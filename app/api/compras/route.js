import { lerDados, salvarDados } from '@/lib/data';

export async function GET() {
  try {
    const dados = lerDados();
    return Response.json(dados.compras || []);
  } catch (error) {
    console.error('Erro ao buscar compras:', error);
    return Response.json({ error: 'Erro ao buscar compras' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const compra = await request.json();
    const dados = lerDados();

    const novaCompra = {
      ...compra,
      id: Date.now().toString(),
      dataCadastro: new Date().toISOString(),
      ultimaAtualizacao: new Date().toISOString(),
    };

    if (!dados.compras) {
      dados.compras = [];
    }

    dados.compras.push(novaCompra);

    // Adicionar/atualizar produtos no inventário automaticamente
    if (!dados.produtos) {
      dados.produtos = [];
    }

    // Processar cada item da compra
    if (compra.itens && Array.isArray(compra.itens)) {
      compra.itens.forEach((item) => {
        // Verificar se o produto já existe (por código interno)
        const produtoExistenteIndex = dados.produtos.findIndex(
          p => p.codigo === item.codigoInterno
        );

        const produtoData = {
          codigo: item.codigoInterno || '',
          tipo: item.tipo || '',
          produto: item.produto || '',
          cor: item.cor || '',
          tamanho: item.tamanho || '',
          precoVenda: item.precoVendaVista || 0,
          precoVenda3x: item.precoVenda3x || 0,
          estoque: item.devolvido ? 0 : 1, // Inicia com 1 se não estiver devolvido
          condicional: 0,
        };

        if (produtoExistenteIndex >= 0) {
          // Atualizar produto existente (mantém estoque e condicional, atualiza preços)
          const produtoAtual = dados.produtos[produtoExistenteIndex];
          dados.produtos[produtoExistenteIndex] = {
            ...produtoAtual,
            ...produtoData,
            estoque: item.devolvido ? 0 : (produtoAtual.estoque || 1), // Mantém estoque atual se não devolvido
            condicional: produtoAtual.condicional, // Mantém condicional atual
            ultimaAtualizacao: new Date().toISOString(),
          };
        } else {
          // Criar novo produto
          const novoProduto = {
            ...produtoData,
            estoque: item.devolvido ? 0 : 1, // Novo produto sempre inicia com estoque = 1 se não devolvido
            id: Date.now().toString() + '_prod_' + Math.random().toString(36).substr(2, 9),
            dataCadastro: new Date().toISOString(),
            ultimaAtualizacao: new Date().toISOString(),
          };
          dados.produtos.push(novoProduto);
        }
      });
    } else {
      // Compatibilidade com estrutura antiga (um produto por compra)
      const produtoExistenteIndex = dados.produtos.findIndex(
        p => p.codigo === compra.codigoInterno
      );

      const produtoData = {
        codigo: compra.codigoInterno || '',
        tipo: compra.tipo || '',
        produto: compra.produto || '',
        cor: compra.cor || '',
        tamanho: compra.tamanho || '',
        precoVenda: compra.precoVendaVista || 0,
        precoVenda3x: compra.precoVenda3x || 0,
        estoque: compra.devolvido ? 0 : 1,
        condicional: 0,
      };

      if (produtoExistenteIndex >= 0) {
        const produtoAtual = dados.produtos[produtoExistenteIndex];
        dados.produtos[produtoExistenteIndex] = {
          ...produtoAtual,
          ...produtoData,
          estoque: compra.devolvido ? 0 : (produtoAtual.estoque || 1),
          condicional: produtoAtual.condicional,
          ultimaAtualizacao: new Date().toISOString(),
        };
      } else {
        const novoProduto = {
          ...produtoData,
          estoque: compra.devolvido ? 0 : 1,
          id: Date.now().toString() + '_prod',
          dataCadastro: new Date().toISOString(),
          ultimaAtualizacao: new Date().toISOString(),
        };
        dados.produtos.push(novoProduto);
      }
    }

    // Criar lançamentos em Contas a Pagar
    if (compra.formaPagamentoCompra) {
      if (!dados.contasAPagar) {
        dados.contasAPagar = [];
      }

      // Calcular valor total da compra (soma dos custos unitários dos itens)
      let valorTotal = 0;
      if (compra.itens && Array.isArray(compra.itens)) {
        valorTotal = compra.itens.reduce((sum, item) => sum + (item.custoUnitario || 0), 0);
      } else {
        // Compatibilidade com estrutura antiga
        valorTotal = compra.custoUnitario || 0;
      }

      const dataCompra = compra.dataCompra ? new Date(compra.dataCompra) : new Date();

      // Se for Pix ou Dinheiro, criar lançamento no caixa diretamente
      if (compra.formaPagamentoCompra === 'Pix' || compra.formaPagamentoCompra === 'Dinheiro') {
        if (!dados.caixa) {
          dados.caixa = [];
        }

        // Calcular saldo anterior (ordenar por data e calcular sequencialmente)
        const caixaOrdenado = [...dados.caixa].sort((a, b) => new Date(a.data) - new Date(b.data));
        let saldoAnterior = 0;
        caixaOrdenado.forEach(lancamento => {
          if (lancamento.tipo === 'entrada') {
            saldoAnterior += lancamento.valor || 0;
          } else {
            saldoAnterior -= lancamento.valor || 0;
          }
        });

        const lancamentoCaixa = {
          id: Date.now().toString() + '_caixa',
          data: dataCompra.toISOString(),
          descricao: `Compra: ${compra.fornecedor || 'Fornecedor'} - ${compra.formaPagamentoCompra}`,
          valor: valorTotal,
          tipo: 'saida',
          saldo: saldoAnterior - valorTotal,
          origem: 'compras',
          origemId: novaCompra.id,
          dataCadastro: new Date().toISOString(),
        };

        dados.caixa.push(lancamentoCaixa);

        // Recalcular saldos de todos os lançamentos de caixa
        let saldoAtual = saldoAnterior;
        dados.caixa.sort((a, b) => new Date(a.data) - new Date(b.data));
        dados.caixa.forEach(lancamento => {
          if (lancamento.tipo === 'entrada') {
            saldoAtual += lancamento.valor || 0;
          } else {
            saldoAtual -= lancamento.valor || 0;
          }
          lancamento.saldo = saldoAtual;
        });
      } else {
        // Se for parcelado (Cartão Crédito ou Boleto), criar lançamentos em Contas a Pagar
        const parcelas = compra.parcelas || 1;
        const valorParcela = valorTotal / parcelas;

        for (let i = 1; i <= parcelas; i++) {
          // Calcular data de vencimento (30 dias por parcela)
          const dataVencimento = new Date(dataCompra);
          dataVencimento.setDate(dataVencimento.getDate() + (i * 30));

          const contaAPagar = {
            id: Date.now().toString() + '_' + i + '_' + Math.random().toString(36).substr(2, 9),
            dataCompra: dataCompra.toISOString(),
            dataVencimento: dataVencimento.toISOString(),
            fornecedor: compra.fornecedor || '',
            codigoCompra: novaCompra.id,
            descricao: `Compra ${compra.fornecedor || 'Fornecedor'} - Parcela ${i}/${parcelas}`,
            valor: valorParcela,
            formaPagamento: compra.formaPagamentoCompra,
            parcela: i,
            totalParcelas: parcelas,
            pago: false,
            valorPago: 0,
            dataCadastro: new Date().toISOString(),
            ultimaAtualizacao: new Date().toISOString(),
          };

          dados.contasAPagar.push(contaAPagar);
        }
      }
    }

    salvarDados(dados);

    return Response.json(novaCompra, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar compra:', error);
    return Response.json({ error: 'Erro ao criar compra' }, { status: 500 });
  }
}

import { lerDados, salvarDados } from '@/lib/data';

export async function GET() {
  try {
    const dados = lerDados();
    return Response.json(dados.vendas || []);
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    return Response.json({ error: 'Erro ao buscar vendas' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const venda = await request.json();
    const dados = lerDados();

    if (!dados.vendas) {
      dados.vendas = [];
    }

    if (!dados.produtos) {
      dados.produtos = [];
    }

    const novaVenda = {
      ...venda,
      id: Date.now().toString(),
      dataCadastro: new Date().toISOString(),
      ultimaAtualizacao: new Date().toISOString(),
    };

    // Atualizar estoque dos produtos vendidos
    if (novaVenda.itens && Array.isArray(novaVenda.itens)) {
      novaVenda.itens.forEach((item) => {
        if (item.codigo) {
          const produtoIndex = dados.produtos.findIndex(
            p => p.codigo && p.codigo.toLowerCase() === item.codigo.toLowerCase()
          );

          if (produtoIndex >= 0) {
            const produto = dados.produtos[produtoIndex];
            // Diminuir estoque em 1 para cada item vendido
            const novoEstoque = Math.max(0, (produto.estoque || 0) - 1);
            dados.produtos[produtoIndex] = {
              ...produto,
              estoque: novoEstoque,
              ultimaAtualizacao: new Date().toISOString(),
            };
          }
        }
      });
    }

    dados.vendas.push(novaVenda);

    // Criar contas a receber para itens com forma de pagamento "Notinha"
    if (!dados.contasAReceber) {
      dados.contasAReceber = [];
    }

    const dataVenda = novaVenda.dataVenda ? new Date(novaVenda.dataVenda) : new Date();
    
    if (novaVenda.itens && Array.isArray(novaVenda.itens)) {
      novaVenda.itens.forEach((item) => {
        if (item.formaPagamento === 'Notinha') {
          // Calcular data de vencimento baseado nas parcelas
          // 1x = 30 dias, 2x = 60 dias, 3x = 90 dias
          const diasVencimento = item.parcelas === 1 ? 30 : item.parcelas === 2 ? 60 : 90;
          const dataVencimento = new Date(dataVenda);
          dataVencimento.setDate(dataVencimento.getDate() + diasVencimento);

          const valorItem = (item.valor || 0) - (item.desconto || 0);

          const novaConta = {
            dataVenda: novaVenda.dataVenda || new Date().toISOString(),
            dataVencimento: dataVencimento.toISOString(),
            cliente: novaVenda.cliente || '',
            codigoVenda: novaVenda.id,
            valor: valorItem,
            formaPagamento: 'Pix', // Sempre Pix quando receber
            recebido: false,
            valorRecebido: 0,
            id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
            dataCadastro: new Date().toISOString(),
            ultimaAtualizacao: new Date().toISOString(),
          };

          dados.contasAReceber.push(novaConta);
        }
      });
    }

    // Criar registro no caixa (entrada) - apenas para itens que NÃO são Notinha
    if (!dados.caixa) {
      dados.caixa = [];
    }

    // Calcular total de itens que não são Notinha
    let totalNaoNotinha = 0;
    if (novaVenda.itens && Array.isArray(novaVenda.itens)) {
      novaVenda.itens.forEach((item) => {
        if (item.formaPagamento !== 'Notinha') {
          const valorItem = (item.valor || 0) - (item.desconto || 0);
          totalNaoNotinha += valorItem;
        }
      });
    }

    // Calcular saldo do caixa
    const caixaOrdenado = [...dados.caixa].sort((a, b) => {
      const dataA = a.data ? new Date(a.data) : new Date(0);
      const dataB = b.data ? new Date(b.data) : new Date(0);
      if (dataA.getTime() === dataB.getTime()) {
        return (a.dataCadastro || '').localeCompare(b.dataCadastro || '');
      }
      return dataA - dataB;
    });

    let saldoCaixaAnterior = 0;
    if (caixaOrdenado.length > 0) {
      saldoCaixaAnterior = caixaOrdenado[caixaOrdenado.length - 1].saldo || 0;
    }

    // Só criar registro no caixa se houver valor que não é Notinha
    if (totalNaoNotinha > 0) {
      const novoSaldoCaixa = saldoCaixaAnterior + totalNaoNotinha;

      const registroCaixa = {
        data: novaVenda.dataVenda || new Date().toISOString(),
        descricao: `Venda: ${novaVenda.cliente || 'Cliente não informado'}`,
        valor: totalNaoNotinha,
        tipo: 'entrada',
        saldo: novoSaldoCaixa,
        origem: 'venda',
        id: Date.now().toString() + '_caixa',
        dataCadastro: new Date().toISOString(),
        ultimaAtualizacao: new Date().toISOString(),
      };

      dados.caixa.push(registroCaixa);
    }

    // Recalcular saldos do caixa
    const todosCaixa = [...dados.caixa].sort((a, b) => {
      const dataA = a.data ? new Date(a.data) : new Date(0);
      const dataB = b.data ? new Date(b.data) : new Date(0);
      if (dataA.getTime() === dataB.getTime()) {
        return (a.dataCadastro || '').localeCompare(b.dataCadastro || '');
      }
      return dataA - dataB;
    });

    let saldoAcumuladoCaixa = 0;
    todosCaixa.forEach((reg) => {
      const valorReg = reg.valor || 0;
      saldoAcumuladoCaixa = reg.tipo === 'entrada' 
        ? saldoAcumuladoCaixa + valorReg 
        : saldoAcumuladoCaixa - valorReg;
      reg.saldo = saldoAcumuladoCaixa;
    });

    salvarDados(dados);

    return Response.json(novaVenda, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar venda:', error);
    return Response.json({ error: 'Erro ao criar venda' }, { status: 500 });
  }
}


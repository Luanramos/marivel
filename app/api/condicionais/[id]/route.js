import { lerDados, salvarDados } from '@/lib/data';

export async function GET(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const dados = lerDados();
    const condicional = dados.condicionais?.find((c) => c.id === id);

    if (!condicional) {
      return Response.json({ error: 'Condicional não encontrado' }, { status: 404 });
    }

    return Response.json(condicional);
  } catch (error) {
    console.error('Erro ao buscar condicional:', error);
    return Response.json({ error: 'Erro ao buscar condicional' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const condicionalAtualizado = await request.json();
    const dados = lerDados();

    if (!dados.condicionais) {
      dados.condicionais = [];
    }

    const index = dados.condicionais.findIndex((c) => c.id === id);
    if (index === -1) {
      return Response.json({ error: 'Condicional não encontrado' }, { status: 404 });
    }

    const condicionalAnterior = dados.condicionais[index];

    // Preserva o código original
    dados.condicionais[index] = {
      ...dados.condicionais[index],
      ...condicionalAtualizado,
      id,
      codigoCond: dados.condicionais[index].codigoCond, // Mantém o código original
      ultimaAtualizacao: new Date().toISOString(),
    };

    const condicionalAtual = dados.condicionais[index];

    // Garantir que produtos existam
    if (!dados.produtos) {
      dados.produtos = [];
    }

    // Obter itens (nova estrutura com itens ou estrutura antiga)
    const itensAtualizados = condicionalAtualizado.itens && Array.isArray(condicionalAtualizado.itens)
      ? condicionalAtualizado.itens
      : condicionalAtualizado.codigoInterno
        ? [{
            codigoInterno: condicionalAtualizado.codigoInterno,
            produto: condicionalAtualizado.produto || '',
            precoVendaVista: condicionalAtualizado.precoVendaVista || 0,
            precoVenda3x: condicionalAtualizado.precoVenda3x || 0,
            status: condicionalAtualizado.status || 'Com Cliente', // Compatibilidade com estrutura antiga
          }]
        : [];

    // Obter itens anteriores para comparar mudanças de status
    const itensAnteriores = condicionalAnterior.itens && Array.isArray(condicionalAnterior.itens)
      ? condicionalAnterior.itens
      : condicionalAnterior.codigoInterno
        ? [{
            codigoInterno: condicionalAnterior.codigoInterno,
            status: condicionalAnterior.status || 'Com Cliente',
          }]
        : [];

    // Atualizar campo condicional no estoque baseado no status de cada produto
    itensAtualizados.forEach(itemAtualizado => {
      if (!itemAtualizado.codigoInterno) return;

      const itemAnterior = itensAnteriores.find(i => 
        i.codigoInterno && 
        i.codigoInterno.toLowerCase() === itemAtualizado.codigoInterno.toLowerCase()
      );
      const statusAnterior = itemAnterior?.status || 'Com Cliente';
      const novoStatus = itemAtualizado.status || 'Com Cliente';

      const produtoIndex = dados.produtos.findIndex(
        p => p.codigo && p.codigo.toLowerCase() === itemAtualizado.codigoInterno.toLowerCase()
      );

      if (produtoIndex >= 0) {
        const produto = dados.produtos[produtoIndex];
        
        // Se o status mudou para "Devolvido" ou "Vendido", verificar se ainda há condicionais ativos
        if (novoStatus === 'Devolvido' || novoStatus === 'Vendido') {
          // Verificar se ainda há condicionais ativos (status "Com Cliente") para este produto
          const condicionaisAtivos = dados.condicionais.filter(c => {
            if (c.id === id) return false; // Excluir o condicional atual
            
            // Verificar em itens (nova estrutura) ou codigoInterno (estrutura antiga)
            let temProdutoComCliente = false;
            if (c.itens && Array.isArray(c.itens)) {
              temProdutoComCliente = c.itens.some(item => 
                item.codigoInterno && 
                item.codigoInterno.toLowerCase() === itemAtualizado.codigoInterno.toLowerCase() &&
                item.status === 'Com Cliente'
              );
            } else if (c.codigoInterno && c.status === 'Com Cliente') {
              temProdutoComCliente = c.codigoInterno.toLowerCase() === itemAtualizado.codigoInterno.toLowerCase();
            }
            
            return temProdutoComCliente;
          });

          // Se não houver mais condicionais ativos, zerar o campo condicional
          if (condicionaisAtivos.length === 0) {
            dados.produtos[produtoIndex] = {
              ...produto,
              condicional: 0,
              ultimaAtualizacao: new Date().toISOString(),
            };
          }
        } else if (novoStatus === 'Com Cliente' && statusAnterior !== 'Com Cliente') {
          // Se mudou para "Com Cliente", marcar como tendo condicional
          dados.produtos[produtoIndex] = {
            ...produto,
            condicional: 1,
            ultimaAtualizacao: new Date().toISOString(),
          };
        }
      }
    });

    // Criar/atualizar vendas para produtos com status "Vendido"
    const clienteCondicional = condicionalAtual.cliente || '';
    const dataCondicional = condicionalAtual.data || new Date().toISOString();
    const dataFormatada = new Date(dataCondicional).toISOString().split('T')[0]; // Apenas a data (YYYY-MM-DD)

    // Coletar apenas produtos com status "Vendido" do condicional atual
    const itensVendidos = itensAtualizados.filter(item => item.status === 'Vendido');
    
    // Verificar se algum item mudou para "Vendido"
    const itensQueMudaramParaVendido = itensVendidos.filter(itemVendido => {
      const itemAnterior = itensAnteriores.find(i => 
        i.codigoInterno && 
        i.codigoInterno.toLowerCase() === itemVendido.codigoInterno.toLowerCase()
      );
      return !itemAnterior || itemAnterior.status !== 'Vendido';
    });

    if (itensQueMudaramParaVendido.length > 0 && clienteCondicional) {
      // Verificar se já existe uma venda para esse cliente e data
      if (!dados.vendas) {
        dados.vendas = [];
      }

      // Buscar venda existente criada a partir de condicionais (marcada com flag especial)
      const vendaExistente = dados.vendas.find(v => 
        v.cliente === clienteCondicional &&
        v.dataVenda && 
        new Date(v.dataVenda).toISOString().split('T')[0] === dataFormatada &&
        v.origemCondicional === true
      );

      // Garantir que produtos existam
      if (!dados.produtos) {
        dados.produtos = [];
      }

      // Adicionar apenas os produtos que mudaram para "Vendido"
      const novosItensVenda = itensQueMudaramParaVendido.map(item => ({
        codigo: item.codigoInterno || '',
        produto: item.produto || '',
        valor: 0, // Deixar editável
        formaPagamento: 'Pix',
        parcelas: 1,
        desconto: 0,
      }));

      if (vendaExistente) {
        // Adicionar itens novos à venda existente
        novosItensVenda.forEach(novoItem => {
          const itemJaExiste = vendaExistente.itens.some(item => 
            item.codigo === novoItem.codigo
          );

          if (!itemJaExiste) {
            vendaExistente.itens.push(novoItem);
            
            // Atualizar estoque do produto
            if (novoItem.codigo) {
              const produtoIndex = dados.produtos.findIndex(
                p => p.codigo && p.codigo.toLowerCase() === novoItem.codigo.toLowerCase()
              );

              if (produtoIndex >= 0) {
                const produto = dados.produtos[produtoIndex];
                const novoEstoque = Math.max(0, (produto.estoque || 0) - 1);
                dados.produtos[produtoIndex] = {
                  ...produto,
                  estoque: novoEstoque,
                  ultimaAtualizacao: new Date().toISOString(),
                };
              }
            }
          }
        });
        
        // Recalcular total
        vendaExistente.total = vendaExistente.itens.reduce((total, item) => {
          const valorItem = item.valor || 0;
          const descontoItem = item.desconto || 0;
          return total + (valorItem - descontoItem);
        }, 0);
        
        vendaExistente.ultimaAtualizacao = new Date().toISOString();
      } else {
        // Coletar todos os produtos "Vendido" de todos os condicionais do mesmo cliente e data
        const todosItensVendidos = [];
        dados.condicionais.forEach(c => {
          if (c.cliente === clienteCondicional &&
              c.data && 
              new Date(c.data).toISOString().split('T')[0] === dataFormatada) {
            if (c.itens && Array.isArray(c.itens)) {
              c.itens.forEach(item => {
                if (item.status === 'Vendido' && item.codigoInterno) {
                  todosItensVendidos.push({
                    codigo: item.codigoInterno || '',
                    produto: item.produto || '',
                    valor: 0, // Deixar editável
                    formaPagamento: 'Pix',
                    parcelas: 1,
                    desconto: 0,
                  });
                }
              });
            } else if (c.status === 'Vendido' && c.codigoInterno) {
              // Estrutura antiga
              todosItensVendidos.push({
                codigo: c.codigoInterno || '',
                produto: c.produto || '',
                valor: 0,
                formaPagamento: 'Pix',
                parcelas: 1,
                desconto: 0,
              });
            }
          }
        });

        if (todosItensVendidos.length > 0) {
          // Criar nova venda agrupando todos os produtos "Vendido" do mesmo cliente e data
          const novaVenda = {
            dataVenda: dataCondicional,
            cliente: clienteCondicional,
            itens: todosItensVendidos,
            total: 0, // Será calculado quando os valores forem preenchidos
            origemCondicional: true, // Flag para identificar vendas criadas a partir de condicionais
            id: Date.now().toString(),
            dataCadastro: new Date().toISOString(),
            ultimaAtualizacao: new Date().toISOString(),
          };

          dados.vendas.push(novaVenda);

          // Atualizar estoque dos produtos vendidos
          todosItensVendidos.forEach((item) => {
            if (item.codigo) {
              const produtoIndex = dados.produtos.findIndex(
                p => p.codigo && p.codigo.toLowerCase() === item.codigo.toLowerCase()
              );

              if (produtoIndex >= 0) {
                const produto = dados.produtos[produtoIndex];
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
      }
    }

    salvarDados(dados);
    return Response.json(dados.condicionais[index]);
  } catch (error) {
    console.error('Erro ao atualizar condicional:', error);
    return Response.json({ error: 'Erro ao atualizar condicional' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const dados = lerDados();

    if (!dados.condicionais) {
      dados.condicionais = [];
    }

    const index = dados.condicionais.findIndex((c) => c.id === id);
    if (index === -1) {
      return Response.json({ error: 'Condicional não encontrado' }, { status: 404 });
    }

    const condicionalRemovido = dados.condicionais[index];

    dados.condicionais.splice(index, 1);

    // Atualizar campo condicional no estoque
    if (!dados.produtos) {
      dados.produtos = [];
    }

    // Obter itens do condicional removido
    const itensRemovidos = condicionalRemovido.itens && Array.isArray(condicionalRemovido.itens)
      ? condicionalRemovido.itens
      : condicionalRemovido.codigoInterno
        ? [{
            codigoInterno: condicionalRemovido.codigoInterno,
            status: condicionalRemovido.status || 'Com Cliente', // Compatibilidade com estrutura antiga
          }]
        : [];

    // Verificar produtos que tinham status "Com Cliente" e atualizar estoque
    itensRemovidos.forEach(itemRemovido => {
      if (itemRemovido.codigoInterno && itemRemovido.status === 'Com Cliente') {
        const condicionaisAtivos = dados.condicionais.filter(c => {
          // Verificar em itens (nova estrutura) ou codigoInterno (estrutura antiga)
          let temProdutoComCliente = false;
          if (c.itens && Array.isArray(c.itens)) {
            temProdutoComCliente = c.itens.some(item => 
              item.codigoInterno && 
              item.codigoInterno.toLowerCase() === itemRemovido.codigoInterno.toLowerCase() &&
              item.status === 'Com Cliente'
            );
          } else if (c.codigoInterno && c.status === 'Com Cliente') {
            temProdutoComCliente = c.codigoInterno.toLowerCase() === itemRemovido.codigoInterno.toLowerCase();
          }
          
          return temProdutoComCliente;
        });

        const produtoIndex = dados.produtos.findIndex(
          p => p.codigo && p.codigo.toLowerCase() === itemRemovido.codigoInterno.toLowerCase()
        );

        if (produtoIndex >= 0) {
          const produto = dados.produtos[produtoIndex];
          
          // Se não houver mais condicionais ativos, zerar o campo condicional
          if (condicionaisAtivos.length === 0) {
            dados.produtos[produtoIndex] = {
              ...produto,
              condicional: 0,
              ultimaAtualizacao: new Date().toISOString(),
            };
          }
        }
      }
    });

    salvarDados(dados);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover condicional:', error);
    return Response.json({ error: 'Erro ao remover condicional' }, { status: 500 });
  }
}


import { lerDados, salvarDados } from '@/lib/data';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const dados = lerDados();
    const compra = dados.compras?.find((c) => c.id === id);

    if (!compra) {
      return Response.json({ error: 'Compra não encontrada' }, { status: 404 });
    }

    return Response.json(compra);
  } catch (error) {
    console.error('Erro ao buscar compra:', error);
    return Response.json({ error: 'Erro ao buscar compra' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const compraAtualizada = await request.json();
    const dados = lerDados();

    if (!dados.compras) {
      dados.compras = [];
    }

    const index = dados.compras.findIndex((c) => c.id === id);
    if (index === -1) {
      return Response.json({ error: 'Compra não encontrada' }, { status: 404 });
    }

    const compraAnterior = dados.compras[index];
    dados.compras[index] = {
      ...dados.compras[index],
      ...compraAtualizada,
      id,
      ultimaAtualizacao: new Date().toISOString(),
    };

    // Atualizar produtos no inventário automaticamente
    if (!dados.produtos) {
      dados.produtos = [];
    }

    // Processar itens da compra atualizada
    if (compraAtualizada.itens && Array.isArray(compraAtualizada.itens)) {
      // Primeiro, remover produtos que não estão mais na compra (se necessário)
      // Mas vamos manter os produtos existentes e apenas atualizar

      compraAtualizada.itens.forEach((item) => {
        const produtoExistenteIndex = dados.produtos.findIndex(
          p => p.codigo === item.codigoInterno
        );

        // Se a compra foi marcada como devolvida, zerar o estoque
        let novoEstoque = 1;
        if (item.devolvido === true) {
          novoEstoque = 0;
        } else if (item.devolvido === false) {
          // Se não está devolvido, verificar se o produto já existe
          if (produtoExistenteIndex >= 0) {
            const produtoAtual = dados.produtos[produtoExistenteIndex];
            novoEstoque = produtoAtual.estoque || 1;
          } else {
            novoEstoque = 1; // Novo produto
          }
        }

        const produtoData = {
          codigo: item.codigoInterno || '',
          tipo: item.tipo || '',
          produto: item.produto || '',
          cor: item.cor || '',
          tamanho: item.tamanho || '',
          precoVenda: item.precoVendaVista || 0,
          precoVenda3x: item.precoVenda3x || 0,
          estoque: novoEstoque,
          condicional: 0,
        };

        if (produtoExistenteIndex >= 0) {
          // Atualizar produto existente
          const produtoAtual = dados.produtos[produtoExistenteIndex];
          dados.produtos[produtoExistenteIndex] = {
            ...produtoAtual,
            ...produtoData,
            estoque: novoEstoque,
            condicional: produtoAtual.condicional, // Mantém condicional atual
            ultimaAtualizacao: new Date().toISOString(),
          };
        } else if (item.codigoInterno) {
          // Criar novo produto
          const novoProduto = {
            ...produtoData,
            estoque: novoEstoque,
            id: Date.now().toString() + '_prod_' + Math.random().toString(36).substr(2, 9),
            dataCadastro: new Date().toISOString(),
            ultimaAtualizacao: new Date().toISOString(),
          };
          dados.produtos.push(novoProduto);
        }
      });
    } else {
      // Compatibilidade com estrutura antiga
      const codigoProduto = compraAtualizada.codigoInterno || compraAnterior.codigoInterno;
      const produtoExistenteIndex = dados.produtos.findIndex(
        p => p.codigo === codigoProduto
      );

      let novoEstoque = 1;
      if (compraAtualizada.devolvido === true) {
        novoEstoque = 0;
      } else if (compraAtualizada.devolvido === false && compraAnterior.devolvido === true) {
        novoEstoque = 1;
      } else if (produtoExistenteIndex >= 0) {
        const produtoAtual = dados.produtos[produtoExistenteIndex];
        novoEstoque = produtoAtual.estoque || 1;
      }

      if (produtoExistenteIndex >= 0) {
        const produtoAtual = dados.produtos[produtoExistenteIndex];
        dados.produtos[produtoExistenteIndex] = {
          ...produtoAtual,
          codigo: compraAtualizada.codigoInterno !== undefined ? compraAtualizada.codigoInterno : produtoAtual.codigo,
          tipo: compraAtualizada.tipo !== undefined ? compraAtualizada.tipo : produtoAtual.tipo,
          produto: compraAtualizada.produto !== undefined ? compraAtualizada.produto : produtoAtual.produto,
          cor: compraAtualizada.cor !== undefined ? compraAtualizada.cor : produtoAtual.cor,
          tamanho: compraAtualizada.tamanho !== undefined ? compraAtualizada.tamanho : produtoAtual.tamanho,
          precoVenda: compraAtualizada.precoVendaVista !== undefined ? compraAtualizada.precoVendaVista : produtoAtual.precoVenda,
          precoVenda3x: compraAtualizada.precoVenda3x !== undefined ? compraAtualizada.precoVenda3x : produtoAtual.precoVenda3x,
          estoque: novoEstoque,
          condicional: produtoAtual.condicional,
          ultimaAtualizacao: new Date().toISOString(),
        };
      } else if (codigoProduto) {
        const novoProduto = {
          codigo: compraAtualizada.codigoInterno || '',
          tipo: compraAtualizada.tipo || '',
          produto: compraAtualizada.produto || '',
          cor: compraAtualizada.cor || '',
          tamanho: compraAtualizada.tamanho || '',
          precoVenda: compraAtualizada.precoVendaVista || 0,
          precoVenda3x: compraAtualizada.precoVenda3x || 0,
          estoque: novoEstoque,
          condicional: 0,
          id: Date.now().toString() + '_prod',
          dataCadastro: new Date().toISOString(),
          ultimaAtualizacao: new Date().toISOString(),
        };
        dados.produtos.push(novoProduto);
      }
    }

    salvarDados(dados);
    return Response.json(dados.compras[index]);
  } catch (error) {
    console.error('Erro ao atualizar compra:', error);
    return Response.json({ 
      error: 'Erro ao atualizar compra',
      message: error.message || 'Erro desconhecido',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const dados = lerDados();

    if (!dados.compras) {
      dados.compras = [];
    }

    const index = dados.compras.findIndex((c) => c.id === id);
    if (index === -1) {
      return Response.json({ error: 'Compra não encontrada' }, { status: 404 });
    }

    dados.compras.splice(index, 1);
    salvarDados(dados);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover compra:', error);
    return Response.json({ error: 'Erro ao remover compra' }, { status: 500 });
  }
}

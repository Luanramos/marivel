import { lerDados, salvarDados } from '@/lib/data';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const dados = lerDados();
    const venda = dados.vendas?.find((v) => v.id === id);

    if (!venda) {
      return Response.json({ error: 'Venda não encontrada' }, { status: 404 });
    }

    return Response.json(venda);
  } catch (error) {
    console.error('Erro ao buscar venda:', error);
    return Response.json({ error: 'Erro ao buscar venda' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const vendaAtualizada = await request.json();
    const dados = lerDados();

    if (!dados.vendas) {
      dados.vendas = [];
    }

    if (!dados.produtos) {
      dados.produtos = [];
    }

    const index = dados.vendas.findIndex((v) => v.id === id);
    if (index === -1) {
      return Response.json({ error: 'Venda não encontrada' }, { status: 404 });
    }

    const vendaAnterior = dados.vendas[index];
    const itensAnteriores = vendaAnterior.itens || [];
    const itensNovos = vendaAtualizada.itens || [];

    // Restaurar estoque dos itens anteriores
    itensAnteriores.forEach((item) => {
      if (item.codigo) {
        const produtoIndex = dados.produtos.findIndex(
          p => p.codigo && p.codigo.toLowerCase() === item.codigo.toLowerCase()
        );

        if (produtoIndex >= 0) {
          const produto = dados.produtos[produtoIndex];
          // Restaurar estoque (aumentar em 1)
          dados.produtos[produtoIndex] = {
            ...produto,
            estoque: (produto.estoque || 0) + 1,
            ultimaAtualizacao: new Date().toISOString(),
          };
        }
      }
    });

    // Diminuir estoque dos novos itens
    itensNovos.forEach((item) => {
      if (item.codigo) {
        const produtoIndex = dados.produtos.findIndex(
          p => p.codigo && p.codigo.toLowerCase() === item.codigo.toLowerCase()
        );

        if (produtoIndex >= 0) {
          const produto = dados.produtos[produtoIndex];
          // Diminuir estoque em 1
          const novoEstoque = Math.max(0, (produto.estoque || 0) - 1);
          dados.produtos[produtoIndex] = {
            ...produto,
            estoque: novoEstoque,
            ultimaAtualizacao: new Date().toISOString(),
          };
        }
      }
    });

    dados.vendas[index] = {
      ...dados.vendas[index],
      ...vendaAtualizada,
      id,
      ultimaAtualizacao: new Date().toISOString(),
    };

    salvarDados(dados);
    return Response.json(dados.vendas[index]);
  } catch (error) {
    console.error('Erro ao atualizar venda:', error);
    return Response.json({ error: 'Erro ao atualizar venda' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const dados = lerDados();

    if (!dados.vendas) {
      dados.vendas = [];
    }

    if (!dados.produtos) {
      dados.produtos = [];
    }

    const index = dados.vendas.findIndex((v) => v.id === id);
    if (index === -1) {
      return Response.json({ error: 'Venda não encontrada' }, { status: 404 });
    }

    const venda = dados.vendas[index];

    // Restaurar estoque dos produtos vendidos
    if (venda.itens && Array.isArray(venda.itens)) {
      venda.itens.forEach((item) => {
        if (item.codigo) {
          const produtoIndex = dados.produtos.findIndex(
            p => p.codigo && p.codigo.toLowerCase() === item.codigo.toLowerCase()
          );

          if (produtoIndex >= 0) {
            const produto = dados.produtos[produtoIndex];
            // Restaurar estoque (aumentar em 1)
            dados.produtos[produtoIndex] = {
              ...produto,
              estoque: (produto.estoque || 0) + 1,
              ultimaAtualizacao: new Date().toISOString(),
            };
          }
        }
      });
    }

    dados.vendas.splice(index, 1);
    salvarDados(dados);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover venda:', error);
    return Response.json({ error: 'Erro ao remover venda' }, { status: 500 });
  }
}


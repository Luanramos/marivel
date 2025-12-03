import { lerDados, salvarDados } from '@/lib/data';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const dados = lerDados();
    const produto = dados.produtos.find((p) => p.id === id);

    if (!produto) {
      return Response.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    return Response.json(produto);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return Response.json({ error: 'Erro ao buscar produto' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const produtoAtualizado = await request.json();
    const dados = lerDados();

    const index = dados.produtos.findIndex((p) => p.id === id);
    if (index === -1) {
      return Response.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    dados.produtos[index] = {
      ...dados.produtos[index],
      ...produtoAtualizado,
      id,
      ultimaAtualizacao: new Date().toISOString(),
    };

    salvarDados(dados);
    return Response.json(dados.produtos[index]);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return Response.json({ error: 'Erro ao atualizar produto' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const dados = lerDados();

    const index = dados.produtos.findIndex((p) => p.id === id);
    if (index === -1) {
      return Response.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    dados.produtos.splice(index, 1);
    salvarDados(dados);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover produto:', error);
    return Response.json({ error: 'Erro ao remover produto' }, { status: 500 });
  }
}


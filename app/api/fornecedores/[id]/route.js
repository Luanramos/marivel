import { lerDados, salvarDados } from '@/lib/data';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const dados = lerDados();
    const fornecedor = dados.fornecedores?.find((f) => f.id === id);

    if (!fornecedor) {
      return Response.json({ error: 'Fornecedor não encontrado' }, { status: 404 });
    }

    return Response.json(fornecedor);
  } catch (error) {
    console.error('Erro ao buscar fornecedor:', error);
    return Response.json({ error: 'Erro ao buscar fornecedor' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const fornecedorAtualizado = await request.json();
    const dados = lerDados();

    if (!dados.fornecedores) {
      dados.fornecedores = [];
    }

    const index = dados.fornecedores.findIndex((f) => f.id === id);
    if (index === -1) {
      return Response.json({ error: 'Fornecedor não encontrado' }, { status: 404 });
    }

    // Preserva o código original
    dados.fornecedores[index] = {
      ...dados.fornecedores[index],
      ...fornecedorAtualizado,
      id,
      codigo: dados.fornecedores[index].codigo, // Mantém o código original
      ultimaAtualizacao: new Date().toISOString(),
    };

    salvarDados(dados);
    return Response.json(dados.fornecedores[index]);
  } catch (error) {
    console.error('Erro ao atualizar fornecedor:', error);
    return Response.json({ error: 'Erro ao atualizar fornecedor' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const dados = lerDados();

    if (!dados.fornecedores) {
      dados.fornecedores = [];
    }

    const index = dados.fornecedores.findIndex((f) => f.id === id);
    if (index === -1) {
      return Response.json({ error: 'Fornecedor não encontrado' }, { status: 404 });
    }

    dados.fornecedores.splice(index, 1);
    salvarDados(dados);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover fornecedor:', error);
    return Response.json({ error: 'Erro ao remover fornecedor' }, { status: 500 });
  }
}


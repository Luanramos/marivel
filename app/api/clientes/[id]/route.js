import { lerDados, salvarDados } from '@/lib/data';

export async function GET(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const dados = lerDados();
    const cliente = dados.clientes?.find((c) => c.id === id);

    if (!cliente) {
      return Response.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    return Response.json(cliente);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    return Response.json({ error: 'Erro ao buscar cliente' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const clienteAtualizado = await request.json();
    const dados = lerDados();

    if (!dados.clientes) {
      dados.clientes = [];
    }

    const index = dados.clientes.findIndex((c) => c.id === id);
    if (index === -1) {
      return Response.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    dados.clientes[index] = {
      ...dados.clientes[index],
      ...clienteAtualizado,
      id,
      ultimaAtualizacao: new Date().toISOString(),
    };

    salvarDados(dados);

    return Response.json(dados.clientes[index]);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    return Response.json({ error: 'Erro ao atualizar cliente' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const dados = lerDados();

    if (!dados.clientes) {
      dados.clientes = [];
    }

    const index = dados.clientes.findIndex((c) => c.id === id);
    if (index === -1) {
      return Response.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    dados.clientes.splice(index, 1);
    salvarDados(dados);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover cliente:', error);
    return Response.json({ error: 'Erro ao remover cliente' }, { status: 500 });
  }
}

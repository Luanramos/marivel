import { lerDados, salvarDados } from '@/lib/data';

export async function GET() {
  try {
    const dados = lerDados();
    return Response.json(dados.clientes || []);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return Response.json({ error: 'Erro ao buscar clientes' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cliente = await request.json();
    const dados = lerDados();

    if (!dados.clientes) {
      dados.clientes = [];
    }

    const novoCliente = {
      ...cliente,
      id: Date.now().toString(),
      dataCadastro: new Date().toISOString(),
      ultimaAtualizacao: new Date().toISOString(),
    };

    dados.clientes.push(novoCliente);
    salvarDados(dados);

    return Response.json(novoCliente, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    return Response.json({ error: 'Erro ao criar cliente' }, { status: 500 });
  }
}

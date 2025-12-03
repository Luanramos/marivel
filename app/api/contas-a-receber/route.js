import { lerDados, salvarDados } from '@/lib/data';

export async function GET() {
  try {
    const dados = lerDados();
    return Response.json(dados.contasAReceber || []);
  } catch (error) {
    console.error('Erro ao buscar contas a receber:', error);
    return Response.json({ error: 'Erro ao buscar contas a receber' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const conta = await request.json();
    const dados = lerDados();

    if (!dados.contasAReceber) {
      dados.contasAReceber = [];
    }

    const novaConta = {
      ...conta,
      id: Date.now().toString(),
      recebido: false,
      valorRecebido: 0,
      dataCadastro: new Date().toISOString(),
      ultimaAtualizacao: new Date().toISOString(),
    };

    dados.contasAReceber.push(novaConta);
    salvarDados(dados);

    return Response.json(novaConta, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar conta a receber:', error);
    return Response.json({ error: 'Erro ao criar conta a receber' }, { status: 500 });
  }
}


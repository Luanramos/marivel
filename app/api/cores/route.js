import { lerDados, salvarDados } from '@/lib/data';

export async function GET() {
  try {
    const dados = lerDados();
    return Response.json(dados.cores || []);
  } catch (error) {
    console.error('Erro ao buscar cores:', error);
    return Response.json({ error: 'Erro ao buscar cores' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { cor } = await request.json();
    const dados = lerDados();

    if (!dados.cores) {
      dados.cores = [];
    }

    // Verificar se a cor já existe
    if (!dados.cores.includes(cor)) {
      dados.cores.push(cor);
      dados.cores.sort(); // Ordenar alfabeticamente
      salvarDados(dados);
    }

    return Response.json(dados.cores, { status: 201 });
  } catch (error) {
    console.error('Erro ao adicionar cor:', error);
    return Response.json({ error: 'Erro ao adicionar cor' }, { status: 500 });
  }
}


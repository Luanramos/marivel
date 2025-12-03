import { lerDados, salvarDados } from '@/lib/data';
import { gerarCodigoProduto } from '@/lib/utils';

export async function GET() {
  try {
    const dados = lerDados();
    return Response.json(dados.produtos || []);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return Response.json({ error: 'Erro ao buscar produtos' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const produto = await request.json();
    const dados = lerDados();

    const novoProduto = {
      ...produto,
      codigo: produto.codigo || gerarCodigoProduto(), // Gera código se não fornecido
      id: Date.now().toString(),
      dataCadastro: new Date().toISOString(),
      ultimaAtualizacao: new Date().toISOString(),
    };

    dados.produtos.push(novoProduto);
    salvarDados(dados);

    return Response.json(novoProduto, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return Response.json({ error: 'Erro ao criar produto' }, { status: 500 });
  }
}


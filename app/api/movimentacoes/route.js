import { lerDados, salvarDados } from '@/lib/data';

export async function GET() {
  try {
    const dados = lerDados();
    return Response.json(dados.movimentacoes || []);
  } catch (error) {
    console.error('Erro ao buscar movimentações:', error);
    return Response.json({ error: 'Erro ao buscar movimentações' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const movimentacao = await request.json();
    const dados = lerDados();

    const novaMovimentacao = {
      ...movimentacao,
      id: Date.now().toString(),
      data: new Date().toISOString(),
    };

    dados.movimentacoes.push(novaMovimentacao);

    // Atualizar quantidade do produto
    const produtoIndex = dados.produtos.findIndex((p) => p.id === movimentacao.produtoId);
    if (produtoIndex !== -1) {
      const produto = dados.produtos[produtoIndex];
      const novaQuantidade =
        movimentacao.tipo === 'entrada'
          ? produto.quantidadeAtual + movimentacao.quantidade
          : produto.quantidadeAtual - movimentacao.quantidade;

      dados.produtos[produtoIndex] = {
        ...produto,
        quantidadeAtual: Math.max(0, novaQuantidade),
        ultimaAtualizacao: new Date().toISOString(),
      };
    }

    salvarDados(dados);
    return Response.json(novaMovimentacao, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar movimentação:', error);
    return Response.json({ error: 'Erro ao criar movimentação' }, { status: 500 });
  }
}


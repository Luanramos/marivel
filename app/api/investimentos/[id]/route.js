import { lerDados, salvarDados } from '@/lib/data';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const dados = lerDados();
    const investimento = dados.investimentos?.find((i) => i.id === id);

    if (!investimento) {
      return Response.json({ error: 'Investimento não encontrado' }, { status: 404 });
    }

    return Response.json(investimento);
  } catch (error) {
    console.error('Erro ao buscar investimento:', error);
    return Response.json({ error: 'Erro ao buscar investimento' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const investimentoAtualizado = await request.json();
    const dados = lerDados();

    if (!dados.investimentos) {
      dados.investimentos = [];
    }

    const index = dados.investimentos.findIndex((i) => i.id === id);
    if (index === -1) {
      return Response.json({ error: 'Investimento não encontrado' }, { status: 404 });
    }

    dados.investimentos[index] = {
      ...dados.investimentos[index],
      ...investimentoAtualizado,
      id,
      ultimaAtualizacao: new Date().toISOString(),
    };

    // Recalcular todos os saldos em ordem cronológica
    const todosInvestimentos = [...dados.investimentos].sort((a, b) => {
      const dataA = a.data ? new Date(a.data) : new Date(0);
      const dataB = b.data ? new Date(b.data) : new Date(0);
      if (dataA.getTime() === dataB.getTime()) {
        return (a.dataCadastro || '').localeCompare(b.dataCadastro || '');
      }
      return dataA - dataB;
    });

    let saldoAcumulado = 0;
    todosInvestimentos.forEach((inv) => {
      const valorInv = inv.valor || 0;
      saldoAcumulado = inv.tipo === 'entrada' 
        ? saldoAcumulado + valorInv 
        : saldoAcumulado - valorInv;
      inv.saldo = saldoAcumulado;
    });

    // Atualizar o array original com os saldos recalculados
    todosInvestimentos.forEach((inv) => {
      const idx = dados.investimentos.findIndex(i => i.id === inv.id);
      if (idx >= 0) {
        dados.investimentos[idx].saldo = inv.saldo;
      }
    });

    salvarDados(dados);
    return Response.json(dados.investimentos[index]);
  } catch (error) {
    console.error('Erro ao atualizar investimento:', error);
    return Response.json({ error: 'Erro ao atualizar investimento' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const dados = lerDados();

    if (!dados.investimentos) {
      dados.investimentos = [];
    }

    const index = dados.investimentos.findIndex((i) => i.id === id);
    if (index === -1) {
      return Response.json({ error: 'Investimento não encontrado' }, { status: 404 });
    }

    dados.investimentos.splice(index, 1);

    // Recalcular todos os saldos em ordem cronológica
    const todosInvestimentos = [...dados.investimentos].sort((a, b) => {
      const dataA = a.data ? new Date(a.data) : new Date(0);
      const dataB = b.data ? new Date(b.data) : new Date(0);
      if (dataA.getTime() === dataB.getTime()) {
        return (a.dataCadastro || '').localeCompare(b.dataCadastro || '');
      }
      return dataA - dataB;
    });

    let saldoAcumulado = 0;
    todosInvestimentos.forEach((inv) => {
      const valorInv = inv.valor || 0;
      saldoAcumulado = inv.tipo === 'entrada' 
        ? saldoAcumulado + valorInv 
        : saldoAcumulado - valorInv;
      inv.saldo = saldoAcumulado;
    });

    // Atualizar o array original com os saldos recalculados
    todosInvestimentos.forEach((inv) => {
      const idx = dados.investimentos.findIndex(i => i.id === inv.id);
      if (idx >= 0) {
        dados.investimentos[idx].saldo = inv.saldo;
      }
    });

    salvarDados(dados);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover investimento:', error);
    return Response.json({ error: 'Erro ao remover investimento' }, { status: 500 });
  }
}


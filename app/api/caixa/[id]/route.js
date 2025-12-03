import { lerDados, salvarDados } from '@/lib/data';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const dados = lerDados();
    const registro = dados.caixa?.find((c) => c.id === id);

    if (!registro) {
      return Response.json({ error: 'Registro não encontrado' }, { status: 404 });
    }

    return Response.json(registro);
  } catch (error) {
    console.error('Erro ao buscar registro de caixa:', error);
    return Response.json({ error: 'Erro ao buscar registro de caixa' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const registroAtualizado = await request.json();
    const dados = lerDados();

    if (!dados.caixa) {
      dados.caixa = [];
    }

    const index = dados.caixa.findIndex((c) => c.id === id);
    if (index === -1) {
      return Response.json({ error: 'Registro não encontrado' }, { status: 404 });
    }

    dados.caixa[index] = {
      ...dados.caixa[index],
      ...registroAtualizado,
      id,
      ultimaAtualizacao: new Date().toISOString(),
    };

    // Recalcular todos os saldos em ordem cronológica
    const todosRegistros = [...dados.caixa].sort((a, b) => {
      const dataA = a.data ? new Date(a.data) : new Date(0);
      const dataB = b.data ? new Date(b.data) : new Date(0);
      if (dataA.getTime() === dataB.getTime()) {
        return (a.dataCadastro || '').localeCompare(b.dataCadastro || '');
      }
      return dataA - dataB;
    });

    let saldoAcumulado = 0;
    todosRegistros.forEach((reg) => {
      const valorReg = reg.valor || 0;
      saldoAcumulado = reg.tipo === 'entrada' 
        ? saldoAcumulado + valorReg 
        : saldoAcumulado - valorReg;
      reg.saldo = saldoAcumulado;
    });

    // Atualizar o array original com os saldos recalculados
    todosRegistros.forEach((reg) => {
      const idx = dados.caixa.findIndex(c => c.id === reg.id);
      if (idx >= 0) {
        dados.caixa[idx].saldo = reg.saldo;
      }
    });

    salvarDados(dados);
    return Response.json(dados.caixa[index]);
  } catch (error) {
    console.error('Erro ao atualizar registro de caixa:', error);
    return Response.json({ error: 'Erro ao atualizar registro de caixa' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const dados = lerDados();

    if (!dados.caixa) {
      dados.caixa = [];
    }

    const index = dados.caixa.findIndex((c) => c.id === id);
    if (index === -1) {
      return Response.json({ error: 'Registro não encontrado' }, { status: 404 });
    }

    dados.caixa.splice(index, 1);

    // Recalcular todos os saldos em ordem cronológica
    const todosRegistros = [...dados.caixa].sort((a, b) => {
      const dataA = a.data ? new Date(a.data) : new Date(0);
      const dataB = b.data ? new Date(b.data) : new Date(0);
      if (dataA.getTime() === dataB.getTime()) {
        return (a.dataCadastro || '').localeCompare(b.dataCadastro || '');
      }
      return dataA - dataB;
    });

    let saldoAcumulado = 0;
    todosRegistros.forEach((reg) => {
      const valorReg = reg.valor || 0;
      saldoAcumulado = reg.tipo === 'entrada' 
        ? saldoAcumulado + valorReg 
        : saldoAcumulado - valorReg;
      reg.saldo = saldoAcumulado;
    });

    // Atualizar o array original com os saldos recalculados
    todosRegistros.forEach((reg) => {
      const idx = dados.caixa.findIndex(c => c.id === reg.id);
      if (idx >= 0) {
        dados.caixa[idx].saldo = reg.saldo;
      }
    });

    salvarDados(dados);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover registro de caixa:', error);
    return Response.json({ error: 'Erro ao remover registro de caixa' }, { status: 500 });
  }
}


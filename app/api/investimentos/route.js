import { lerDados, salvarDados } from '@/lib/data';

export async function GET() {
  try {
    const dados = lerDados();
    return Response.json(dados.investimentos || []);
  } catch (error) {
    console.error('Erro ao buscar investimentos:', error);
    return Response.json({ error: 'Erro ao buscar investimentos' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const investimento = await request.json();
    const dados = lerDados();

    if (!dados.investimentos) {
      dados.investimentos = [];
    }

    // Calcular saldo acumulado
    const investimentosOrdenados = [...dados.investimentos].sort((a, b) => {
      const dataA = a.data ? new Date(a.data) : new Date(0);
      const dataB = b.data ? new Date(b.data) : new Date(0);
      return dataA - dataB; // Ordenar por data crescente
    });

    // Calcular saldo anterior
    let saldoAnterior = 0;
    if (investimentosOrdenados.length > 0) {
      saldoAnterior = investimentosOrdenados[investimentosOrdenados.length - 1].saldo || 0;
    }

    // Calcular novo saldo
    const valor = investimento.valor || 0;
    const novoSaldo = investimento.tipo === 'entrada' 
      ? saldoAnterior + valor 
      : saldoAnterior - valor;

    const novoInvestimento = {
      ...investimento,
      saldo: novoSaldo,
      id: Date.now().toString(),
      dataCadastro: new Date().toISOString(),
      ultimaAtualizacao: new Date().toISOString(),
    };

    dados.investimentos.push(novoInvestimento);

    // Recalcular saldos de todos os registros após este (se houver)
    const dataNovo = investimento.data ? new Date(investimento.data) : new Date();
    const investimentosPosteriores = dados.investimentos.filter(inv => {
      if (!inv.data) return false;
      const dataInv = new Date(inv.data);
      return dataInv > dataNovo || (dataInv.getTime() === dataNovo.getTime() && inv.id !== novoInvestimento.id);
    });

    // Recalcular saldos em ordem cronológica
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

    salvarDados(dados);

    // Criar registro no caixa
    if (!dados.caixa) {
      dados.caixa = [];
    }

    // Calcular saldo do caixa
    const caixaOrdenado = [...dados.caixa].sort((a, b) => {
      const dataA = a.data ? new Date(a.data) : new Date(0);
      const dataB = b.data ? new Date(b.data) : new Date(0);
      if (dataA.getTime() === dataB.getTime()) {
        return (a.dataCadastro || '').localeCompare(b.dataCadastro || '');
      }
      return dataA - dataB;
    });

    let saldoCaixaAnterior = 0;
    if (caixaOrdenado.length > 0) {
      saldoCaixaAnterior = caixaOrdenado[caixaOrdenado.length - 1].saldo || 0;
    }

    const novoSaldoCaixa = investimento.tipo === 'entrada' 
      ? saldoCaixaAnterior + valor 
      : saldoCaixaAnterior - valor;

    const registroCaixa = {
      data: investimento.data,
      descricao: `Investimento: ${investimento.descricao || 'Sem descrição'}`,
      valor: valor,
      tipo: investimento.tipo,
      saldo: novoSaldoCaixa,
      origem: 'investimento',
      id: Date.now().toString() + '_caixa',
      dataCadastro: new Date().toISOString(),
      ultimaAtualizacao: new Date().toISOString(),
    };

    dados.caixa.push(registroCaixa);

    // Recalcular saldos do caixa
    const todosCaixa = [...dados.caixa].sort((a, b) => {
      const dataA = a.data ? new Date(a.data) : new Date(0);
      const dataB = b.data ? new Date(b.data) : new Date(0);
      if (dataA.getTime() === dataB.getTime()) {
        return (a.dataCadastro || '').localeCompare(b.dataCadastro || '');
      }
      return dataA - dataB;
    });

    let saldoAcumuladoCaixa = 0;
    todosCaixa.forEach((reg) => {
      const valorReg = reg.valor || 0;
      saldoAcumuladoCaixa = reg.tipo === 'entrada' 
        ? saldoAcumuladoCaixa + valorReg 
        : saldoAcumuladoCaixa - valorReg;
      reg.saldo = saldoAcumuladoCaixa;
    });

    salvarDados(dados);

    return Response.json(novoInvestimento, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar investimento:', error);
    return Response.json({ error: 'Erro ao criar investimento' }, { status: 500 });
  }
}


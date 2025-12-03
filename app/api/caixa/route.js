import { lerDados, salvarDados } from '@/lib/data';

export async function GET() {
  try {
    const dados = lerDados();
    return Response.json(dados.caixa || []);
  } catch (error) {
    console.error('Erro ao buscar caixa:', error);
    return Response.json({ error: 'Erro ao buscar caixa' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const registro = await request.json();
    const dados = lerDados();

    if (!dados.caixa) {
      dados.caixa = [];
    }

    // Calcular saldo acumulado
    const registrosOrdenados = [...dados.caixa].sort((a, b) => {
      const dataA = a.data ? new Date(a.data) : new Date(0);
      const dataB = b.data ? new Date(b.data) : new Date(0);
      if (dataA.getTime() === dataB.getTime()) {
        return (a.dataCadastro || '').localeCompare(b.dataCadastro || '');
      }
      return dataA - dataB; // Ordenar por data crescente
    });

    // Calcular saldo anterior
    let saldoAnterior = 0;
    if (registrosOrdenados.length > 0) {
      saldoAnterior = registrosOrdenados[registrosOrdenados.length - 1].saldo || 0;
    }

    // Calcular novo saldo
    const valor = registro.valor || 0;
    const novoSaldo = registro.tipo === 'entrada' 
      ? saldoAnterior + valor 
      : saldoAnterior - valor;

    const novoRegistro = {
      ...registro,
      saldo: novoSaldo,
      id: Date.now().toString(),
      dataCadastro: new Date().toISOString(),
      ultimaAtualizacao: new Date().toISOString(),
    };

    dados.caixa.push(novoRegistro);

    // Recalcular saldos em ordem cronológica
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

    salvarDados(dados);

    return Response.json(novoRegistro, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar registro de caixa:', error);
    return Response.json({ error: 'Erro ao criar registro de caixa' }, { status: 500 });
  }
}


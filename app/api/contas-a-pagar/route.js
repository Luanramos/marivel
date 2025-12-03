import { lerDados, salvarDados } from '@/lib/data';

export async function GET() {
  try {
    const dados = lerDados();
    return Response.json(dados.contasAPagar || []);
  } catch (error) {
    console.error('Erro ao buscar contas a pagar:', error);
    return Response.json({ error: 'Erro ao buscar contas a pagar' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const conta = await request.json();
    const dados = lerDados();

    if (!dados.contasAPagar) {
      dados.contasAPagar = [];
    }

    const novaConta = {
      ...conta,
      id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
      dataCadastro: new Date().toISOString(),
      ultimaAtualizacao: new Date().toISOString(),
      pago: conta.pago || false,
      valorPago: conta.valorPago || 0,
    };

    // Se foi criada como paga e tem valor pago, criar lançamento no caixa
    if (novaConta.pago && novaConta.valorPago > 0) {
      if (!dados.caixa) {
        dados.caixa = [];
      }

      // Calcular saldo anterior (ordenar por data e calcular sequencialmente)
      const caixaOrdenado = [...dados.caixa].sort((a, b) => new Date(a.data) - new Date(b.data));
      let saldoAnterior = 0;
      caixaOrdenado.forEach(lancamento => {
        if (lancamento.tipo === 'entrada') {
          saldoAnterior += lancamento.valor || 0;
        } else {
          saldoAnterior -= lancamento.valor || 0;
        }
      });

      const lancamentoCaixa = {
        id: Date.now().toString() + '_caixa',
        data: novaConta.dataPagamento || new Date().toISOString(),
        descricao: `Pagamento: ${novaConta.fornecedor || 'Fornecedor'} - ${novaConta.descricao || 'Conta a pagar'}`,
        valor: novaConta.valorPago,
        tipo: 'saida',
        saldo: saldoAnterior - novaConta.valorPago,
        origem: 'contas_a_pagar',
        origemId: novaConta.id,
        dataCadastro: new Date().toISOString(),
      };

      dados.caixa.push(lancamentoCaixa);

      // Recalcular saldos de todos os lançamentos de caixa
      let saldoAtual = saldoAnterior;
      dados.caixa.sort((a, b) => new Date(a.data) - new Date(b.data));
      dados.caixa.forEach(lancamento => {
        if (lancamento.tipo === 'entrada') {
          saldoAtual += lancamento.valor || 0;
        } else {
          saldoAtual -= lancamento.valor || 0;
        }
        lancamento.saldo = saldoAtual;
      });
    }

    dados.contasAPagar.push(novaConta);
    salvarDados(dados);

    return Response.json(novaConta, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar conta a pagar:', error);
    return Response.json({ error: 'Erro ao criar conta a pagar' }, { status: 500 });
  }
}


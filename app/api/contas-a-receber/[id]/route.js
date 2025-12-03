import { lerDados, salvarDados } from '@/lib/data';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const dados = lerDados();
    const conta = dados.contasAReceber?.find((c) => c.id === id);

    if (!conta) {
      return Response.json({ error: 'Conta a receber não encontrada' }, { status: 404 });
    }

    return Response.json(conta);
  } catch (error) {
    console.error('Erro ao buscar conta a receber:', error);
    return Response.json({ error: 'Erro ao buscar conta a receber' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const contaAtualizada = await request.json();
    const dados = lerDados();

    if (!dados.contasAReceber) {
      dados.contasAReceber = [];
    }

    const index = dados.contasAReceber.findIndex((c) => c.id === id);
    if (index === -1) {
      return Response.json({ error: 'Conta a receber não encontrada' }, { status: 404 });
    }

    const contaAnterior = dados.contasAReceber[index];
    const recebidoAnterior = contaAnterior.recebido;
    const recebidoNovo = contaAtualizada.recebido || false;

    dados.contasAReceber[index] = {
      ...dados.contasAReceber[index],
      ...contaAtualizada,
      id,
      ultimaAtualizacao: new Date().toISOString(),
    };

    // Se foi marcado como recebido e tem valor recebido, criar lançamento no caixa
    if (recebidoNovo && !recebidoAnterior && contaAtualizada.valorRecebido > 0) {
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

      const valorRecebido = contaAtualizada.valorRecebido || 0;
      const novoSaldoCaixa = saldoCaixaAnterior + valorRecebido;

      const registroCaixa = {
        data: contaAtualizada.dataRecebimento || new Date().toISOString(),
        descricao: `Recebimento: ${contaAnterior.cliente || 'Cliente não informado'} - ${contaAnterior.codigoVenda || ''}`,
        valor: valorRecebido,
        tipo: 'entrada',
        saldo: novoSaldoCaixa,
        origem: 'contas-a-receber',
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
    }

    salvarDados(dados);
    return Response.json(dados.contasAReceber[index]);
  } catch (error) {
    console.error('Erro ao atualizar conta a receber:', error);
    return Response.json({ error: 'Erro ao atualizar conta a receber' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const dados = lerDados();

    if (!dados.contasAReceber) {
      dados.contasAReceber = [];
    }

    const index = dados.contasAReceber.findIndex((c) => c.id === id);
    if (index === -1) {
      return Response.json({ error: 'Conta a receber não encontrada' }, { status: 404 });
    }

    dados.contasAReceber.splice(index, 1);
    salvarDados(dados);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover conta a receber:', error);
    return Response.json({ error: 'Erro ao remover conta a receber' }, { status: 500 });
  }
}


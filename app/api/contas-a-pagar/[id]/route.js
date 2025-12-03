import { lerDados, salvarDados } from '@/lib/data';

export async function GET(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    
    let idBuscado = String(id);
    try {
      idBuscado = decodeURIComponent(idBuscado);
    } catch (e) {
      // Se falhar, usar o ID original
    }
    idBuscado = idBuscado.trim();
    
    const dados = lerDados();
    
    const conta = dados.contasAPagar?.find((c) => {
      const idConta = String(c.id).trim();
      return idConta === idBuscado || idConta === String(id).trim();
    });

    if (!conta) {
      return Response.json({ error: 'Conta a pagar não encontrada' }, { status: 404 });
    }

    return Response.json(conta);
  } catch (error) {
    console.error('Erro ao buscar conta a pagar:', error);
    return Response.json({ error: 'Erro ao buscar conta a pagar' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    // Em Next.js 15+, params pode ser uma Promise, então precisamos await
    // Mas em Next.js 16 pode ser direto também, então vamos tratar ambos os casos
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    
    const contaAtualizada = await request.json();
    const dados = lerDados();

    if (!dados.contasAPagar) {
      dados.contasAPagar = [];
    }

    // Normalizar o ID recebido - tentar decodificar, mas usar original se falhar
    let idBuscado = String(id);
    try {
      idBuscado = decodeURIComponent(idBuscado);
    } catch (e) {
      // Se falhar, usar o ID original
    }
    idBuscado = idBuscado.trim();
    
    // Buscar a conta - comparar de forma flexível
    let index = -1;
    for (let i = 0; i < dados.contasAPagar.length; i++) {
      const conta = dados.contasAPagar[i];
      const idConta = String(conta.id).trim();
      
      // Comparar exatamente
      if (idConta === idBuscado) {
        index = i;
        break;
      }
      
      // Comparar com o ID original (sem decodificar)
      if (idConta === String(id).trim()) {
        index = i;
        break;
      }
    }
    
    if (index === -1) {
      // Log detalhado para debug
      const idsDisponiveis = dados.contasAPagar.map(c => String(c.id));
      console.error('=== ERRO: Conta a pagar não encontrada ===');
      console.error('ID recebido (params):', id);
      console.error('ID buscado (normalizado):', idBuscado);
      console.error('Tipo do ID recebido:', typeof id);
      console.error('Total de contas:', dados.contasAPagar.length);
      console.error('Todos os IDs disponíveis:', idsDisponiveis);
      console.error('Primeira conta (exemplo):', dados.contasAPagar[0] ? {
        id: dados.contasAPagar[0].id,
        tipo: typeof dados.contasAPagar[0].id,
        idString: String(dados.contasAPagar[0].id)
      } : 'Nenhuma conta disponível');
      
      return Response.json({ 
        error: 'Conta a pagar não encontrada',
        idBuscado: id,
        idNormalizado: idBuscado,
        totalContas: dados.contasAPagar.length,
        idsDisponiveis: idsDisponiveis
      }, { status: 404 });
    }

    const contaAnterior = dados.contasAPagar[index];
    const contaFinal = {
      ...dados.contasAPagar[index],
      ...contaAtualizada,
      id: dados.contasAPagar[index].id, // Manter o ID original da conta
      ultimaAtualizacao: new Date().toISOString(),
    };

    // Se foi marcado como pago e tem valor pago, criar lançamento no caixa
    if (contaFinal.pago && contaFinal.valorPago > 0 && !contaAnterior.pago) {
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
        data: contaFinal.dataPagamento || new Date().toISOString(),
        descricao: `Pagamento: ${contaFinal.fornecedor || 'Fornecedor'} - ${contaFinal.descricao || 'Conta a pagar'}`,
        valor: contaFinal.valorPago,
        tipo: 'saida',
        saldo: saldoAnterior - contaFinal.valorPago,
        origem: 'contas_a_pagar',
        origemId: id,
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

    dados.contasAPagar[index] = contaFinal;
    salvarDados(dados);

    return Response.json(contaFinal);
  } catch (error) {
    console.error('Erro ao atualizar conta a pagar:', error);
    return Response.json({ error: 'Erro ao atualizar conta a pagar' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    
    let idBuscado = String(id);
    try {
      idBuscado = decodeURIComponent(idBuscado);
    } catch (e) {
      // Se falhar, usar o ID original
    }
    idBuscado = idBuscado.trim();
    
    const dados = lerDados();

    if (!dados.contasAPagar) {
      dados.contasAPagar = [];
    }

    let index = -1;
    for (let i = 0; i < dados.contasAPagar.length; i++) {
      const conta = dados.contasAPagar[i];
      const idConta = String(conta.id).trim();
      if (idConta === idBuscado || idConta === String(id).trim()) {
        index = i;
        break;
      }
    }
    
    if (index === -1) {
      return Response.json({ error: 'Conta a pagar não encontrada' }, { status: 404 });
    }

    dados.contasAPagar.splice(index, 1);
    salvarDados(dados);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover conta a pagar:', error);
    return Response.json({ error: 'Erro ao remover conta a pagar' }, { status: 500 });
  }
}


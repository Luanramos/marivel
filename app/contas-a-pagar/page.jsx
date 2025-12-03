'use client';

import { useState } from 'react';
import { useEstoque } from '@/lib/EstoqueContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { formatarMoeda, formatarValorInput, parseValorInput, formatarValorEmTempoReal } from '@/lib/utils';

export default function ContasAPagarPage() {
  const { contasAPagar, adicionarContaAPagar, atualizarContaAPagar, removerContaAPagar } = useEstoque();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarFormularioNovo, setMostrarFormularioNovo] = useState(false);
  const [contaEditando, setContaEditando] = useState(null);
  const [filtro, setFiltro] = useState('');

  const [formData, setFormData] = useState({
    dataVencimento: '',
    dataPagamento: '',
    valorPago: 0,
  });

  const [formDataNovo, setFormDataNovo] = useState({
    fornecedor: '',
    descricao: '',
    valor: 0,
    dataVencimento: '',
    formaPagamento: '',
    parcelas: 1,
    dataPagamento: '',
    valorPago: 0,
  });

  // Formatar data para input (dd/mm/aaaa)
  const formatarDataParaInput = (data) => {
    if (!data) return '';
    const date = data instanceof Date ? data : new Date(data);
    if (isNaN(date.getTime())) return '';
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = date.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  // Converter data do input (dd/mm/aaaa) para Date
  const parseDataDoInput = (dataStr) => {
    if (!dataStr) return null;
    const partes = dataStr.split('/');
    if (partes.length !== 3) return null;
    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1;
    const ano = parseInt(partes[2], 10);
    const date = new Date(ano, mes, dia);
    if (isNaN(date.getTime())) return null;
    return date;
  };

  // Formatar data enquanto digita (dd/mm/aaaa)
  const formatarDataEmTempoReal = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length === 0) return '';
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 4) return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
    return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4, 8)}`;
  };

  // Converter data para formato ISO (aaaa-mm-dd) para input type="date"
  const formatarDataParaISO = (data) => {
    if (!data) return '';
    if (data.match(/^\d{4}-\d{2}-\d{2}$/)) return data;
    const date = data instanceof Date ? data : new Date(data);
    if (!isNaN(date.getTime())) {
      const dia = String(date.getDate()).padStart(2, '0');
      const mes = String(date.getMonth() + 1).padStart(2, '0');
      const ano = date.getFullYear();
      return `${ano}-${mes}-${dia}`;
    }
    const partes = data.split('/');
    if (partes.length === 3 && partes[2].length === 4) {
      return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
    }
    return '';
  };

  // Converter de ISO (aaaa-mm-dd) para dd/mm/aaaa
  const converterISOparaBR = (isoStr) => {
    if (!isoStr) return '';
    const partes = isoStr.split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return isoStr;
  };

  const resetForm = () => {
    setFormData({
      dataVencimento: '',
      dataPagamento: '',
      valorPago: 0,
    });
    setContaEditando(null);
    setMostrarFormulario(false);
  };

  const resetFormNovo = () => {
    setFormDataNovo({
      fornecedor: '',
      descricao: '',
      valor: 0,
      dataVencimento: '',
      formaPagamento: '',
      parcelas: 1,
      dataPagamento: '',
      valorPago: 0,
    });
    setMostrarFormularioNovo(false);
  };

  const handleSubmitNovo = async (e) => {
    e.preventDefault();

    // Validar campos obrigatórios
    if (!formDataNovo.descricao.trim()) {
      alert('Por favor, informe a descrição.');
      return;
    }

    if (!formDataNovo.dataVencimento.trim()) {
      alert('Por favor, informe a data de vencimento.');
      return;
    }

    if (!formDataNovo.valor || formDataNovo.valor <= 0) {
      alert('Por favor, informe um valor válido.');
      return;
    }

    const parcelas = parseInt(formDataNovo.parcelas) || 1;
    if (parcelas < 1) {
      alert('A quantidade de parcelas deve ser maior que zero.');
      return;
    }

    try {
      // Converter data de vencimento para ISO
      const dataVencimentoBase = parseDataDoInput(formDataNovo.dataVencimento);
      if (!dataVencimentoBase) {
        alert('Data de vencimento inválida.');
        return;
      }

      const valorTotal = parseFloat(formDataNovo.valor);
      const valorParcela = valorTotal / parcelas;

      // Se for parcelado, criar múltiplas contas
      if (parcelas > 1) {
        for (let i = 1; i <= parcelas; i++) {
          // Calcular data de vencimento (30 dias por parcela a partir da data base)
          const dataVencimento = new Date(dataVencimentoBase);
          dataVencimento.setDate(dataVencimento.getDate() + ((i - 1) * 30));

          let dataPagamentoParsed = null;
          if (formDataNovo.dataPagamento && formDataNovo.dataPagamento.trim() !== '') {
            dataPagamentoParsed = parseDataDoInput(formDataNovo.dataPagamento);
          }

          const novaConta = {
            fornecedor: formDataNovo.fornecedor || '',
            descricao: `${formDataNovo.descricao} - Parcela ${i}/${parcelas}`,
            valor: valorParcela,
            dataVencimento: dataVencimento.toISOString(),
            formaPagamento: formDataNovo.formaPagamento || '',
            parcela: i,
            totalParcelas: parcelas,
            dataPagamento: dataPagamentoParsed ? dataPagamentoParsed.toISOString() : null,
            valorPago: i === 1 ? (parseFloat(formDataNovo.valorPago) || 0) : 0, // Só marca como pago a primeira parcela se informado
            pago: i === 1 && parseFloat(formDataNovo.valorPago) > 0,
          };

          await adicionarContaAPagar(novaConta);
        }
        resetFormNovo();
        alert(`${parcelas} parcela(s) adicionada(s) com sucesso!`);
      } else {
        // Se for à vista, criar apenas uma conta
        let dataPagamentoParsed = null;
        if (formDataNovo.dataPagamento && formDataNovo.dataPagamento.trim() !== '') {
          dataPagamentoParsed = parseDataDoInput(formDataNovo.dataPagamento);
        }

        const novaConta = {
          fornecedor: formDataNovo.fornecedor || '',
          descricao: formDataNovo.descricao,
          valor: valorTotal,
          dataVencimento: dataVencimentoBase.toISOString(),
          formaPagamento: formDataNovo.formaPagamento || '',
          dataPagamento: dataPagamentoParsed ? dataPagamentoParsed.toISOString() : null,
          valorPago: parseFloat(formDataNovo.valorPago) || 0,
          pago: parseFloat(formDataNovo.valorPago) > 0,
        };

        await adicionarContaAPagar(novaConta);
        resetFormNovo();
        alert('Conta a pagar adicionada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao adicionar conta a pagar:', error);
      alert(`Erro ao adicionar conta a pagar: ${error.message || 'Erro desconhecido'}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!contaEditando) return;

    // Converter datas para ISO
    let dataVencimentoFinal = null;
    
    // Priorizar o valor do formulário se foi alterado
    if (formData.dataVencimento && formData.dataVencimento.trim() !== '') {
      const dataParsed = parseDataDoInput(formData.dataVencimento);
      if (dataParsed) {
        dataVencimentoFinal = dataParsed.toISOString();
      }
    }
    
    // Se não foi possível obter do formulário, usar a data existente
    if (!dataVencimentoFinal && contaEditando.dataVencimento) {
      if (contaEditando.dataVencimento instanceof Date) {
        dataVencimentoFinal = contaEditando.dataVencimento.toISOString();
      } else if (typeof contaEditando.dataVencimento === 'string') {
        // Se já é uma string ISO, usar diretamente
        dataVencimentoFinal = contaEditando.dataVencimento;
      } else {
        // Tentar converter de qualquer formato
        const date = new Date(contaEditando.dataVencimento);
        if (!isNaN(date.getTime())) {
          dataVencimentoFinal = date.toISOString();
        }
      }
    }

    let dataPagamentoFinal = null;
    if (formData.dataPagamento) {
      const dataParsed = parseDataDoInput(formData.dataPagamento);
      dataPagamentoFinal = dataParsed ? dataParsed.toISOString() : null;
    } else if (contaEditando.dataPagamento) {
      // Se não foi alterada, usar a data existente convertida para ISO
      if (contaEditando.dataPagamento instanceof Date) {
        dataPagamentoFinal = contaEditando.dataPagamento.toISOString();
      } else if (typeof contaEditando.dataPagamento === 'string') {
        dataPagamentoFinal = contaEditando.dataPagamento;
      }
    }

    // Enviar apenas os campos que podem ser atualizados
    // Garantir que sempre temos valores válidos
    const contaAtualizada = {
      dataVencimento: dataVencimentoFinal || contaEditando.dataVencimento,
      dataPagamento: dataPagamentoFinal || contaEditando.dataPagamento || null,
      valorPago: parseFloat(formData.valorPago) || 0,
      pago: parseFloat(formData.valorPago) > 0,
    };
    
    // Se dataVencimento ainda não foi definida, usar a data existente
    if (!contaAtualizada.dataVencimento && contaEditando.dataVencimento) {
      if (typeof contaEditando.dataVencimento === 'string') {
        contaAtualizada.dataVencimento = contaEditando.dataVencimento;
      } else if (contaEditando.dataVencimento instanceof Date) {
        contaAtualizada.dataVencimento = contaEditando.dataVencimento.toISOString();
      } else {
        const date = new Date(contaEditando.dataVencimento);
        if (!isNaN(date.getTime())) {
          contaAtualizada.dataVencimento = date.toISOString();
        }
      }
    }

    try {
      if (!contaEditando || !contaEditando.id) {
        throw new Error('ID da conta a pagar não encontrado');
      }
      
      // Validar que temos dados para enviar
      if (!dataVencimentoFinal) {
        throw new Error('Data de vencimento é obrigatória. Por favor, informe uma data válida.');
      }
      
      // Garantir que o ID seja uma string
      const idConta = String(contaEditando.id);
      
      // Validar que o objeto tem dados válidos
      if (!contaAtualizada.dataVencimento) {
        console.error('Erro: dataVencimento está vazia', {
          formData: formData,
          contaEditando: contaEditando,
          dataVencimentoFinal: dataVencimentoFinal
        });
        throw new Error('Data de vencimento é obrigatória. Por favor, verifique o formulário.');
      }
      
      console.log('Atualizando conta a pagar:', {
        id: idConta,
        tipoId: typeof idConta,
        dados: contaAtualizada,
        temDataVencimento: !!contaAtualizada.dataVencimento
      });
      
      await atualizarContaAPagar(idConta, contaAtualizada);
      resetForm();
    } catch (error) {
      console.error('Erro ao atualizar conta a pagar:', error);
      console.error('ID da conta:', contaEditando?.id);
      console.error('Tipo do ID:', typeof contaEditando?.id);
      console.error('Dados a enviar:', contaAtualizada);
      alert(`Erro ao atualizar conta a pagar: ${error.message || 'Erro desconhecido'}. Verifique o console para mais detalhes.`);
    }
  };

  const handleEdit = (conta) => {
    setContaEditando(conta);
    // Garantir que sempre temos uma data de vencimento formatada
    let dataVencimentoFormatada = '';
    if (conta.dataVencimento) {
      dataVencimentoFormatada = formatarDataParaInput(conta.dataVencimento);
    }
    
    const dataPagamentoFormatada = conta.dataPagamento ? formatarDataParaInput(conta.dataPagamento) : '';
    setFormData({
      dataVencimento: dataVencimentoFormatada,
      dataPagamento: dataPagamentoFormatada,
      valorPago: conta.valorPago || 0,
    });
    setMostrarFormulario(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja excluir esta conta a pagar?')) {
      try {
        await removerContaAPagar(id);
      } catch (error) {
        console.error('Erro ao remover conta a pagar:', error);
        alert('Erro ao remover conta a pagar. Verifique o console para mais detalhes.');
      }
    }
  };

  const contasFiltradas = contasAPagar.filter((conta) => {
    const busca = filtro.toLowerCase();
    return (
      (conta.fornecedor && conta.fornecedor.toLowerCase().includes(busca)) ||
      (conta.codigoCompra && conta.codigoCompra.toLowerCase().includes(busca)) ||
      (conta.descricao && conta.descricao.toLowerCase().includes(busca))
    );
  });

  // Ordenar por data de vencimento (mais próximo primeiro)
  const contasOrdenadas = [...contasFiltradas].sort((a, b) => {
    const dataA = a.dataVencimento ? new Date(a.dataVencimento) : new Date(0);
    const dataB = b.dataVencimento ? new Date(b.dataVencimento) : new Date(0);
    return dataA - dataB;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📋 Contas a Pagar</h1>
            <p className="text-gray-600 mt-1">Gerencie as contas a pagar das compras</p>
          </div>
          <Button
            variant="primary"
            onClick={() => setMostrarFormularioNovo(true)}
          >
            ➕ Adicionar Nova Conta
          </Button>
        </div>

        {mostrarFormularioNovo && (
          <Card className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              ➕ Nova Conta a Pagar
            </h2>
            <form onSubmit={handleSubmitNovo}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição *
                  </label>
                  <input
                    type="text"
                    required
                    value={formDataNovo.descricao}
                    onChange={(e) => setFormDataNovo({ ...formDataNovo, descricao: e.target.value })}
                    placeholder="Ex: Aluguel, Fornecedor X, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fornecedor
                  </label>
                  <input
                    type="text"
                    value={formDataNovo.fornecedor}
                    onChange={(e) => setFormDataNovo({ ...formDataNovo, fornecedor: e.target.value })}
                    placeholder="Nome do fornecedor (opcional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                    <input
                      type="text"
                      required
                      value={formatarValorInput(formDataNovo.valor)}
                      onChange={(e) => {
                        const valorFormatado = formatarValorEmTempoReal(e.target.value);
                        const numValor = parseValorInput(valorFormatado);
                        setFormDataNovo({ ...formDataNovo, valor: numValor });
                      }}
                      placeholder="0,00"
                      className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Vencimento *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formDataNovo.dataVencimento}
                      onChange={(e) => {
                        const valorFormatado = formatarDataEmTempoReal(e.target.value);
                        setFormDataNovo({ ...formDataNovo, dataVencimento: valorFormatado });
                      }}
                      placeholder="dd/mm/aaaa"
                      maxLength={10}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent"
                    />
                    <input
                      type="date"
                      value={formatarDataParaISO(formDataNovo.dataVencimento)}
                      onChange={(e) => {
                        if (e.target.value) {
                          const dataBR = converterISOparaBR(e.target.value);
                          setFormDataNovo({ ...formDataNovo, dataVencimento: dataBR });
                        }
                      }}
                      className="absolute right-0 top-0 h-full w-10 opacity-0 cursor-pointer z-10"
                      title="Abrir calendário"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-0">📅</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Forma de Pagamento
                  </label>
                  <select
                    value={formDataNovo.formaPagamento}
                    onChange={(e) => setFormDataNovo({ ...formDataNovo, formaPagamento: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent"
                  >
                    <option value="">Selecione...</option>
                    <option value="Pix">Pix</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Cartão Crédito">Cartão Crédito</option>
                    <option value="Cartão Débito">Cartão Débito</option>
                    <option value="Boleto">Boleto</option>
                    <option value="Transferência">Transferência</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantidade de Parcelas
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formDataNovo.parcelas}
                    onChange={(e) => {
                      const valor = parseInt(e.target.value) || 1;
                      setFormDataNovo({ ...formDataNovo, parcelas: valor > 0 ? valor : 1 });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent"
                  />
                  {formDataNovo.parcelas > 1 && formDataNovo.valor > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Valor por parcela: {formatarMoeda((formDataNovo.valor || 0) / formDataNovo.parcelas)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Pagamento
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formDataNovo.dataPagamento}
                      onChange={(e) => {
                        const valorFormatado = formatarDataEmTempoReal(e.target.value);
                        setFormDataNovo({ ...formDataNovo, dataPagamento: valorFormatado });
                      }}
                      placeholder="dd/mm/aaaa"
                      maxLength={10}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent"
                    />
                    <input
                      type="date"
                      value={formatarDataParaISO(formDataNovo.dataPagamento)}
                      onChange={(e) => {
                        if (e.target.value) {
                          const dataBR = converterISOparaBR(e.target.value);
                          setFormDataNovo({ ...formDataNovo, dataPagamento: dataBR });
                        }
                      }}
                      className="absolute right-0 top-0 h-full w-10 opacity-0 cursor-pointer z-10"
                      title="Abrir calendário"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-0">📅</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor Pago
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                    <input
                      type="text"
                      value={formatarValorInput(formDataNovo.valorPago)}
                      onChange={(e) => {
                        const valorFormatado = formatarValorEmTempoReal(e.target.value);
                        const numValor = parseValorInput(valorFormatado);
                        setFormDataNovo({ ...formDataNovo, valorPago: numValor });
                      }}
                      placeholder="0,00"
                      className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" variant="primary">
                  💾 Salvar Conta
                </Button>
                <Button type="button" variant="secondary" onClick={resetFormNovo}>
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        )}

        {mostrarFormulario && contaEditando && (
          <Card className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              ✏️ Editar Conta a Pagar
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fornecedor
                  </label>
                  <input
                    type="text"
                    value={contaEditando.fornecedor || ''}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor Total
                  </label>
                  <input
                    type="text"
                    value={formatarMoeda(contaEditando.valor || 0)}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>
                {contaEditando.parcela && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parcela
                    </label>
                    <input
                      type="text"
                      value={`${contaEditando.parcela}/${contaEditando.totalParcelas || 1}`}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Vencimento *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.dataVencimento}
                      onChange={(e) => {
                        const valorFormatado = formatarDataEmTempoReal(e.target.value);
                        setFormData({ ...formData, dataVencimento: valorFormatado });
                      }}
                      placeholder="dd/mm/aaaa"
                      maxLength={10}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent"
                    />
                    <input
                      type="date"
                      value={formatarDataParaISO(formData.dataVencimento)}
                      onChange={(e) => {
                        if (e.target.value) {
                          const dataBR = converterISOparaBR(e.target.value);
                          setFormData({ ...formData, dataVencimento: dataBR });
                        }
                      }}
                      className="absolute right-0 top-0 h-full w-10 opacity-0 cursor-pointer z-10"
                      title="Abrir calendário"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-0">📅</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Pagamento
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.dataPagamento}
                      onChange={(e) => {
                        const valorFormatado = formatarDataEmTempoReal(e.target.value);
                        setFormData({ ...formData, dataPagamento: valorFormatado });
                      }}
                      placeholder="dd/mm/aaaa"
                      maxLength={10}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent"
                    />
                    <input
                      type="date"
                      value={formatarDataParaISO(formData.dataPagamento)}
                      onChange={(e) => {
                        if (e.target.value) {
                          const dataBR = converterISOparaBR(e.target.value);
                          setFormData({ ...formData, dataPagamento: dataBR });
                        }
                      }}
                      className="absolute right-0 top-0 h-full w-10 opacity-0 cursor-pointer z-10"
                      title="Abrir calendário"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-0">📅</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor Pago
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                    <input
                      type="text"
                      value={formatarValorInput(formData.valorPago)}
                      onChange={(e) => {
                        const valorFormatado = formatarValorEmTempoReal(e.target.value);
                        const numValor = parseValorInput(valorFormatado);
                        setFormData({ ...formData, valorPago: numValor });
                      }}
                      placeholder="0,00"
                      className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" variant="primary">
                  💾 Salvar Alterações
                </Button>
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Barra de Pesquisa */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 Pesquisar por fornecedor, código de compra ou descrição..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Lista de Contas a Pagar */}
        <Card>
          {contasOrdenadas.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              Nenhuma conta a pagar encontrada
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Data Compra</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Data Vencimento</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Fornecedor</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Descrição</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Parcela</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Valor</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Forma Pagamento</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Data Pagamento</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Valor Pago</th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Status</th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {contasOrdenadas.map((conta) => {
                    const dataCompraFormatada = conta.dataCompra ? formatarDataParaInput(conta.dataCompra) : '-';
                    const dataVencimentoFormatada = conta.dataVencimento ? formatarDataParaInput(conta.dataVencimento) : '-';
                    const dataPagamentoFormatada = conta.dataPagamento ? formatarDataParaInput(conta.dataPagamento) : '-';
                    const hoje = new Date();
                    const vencimento = conta.dataVencimento ? new Date(conta.dataVencimento) : null;
                    const estaVencida = vencimento && vencimento < hoje && !conta.pago;
                    return (
                      <tr key={conta.id} className={`hover:bg-gray-50 ${estaVencida ? 'bg-red-50' : ''} ${conta.pago ? 'opacity-60' : ''}`}>
                        <td className="py-4 px-4 text-sm text-gray-600">{dataCompraFormatada}</td>
                        <td className={`py-4 px-4 text-sm font-medium ${estaVencida ? 'text-red-600' : 'text-gray-600'}`}>
                          {dataVencimentoFormatada}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">{conta.fornecedor || '-'}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">{conta.descricao || '-'}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {conta.parcela ? `${conta.parcela}/${conta.totalParcelas || 1}` : '-'}
                        </td>
                        <td className="py-4 px-4 text-sm font-semibold text-gray-900">
                          {formatarMoeda(conta.valor || 0)}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">{conta.formaPagamento || '-'}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">{dataPagamentoFormatada}</td>
                        <td className="py-4 px-4 text-sm font-semibold text-gray-900">
                          {conta.valorPago > 0 ? formatarMoeda(conta.valorPago) : '-'}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            conta.pago
                              ? 'bg-green-100 text-green-700'
                              : estaVencida
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {conta.pago ? 'Pago' : estaVencida ? 'Vencida' : 'Pendente'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            {!conta.pago && (
                              <button
                                onClick={() => handleEdit(conta)}
                                className="p-2 text-gray-400 hover:text-[#174759] transition-colors"
                                title="Registrar Pagamento"
                              >
                                ✏️
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(conta.id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              title="Excluir"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}


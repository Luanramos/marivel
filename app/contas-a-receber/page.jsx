'use client';

import { useState } from 'react';
import { useEstoque } from '@/lib/EstoqueContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { formatarMoeda, formatarValorInput, parseValorInput, formatarValorEmTempoReal } from '@/lib/utils';

export default function ContasAReceberPage() {
  const { contasAReceber, atualizarContaAReceber, removerContaAReceber } = useEstoque();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [contaEditando, setContaEditando] = useState(null);
  const [filtro, setFiltro] = useState('');

  const [formData, setFormData] = useState({
    dataRecebimento: '',
    valorRecebido: 0,
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
      dataRecebimento: '',
      valorRecebido: 0,
    });
    setContaEditando(null);
    setMostrarFormulario(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!contaEditando) return;

    const dataRecebimentoISO = formData.dataRecebimento ? parseDataDoInput(formData.dataRecebimento)?.toISOString() : null;

    const contaAtualizada = {
      ...contaEditando,
      dataRecebimento: dataRecebimentoISO,
      valorRecebido: formData.valorRecebido,
      recebido: formData.valorRecebido > 0,
    };

    atualizarContaAReceber(contaEditando.id, contaAtualizada);
    resetForm();
  };

  const handleEdit = (conta) => {
    setContaEditando(conta);
    const dataRecebimentoFormatada = conta.dataRecebimento ? formatarDataParaInput(conta.dataRecebimento) : '';
    setFormData({
      dataRecebimento: dataRecebimentoFormatada,
      valorRecebido: conta.valorRecebido || 0,
    });
    setMostrarFormulario(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja excluir esta conta a receber?')) {
      await removerContaAReceber(id);
    }
  };

  const contasFiltradas = contasAReceber.filter((conta) => {
    const busca = filtro.toLowerCase();
    return (
      (conta.cliente && conta.cliente.toLowerCase().includes(busca)) ||
      (conta.codigoVenda && conta.codigoVenda.toLowerCase().includes(busca))
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">📋 Contas a Receber</h1>
          <p className="text-gray-600 mt-1">Gerencie as contas a receber das vendas</p>
        </div>

        {mostrarFormulario && contaEditando && (
          <Card className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              ✏️ Registrar Recebimento
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cliente
                  </label>
                  <input
                    type="text"
                    value={contaEditando.cliente || ''}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Recebimento *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.dataRecebimento}
                      onChange={(e) => {
                        const valorFormatado = formatarDataEmTempoReal(e.target.value);
                        setFormData({ ...formData, dataRecebimento: valorFormatado });
                      }}
                      placeholder="dd/mm/aaaa"
                      maxLength={10}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="date"
                      value={formatarDataParaISO(formData.dataRecebimento)}
                      onChange={(e) => {
                        if (e.target.value) {
                          const dataBR = converterISOparaBR(e.target.value);
                          setFormData({ ...formData, dataRecebimento: dataBR });
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
                    Valor Recebido *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                    <input
                      type="text"
                      required
                      value={formatarValorInput(formData.valorRecebido)}
                      onChange={(e) => {
                        const valorFormatado = formatarValorEmTempoReal(e.target.value);
                        const numValor = parseValorInput(valorFormatado);
                        setFormData({ ...formData, valorRecebido: numValor });
                      }}
                      placeholder="0,00"
                      className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" variant="primary">
                  💾 Salvar Recebimento
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
                placeholder="🔍 Pesquisar por cliente ou código de venda..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Lista de Contas a Receber */}
        <Card>
          {contasOrdenadas.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              Nenhuma conta a receber encontrada
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Data Venda</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Data Vencimento</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Cliente</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Código Venda</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Valor</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Data Recebimento</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Valor Recebido</th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Status</th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {contasOrdenadas.map((conta) => {
                    const dataVendaFormatada = conta.dataVenda ? formatarDataParaInput(conta.dataVenda) : '-';
                    const dataVencimentoFormatada = conta.dataVencimento ? formatarDataParaInput(conta.dataVencimento) : '-';
                    const dataRecebimentoFormatada = conta.dataRecebimento ? formatarDataParaInput(conta.dataRecebimento) : '-';
                    const hoje = new Date();
                    const vencimento = conta.dataVencimento ? new Date(conta.dataVencimento) : null;
                    const estaVencida = vencimento && vencimento < hoje && !conta.recebido;
                    return (
                      <tr key={conta.id} className={`hover:bg-gray-50 ${estaVencida ? 'bg-red-50' : ''} ${conta.recebido ? 'opacity-60' : ''}`}>
                        <td className="py-4 px-4 text-sm text-gray-600">{dataVendaFormatada}</td>
                        <td className={`py-4 px-4 text-sm font-medium ${estaVencida ? 'text-red-600' : 'text-gray-600'}`}>
                          {dataVencimentoFormatada}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">{conta.cliente || '-'}</td>
                        <td className="py-4 px-4 text-sm font-medium text-gray-900">{conta.codigoVenda || '-'}</td>
                        <td className="py-4 px-4 text-sm font-semibold text-gray-900">
                          {formatarMoeda(conta.valor || 0)}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">{dataRecebimentoFormatada}</td>
                        <td className="py-4 px-4 text-sm font-semibold text-gray-900">
                          {conta.valorRecebido > 0 ? formatarMoeda(conta.valorRecebido) : '-'}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            conta.recebido
                              ? 'bg-green-100 text-green-700'
                              : estaVencida
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {conta.recebido ? 'Recebido' : estaVencida ? 'Vencida' : 'Pendente'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            {!conta.recebido && (
                              <button
                                onClick={() => handleEdit(conta)}
                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Registrar Recebimento"
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


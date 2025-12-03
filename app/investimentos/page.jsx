'use client';

import { useState } from 'react';
import { useEstoque } from '@/lib/EstoqueContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { formatarMoeda, formatarValorInput, parseValorInput, formatarValorEmTempoReal } from '@/lib/utils';

export default function InvestimentosPage() {
  const { investimentos, adicionarInvestimento, atualizarInvestimento, removerInvestimento } = useEstoque();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [investimentoEditando, setInvestimentoEditando] = useState(null);
  const [filtro, setFiltro] = useState('');

  const [formData, setFormData] = useState({
    data: '',
    descricao: '',
    valor: 0,
    tipo: 'entrada',
    observacao: '',
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
      data: '',
      descricao: '',
      valor: 0,
      tipo: 'entrada',
      observacao: '',
    });
    setInvestimentoEditando(null);
    setMostrarFormulario(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const dataISO = formData.data ? parseDataDoInput(formData.data)?.toISOString() : null;

    const investimentoData = {
      ...formData,
      data: dataISO,
    };

    if (investimentoEditando) {
      atualizarInvestimento(investimentoEditando.id, investimentoData);
    } else {
      adicionarInvestimento(investimentoData);
    }

    resetForm();
  };

  const handleEdit = (investimento) => {
    setInvestimentoEditando(investimento);
    const dataFormatada = investimento.data ? formatarDataParaInput(investimento.data) : '';
    setFormData({
      data: dataFormatada,
      descricao: investimento.descricao || '',
      valor: investimento.valor || 0,
      tipo: investimento.tipo || 'entrada',
      observacao: investimento.observacao || '',
    });
    setMostrarFormulario(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja excluir este registro?')) {
      await removerInvestimento(id);
    }
  };

  const investimentosFiltrados = investimentos.filter((investimento) => {
    const busca = filtro.toLowerCase();
    return (
      (investimento.descricao && investimento.descricao.toLowerCase().includes(busca)) ||
      (investimento.observacao && investimento.observacao.toLowerCase().includes(busca)) ||
      (investimento.tipo && investimento.tipo.toLowerCase().includes(busca))
    );
  });

  // Ordenar por data (mais recente primeiro)
  const investimentosOrdenados = [...investimentosFiltrados].sort((a, b) => {
    const dataA = a.data ? new Date(a.data) : new Date(0);
    const dataB = b.data ? new Date(b.data) : new Date(0);
    return dataB - dataA;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">💵 Investimentos</h1>
          <p className="text-gray-600 mt-1">Gerencie entradas e saídas de investimentos</p>
        </div>

        {!mostrarFormulario ? (
          <div className="mb-6">
            <Button onClick={() => setMostrarFormulario(true)} variant="primary">
              ➕ Novo Registro
            </Button>
          </div>
        ) : (
          <Card className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {investimentoEditando ? '✏️ Editar Registro' : '➕ Novo Registro'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.data}
                      onChange={(e) => {
                        const valorFormatado = formatarDataEmTempoReal(e.target.value);
                        setFormData({ ...formData, data: valorFormatado });
                      }}
                      placeholder="dd/mm/aaaa"
                      maxLength={10}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="date"
                      value={formatarDataParaISO(formData.data)}
                      onChange={(e) => {
                        if (e.target.value) {
                          const dataBR = converterISOparaBR(e.target.value);
                          setFormData({ ...formData, data: dataBR });
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
                    Tipo *
                  </label>
                  <select
                    required
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="entrada">Entrada</option>
                    <option value="saida">Saída</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descrição do registro"
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
                      value={formatarValorInput(formData.valor)}
                      onChange={(e) => {
                        const valorFormatado = formatarValorEmTempoReal(e.target.value);
                        const numValor = parseValorInput(valorFormatado);
                        setFormData({ ...formData, valor: numValor });
                      }}
                      placeholder="0,00"
                      className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observação
                  </label>
                  <textarea
                    value={formData.observacao}
                    onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Observações adicionais (opcional)"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" variant="primary">
                  {investimentoEditando ? '💾 Salvar Alterações' : '➕ Adicionar Registro'}
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
                placeholder="🔍 Pesquisar por descrição, tipo ou observação..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Lista de Investimentos */}
        <Card>
          {investimentosOrdenados.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              Nenhum registro encontrado
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Data</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Descrição</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Tipo</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Valor</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Saldo</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Observação</th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {investimentosOrdenados.map((investimento) => {
                    const dataFormatada = investimento.data ? formatarDataParaInput(investimento.data) : '-';
                    return (
                      <tr key={investimento.id} className="hover:bg-gray-50">
                        <td className="py-4 px-4 text-sm text-gray-600">{dataFormatada}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">{investimento.descricao || '-'}</td>
                        <td className="py-4 px-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            investimento.tipo === 'entrada'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {investimento.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                          </span>
                        </td>
                        <td className={`py-4 px-4 text-sm font-semibold ${
                          investimento.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {investimento.tipo === 'entrada' ? '+' : '-'} {formatarMoeda(investimento.valor || 0)}
                        </td>
                        <td className="py-4 px-4 text-sm font-semibold text-gray-900">
                          {formatarMoeda(investimento.saldo || 0)}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">{investimento.observacao || '-'}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(investimento)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(investimento.id)}
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


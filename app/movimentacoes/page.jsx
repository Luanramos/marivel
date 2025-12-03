'use client';

import { useState } from 'react';
import { useEstoque } from '@/lib/EstoqueContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { formatarMoeda, formatarValorInput, parseValorInput, formatarValorEmTempoReal } from '@/lib/utils';

export default function MovimentacoesPage() {
  const { produtos, movimentacoes, adicionarMovimentacao } = useEstoque();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('todas');
  const [valorUnitarioInput, setValorUnitarioInput] = useState('');

  const [formData, setFormData] = useState({
    produtoId: '',
    tipo: 'entrada',
    quantidade: 0,
    motivo: '',
    observacao: '',
    usuarioResponsavel: '',
    valorUnitario: 0,
  });

  const resetForm = () => {
    setFormData({
      produtoId: '',
      tipo: 'entrada',
      quantidade: 0,
      motivo: '',
      observacao: '',
      usuarioResponsavel: '',
      valorUnitario: 0,
    });
    setValorUnitarioInput('');
    setMostrarFormulario(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    adicionarMovimentacao(formData);
    resetForm();
  };

  const movimentacoesFiltradas =
    filtroTipo === 'todas'
      ? movimentacoes
      : movimentacoes.filter((m) => m.tipo === filtroTipo);

  const movimentacoesOrdenadas = [...movimentacoesFiltradas].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Movimentações
          </h1>
          <p className="text-gray-600 mt-2">
            Registre entradas e saídas do estoque
          </p>
        </div>
        <Button onClick={() => setMostrarFormulario(!mostrarFormulario)}>
          {mostrarFormulario ? '✕ Fechar' : '+ Nova Movimentação'}
        </Button>
      </div>

      {/* Formulário */}
      {mostrarFormulario && (
        <Card title="Nova Movimentação" icon="🔄" className="mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Produto *
                </label>
                <select
                  required
                  value={formData.produtoId}
                    onChange={(e) => {
                      const produto = produtos.find((p) => p.id === e.target.value);
                      const valorUnit = produto?.precoCompra || 0;
                      setFormData({
                        ...formData,
                        produtoId: e.target.value,
                        valorUnitario: valorUnit,
                      });
                      if (valorUnit > 0) {
                        setValorUnitarioInput(formatarValorInput(valorUnit));
                      }
                    }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione um produto</option>
                  {produtos.map((produto) => (
                    <option key={produto.id} value={produto.id}>
                      {produto.codigo} - {produto.nome} (Estoque: {produto.quantidadeAtual})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Movimentação *
                </label>
                <select
                  required
                  value={formData.tipo}
                  onChange={(e) =>
                    setFormData({ ...formData, tipo: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="entrada">📥 Entrada</option>
                  <option value="saida">📤 Saída</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantidade}
                  onChange={(e) => setFormData({ ...formData, quantidade: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Unitário
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                  <input
                    type="text"
                    min="0"
                    value={valorUnitarioInput}
                    onChange={(e) => {
                      const valorFormatado = formatarValorEmTempoReal(e.target.value);
                      setValorUnitarioInput(valorFormatado);
                      // Atualiza o valor numérico
                      const numValor = parseValorInput(valorFormatado);
                      setFormData({ ...formData, valorUnitario: numValor });
                    }}
                    placeholder="0,00"
                    className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                  placeholder="Ex: Compra, Venda, Devolução, Ajuste..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Responsável *
                </label>
                <input
                  type="text"
                  required
                  value={formData.usuarioResponsavel}
                  onChange={(e) => setFormData({ ...formData, usuarioResponsavel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
                />
              </div>
            </div>

            {formData.produtoId && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  💡 Estoque atual do produto:{' '}
                  <strong>
                    {produtos.find((p) => p.id === formData.produtoId)?.quantidadeAtual || 0}
                  </strong>
                  {' → Novo estoque: '}
                  <strong>
                    {formData.tipo === 'entrada'
                      ? (produtos.find((p) => p.id === formData.produtoId)?.quantidadeAtual || 0) +
                        formData.quantidade
                      : Math.max(
                          0,
                          (produtos.find((p) => p.id === formData.produtoId)?.quantidadeAtual || 0) -
                            formData.quantidade
                        )}
                  </strong>
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" variant="primary">
                💾 Registrar Movimentação
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filtros */}
      <div className="mb-6 flex gap-2">
        <Button
          variant={filtroTipo === 'todas' ? 'primary' : 'secondary'}
          onClick={() => setFiltroTipo('todas')}
        >
          🔄 Todas
        </Button>
        <Button
          variant={filtroTipo === 'entrada' ? 'success' : 'secondary'}
          onClick={() => setFiltroTipo('entrada')}
        >
          📥 Entradas
        </Button>
        <Button
          variant={filtroTipo === 'saida' ? 'danger' : 'secondary'}
          onClick={() => setFiltroTipo('saida')}
        >
          📤 Saídas
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-l-4 border-purple-500">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total de Movimentações</p>
            <p className="text-3xl font-bold text-gray-900">
              {movimentacoes.length}
            </p>
          </div>
        </Card>
        <Card className="border-l-4 border-green-500">
          <div className="text-center">
            <p className="text-sm text-gray-600">Entradas</p>
            <p className="text-3xl font-bold text-green-600">
              {movimentacoes.filter((m) => m.tipo === 'entrada').length}
            </p>
          </div>
        </Card>
        <Card className="border-l-4 border-red-500">
          <div className="text-center">
            <p className="text-sm text-gray-600">Saídas</p>
            <p className="text-3xl font-bold text-red-600">
              {movimentacoes.filter((m) => m.tipo === 'saida').length}
            </p>
          </div>
        </Card>
      </div>

      {/* Lista de Movimentações */}
      <Card title={`Histórico de Movimentações (${movimentacoesFiltradas.length})`} icon="📋">
        {movimentacoesOrdenadas.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            Nenhuma movimentação registrada
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Data/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Quantidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Motivo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Responsável
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movimentacoesOrdenadas.map((mov) => {
                  const produto = produtos.find((p) => p.id === mov.produtoId);
                  return (
                    <tr key={mov.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>{new Date(mov.data).toLocaleDateString('pt-BR')}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(mov.data).toLocaleTimeString('pt-BR')}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{produto?.nome || 'N/A'}</div>
                          <div className="text-xs text-gray-500">
                            {produto?.codigo || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            mov.tipo === 'entrada'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {mov.tipo === 'entrada' ? '📥 Entrada' : '📤 Saída'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {mov.tipo === 'entrada' ? '+' : '-'}
                        {mov.quantidade}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          <div>{mov.motivo}</div>
                          {mov.observacao && (
                            <div className="text-xs text-gray-500">
                              {mov.observacao}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {mov.usuarioResponsavel}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {mov.valorUnitario
                          ? formatarMoeda(mov.valorUnitario * mov.quantidade)
                          : '-'}
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
  );
}


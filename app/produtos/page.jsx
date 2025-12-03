'use client';

import { useState } from 'react';
import { useEstoque } from '@/lib/EstoqueContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { formatarMoeda, formatarValorInput, parseValorInput, formatarValorEmTempoReal } from '@/lib/utils';

export default function ProdutosPage() {
  const { produtos, adicionarProduto, atualizarProduto, removerProduto, cores } = useEstoque();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [filtro, setFiltro] = useState('');

  const [formData, setFormData] = useState({
    codigo: '',
    tipo: '',
    produto: '',
    cor: '',
    tamanho: '',
    precoVenda: 0,
    precoVenda3x: 0,
    estoque: 0,
    condicional: 0,
  });

  // Estados para valores formatados dos preços (apenas para exibição)
  const [precoVendaInput, setPrecoVendaInput] = useState('');
  const [precoVenda3xInput, setPrecoVenda3xInput] = useState('');

  const resetForm = () => {
    setFormData({
      codigo: '',
      tipo: '',
      produto: '',
      cor: '',
      tamanho: '',
      precoVenda: 0,
      precoVenda3x: 0,
      estoque: 0,
      condicional: 0,
    });
    setPrecoVendaInput('');
    setPrecoVenda3xInput('');
    setProdutoEditando(null);
    setMostrarFormulario(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (produtoEditando) {
      atualizarProduto(produtoEditando.id, formData);
      resetForm();
    }
  };

  const handleEdit = (produto) => {
    setProdutoEditando(produto);
    setFormData({
      codigo: produto.codigo || '',
      tipo: produto.tipo || '',
      produto: produto.produto || '',
      cor: produto.cor || '',
      tamanho: produto.tamanho || '',
      precoVenda: produto.precoVenda || 0,
      precoVenda3x: produto.precoVenda3x || 0,
      estoque: produto.estoque || 0,
      condicional: produto.condicional || 0,
    });
    setPrecoVendaInput(formatarValorInput(produto.precoVenda || 0));
    setPrecoVenda3xInput(formatarValorInput(produto.precoVenda3x || 0));
    setMostrarFormulario(true);
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja remover este produto?')) {
      removerProduto(id);
    }
  };

  const produtosFiltrados = produtos.filter((p) => {
    const matchFiltro = 
      (p.codigo && p.codigo.toLowerCase().includes(filtro.toLowerCase())) ||
      (p.tipo && p.tipo.toLowerCase().includes(filtro.toLowerCase())) ||
      (p.produto && p.produto.toLowerCase().includes(filtro.toLowerCase())) ||
      (p.cor && p.cor.toLowerCase().includes(filtro.toLowerCase()));
    return matchFiltro;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Estoque
            </h1>
            <p className="text-gray-600 mt-1">
              Produtos são adicionados automaticamente através de compras
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
              📊 Importar
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
              📤 Exportar
            </button>
          </div>
        </div>

      {/* Formulário de Edição */}
      {mostrarFormulario && produtoEditando && (
        <Card title="Editar Produto" className="mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código
                </label>
                <input
                  type="text"
                  value={produtoEditando?.codigo || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  O código não pode ser alterado
                </p>
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
                  <option value="">Selecione um tipo</option>
                  <option value="Camiseta">Camiseta</option>
                  <option value="CJT Leg + Top">CJT Leg + Top</option>
                  <option value="CJT Sht + Top">CJT Sht + Top</option>
                  <option value="Macaquinho">Macaquinho</option>
                  <option value="Regata">Regata</option>
                  <option value="Leg">Leg</option>
                  <option value="Top">Top</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Produto *
                </label>
                <input
                  type="text"
                  required
                  value={formData.produto}
                  onChange={(e) => setFormData({ ...formData, produto: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nome do produto"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tamanho
                </label>
                <select
                  value={formData.tamanho}
                  onChange={(e) => setFormData({ ...formData, tamanho: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Selecione um tamanho</option>
                  <option value="P">P</option>
                  <option value="M">M</option>
                  <option value="G">G</option>
                  <option value="GG">GG</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cor
                </label>
                <select
                  value={formData.cor}
                  onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Selecione uma cor</option>
                        {cores && cores.length > 0 ? (
                          cores.map((cor) => (
                            <option key={cor} value={cor}>
                              {cor}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="Azul Cand">Azul Cand</option>
                            <option value="Branco">Branco</option>
                            <option value="Cinza">Cinza</option>
                            <option value="Esmeralda">Esmeralda</option>
                            <option value="Lilás">Lilás</option>
                            <option value="Marinho">Marinho</option>
                            <option value="Menta">Menta</option>
                            <option value="Militar">Militar</option>
                            <option value="Petroleo">Petroleo</option>
                            <option value="Preto">Preto</option>
                            <option value="Pink">Pink</option>
                            <option value="Rosa Cand">Rosa Cand</option>
                            <option value="Terracota">Terracota</option>
                          </>
                        )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço de Venda *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                  <input
                    type="text"
                    required
                    value={precoVendaInput}
                    onChange={(e) => {
                      const valorFormatado = formatarValorEmTempoReal(e.target.value);
                      setPrecoVendaInput(valorFormatado);
                      const numValor = parseValorInput(valorFormatado);
                      setFormData({ ...formData, precoVenda: numValor });
                    }}
                    placeholder="0,00"
                    className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço de Venda 3x *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                  <input
                    type="text"
                    required
                    value={precoVenda3xInput}
                    onChange={(e) => {
                      const valorFormatado = formatarValorEmTempoReal(e.target.value);
                      setPrecoVenda3xInput(valorFormatado);
                      const numValor = parseValorInput(valorFormatado);
                      setFormData({ ...formData, precoVenda3x: numValor });
                    }}
                    placeholder="0,00"
                    className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estoque *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.estoque}
                  onChange={(e) => setFormData({ ...formData, estoque: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condicional *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.condicional}
                  onChange={(e) => setFormData({ ...formData, condicional: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
              placeholder="🔍 Pesquisar por código, tipo, produto ou cor..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Lista de Produtos em Cards */}
      <Card>
        {produtosFiltrados.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            Nenhum produto encontrado
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Código</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Tipo</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Produto</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Cor</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Tamanho</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Preço de Venda</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Preço de Venda 3x</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Estoque</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Condicional</th>
                  <th className="text-center text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {produtosFiltrados.map((produto) => {
                  return (
                    <tr key={produto.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm font-medium text-gray-900">{produto.codigo || '-'}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{produto.tipo || '-'}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{produto.produto || '-'}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{produto.cor || '-'}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{produto.tamanho || '-'}</td>
                      <td className="py-4 px-4 text-sm font-semibold text-gray-900">{formatarMoeda(produto.precoVenda || 0)}</td>
                      <td className="py-4 px-4 text-sm font-semibold text-gray-900">{formatarMoeda(produto.precoVenda3x || 0)}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{produto.estoque || 0}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {produto.condicional > 0 ? 'Sim' : ''}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(produto)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(produto.id)}
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

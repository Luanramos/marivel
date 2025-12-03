'use client';

import { useState } from 'react';
import { useEstoque } from '@/lib/EstoqueContext';
import Card from '../components/Card';
import Button from '../components/Button';

// Função para formatar CNPJ
const formatarCNPJ = (valor) => {
  const numeros = valor.replace(/\D/g, '');
  if (numeros.length <= 14) {
    return numeros
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return valor;
};

// Função para formatar CEP
const formatarCEP = (valor) => {
  const numeros = valor.replace(/\D/g, '');
  if (numeros.length <= 8) {
    return numeros.replace(/^(\d{5})(\d)/, '$1-$2');
  }
  return valor;
};

// Função para formatar telefone
const formatarTelefone = (valor) => {
  const numeros = valor.replace(/\D/g, '');
  if (numeros.length <= 10) {
    return numeros.replace(/^(\d{2})(\d{4})(\d)/, '($1) $2-$3');
  } else {
    return numeros.replace(/^(\d{2})(\d{5})(\d)/, '($1) $2-$3');
  }
};

export default function FornecedoresPage() {
  const { fornecedores, adicionarFornecedor, atualizarFornecedor, removerFornecedor } = useEstoque();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [fornecedorEditando, setFornecedorEditando] = useState(null);
  const [filtro, setFiltro] = useState('');

  const [formData, setFormData] = useState({
    nomeFantasia: '',
    razaoSocial: '',
    cnpj: '',
    rua: '',
    numero: '',
    complemento: '',
    cep: '',
    bairro: '',
    cidade: '',
    estado: '',
    telefone: '',
    nomeContato: '',
  });

  const resetForm = () => {
    setFormData({
      nomeFantasia: '',
      razaoSocial: '',
      cnpj: '',
      rua: '',
      numero: '',
      complemento: '',
      cep: '',
      bairro: '',
      cidade: '',
      estado: '',
      telefone: '',
      nomeContato: '',
    });
    setFornecedorEditando(null);
    setMostrarFormulario(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (fornecedorEditando) {
      atualizarFornecedor(fornecedorEditando.id, formData);
    } else {
      adicionarFornecedor(formData);
    }
    
    resetForm();
  };

  const handleEdit = (fornecedor) => {
    setFornecedorEditando(fornecedor);
    setFormData({
      nomeFantasia: fornecedor.nomeFantasia || '',
      razaoSocial: fornecedor.razaoSocial || '',
      cnpj: fornecedor.cnpj || '',
      rua: fornecedor.rua || '',
      numero: fornecedor.numero || '',
      complemento: fornecedor.complemento || '',
      cep: fornecedor.cep || '',
      bairro: fornecedor.bairro || '',
      cidade: fornecedor.cidade || '',
      estado: fornecedor.estado || '',
      telefone: fornecedor.telefone || '',
      nomeContato: fornecedor.nomeContato || '',
    });
    setMostrarFormulario(true);
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja remover este fornecedor?')) {
      removerFornecedor(id);
    }
  };

  const fornecedoresFiltrados = fornecedores.filter((f) => {
    const matchFiltro = 
      (f.nomeFantasia && f.nomeFantasia.toLowerCase().includes(filtro.toLowerCase())) ||
      (f.razaoSocial && f.razaoSocial.toLowerCase().includes(filtro.toLowerCase())) ||
      (f.cnpj && f.cnpj.includes(filtro)) ||
      (f.codigo && f.codigo.includes(filtro));
    return matchFiltro;
  });

  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Fornecedores
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie seus fornecedores
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
            >
              + Novo Fornecedor
            </button>
          </div>
        </div>

      {/* Formulário */}
      {mostrarFormulario && (
        <Card title={fornecedorEditando ? 'Editar Fornecedor' : 'Novo Fornecedor'} className="mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fornecedorEditando && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código
                  </label>
                  <input
                    type="text"
                    value={fornecedorEditando.codigo}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    O código não pode ser alterado
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Fantasia *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nomeFantasia}
                  onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Razão Social *
                </label>
                <input
                  type="text"
                  required
                  value={formData.razaoSocial}
                  onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CNPJ *
                </label>
                <input
                  type="text"
                  required
                  value={formData.cnpj}
                  onChange={(e) => {
                    const valorFormatado = formatarCNPJ(e.target.value);
                    setFormData({ ...formData, cnpj: valorFormatado });
                  }}
                  maxLength={18}
                  placeholder="00.000.000/0000-00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rua *
                </label>
                <input
                  type="text"
                  required
                  value={formData.rua}
                  onChange={(e) => setFormData({ ...formData, rua: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número *
                </label>
                <input
                  type="text"
                  required
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Complemento
                </label>
                <input
                  type="text"
                  value={formData.complemento}
                  onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CEP *
                </label>
                <input
                  type="text"
                  required
                  value={formData.cep}
                  onChange={(e) => {
                    const valorFormatado = formatarCEP(e.target.value);
                    setFormData({ ...formData, cep: valorFormatado });
                  }}
                  maxLength={9}
                  placeholder="00000-000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bairro *
                </label>
                <input
                  type="text"
                  required
                  value={formData.bairro}
                  onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cidade *
                </label>
                <input
                  type="text"
                  required
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado *
                </label>
                <select
                  required
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Selecione o estado</option>
                  {estados.map(estado => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone *
                </label>
                <input
                  type="text"
                  required
                  value={formData.telefone}
                  onChange={(e) => {
                    const valorFormatado = formatarTelefone(e.target.value);
                    setFormData({ ...formData, telefone: valorFormatado });
                  }}
                  maxLength={15}
                  placeholder="(00) 00000-0000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome de Contato *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nomeContato}
                  onChange={(e) => setFormData({ ...formData, nomeContato: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="primary">
                {fornecedorEditando ? '💾 Salvar Alterações' : '➕ Adicionar Fornecedor'}
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
              placeholder="🔍 Pesquisar por nome fantasia, razão social, CNPJ ou código..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Lista de Fornecedores */}
      <Card>
        {fornecedoresFiltrados.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            Nenhum fornecedor encontrado
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Código</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Nome Fantasia</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Razão Social</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">CNPJ</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Endereço</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Cidade/Estado</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Telefone</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Contato</th>
                  <th className="text-center text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fornecedoresFiltrados.map((fornecedor) => {
                  const endereco = `${fornecedor.rua || ''}, ${fornecedor.numero || ''}${fornecedor.complemento ? ' - ' + fornecedor.complemento : ''}`.trim();
                  const cidadeEstado = `${fornecedor.cidade || ''}${fornecedor.estado ? '/' + fornecedor.estado : ''}`.trim();
                  return (
                    <tr key={fornecedor.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm font-medium text-gray-900">{fornecedor.codigo || '-'}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{fornecedor.nomeFantasia || '-'}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{fornecedor.razaoSocial || '-'}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{fornecedor.cnpj || '-'}</td>
                      <td className="py-4 px-4 text-sm text-gray-600 max-w-xs truncate">{endereco || '-'}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{cidadeEstado || '-'}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{fornecedor.telefone || '-'}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{fornecedor.nomeContato || '-'}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(fornecedor)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(fornecedor.id)}
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


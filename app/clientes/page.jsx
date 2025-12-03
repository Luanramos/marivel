'use client';

import { useState } from 'react';
import { useEstoque } from '@/lib/EstoqueContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { formatarMoeda } from '@/lib/utils';

// Função para formatar CPF
const formatarCPF = (valor) => {
  const numeros = valor.replace(/\D/g, '');
  if (numeros.length <= 11) {
    return numeros.replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1-$2');
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

export default function ClientesPage() {
  const { clientes, vendas, adicionarCliente, atualizarCliente, removerCliente } = useEstoque();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    observacoes: '',
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      cpf: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      observacoes: '',
    });
    setClienteEditando(null);
    setMostrarFormulario(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (clienteEditando) {
        await atualizarCliente(clienteEditando.id, formData);
      } else {
        await adicionarCliente(formData);
      }
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      alert('Erro ao salvar cliente. Verifique o console para mais detalhes.');
    }
  };

  const handleEdit = (cliente) => {
    setClienteEditando(cliente);
    setFormData({
      nome: cliente.nome || '',
      email: cliente.email || '',
      telefone: cliente.telefone || '',
      cpf: cliente.cpf || '',
      endereco: cliente.endereco || '',
      cidade: cliente.cidade || '',
      estado: cliente.estado || '',
      cep: cliente.cep || '',
      observacoes: cliente.observacoes || '',
    });
    setMostrarFormulario(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja remover este cliente?')) {
      try {
        await removerCliente(id);
      } catch (error) {
        console.error('Erro ao remover cliente:', error);
        alert('Erro ao remover cliente. Verifique o console para mais detalhes.');
      }
    }
  };

  const clientesFiltrados = clientes.filter((c) => {
    const matchFiltro = 
      (c.nome && c.nome.toLowerCase().includes(filtro.toLowerCase())) ||
      (c.email && c.email && c.email.toLowerCase().includes(filtro.toLowerCase())) ||
      (c.telefone && c.telefone.includes(filtro)) ||
      (c.cpf && c.cpf.includes(filtro));
    return matchFiltro;
  });

  // Obter vendas de um cliente
  const obterVendasCliente = (nomeCliente) => {
    if (!nomeCliente) return [];
    return vendas.filter(v => v.cliente && v.cliente.toLowerCase() === nomeCliente.toLowerCase());
  };

  // Calcular total de vendas de um cliente
  const calcularTotalVendas = (nomeCliente) => {
    const vendasCliente = obterVendasCliente(nomeCliente);
    return vendasCliente.reduce((total, venda) => total + (venda.total || 0), 0);
  };

  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const formatarDataParaInput = (data) => {
    if (!data) return '';
    const date = data instanceof Date ? data : new Date(data);
    if (isNaN(date.getTime())) return '';
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = date.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              👥 Clientes
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie seus clientes
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
            >
              ➕ Novo Cliente
            </Button>
          </div>
        </div>

        {mostrarFormulario && (
          <Card className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {clienteEditando ? '✏️ Editar Cliente' : '➕ Novo Cliente'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent"
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent"
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={formData.telefone}
                    onChange={(e) => {
                      const valorFormatado = formatarTelefone(e.target.value);
                      setFormData({ ...formData, telefone: valorFormatado });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent"
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CPF
                  </label>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => {
                      const valorFormatado = formatarCPF(e.target.value);
                      setFormData({ ...formData, cpf: valorFormatado });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent"
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent"
                    placeholder="Rua, número, complemento"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent"
                    placeholder="Cidade"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent"
                  >
                    <option value="">Selecione...</option>
                    {estados.map((estado) => (
                      <option key={estado} value={estado}>
                        {estado}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CEP
                  </label>
                  <input
                    type="text"
                    value={formData.cep}
                    onChange={(e) => {
                      const numeros = e.target.value.replace(/\D/g, '');
                      const valorFormatado = numeros.replace(/^(\d{5})(\d)/, '$1-$2');
                      setFormData({ ...formData, cep: valorFormatado });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent"
                    placeholder="00000-000"
                    maxLength={9}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent"
                    rows={3}
                    placeholder="Observações sobre o cliente"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" variant="primary">
                  💾 Salvar
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
          <input
            type="text"
            placeholder="🔍 Pesquisar por nome, email, telefone ou CPF..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent"
          />
        </div>

        {/* Lista de Clientes */}
        <div className="grid grid-cols-1 gap-4">
          {clientesFiltrados.length === 0 ? (
            <Card>
              <p className="text-gray-600 text-center py-8">
                Nenhum cliente encontrado
              </p>
            </Card>
          ) : (
            clientesFiltrados.map((cliente) => {
              const vendasCliente = obterVendasCliente(cliente.nome);
              const totalVendas = calcularTotalVendas(cliente.nome);
              
              return (
                <Card key={cliente.id} className="hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {cliente.nome || 'Sem nome'}
                        </h3>
                        {vendasCliente.length > 0 && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                            {vendasCliente.length} venda(s)
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        {cliente.email && (
                          <div>📧 {cliente.email}</div>
                        )}
                        {cliente.telefone && (
                          <div>📞 {cliente.telefone}</div>
                        )}
                        {cliente.cpf && (
                          <div>🆔 {cliente.cpf}</div>
                        )}
                        {cliente.endereco && (
                          <div className="md:col-span-2">
                            📍 {cliente.endereco}
                            {cliente.cidade && `, ${cliente.cidade}`}
                            {cliente.estado && ` - ${cliente.estado}`}
                            {cliente.cep && ` (${cliente.cep})`}
                          </div>
                        )}
                        {totalVendas > 0 && (
                          <div className="md:col-span-2 font-semibold text-green-600">
                            💰 Total em vendas: {formatarMoeda(totalVendas)}
                          </div>
                        )}
                        {cliente.observacoes && (
                          <div className="md:col-span-2 text-xs text-gray-500 mt-1">
                            📝 {cliente.observacoes}
                          </div>
                        )}
                      </div>
                      
                      {/* Vendas do Cliente */}
                      {clienteSelecionado === cliente.id && vendasCliente.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="font-semibold text-gray-900 mb-2">Vendas Realizadas:</h4>
                          <div className="space-y-2">
                            {vendasCliente.map((venda) => (
                              <div key={venda.id} className="bg-gray-50 p-3 rounded-lg text-sm">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {formatarDataParaInput(venda.dataVenda)}
                                    </div>
                                    {venda.itens && venda.itens.length > 0 && (
                                      <div className="text-gray-600 mt-1">
                                        {venda.itens.map((item, idx) => (
                                          <div key={idx}>
                                            {item.produto} - {formatarMoeda(item.valor || 0)}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <div className="font-semibold text-gray-900">
                                      {formatarMoeda(venda.total || 0)}
                                    </div>
                                    {venda.formaPagamento && (
                                      <div className="text-xs text-gray-500">
                                        {venda.formaPagamento}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      {vendasCliente.length > 0 && (
                        <button
                          onClick={() => setClienteSelecionado(clienteSelecionado === cliente.id ? null : cliente.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title={clienteSelecionado === cliente.id ? "Ocultar vendas" : "Ver vendas"}
                        >
                          {clienteSelecionado === cliente.id ? '👁️‍🗨️' : '👁️'}
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(cliente)}
                        className="p-2 text-gray-400 hover:text-[#174759] transition-colors"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(cliente.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Excluir"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

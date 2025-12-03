'use client';

import { useState, useEffect } from 'react';
import { useEstoque } from '@/lib/EstoqueContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { formatarMoeda, formatarValorInput } from '@/lib/utils';

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
  // Remove tudo que não é número
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

export default function CondicionaisPage() {
  const { condicionais, produtos, adicionarCondicional, atualizarCondicional, removerCondicional } = useEstoque();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [condicionalEditando, setCondicionalEditando] = useState(null);
  const [filtro, setFiltro] = useState('');

  // Dados do cabeçalho do condicional
  const [cabecalhoCondicional, setCabecalhoCondicional] = useState({
    data: '',
    cliente: '',
  });

  // Lista de itens (produtos) do condicional - cada item tem seu próprio status
  const [itens, setItens] = useState([]);

  const resetForm = () => {
    setCabecalhoCondicional({
      data: '',
      cliente: '',
    });
    setItens([]);
    setCondicionalEditando(null);
    setMostrarFormulario(false);
  };

  // Buscar produto automaticamente quando código interno mudar em um item
  const handleCodigoChange = (itemId, codigo) => {
    const novosItens = itens.map(item => {
      if (item.id === itemId) {
        const itemAtualizado = { ...item, codigoInterno: codigo };
        
        if (codigo && produtos.length > 0) {
          const produtoEncontrado = produtos.find(
            p => p.codigo && p.codigo.toLowerCase() === codigo.toLowerCase()
          );
          
          if (produtoEncontrado) {
            itemAtualizado.produto = produtoEncontrado.produto || '';
            itemAtualizado.precoVendaVista = produtoEncontrado.precoVenda || 0;
            itemAtualizado.precoVenda3x = produtoEncontrado.precoVenda3x || 0;
          } else {
            itemAtualizado.produto = '';
            itemAtualizado.precoVendaVista = 0;
            itemAtualizado.precoVenda3x = 0;
          }
        } else {
          itemAtualizado.produto = '';
          itemAtualizado.precoVendaVista = 0;
          itemAtualizado.precoVenda3x = 0;
        }
        
        return itemAtualizado;
      }
      return item;
    });
    
    setItens(novosItens);
  };

  const adicionarItem = () => {
    const novoItem = {
      id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
      codigoInterno: '',
      produto: '',
      precoVendaVista: 0,
      precoVenda3x: 0,
      status: 'Com Cliente', // Cada produto tem seu próprio status
    };
    setItens([...itens, novoItem]);
  };

  const removerItem = (itemId) => {
    setItens(itens.filter(item => item.id !== itemId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (itens.length === 0) {
      alert('Adicione pelo menos um produto ao condicional');
      return;
    }
    
    // Converter data para formato ISO
    const dataISO = cabecalhoCondicional.data ? parseDataDoInput(cabecalhoCondicional.data)?.toISOString() : null;
    
    const condicionalData = {
      ...cabecalhoCondicional,
      data: dataISO,
      itens: itens.map(item => ({
        codigoInterno: item.codigoInterno || '',
        produto: item.produto || '',
        precoVendaVista: item.precoVendaVista || 0,
        precoVenda3x: item.precoVenda3x || 0,
        status: item.status || 'Com Cliente', // Status por produto
      })),
    };
    
    try {
      if (condicionalEditando) {
        await atualizarCondicional(condicionalEditando.id, condicionalData);
      } else {
        await adicionarCondicional(condicionalData);
      }
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar condicional:', error);
      alert(`Erro ao salvar condicional: ${error.message || 'Erro desconhecido'}`);
    }
  };

  const handleEdit = (condicional) => {
    setCondicionalEditando(condicional);
    const dataFormatada = condicional.data ? formatarDataParaInput(condicional.data) : '';
    
    setCabecalhoCondicional({
      data: dataFormatada,
      cliente: condicional.cliente || '',
    });

    // Se o condicional tem itens (nova estrutura), usar os itens
    // Se não tem (estrutura antiga), converter para novo formato
    if (condicional.itens && Array.isArray(condicional.itens)) {
      setItens(condicional.itens.map((item, index) => ({
        id: item.id || `${Date.now()}_${index}`,
        codigoInterno: item.codigoInterno || '',
        produto: item.produto || '',
        precoVendaVista: item.precoVendaVista || 0,
        precoVenda3x: item.precoVenda3x || 0,
        status: item.status || condicional.status || 'Com Cliente', // Status do item ou do condicional (compatibilidade)
      })));
    } else {
      // Converter estrutura antiga para nova
      setItens([{
        id: Date.now().toString(),
        codigoInterno: condicional.codigoInterno || '',
        produto: condicional.produto || '',
        precoVendaVista: condicional.precoVendaVista || 0,
        precoVenda3x: condicional.precoVenda3x || 0,
        status: condicional.status || 'Com Cliente',
      }]);
    }
    
    setMostrarFormulario(true);
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja remover este condicional?')) {
      removerCondicional(id);
    }
  };

  const condicionaisFiltrados = condicionais.filter((c) => {
    const busca = filtro.toLowerCase();
    const matchCodigo = c.codigoCond && c.codigoCond.includes(filtro);
    const matchCliente = c.cliente && c.cliente.toLowerCase().includes(busca);
    
    // Verificar se algum item corresponde ao filtro
    let matchItens = false;
    if (c.itens && Array.isArray(c.itens)) {
      matchItens = c.itens.some(item => 
        (item.codigoInterno && item.codigoInterno.toLowerCase().includes(busca)) ||
        (item.produto && item.produto.toLowerCase().includes(busca))
      );
    } else {
      // Compatibilidade com estrutura antiga
      matchItens = 
        (c.codigoInterno && c.codigoInterno.toLowerCase().includes(busca)) ||
        (c.produto && c.produto.toLowerCase().includes(busca));
    }
    
    return matchCodigo || matchCliente || matchItens;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Condicionais
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie produtos em condicional
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
            >
              + Novo Condicional
            </button>
          </div>
        </div>

      {/* Formulário */}
      {mostrarFormulario && (
        <Card className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {condicionalEditando ? '✏️ Editar Condicional' : '➕ Novo Condicional'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cabeçalho */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados do Condicional</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {condicionalEditando && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código Cond
                    </label>
                    <input
                      type="text"
                      value={condicionalEditando.codigoCond}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={cabecalhoCondicional.data}
                      onChange={(e) => {
                        const valorFormatado = formatarDataEmTempoReal(e.target.value);
                        setCabecalhoCondicional({ ...cabecalhoCondicional, data: valorFormatado });
                      }}
                      placeholder="dd/mm/aaaa"
                      maxLength={10}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent"
                    />
                    <input
                      type="date"
                      value={formatarDataParaISO(cabecalhoCondicional.data)}
                      onChange={(e) => {
                        if (e.target.value) {
                          const dataBR = converterISOparaBR(e.target.value);
                          setCabecalhoCondicional({ ...cabecalhoCondicional, data: dataBR });
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
                    Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    value={cabecalhoCondicional.cliente}
                    onChange={(e) => setCabecalhoCondicional({ ...cabecalhoCondicional, cliente: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent"
                    placeholder="Nome do cliente"
                  />
                </div>
              </div>
            </div>

            {/* Lista de Produtos */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Produtos</h3>
              </div>

              {itens.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-4">
                    Nenhum produto adicionado. Clique em "Adicionar Produto" para começar.
                  </p>
                  <Button type="button" variant="secondary" onClick={adicionarItem}>
                    ➕ Adicionar Produto
                  </Button>
                </div>
              )}

              {itens.map((item, index) => (
                <div key={item.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-semibold text-gray-700">Produto {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removerItem(item.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      🗑️ Remover
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Código Interno *
                      </label>
                      <input
                        type="text"
                        required
                        value={item.codigoInterno}
                        onChange={(e) => handleCodigoChange(item.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent"
                        placeholder="Digite o código interno"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        O produto será buscado automaticamente
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Produto
                      </label>
                      <input
                        type="text"
                        value={item.produto}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Venda à Vista
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                        <input
                          type="text"
                          value={formatarValorInput(item.precoVendaVista)}
                          readOnly
                          className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Venda 3x
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                        <input
                          type="text"
                          value={formatarValorInput(item.precoVenda3x)}
                          readOnly
                          className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parcelamento
                      </label>
                      <input
                        type="text"
                        value={item.precoVenda3x > 0 ? `3 x ${formatarMoeda(item.precoVenda3x / 3)}` : '3 x R$ 0,00'}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status *
                      </label>
                      <select
                        required
                        value={item.status || 'Com Cliente'}
                        onChange={(e) => {
                          const novosItens = itens.map(i => 
                            i.id === item.id ? { ...i, status: e.target.value } : i
                          );
                          setItens(novosItens);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent bg-white"
                      >
                        <option value="Com Cliente">Com Cliente</option>
                        <option value="Devolvido">Devolvido</option>
                        <option value="Vendido">Vendido</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              {itens.length > 0 && (
                <div className="mt-4">
                  <Button type="button" variant="secondary" onClick={adicionarItem}>
                    ➕ Adicionar Produto
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="submit" variant="primary">
                {condicionalEditando ? '💾 Salvar Alterações' : '➕ Adicionar Condicional'}
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
                placeholder="🔍 Pesquisar por código, cliente, código interno ou produto..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
          </div>
        </div>
      </div>

      {/* Lista de Condicionais */}
      <Card>
        {condicionaisFiltrados.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            Nenhum condicional encontrado
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Código Cond</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Data</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Cliente</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Produtos</th>
                  <th className="text-center text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {condicionaisFiltrados.map((condicional) => {
                  const dataFormatada = condicional.data ? formatarDataParaInput(condicional.data) : '-';
                  const itensCondicional = condicional.itens && Array.isArray(condicional.itens) 
                    ? condicional.itens 
                    : [{
                        codigoInterno: condicional.codigoInterno || '',
                        produto: condicional.produto || '',
                        precoVendaVista: condicional.precoVendaVista || 0,
                        precoVenda3x: condicional.precoVenda3x || 0,
                        status: condicional.status || 'Com Cliente', // Compatibilidade com estrutura antiga
                      }];
                  
                  return (
                    <tr key={condicional.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm font-medium text-gray-900">{condicional.codigoCond || '-'}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{dataFormatada}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{condicional.cliente || '-'}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        <div className="space-y-2">
                          {itensCondicional.map((item, idx) => (
                            <div key={idx} className="border-b border-gray-200 pb-2 last:border-b-0 last:pb-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">{item.produto || item.codigoInterno || '-'}</div>
                                  {item.precoVenda3x > 0 && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      {formatarMoeda(item.precoVendaVista || 0)} | 3x {formatarMoeda((item.precoVenda3x || 0) / 3)}
                                    </div>
                                  )}
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                                  item.status === 'Vendido' 
                                    ? 'bg-green-100 text-green-700' 
                                    : item.status === 'Devolvido'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {item.status || 'Com Cliente'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(condicional)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(condicional.id)}
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


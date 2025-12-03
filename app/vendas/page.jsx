'use client';

import { useState, useEffect } from 'react';
import { useEstoque } from '@/lib/EstoqueContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { formatarMoeda, formatarValorInput, parseValorInput, formatarValorEmTempoReal } from '@/lib/utils';

export default function VendasPage() {
  const { produtos, vendas, adicionarVenda, atualizarVenda, removerVenda, clientes, adicionarCliente } = useEstoque();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [vendaEditando, setVendaEditando] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [clienteInput, setClienteInput] = useState('');
  const [mostrarClientes, setMostrarClientes] = useState(false);

  const [formData, setFormData] = useState({
    dataVenda: '',
    cliente: '',
    itens: [
      {
        codigo: '',
        produto: '',
        valor: 0,
        formaPagamento: 'Pix',
        parcelas: 1,
        desconto: 0,
      }
    ],
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
      dataVenda: '',
      cliente: '',
      itens: [
        {
          codigo: '',
          produto: '',
          valor: 0,
          formaPagamento: 'Pix',
          parcelas: 1,
          desconto: 0,
        }
      ],
    });
    setClienteInput('');
    setVendaEditando(null);
    setMostrarFormulario(false);
  };

  // Buscar produto automaticamente quando código mudar
  const handleCodigoChange = (index, codigo) => {
    const novosItens = [...formData.itens];
    novosItens[index] = { ...novosItens[index], codigo };

    if (codigo && produtos.length > 0) {
      const produtoEncontrado = produtos.find(
        p => p.codigo && p.codigo.toLowerCase() === codigo.toLowerCase()
      );

      if (produtoEncontrado) {
        novosItens[index] = {
          ...novosItens[index],
          produto: produtoEncontrado.produto || '',
          valor: produtoEncontrado.precoVenda || 0,
        };
      } else {
        novosItens[index] = {
          ...novosItens[index],
          produto: '',
          valor: 0,
        };
      }
    } else {
      novosItens[index] = {
        ...novosItens[index],
        produto: '',
        valor: 0,
      };
    }

    setFormData({ ...formData, itens: novosItens });
  };

  const adicionarItem = () => {
    setFormData({
      ...formData,
      itens: [
        ...formData.itens,
        {
          codigo: '',
          produto: '',
          valor: 0,
          formaPagamento: 'Pix',
          parcelas: 1,
          desconto: 0,
        }
      ],
    });
  };

  const removerItem = (index) => {
    if (formData.itens.length > 1) {
      const novosItens = formData.itens.filter((_, i) => i !== index);
      setFormData({ ...formData, itens: novosItens });
    }
  };

  const atualizarItem = (index, campo, valor) => {
    const novosItens = [...formData.itens];
    novosItens[index] = { ...novosItens[index], [campo]: valor };
    setFormData({ ...formData, itens: novosItens });
  };

  const calcularTotal = () => {
    return formData.itens.reduce((total, item) => {
      const valorItem = item.valor || 0;
      const descontoItem = item.desconto || 0;
      return total + (valorItem - descontoItem);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verificar se o cliente existe, se não, criar automaticamente
    let nomeCliente = clienteInput.trim() || formData.cliente.trim();
    if (nomeCliente) {
      const clienteExistente = clientes.find(
        c => c.nome && c.nome.toLowerCase() === nomeCliente.toLowerCase()
      );
      
      if (!clienteExistente) {
        // Criar novo cliente automaticamente
        try {
          await adicionarCliente({ nome: nomeCliente });
        } catch (error) {
          console.error('Erro ao criar cliente automaticamente:', error);
          // Continuar mesmo se falhar ao criar cliente
        }
      }
    }

    const dataISO = formData.dataVenda ? parseDataDoInput(formData.dataVenda)?.toISOString() : null;

    const vendaData = {
      ...formData,
      cliente: nomeCliente,
      dataVenda: dataISO,
      total: calcularTotal(),
    };

    try {
      if (vendaEditando) {
        await atualizarVenda(vendaEditando.id, vendaData);
      } else {
        await adicionarVenda(vendaData);
      }
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
      alert('Erro ao salvar venda. Verifique o console para mais detalhes.');
    }
  };

  const handleEdit = (venda) => {
    setVendaEditando(venda);
    const dataFormatada = venda.dataVenda ? formatarDataParaInput(venda.dataVenda) : '';
    setClienteInput(venda.cliente || '');
    setFormData({
      dataVenda: dataFormatada,
      cliente: venda.cliente || '',
      itens: venda.itens || [
        {
          codigo: '',
          produto: '',
          valor: 0,
          formaPagamento: 'Pix',
          parcelas: 1,
          desconto: 0,
        }
      ],
    });
    setMostrarFormulario(true);
  };

  // Filtrar clientes baseado no input
  const clientesFiltradosAutocomplete = clientes.filter((c) => {
    if (!clienteInput) return false;
    const busca = clienteInput.toLowerCase();
    return (
      (c.nome && c.nome.toLowerCase().includes(busca)) ||
      (c.email && c.email.toLowerCase().includes(busca)) ||
      (c.telefone && c.telefone.includes(clienteInput))
    );
  });

  const selecionarCliente = (cliente) => {
    setFormData({ ...formData, cliente: cliente.nome });
    setClienteInput(cliente.nome);
    setMostrarClientes(false);
  };

  const handleClienteInputChange = async (e) => {
    const valor = e.target.value;
    setClienteInput(valor);
    setFormData({ ...formData, cliente: valor });
    setMostrarClientes(true);
  };

  const handleClienteBlur = async () => {
    // Aguardar um pouco antes de fechar para permitir clique no autocomplete
    setTimeout(async () => {
      setMostrarClientes(false);
      
      // Se o cliente não existe e foi digitado algo, criar automaticamente
      if (clienteInput && clienteInput.trim() !== '') {
        const clienteExiste = clientes.some(
          c => c.nome && c.nome.toLowerCase() === clienteInput.toLowerCase().trim()
        );
        
        if (!clienteExiste) {
          try {
            await adicionarCliente({ nome: clienteInput.trim() });
            setFormData({ ...formData, cliente: clienteInput.trim() });
          } catch (error) {
            console.error('Erro ao criar cliente automaticamente:', error);
          }
        }
      }
    }, 200);
  };

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja excluir esta venda?')) {
      await removerVenda(id);
    }
  };

  const vendasFiltradas = vendas.filter((venda) => {
    const busca = filtro.toLowerCase();
    return (
      (venda.cliente && venda.cliente.toLowerCase().includes(busca)) ||
      (venda.itens && venda.itens.some(item => 
        (item.codigo && item.codigo.toLowerCase().includes(busca)) ||
        (item.produto && item.produto.toLowerCase().includes(busca))
      ))
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">💰 Vendas</h1>
          <p className="text-gray-600 mt-1">Gerencie as vendas realizadas</p>
        </div>

        {!mostrarFormulario ? (
          <div className="mb-6">
            <Button onClick={() => setMostrarFormulario(true)} variant="primary">
              ➕ Nova Venda
            </Button>
          </div>
        ) : (
          <Card className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {vendaEditando ? '✏️ Editar Venda' : '➕ Nova Venda'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Venda *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.dataVenda}
                      onChange={(e) => {
                        const valorFormatado = formatarDataEmTempoReal(e.target.value);
                        setFormData({ ...formData, dataVenda: valorFormatado });
                      }}
                      placeholder="dd/mm/aaaa"
                      maxLength={10}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="date"
                      value={formatarDataParaISO(formData.dataVenda)}
                      onChange={(e) => {
                        if (e.target.value) {
                          const dataBR = converterISOparaBR(e.target.value);
                          setFormData({ ...formData, dataVenda: dataBR });
                        }
                      }}
                      className="absolute right-0 top-0 h-full w-10 opacity-0 cursor-pointer z-10"
                      title="Abrir calendário"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-0">📅</span>
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    value={clienteInput}
                    onChange={handleClienteInputChange}
                    onFocus={() => {
                      if (clienteInput) {
                        setMostrarClientes(true);
                      }
                    }}
                    onBlur={handleClienteBlur}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Digite o nome do cliente..."
                  />
                  {mostrarClientes && clienteInput && clientesFiltradosAutocomplete.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {clientesFiltradosAutocomplete.map((cliente) => (
                        <div
                          key={cliente.id}
                          onClick={() => selecionarCliente(cliente)}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{cliente.nome || 'Sem nome'}</div>
                          {cliente.email && (
                            <div className="text-sm text-gray-500">{cliente.email}</div>
                          )}
                          {cliente.telefone && (
                            <div className="text-sm text-gray-500">{cliente.telefone}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Itens da Venda</h3>
                  <Button type="button" onClick={adicionarItem} variant="secondary">
                    ➕ Adicionar Item
                  </Button>
                </div>

                {formData.itens.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-gray-700">Item {index + 1}</h4>
                      {formData.itens.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removerItem(index)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          🗑️ Remover
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Código *
                        </label>
                        <input
                          type="text"
                          required
                          value={item.codigo}
                          onChange={(e) => handleCodigoChange(index, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Código do produto"
                        />
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
                          Valor *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                          <input
                            type="text"
                            required
                            value={formatarValorInput(item.valor)}
                            onChange={(e) => {
                              const valorFormatado = formatarValorEmTempoReal(e.target.value);
                              const numValor = parseValorInput(valorFormatado);
                              atualizarItem(index, 'valor', numValor);
                            }}
                            placeholder="0,00"
                            className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Forma de Pagamento *
                        </label>
                        <select
                          required
                          value={item.formaPagamento}
                          onChange={(e) => {
                            const novaFormaPagamento = e.target.value;
                            // Resetar parcelas para 1 se não for Cartão Crédito ou Notinha
                            if (novaFormaPagamento !== 'Cartão Crédito' && novaFormaPagamento !== 'Notinha') {
                              atualizarItem(index, 'formaPagamento', novaFormaPagamento);
                              atualizarItem(index, 'parcelas', 1);
                            } else {
                              atualizarItem(index, 'formaPagamento', novaFormaPagamento);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                          <option value="Pix">Pix</option>
                          <option value="Dinheiro">Dinheiro</option>
                          <option value="Cartão Crédito">Cartão Crédito</option>
                          <option value="Notinha">Notinha</option>
                        </select>
                      </div>
                      {(item.formaPagamento === 'Cartão Crédito' || item.formaPagamento === 'Notinha') && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Parcelas *
                          </label>
                          <select
                            required
                            value={item.parcelas}
                            onChange={(e) => atualizarItem(index, 'parcelas', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          >
                            <option value={1}>1x</option>
                            <option value={2}>2x</option>
                            <option value={3}>3x</option>
                          </select>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Desconto
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                          <input
                            type="text"
                            value={formatarValorInput(item.desconto)}
                            onChange={(e) => {
                              const valorFormatado = formatarValorEmTempoReal(e.target.value);
                              const numValor = parseValorInput(valorFormatado);
                              atualizarItem(index, 'desconto', numValor);
                            }}
                            placeholder="0,00"
                            className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-end">
                  <div className="text-right">
                    <div className="text-sm text-gray-600 mb-1">Total:</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatarMoeda(calcularTotal())}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" variant="primary">
                  {vendaEditando ? '💾 Salvar Alterações' : '➕ Adicionar Venda'}
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
                placeholder="🔍 Pesquisar por cliente, código ou produto..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Lista de Vendas */}
        <Card>
          {vendasFiltradas.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              Nenhuma venda encontrada
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Data</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Cliente</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Itens</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Total</th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {vendasFiltradas.map((venda) => {
                    const dataFormatada = venda.dataVenda ? formatarDataParaInput(venda.dataVenda) : '-';
                    return (
                      <tr key={venda.id} className="hover:bg-gray-50">
                        <td className="py-4 px-4 text-sm text-gray-600">{dataFormatada}</td>
                        <td className="py-4 px-4 text-sm font-medium text-gray-900">{venda.cliente || '-'}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          <div className="space-y-1">
                            {venda.itens && venda.itens.map((item, idx) => (
                              <div key={idx} className="text-xs">
                                {item.codigo} - {item.produto} ({item.formaPagamento}
                                {(item.formaPagamento === 'Cartão Crédito' || item.formaPagamento === 'Notinha') && ` ${item.parcelas}x`})
                                {' '}
                                {formatarMoeda(item.valor - (item.desconto || 0))}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm font-semibold text-gray-900">
                          {formatarMoeda(venda.total || 0)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(venda)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(venda.id)}
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


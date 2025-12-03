'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const EstoqueContext = createContext(undefined);

export function EstoqueProvider({ children }) {
  const [produtos, setProdutos] = useState([]);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [compras, setCompras] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [condicionais, setCondicionais] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [investimentos, setInvestimentos] = useState([]);
  const [caixa, setCaixa] = useState([]);
  const [contasAReceber, setContasAReceber] = useState([]);
  const [contasAPagar, setContasAPagar] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [cores, setCores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);

      // Carregar produtos
      const produtosRes = await fetch('/api/produtos');
      if (produtosRes.ok) {
        const produtosData = await produtosRes.json();
        setProdutos(
          produtosData.map((p) => ({
            ...p,
            dataCadastro: new Date(p.dataCadastro),
            ultimaAtualizacao: new Date(p.ultimaAtualizacao),
          }))
        );
      }

      // Carregar movimentações
      const movimentacoesRes = await fetch('/api/movimentacoes');
      if (movimentacoesRes.ok) {
        const movimentacoesData = await movimentacoesRes.json();
        setMovimentacoes(
          movimentacoesData.map((m) => ({
            ...m,
            data: new Date(m.data),
          }))
        );
      }

      // Carregar compras
      const comprasRes = await fetch('/api/compras');
      if (comprasRes.ok) {
        const comprasData = await comprasRes.json();
        setCompras(
          comprasData.map((c) => ({
            ...c,
            dataCompra: c.dataCompra ? new Date(c.dataCompra) : null,
            dataCadastro: new Date(c.dataCadastro),
            ultimaAtualizacao: new Date(c.ultimaAtualizacao),
          }))
        );
      }

      // Carregar fornecedores
      const fornecedoresRes = await fetch('/api/fornecedores');
      if (fornecedoresRes.ok) {
        const fornecedoresData = await fornecedoresRes.json();
        setFornecedores(
          fornecedoresData.map((f) => ({
            ...f,
            dataCadastro: new Date(f.dataCadastro),
            ultimaAtualizacao: new Date(f.ultimaAtualizacao),
          }))
        );
      }

      // Carregar condicionais
      const condicionaisRes = await fetch('/api/condicionais');
      if (condicionaisRes.ok) {
        const condicionaisData = await condicionaisRes.json();
        setCondicionais(
          condicionaisData.map((c) => ({
            ...c,
            data: c.data ? new Date(c.data) : null,
            dataCadastro: new Date(c.dataCadastro),
            ultimaAtualizacao: new Date(c.ultimaAtualizacao),
          }))
        );
      }

      // Carregar vendas
      const vendasRes = await fetch('/api/vendas');
      if (vendasRes.ok) {
        const vendasData = await vendasRes.json();
        setVendas(
          vendasData.map((v) => ({
            ...v,
            dataVenda: v.dataVenda ? new Date(v.dataVenda) : null,
            dataCadastro: new Date(v.dataCadastro),
            ultimaAtualizacao: new Date(v.ultimaAtualizacao),
          }))
        );
      }

      // Carregar investimentos
      const investimentosRes = await fetch('/api/investimentos');
      if (investimentosRes.ok) {
        const investimentosData = await investimentosRes.json();
        setInvestimentos(
          investimentosData.map((i) => ({
            ...i,
            data: i.data ? new Date(i.data) : null,
            dataCadastro: new Date(i.dataCadastro),
            ultimaAtualizacao: new Date(i.ultimaAtualizacao),
          }))
        );
      }

      // Carregar caixa
      const caixaRes = await fetch('/api/caixa');
      if (caixaRes.ok) {
        const caixaData = await caixaRes.json();
        setCaixa(
          caixaData.map((c) => ({
            ...c,
            data: c.data ? new Date(c.data) : null,
            dataCadastro: new Date(c.dataCadastro),
            ultimaAtualizacao: new Date(c.ultimaAtualizacao),
          }))
        );
      }

      // Carregar contas a receber
      const contasAReceberRes = await fetch('/api/contas-a-receber');
      if (contasAReceberRes.ok) {
        const contasAReceberData = await contasAReceberRes.json();
        setContasAReceber(
          contasAReceberData.map((c) => ({
            ...c,
            dataVenda: c.dataVenda ? new Date(c.dataVenda) : null,
            dataVencimento: c.dataVencimento ? new Date(c.dataVencimento) : null,
            dataRecebimento: c.dataRecebimento ? new Date(c.dataRecebimento) : null,
            dataCadastro: new Date(c.dataCadastro),
            ultimaAtualizacao: new Date(c.ultimaAtualizacao),
          }))
        );
      }

      // Carregar contas a pagar
      const contasAPagarRes = await fetch('/api/contas-a-pagar');
      if (contasAPagarRes.ok) {
        const contasAPagarData = await contasAPagarRes.json();
        setContasAPagar(
          contasAPagarData.map((c) => ({
            ...c,
            dataCompra: c.dataCompra ? new Date(c.dataCompra) : null,
            dataVencimento: c.dataVencimento ? new Date(c.dataVencimento) : null,
            dataPagamento: c.dataPagamento ? new Date(c.dataPagamento) : null,
            dataCadastro: new Date(c.dataCadastro),
            ultimaAtualizacao: new Date(c.ultimaAtualizacao),
          }))
        );
      }

      // Carregar clientes
      const clientesRes = await fetch('/api/clientes');
      if (clientesRes.ok) {
        const clientesData = await clientesRes.json();
        setClientes(
          clientesData.map((c) => ({
            ...c,
            dataCadastro: new Date(c.dataCadastro),
            ultimaAtualizacao: new Date(c.ultimaAtualizacao),
          }))
        );
      }

      // Carregar cores
      const coresRes = await fetch('/api/cores');
      if (coresRes.ok) {
        const coresData = await coresRes.json();
        setCores(coresData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const adicionarProduto = async (produto) => {
    try {
      const res = await fetch('/api/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(produto),
      });

      if (!res.ok) throw new Error('Erro ao adicionar produto');

      const novoProduto = await res.json();
      setProdutos((prev) => [
        ...prev,
        {
          ...novoProduto,
          dataCadastro: new Date(novoProduto.dataCadastro),
          ultimaAtualizacao: new Date(novoProduto.ultimaAtualizacao),
        },
      ]);
      return novoProduto;
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      throw error;
    }
  };

  const atualizarProduto = async (id, produtoAtualizado) => {
    try {
      const res = await fetch(`/api/produtos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(produtoAtualizado),
      });

      if (!res.ok) throw new Error('Erro ao atualizar produto');

      const produtoAtual = await res.json();
      setProdutos((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...produtoAtual,
                dataCadastro: new Date(produtoAtual.dataCadastro),
                ultimaAtualizacao: new Date(produtoAtual.ultimaAtualizacao),
              }
            : p
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  };

  const removerProduto = async (id) => {
    try {
      const res = await fetch(`/api/produtos/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Erro ao remover produto');

      setProdutos((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      throw error;
    }
  };

  const adicionarMovimentacao = async (movimentacao) => {
    try {
      const res = await fetch('/api/movimentacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(movimentacao),
      });

      if (!res.ok) throw new Error('Erro ao adicionar movimentação');

      const novaMovimentacao = await res.json();
      setMovimentacoes((prev) => [
        {
          ...novaMovimentacao,
          data: new Date(novaMovimentacao.data),
        },
        ...prev,
      ]);

      // Atualizar quantidade do produto (já atualizado na API, recarregar produtos)
      const produtosRes = await fetch('/api/produtos');
      if (produtosRes.ok) {
        const produtosData = await produtosRes.json();
        setProdutos(
          produtosData.map((p) => ({
            ...p,
            dataCadastro: new Date(p.dataCadastro),
            ultimaAtualizacao: new Date(p.ultimaAtualizacao),
          }))
        );
      }
    } catch (error) {
      console.error('Erro ao adicionar movimentação:', error);
      throw error;
    }
  };

  const getProduto = (id) => {
    return produtos.find((p) => p.id === id);
  };

  const adicionarCompra = async (compra) => {
    try {
      const res = await fetch('/api/compras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(compra),
      });

      if (!res.ok) throw new Error('Erro ao adicionar compra');

      const novaCompra = await res.json();
      setCompras((prev) => [
        ...prev,
        {
          ...novaCompra,
          dataCompra: novaCompra.dataCompra ? new Date(novaCompra.dataCompra) : null,
          dataCadastro: new Date(novaCompra.dataCadastro),
          ultimaAtualizacao: new Date(novaCompra.ultimaAtualizacao),
        },
      ]);

      // Recarregar produtos para incluir o novo produto adicionado automaticamente
      const produtosRes = await fetch('/api/produtos');
      if (produtosRes.ok) {
        const produtosData = await produtosRes.json();
        setProdutos(
          produtosData.map((p) => ({
            ...p,
            dataCadastro: new Date(p.dataCadastro),
            ultimaAtualizacao: new Date(p.ultimaAtualizacao),
          }))
        );
      }

      return novaCompra;
    } catch (error) {
      console.error('Erro ao adicionar compra:', error);
      throw error;
    }
  };

  const atualizarCompra = async (id, compraAtualizada) => {
    try {
      const res = await fetch(`/api/compras/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(compraAtualizada),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(errorData.error || `Erro ao atualizar compra: ${res.status} ${res.statusText}`);
      }

      const compraAtual = await res.json();
      setCompras((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...compraAtual,
                dataCompra: compraAtual.dataCompra ? new Date(compraAtual.dataCompra) : null,
                dataCadastro: new Date(compraAtual.dataCadastro),
                ultimaAtualizacao: new Date(compraAtual.ultimaAtualizacao),
              }
            : c
        )
      );

      // Recarregar produtos para refletir atualizações no produto relacionado
      const produtosRes = await fetch('/api/produtos');
      if (produtosRes.ok) {
        const produtosData = await produtosRes.json();
        setProdutos(
          produtosData.map((p) => ({
            ...p,
            dataCadastro: new Date(p.dataCadastro),
            ultimaAtualizacao: new Date(p.ultimaAtualizacao),
          }))
        );
      }
    } catch (error) {
      console.error('Erro ao atualizar compra:', error);
      throw error;
    }
  };

  const removerCompra = async (id) => {
    try {
      const res = await fetch(`/api/compras/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Erro ao remover compra';
        
        // Se a compra não foi encontrada, apenas remove do estado local
        if (res.status === 404) {
          setCompras((prev) => prev.filter((c) => c.id !== id));
          return;
        }
        
        throw new Error(errorMessage);
      }

      setCompras((prev) => prev.filter((c) => c.id !== id));

      // Recarregar produtos para refletir possíveis alterações no estoque
      const produtosRes = await fetch('/api/produtos');
      if (produtosRes.ok) {
        const produtosData = await produtosRes.json();
        setProdutos(
          produtosData.map((p) => ({
            ...p,
            dataCadastro: new Date(p.dataCadastro),
            ultimaAtualizacao: new Date(p.ultimaAtualizacao),
          }))
        );
      }
    } catch (error) {
      console.error('Erro ao remover compra:', error);
      throw error;
    }
  };

  const adicionarFornecedor = async (fornecedor) => {
    try {
      const res = await fetch('/api/fornecedores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fornecedor),
      });

      if (!res.ok) throw new Error('Erro ao adicionar fornecedor');

      const novoFornecedor = await res.json();
      setFornecedores((prev) => [
        ...prev,
        {
          ...novoFornecedor,
          dataCadastro: new Date(novoFornecedor.dataCadastro),
          ultimaAtualizacao: new Date(novoFornecedor.ultimaAtualizacao),
        },
      ]);
      return novoFornecedor;
    } catch (error) {
      console.error('Erro ao adicionar fornecedor:', error);
      throw error;
    }
  };

  const atualizarFornecedor = async (id, fornecedorAtualizado) => {
    try {
      const res = await fetch(`/api/fornecedores/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fornecedorAtualizado),
      });

      if (!res.ok) throw new Error('Erro ao atualizar fornecedor');

      const fornecedorAtual = await res.json();
      setFornecedores((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...fornecedorAtual,
                dataCadastro: new Date(fornecedorAtual.dataCadastro),
                ultimaAtualizacao: new Date(fornecedorAtual.ultimaAtualizacao),
              }
            : f
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar fornecedor:', error);
      throw error;
    }
  };

  const removerFornecedor = async (id) => {
    try {
      const res = await fetch(`/api/fornecedores/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Erro ao remover fornecedor');

      setFornecedores((prev) => prev.filter((f) => f.id !== id));
    } catch (error) {
      console.error('Erro ao remover fornecedor:', error);
      throw error;
    }
  };

  const adicionarCondicional = async (condicional) => {
    try {
      const res = await fetch('/api/condicionais', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(condicional),
      });

      if (!res.ok) throw new Error('Erro ao adicionar condicional');

      const novoCondicional = await res.json();
      setCondicionais((prev) => [
        ...prev,
        {
          ...novoCondicional,
          data: novoCondicional.data ? new Date(novoCondicional.data) : null,
          dataCadastro: new Date(novoCondicional.dataCadastro),
          ultimaAtualizacao: new Date(novoCondicional.ultimaAtualizacao),
        },
      ]);

      // Recarregar produtos para refletir as alterações no campo condicional
      const produtosRes = await fetch('/api/produtos');
      if (produtosRes.ok) {
        const produtosData = await produtosRes.json();
        setProdutos(
          produtosData.map((p) => ({
            ...p,
            dataCadastro: new Date(p.dataCadastro),
            ultimaAtualizacao: new Date(p.ultimaAtualizacao),
          }))
        );
      }

      return novoCondicional;
    } catch (error) {
      console.error('Erro ao adicionar condicional:', error);
      throw error;
    }
  };

  const atualizarCondicional = async (id, condicionalAtualizado) => {
    try {
      const res = await fetch(`/api/condicionais/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(condicionalAtualizado),
      });

      if (!res.ok) throw new Error('Erro ao atualizar condicional');

      const condicionalAtual = await res.json();
      setCondicionais((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...condicionalAtual,
                data: condicionalAtual.data ? new Date(condicionalAtual.data) : null,
                dataCadastro: new Date(condicionalAtual.dataCadastro),
                ultimaAtualizacao: new Date(condicionalAtual.ultimaAtualizacao),
              }
            : c
        )
      );

      // Recarregar produtos para refletir as alterações no campo condicional
      const produtosRes = await fetch('/api/produtos');
      if (produtosRes.ok) {
        const produtosData = await produtosRes.json();
        setProdutos(
          produtosData.map((p) => ({
            ...p,
            dataCadastro: new Date(p.dataCadastro),
            ultimaAtualizacao: new Date(p.ultimaAtualizacao),
          }))
        );
      }

      // Se o status mudou para "Vendido", recarregar vendas para mostrar a nova venda criada
      if (condicionalAtualizado.status === 'Vendido') {
        const vendasRes = await fetch('/api/vendas');
        if (vendasRes.ok) {
          const vendasData = await vendasRes.json();
          setVendas(
            vendasData.map((v) => ({
              ...v,
              dataVenda: v.dataVenda ? new Date(v.dataVenda) : null,
              dataCadastro: new Date(v.dataCadastro),
              ultimaAtualizacao: new Date(v.ultimaAtualizacao),
            }))
          );
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar condicional:', error);
      throw error;
    }
  };

  const removerCondicional = async (id) => {
    try {
      const res = await fetch(`/api/condicionais/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Erro ao remover condicional');

      setCondicionais((prev) => prev.filter((c) => c.id !== id));

      // Recarregar produtos para refletir as alterações no campo condicional
      const produtosRes = await fetch('/api/produtos');
      if (produtosRes.ok) {
        const produtosData = await produtosRes.json();
        setProdutos(
          produtosData.map((p) => ({
            ...p,
            dataCadastro: new Date(p.dataCadastro),
            ultimaAtualizacao: new Date(p.ultimaAtualizacao),
          }))
        );
      }
    } catch (error) {
      console.error('Erro ao remover condicional:', error);
      throw error;
    }
  };

  const adicionarVenda = async (venda) => {
    try {
      const res = await fetch('/api/vendas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(venda),
      });

      if (!res.ok) throw new Error('Erro ao adicionar venda');

      const novaVenda = await res.json();
      setVendas((prev) => [
        ...prev,
        {
          ...novaVenda,
          dataVenda: novaVenda.dataVenda ? new Date(novaVenda.dataVenda) : null,
          dataCadastro: new Date(novaVenda.dataCadastro),
          ultimaAtualizacao: new Date(novaVenda.ultimaAtualizacao),
        },
      ]);

      // Recarregar produtos para refletir as alterações no estoque
      const produtosRes = await fetch('/api/produtos');
      if (produtosRes.ok) {
        const produtosData = await produtosRes.json();
        setProdutos(
          produtosData.map((p) => ({
            ...p,
            dataCadastro: new Date(p.dataCadastro),
            ultimaAtualizacao: new Date(p.ultimaAtualizacao),
          }))
        );
      }

      // Recarregar contas a receber (caso tenha sido criada uma conta para Notinha)
      const contasAReceberRes = await fetch('/api/contas-a-receber');
      if (contasAReceberRes.ok) {
        const contasAReceberData = await contasAReceberRes.json();
        setContasAReceber(
          contasAReceberData.map((c) => ({
            ...c,
            dataVenda: c.dataVenda ? new Date(c.dataVenda) : null,
            dataVencimento: c.dataVencimento ? new Date(c.dataVencimento) : null,
            dataRecebimento: c.dataRecebimento ? new Date(c.dataRecebimento) : null,
            dataCadastro: new Date(c.dataCadastro),
            ultimaAtualizacao: new Date(c.ultimaAtualizacao),
          }))
        );
      }

      return novaVenda;
    } catch (error) {
      console.error('Erro ao adicionar venda:', error);
      throw error;
    }
  };

  const atualizarVenda = async (id, vendaAtualizada) => {
    try {
      const res = await fetch(`/api/vendas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendaAtualizada),
      });

      if (!res.ok) throw new Error('Erro ao atualizar venda');

      const vendaAtual = await res.json();
      setVendas((prev) =>
        prev.map((v) =>
          v.id === id
            ? {
                ...vendaAtual,
                dataVenda: vendaAtual.dataVenda ? new Date(vendaAtual.dataVenda) : null,
                dataCadastro: new Date(vendaAtual.dataCadastro),
                ultimaAtualizacao: new Date(vendaAtual.ultimaAtualizacao),
              }
            : v
        )
      );

      // Recarregar produtos para refletir as alterações no estoque
      const produtosRes = await fetch('/api/produtos');
      if (produtosRes.ok) {
        const produtosData = await produtosRes.json();
        setProdutos(
          produtosData.map((p) => ({
            ...p,
            dataCadastro: new Date(p.dataCadastro),
            ultimaAtualizacao: new Date(p.ultimaAtualizacao),
          }))
        );
      }
    } catch (error) {
      console.error('Erro ao atualizar venda:', error);
      throw error;
    }
  };

  const removerVenda = async (id) => {
    try {
      const res = await fetch(`/api/vendas/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Erro ao remover venda');

      setVendas((prev) => prev.filter((v) => v.id !== id));

      // Recarregar produtos para refletir as alterações no estoque
      const produtosRes = await fetch('/api/produtos');
      if (produtosRes.ok) {
        const produtosData = await produtosRes.json();
        setProdutos(
          produtosData.map((p) => ({
            ...p,
            dataCadastro: new Date(p.dataCadastro),
            ultimaAtualizacao: new Date(p.ultimaAtualizacao),
          }))
        );
      }
    } catch (error) {
      console.error('Erro ao remover venda:', error);
      throw error;
    }
  };

  const adicionarInvestimento = async (investimento) => {
    try {
      const res = await fetch('/api/investimentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(investimento),
      });

      if (!res.ok) throw new Error('Erro ao adicionar investimento');

      const novoInvestimento = await res.json();
      setInvestimentos((prev) => [
        ...prev,
        {
          ...novoInvestimento,
          data: novoInvestimento.data ? new Date(novoInvestimento.data) : null,
          dataCadastro: new Date(novoInvestimento.dataCadastro),
          ultimaAtualizacao: new Date(novoInvestimento.ultimaAtualizacao),
        },
      ]);

      // Recarregar investimentos para ter os saldos recalculados
      const investimentosRes = await fetch('/api/investimentos');
      if (investimentosRes.ok) {
        const investimentosData = await investimentosRes.json();
        setInvestimentos(
          investimentosData.map((i) => ({
            ...i,
            data: i.data ? new Date(i.data) : null,
            dataCadastro: new Date(i.dataCadastro),
            ultimaAtualizacao: new Date(i.ultimaAtualizacao),
          }))
        );
      }

      return novoInvestimento;
    } catch (error) {
      console.error('Erro ao adicionar investimento:', error);
      throw error;
    }
  };

  const atualizarInvestimento = async (id, investimentoAtualizado) => {
    try {
      const res = await fetch(`/api/investimentos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(investimentoAtualizado),
      });

      if (!res.ok) throw new Error('Erro ao atualizar investimento');

      const investimentoAtual = await res.json();
      setInvestimentos((prev) =>
        prev.map((i) =>
          i.id === id
            ? {
                ...investimentoAtual,
                data: investimentoAtual.data ? new Date(investimentoAtual.data) : null,
                dataCadastro: new Date(investimentoAtual.dataCadastro),
                ultimaAtualizacao: new Date(investimentoAtual.ultimaAtualizacao),
              }
            : i
        )
      );

      // Recarregar investimentos para ter os saldos recalculados
      const investimentosRes = await fetch('/api/investimentos');
      if (investimentosRes.ok) {
        const investimentosData = await investimentosRes.json();
        setInvestimentos(
          investimentosData.map((i) => ({
            ...i,
            data: i.data ? new Date(i.data) : null,
            dataCadastro: new Date(i.dataCadastro),
            ultimaAtualizacao: new Date(i.ultimaAtualizacao),
          }))
        );
      }
    } catch (error) {
      console.error('Erro ao atualizar investimento:', error);
      throw error;
    }
  };

  const removerInvestimento = async (id) => {
    try {
      const res = await fetch(`/api/investimentos/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Erro ao remover investimento');

      setInvestimentos((prev) => prev.filter((i) => i.id !== id));

      // Recarregar investimentos para ter os saldos recalculados
      const investimentosRes = await fetch('/api/investimentos');
      if (investimentosRes.ok) {
        const investimentosData = await investimentosRes.json();
        setInvestimentos(
          investimentosData.map((i) => ({
            ...i,
            data: i.data ? new Date(i.data) : null,
            dataCadastro: new Date(i.dataCadastro),
            ultimaAtualizacao: new Date(i.ultimaAtualizacao),
          }))
        );
      }
    } catch (error) {
      console.error('Erro ao remover investimento:', error);
      throw error;
    }
  };

  const adicionarCaixa = async (registro) => {
    try {
      const res = await fetch('/api/caixa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registro),
      });

      if (!res.ok) throw new Error('Erro ao adicionar registro de caixa');

      const novoRegistro = await res.json();
      setCaixa((prev) => [
        ...prev,
        {
          ...novoRegistro,
          data: novoRegistro.data ? new Date(novoRegistro.data) : null,
          dataCadastro: new Date(novoRegistro.dataCadastro),
          ultimaAtualizacao: new Date(novoRegistro.ultimaAtualizacao),
        },
      ]);

      // Recarregar caixa para ter os saldos recalculados
      const caixaRes = await fetch('/api/caixa');
      if (caixaRes.ok) {
        const caixaData = await caixaRes.json();
        setCaixa(
          caixaData.map((c) => ({
            ...c,
            data: c.data ? new Date(c.data) : null,
            dataCadastro: new Date(c.dataCadastro),
            ultimaAtualizacao: new Date(c.ultimaAtualizacao),
          }))
        );
      }

      return novoRegistro;
    } catch (error) {
      console.error('Erro ao adicionar registro de caixa:', error);
      throw error;
    }
  };

  const atualizarCaixa = async (id, registroAtualizado) => {
    try {
      const res = await fetch(`/api/caixa/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registroAtualizado),
      });

      if (!res.ok) throw new Error('Erro ao atualizar registro de caixa');

      const registroAtual = await res.json();
      setCaixa((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...registroAtual,
                data: registroAtual.data ? new Date(registroAtual.data) : null,
                dataCadastro: new Date(registroAtual.dataCadastro),
                ultimaAtualizacao: new Date(registroAtual.ultimaAtualizacao),
              }
            : c
        )
      );

      // Recarregar caixa para ter os saldos recalculados
      const caixaRes = await fetch('/api/caixa');
      if (caixaRes.ok) {
        const caixaData = await caixaRes.json();
        setCaixa(
          caixaData.map((c) => ({
            ...c,
            data: c.data ? new Date(c.data) : null,
            dataCadastro: new Date(c.dataCadastro),
            ultimaAtualizacao: new Date(c.ultimaAtualizacao),
          }))
        );
      }
    } catch (error) {
      console.error('Erro ao atualizar registro de caixa:', error);
      throw error;
    }
  };

  const removerCaixa = async (id) => {
    try {
      const res = await fetch(`/api/caixa/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Erro ao remover registro de caixa');

      setCaixa((prev) => prev.filter((c) => c.id !== id));

      // Recarregar caixa para ter os saldos recalculados
      const caixaRes = await fetch('/api/caixa');
      if (caixaRes.ok) {
        const caixaData = await caixaRes.json();
        setCaixa(
          caixaData.map((c) => ({
            ...c,
            data: c.data ? new Date(c.data) : null,
            dataCadastro: new Date(c.dataCadastro),
            ultimaAtualizacao: new Date(c.ultimaAtualizacao),
          }))
        );
      }
    } catch (error) {
      console.error('Erro ao remover registro de caixa:', error);
      throw error;
    }
  };

  const atualizarContaAReceber = async (id, contaAtualizada) => {
    try {
      const res = await fetch(`/api/contas-a-receber/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contaAtualizada),
      });

      if (!res.ok) throw new Error('Erro ao atualizar conta a receber');

      const contaAtual = await res.json();
      setContasAReceber((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...contaAtual,
                dataVenda: contaAtual.dataVenda ? new Date(contaAtual.dataVenda) : null,
                dataVencimento: contaAtual.dataVencimento ? new Date(contaAtual.dataVencimento) : null,
                dataRecebimento: contaAtual.dataRecebimento ? new Date(contaAtual.dataRecebimento) : null,
                dataCadastro: new Date(contaAtual.dataCadastro),
                ultimaAtualizacao: new Date(contaAtual.ultimaAtualizacao),
              }
            : c
        )
      );

      // Recarregar caixa se foi recebido
      if (contaAtualizada.recebido) {
        const caixaRes = await fetch('/api/caixa');
        if (caixaRes.ok) {
          const caixaData = await caixaRes.json();
          setCaixa(
            caixaData.map((c) => ({
              ...c,
              data: c.data ? new Date(c.data) : null,
              dataCadastro: new Date(c.dataCadastro),
              ultimaAtualizacao: new Date(c.ultimaAtualizacao),
            }))
          );
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar conta a receber:', error);
      throw error;
    }
  };

  const removerContaAReceber = async (id) => {
    try {
      const res = await fetch(`/api/contas-a-receber/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Erro ao remover conta a receber');

      setContasAReceber((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Erro ao remover conta a receber:', error);
      throw error;
    }
  };

  const atualizarContaAPagar = async (id, contaAtualizada) => {
    try {
      // Garantir que o ID seja uma string
      // Não codificar manualmente - o fetch/Next.js trata isso automaticamente
      const idString = String(id);
      
      const res = await fetch(`/api/contas-a-pagar/${idString}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contaAtualizada),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
        const errorMessage = errorData.error || `Erro ao atualizar conta a pagar: ${res.status} ${res.statusText}`;
        console.error('Erro na resposta da API:', {
          status: res.status,
          statusText: res.statusText,
          errorData,
          idEnviado: idString
        });
        throw new Error(errorMessage);
      }

      const contaAtualizadaData = await res.json();
      setContasAPagar((prev) =>
        prev.map((c) =>
          String(c.id) === idString
            ? {
                ...contaAtualizadaData,
                dataCompra: contaAtualizadaData.dataCompra ? new Date(contaAtualizadaData.dataCompra) : null,
                dataVencimento: contaAtualizadaData.dataVencimento ? new Date(contaAtualizadaData.dataVencimento) : null,
                dataPagamento: contaAtualizadaData.dataPagamento ? new Date(contaAtualizadaData.dataPagamento) : null,
                dataCadastro: new Date(contaAtualizadaData.dataCadastro),
                ultimaAtualizacao: new Date(contaAtualizadaData.ultimaAtualizacao),
              }
            : c
        )
      );

      // Recarregar caixa se foi pago
      if (contaAtualizadaData.pago) {
        const caixaRes = await fetch('/api/caixa');
        if (caixaRes.ok) {
          const caixaData = await caixaRes.json();
          setCaixa(
            caixaData.map((c) => ({
              ...c,
              data: new Date(c.data),
              dataCadastro: new Date(c.dataCadastro),
              ultimaAtualizacao: new Date(c.ultimaAtualizacao),
            }))
          );
        }
      }

      return contaAtualizadaData;
    } catch (error) {
      console.error('Erro ao atualizar conta a pagar:', error);
      throw error;
    }
  };

  const adicionarContaAPagar = async (conta) => {
    try {
      const res = await fetch('/api/contas-a-pagar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conta),
      });

      if (!res.ok) throw new Error('Erro ao adicionar conta a pagar');

      const novaConta = await res.json();
      setContasAPagar((prev) => [
        ...prev,
        {
          ...novaConta,
          dataCompra: novaConta.dataCompra ? new Date(novaConta.dataCompra) : null,
          dataVencimento: novaConta.dataVencimento ? new Date(novaConta.dataVencimento) : null,
          dataPagamento: novaConta.dataPagamento ? new Date(novaConta.dataPagamento) : null,
          dataCadastro: new Date(novaConta.dataCadastro),
          ultimaAtualizacao: new Date(novaConta.ultimaAtualizacao),
        },
      ]);
      return novaConta;
    } catch (error) {
      console.error('Erro ao adicionar conta a pagar:', error);
      throw error;
    }
  };

  const removerContaAPagar = async (id) => {
    try {
      const res = await fetch(`/api/contas-a-pagar/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Erro ao remover conta a pagar');

      setContasAPagar((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Erro ao remover conta a pagar:', error);
      throw error;
    }
  };

  const adicionarCliente = async (cliente) => {
    try {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cliente),
      });

      if (!res.ok) throw new Error('Erro ao adicionar cliente');

      const novoCliente = await res.json();
      setClientes((prev) => [
        ...prev,
        {
          ...novoCliente,
          dataCadastro: new Date(novoCliente.dataCadastro),
          ultimaAtualizacao: new Date(novoCliente.ultimaAtualizacao),
        },
      ]);
      return novoCliente;
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      throw error;
    }
  };

  const atualizarCliente = async (id, clienteAtualizado) => {
    try {
      const res = await fetch(`/api/clientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clienteAtualizado),
      });

      if (!res.ok) throw new Error('Erro ao atualizar cliente');

      const clienteAtual = await res.json();
      setClientes((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...clienteAtual,
                dataCadastro: new Date(clienteAtual.dataCadastro),
                ultimaAtualizacao: new Date(clienteAtual.ultimaAtualizacao),
              }
            : c
        )
      );
      return clienteAtual;
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  };

  const removerCliente = async (id) => {
    try {
      const res = await fetch(`/api/clientes/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Erro ao remover cliente');

      setClientes((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Erro ao remover cliente:', error);
      throw error;
    }
  };

  return (
    <EstoqueContext.Provider
      value={{
        produtos,
        movimentacoes,
        compras,
        fornecedores,
        condicionais,
        vendas,
        investimentos,
        caixa,
        contasAReceber,
        contasAPagar,
        clientes,
        cores,
        loading,
        adicionarProduto,
        atualizarProduto,
        removerProduto,
        adicionarMovimentacao,
        adicionarCompra,
        atualizarCompra,
        removerCompra,
        adicionarFornecedor,
        atualizarFornecedor,
        removerFornecedor,
        adicionarCondicional,
        atualizarCondicional,
        removerCondicional,
        adicionarVenda,
        atualizarVenda,
        removerVenda,
        adicionarInvestimento,
        atualizarInvestimento,
        removerInvestimento,
        adicionarCaixa,
        atualizarCaixa,
        removerCaixa,
        atualizarContaAReceber,
        removerContaAReceber,
        adicionarContaAPagar,
        atualizarContaAPagar,
        removerContaAPagar,
        adicionarCliente,
        atualizarCliente,
        removerCliente,
        getProduto,
        refreshData: carregarDados,
      }}
    >
      {children}
    </EstoqueContext.Provider>
  );
}

export function useEstoque() {
  const context = useContext(EstoqueContext);
  if (context === undefined) {
    throw new Error('useEstoque deve ser usado dentro de um EstoqueProvider');
  }
  return context;
}

'use client';

import { useState, useEffect } from 'react';
import { useEstoque } from '@/lib/EstoqueContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { formatarMoeda, formatarValorInput, parseValorInput, formatarValorEmTempoReal } from '@/lib/utils';

// Mapeamento de tipos para abreviações
const tipoAbreviacoes = {
  'Camiseta': 'CMT',
  'CJT Leg + Top': 'CLT',
  'CJT Sht + Top': 'CST',
  'Macaquinho': 'MCQ',
  'Regata': 'RGT',
  'Leg': 'LEG',
  'Top': 'TOP',
};

// Função para extrair número sequencial de um código interno existente
const extrairNumeroSequencial = (codigoInterno) => {
  if (!codigoInterno) return 0;
  const match = codigoInterno.match(/\d{5}/);
  if (match) {
    return parseInt(match[0], 10);
  }
  return 0;
};

// Função para obter o próximo número sequencial de TODOS os produtos (de todas as compras E do estoque E itens atuais)
// compraIdExcluir: ID da compra que está sendo editada, para não contar seus códigos duas vezes
const obterProximoNumeroSequencial = (compras, produtos, itensAtuais = [], compraIdExcluir = null) => {
  const numeros = [];
  
  // Extrair números sequenciais dos produtos do estoque (fonte mais confiável)
  if (produtos && produtos.length > 0) {
    produtos.forEach(produto => {
      if (produto.codigo) {
        const num = extrairNumeroSequencial(produto.codigo);
        if (num > 0) numeros.push(num);
      }
    });
  }
  
  // Extrair números sequenciais de todos os itens de todas as compras (exceto a que está sendo editada)
  // Isso captura produtos que ainda não foram salvos no estoque
  if (compras && compras.length > 0) {
    compras.forEach(compra => {
      // Pular a compra que está sendo editada (seus códigos já estão em itensAtuais ou produtos)
      if (compraIdExcluir && compra.id === compraIdExcluir) {
        return;
      }
      
      if (compra.itens && Array.isArray(compra.itens)) {
        compra.itens.forEach(item => {
          if (item.codigoInterno) {
            const num = extrairNumeroSequencial(item.codigoInterno);
            if (num > 0) numeros.push(num);
          }
        });
      } else if (compra.codigoInterno) {
        // Compatibilidade com estrutura antiga
        const num = extrairNumeroSequencial(compra.codigoInterno);
        if (num > 0) numeros.push(num);
      }
    });
  }
  
  // Extrair números sequenciais dos itens que estão sendo adicionados/editados na compra atual
  if (itensAtuais && itensAtuais.length > 0) {
    itensAtuais.forEach(item => {
      if (item.codigoInterno) {
        const num = extrairNumeroSequencial(item.codigoInterno);
        if (num > 0) numeros.push(num);
      }
    });
  }
  
  if (numeros.length === 0) {
    return 1;
  }
  
  const maiorNumero = Math.max(...numeros);
  return maiorNumero + 1;
};

// Função para gerar código interno com número sequencial
const gerarCodigoInterno = (tipo, tamanho, compras, produtos, itensAtuais = [], compraIdExcluir = null) => {
  if (!tipo || !tamanho) return '';
  const abreviacao = tipoAbreviacoes[tipo] || '';
  const proximoNumero = obterProximoNumeroSequencial(compras, produtos, itensAtuais, compraIdExcluir);
  const numeroFormatado = String(proximoNumero).padStart(5, '0');
  return `${abreviacao}${numeroFormatado}${tamanho}`;
};

// Função para gerar nome do produto
const gerarProduto = (tipo, cor, tamanho) => {
  if (!tipo || !cor || !tamanho) return '';
  return `${tipo} ${cor} ${tamanho}`;
};

export default function ComprasPage() {
  const { compras, produtos, adicionarCompra, atualizarCompra, removerCompra, fornecedores, cores, refreshData } = useEstoque();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [compraEditando, setCompraEditando] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [fornecedorInput, setFornecedorInput] = useState('');
  const [mostrarFornecedores, setMostrarFornecedores] = useState(false);
  const [mostrarAdicionarCor, setMostrarAdicionarCor] = useState({});
  const [novaCor, setNovaCor] = useState({});
  const [corrigindoCodigos, setCorrigindoCodigos] = useState(false);

  // Dados do cabeçalho da compra
  const [cabecalhoCompra, setCabecalhoCompra] = useState({
    dataCompra: '',
    fornecedor: '',
    codigoFornecedor: '',
    formaPagamentoCompra: '', // Forma de pagamento para contas a pagar
    parcelas: 1, // Número de parcelas
  });

  // Lista de itens (produtos) da compra
  const [itens, setItens] = useState([]);

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
    const date = data instanceof Date ? data : new Date(data);
    if (isNaN(date.getTime())) {
      // Tentar converter de dd/mm/aaaa
      const partes = data.split('/');
      if (partes.length === 3) {
        const dia = partes[0];
        const mes = partes[1];
        const ano = partes[2];
        if (ano && mes && dia) {
          return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
        }
      }
      return '';
    }
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = date.getFullYear();
    return `${ano}-${mes}-${dia}`;
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

  // Adicionar novo item à compra
  const adicionarItem = () => {
    const novoItem = {
      id: Date.now().toString(),
      tipo: '',
      cor: '',
      tamanho: '',
      codigoInterno: '',
      produto: '',
      custoUnitario: 0,
      precoSugerido: 0,
      precoVendaVista: 0,
      precoVenda3x: 0,
      lucroVista: 0,
      lucro3x: 0,
      custo3x: 0,
      devolvido: false,
      // Estados para valores formatados
      custoUnitarioInput: '',
      precoSugeridoInput: '',
      precoVendaVistaInput: '',
      precoVenda3xInput: '',
      custo3xInput: '',
    };
    setItens([...itens, novoItem]);
  };

  // Remover item da compra
  const removerItem = (itemId) => {
    setItens(itens.filter(item => item.id !== itemId));
  };

  // Atualizar item
  const adicionarNovaCor = async (nomeCor, itemId) => {
    if (!nomeCor || nomeCor.trim() === '') return;
    
    try {
      const res = await fetch('/api/cores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cor: nomeCor.trim() }),
      });

      if (res.ok) {
        // Atualizar o item com a nova cor
        atualizarItem(itemId, 'cor', nomeCor.trim());
        setMostrarAdicionarCor({ ...mostrarAdicionarCor, [itemId]: false });
        setNovaCor({ ...novaCor, [itemId]: '' });
        // Recarregar dados do contexto para atualizar a lista de cores
        if (refreshData) {
          refreshData();
        }
      }
    } catch (error) {
      console.error('Erro ao adicionar cor:', error);
      alert('Erro ao adicionar cor. Verifique o console para mais detalhes.');
    }
  };

  const atualizarItem = (itemId, campo, valor) => {
    setItens(itens.map(item => {
      if (item.id === itemId) {
        const itemAtualizado = { ...item, [campo]: valor };
        
        // Calcular Preço Sugerido
        if (campo === 'custoUnitario') {
          const precoSugerido = valor > 0 ? valor * 2 : 0;
          itemAtualizado.precoSugerido = precoSugerido;
          itemAtualizado.precoSugeridoInput = formatarValorInput(precoSugerido);
        }

        // Calcular Lucro à vista
        if (campo === 'custoUnitario' || campo === 'precoVendaVista') {
          const custo = campo === 'custoUnitario' ? valor : itemAtualizado.custoUnitario;
          const precoVista = campo === 'precoVendaVista' ? valor : itemAtualizado.precoVendaVista;
          if (precoVista > 0 && custo > 0) {
            itemAtualizado.lucroVista = ((precoVista - custo) / custo) * 100;
          } else {
            itemAtualizado.lucroVista = 0;
          }
        }

        // Calcular Lucro 3x
        if (campo === 'custoUnitario' || campo === 'custo3x' || campo === 'precoVenda3x') {
          const custo = campo === 'custoUnitario' ? valor : itemAtualizado.custoUnitario;
          const custo3x = campo === 'custo3x' ? valor : itemAtualizado.custo3x;
          const preco3x = campo === 'precoVenda3x' ? valor : itemAtualizado.precoVenda3x;
          const custoTotal3x = custo + custo3x;
          if (preco3x > 0 && custoTotal3x > 0) {
            itemAtualizado.lucro3x = ((preco3x - custoTotal3x) / custoTotal3x) * 100;
          } else {
            itemAtualizado.lucro3x = 0;
          }
        }

        // Gerar Código Interno e Produto
        // Só gerar novo código se tipo ou tamanho mudaram E o item não tinha código antes
        // Se o item já tem código, preservar (exceto se tipo ou tamanho mudaram completamente)
        if (campo === 'tipo' || campo === 'cor' || campo === 'tamanho') {
          const tipo = campo === 'tipo' ? valor : itemAtualizado.tipo;
          const cor = campo === 'cor' ? valor : itemAtualizado.cor;
          const tamanho = campo === 'tamanho' ? valor : itemAtualizado.tamanho;
          
          if (tipo && cor && tamanho) {
            // Se o item já tinha código e tipo/tamanho não mudaram, preservar
            const tipoMudou = campo === 'tipo' && itemAtualizado.tipo !== valor;
            const tamanhoMudou = campo === 'tamanho' && itemAtualizado.tamanho !== valor;
            
            // Se tipo ou tamanho mudaram, ou se não tinha código, gerar novo
            if (!itemAtualizado.codigoInterno || tipoMudou || tamanhoMudou) {
              // Passar todos os itens exceto o atual para evitar duplicação
              const outrosItens = itens.filter(i => i.id !== itemId);
              // Passar o ID da compra sendo editada para não contar seus códigos duas vezes
              const compraIdExcluir = compraEditando ? compraEditando.id : null;
              itemAtualizado.codigoInterno = gerarCodigoInterno(tipo, tamanho, compras, produtos, outrosItens, compraIdExcluir);
            }
            // Sempre atualizar o nome do produto (pode mudar com a cor)
            itemAtualizado.produto = gerarProduto(tipo, cor, tamanho);
          } else {
            itemAtualizado.codigoInterno = '';
            itemAtualizado.produto = '';
          }
        }

        return itemAtualizado;
      }
      return item;
    }));
  };

  // Atualizar campo formatado de valor
  const atualizarItemValorFormatado = (itemId, campo, valorFormatado) => {
    const valorNumerico = parseValorInput(valorFormatado);
    setItens(prevItens => prevItens.map(item => {
      if (item.id === itemId) {
        const itemAtualizado = { ...item, [campo]: valorNumerico, [`${campo}Input`]: valorFormatado };
        
        // Calcular Preço Sugerido
        if (campo === 'custoUnitario') {
          const precoSugerido = valorNumerico > 0 ? valorNumerico * 2 : 0;
          itemAtualizado.precoSugerido = precoSugerido;
          itemAtualizado.precoSugeridoInput = formatarValorInput(precoSugerido);
        }

        // Calcular Lucro à vista
        if (campo === 'custoUnitario' || campo === 'precoVendaVista') {
          const custo = campo === 'custoUnitario' ? valorNumerico : itemAtualizado.custoUnitario;
          const precoVista = campo === 'precoVendaVista' ? valorNumerico : itemAtualizado.precoVendaVista;
          if (precoVista > 0 && custo > 0) {
            itemAtualizado.lucroVista = ((precoVista - custo) / custo) * 100;
          } else {
            itemAtualizado.lucroVista = 0;
          }
        }

        // Calcular Lucro 3x
        if (campo === 'custoUnitario' || campo === 'custo3x' || campo === 'precoVenda3x') {
          const custo = campo === 'custoUnitario' ? valorNumerico : itemAtualizado.custoUnitario;
          const custo3x = campo === 'custo3x' ? valorNumerico : itemAtualizado.custo3x;
          const preco3x = campo === 'precoVenda3x' ? valorNumerico : itemAtualizado.precoVenda3x;
          const custoTotal3x = custo + custo3x;
          if (preco3x > 0 && custoTotal3x > 0) {
            itemAtualizado.lucro3x = ((preco3x - custoTotal3x) / custoTotal3x) * 100;
          } else {
            itemAtualizado.lucro3x = 0;
          }
        }

        return itemAtualizado;
      }
      return item;
    }));
  };

  const resetForm = () => {
    setCabecalhoCompra({
      dataCompra: '',
      fornecedor: '',
      codigoFornecedor: '',
      formaPagamentoCompra: '',
      parcelas: 1,
    });
    setItens([]);
    setFornecedorInput('');
    setMostrarFornecedores(false);
    setCompraEditando(null);
    setMostrarFormulario(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (itens.length === 0) {
      alert('Adicione pelo menos um produto à compra');
      return;
    }

    const compraData = {
      ...cabecalhoCompra,
      fornecedor: fornecedorInput || cabecalhoCompra.fornecedor,
      dataCompra: cabecalhoCompra.dataCompra ? parseDataDoInput(cabecalhoCompra.dataCompra)?.toISOString() : null,
      itens: itens.map(item => ({
        tipo: item.tipo,
        cor: item.cor,
        tamanho: item.tamanho,
        codigoInterno: item.codigoInterno,
        produto: item.produto,
        custoUnitario: item.custoUnitario,
        precoSugerido: item.precoSugerido,
        precoVendaVista: item.precoVendaVista,
        precoVenda3x: item.precoVenda3x,
        lucroVista: item.lucroVista,
        lucro3x: item.lucro3x,
        custo3x: item.custo3x,
        devolvido: item.devolvido || false,
      })),
    };
    
    try {
      if (compraEditando) {
        await atualizarCompra(compraEditando.id, compraData);
      } else {
        await adicionarCompra(compraData);
      }
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar compra:', error);
      alert(`Erro ao salvar compra: ${error.message || 'Erro desconhecido'}. Verifique o console para mais detalhes.`);
    }
  };

  const handleEdit = (compra) => {
    setCompraEditando(compra);
    const dataCompraFormatada = compra.dataCompra ? formatarDataParaInput(compra.dataCompra) : '';
    
    setCabecalhoCompra({
      dataCompra: dataCompraFormatada,
      fornecedor: compra.fornecedor || '',
      codigoFornecedor: compra.codigoFornecedor || '',
      formaPagamentoCompra: compra.formaPagamentoCompra || '',
      parcelas: compra.parcelas || 1,
    });
    setFornecedorInput(compra.fornecedor || '');

    // Se a compra tem itens (nova estrutura), usar os itens
    // Se não tem (estrutura antiga), converter para novo formato
    if (compra.itens && Array.isArray(compra.itens)) {
      setItens(compra.itens.map((item, index) => ({
        id: item.id || `${Date.now()}_${index}`,
        ...item,
        codigoInterno: item.codigoInterno || '', // Preservar código existente
        custoUnitarioInput: formatarValorInput(item.custoUnitario || 0),
        precoSugeridoInput: formatarValorInput(item.precoSugerido || 0),
        precoVendaVistaInput: formatarValorInput(item.precoVendaVista || 0),
        precoVenda3xInput: formatarValorInput(item.precoVenda3x || 0),
        custo3xInput: formatarValorInput(item.custo3x || 0),
      })));
    } else {
      // Converter estrutura antiga para nova
      setItens([{
        id: Date.now().toString(),
        tipo: compra.tipo || '',
        cor: compra.cor || '',
        tamanho: compra.tamanho || '',
        codigoInterno: compra.codigoInterno || '',
        produto: compra.produto || '',
        custoUnitario: compra.custoUnitario || 0,
        precoSugerido: compra.precoSugerido || 0,
        precoVendaVista: compra.precoVendaVista || 0,
        precoVenda3x: compra.precoVenda3x || 0,
        lucroVista: compra.lucroVista || 0,
        lucro3x: compra.lucro3x || 0,
        custo3x: compra.custo3x || 0,
        devolvido: compra.devolvido || false,
        custoUnitarioInput: formatarValorInput(compra.custoUnitario || 0),
        precoSugeridoInput: formatarValorInput(compra.precoSugerido || 0),
        precoVendaVistaInput: formatarValorInput(compra.precoVendaVista || 0),
        precoVenda3xInput: formatarValorInput(compra.precoVenda3x || 0),
        custo3xInput: formatarValorInput(compra.custo3x || 0),
      }]);
    }
    
    setMostrarFormulario(true);
  };

  // Filtrar fornecedores baseado no input
  const fornecedoresFiltradosAutocomplete = fornecedores.filter((f) => {
    if (!fornecedorInput) return false;
    const busca = fornecedorInput.toLowerCase();
    return (
      (f.nomeFantasia && f.nomeFantasia.toLowerCase().includes(busca)) ||
      (f.razaoSocial && f.razaoSocial.toLowerCase().includes(busca)) ||
      (f.codigo && f.codigo.includes(busca))
    );
  });

  const selecionarFornecedor = (fornecedor) => {
    setCabecalhoCompra({ ...cabecalhoCompra, fornecedor: fornecedor.nomeFantasia, codigoFornecedor: fornecedor.codigo });
    setFornecedorInput(fornecedor.nomeFantasia);
    setMostrarFornecedores(false);
  };

  const handleCorrigirCodigos = async () => {
    if (!confirm('Tem certeza que deseja corrigir todos os códigos dos produtos? Esta ação reorganizará todos os códigos sequencialmente e não pode ser desfeita.')) {
      return;
    }

    setCorrigindoCodigos(true);
    try {
      const res = await fetch('/api/corrigir-codigos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Erro ao corrigir códigos');
      }

      const resultado = await res.json();
      alert(resultado.mensagem || `Códigos corrigidos com sucesso! ${resultado.totalCorrigidos} códigos foram atualizados.`);
      
      // Recarregar dados
      if (refreshData) {
        refreshData();
      }
    } catch (error) {
      console.error('Erro ao corrigir códigos:', error);
      alert(`Erro ao corrigir códigos: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setCorrigindoCodigos(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja remover esta compra?')) {
      try {
        await removerCompra(id);
      } catch (error) {
        console.error('Erro ao remover compra:', error);
        alert('Erro ao remover compra. Verifique o console para mais detalhes.');
      }
    }
  };

  const handleMarcarDevolvido = async (compra, itemId) => {
    try {
      const compraAtualizada = {
        ...compra,
        itens: compra.itens.map(item => 
          item.id === itemId || item.codigoInterno === itemId
            ? { ...item, devolvido: !item.devolvido }
            : item
        ),
      };
      await atualizarCompra(compra.id, compraAtualizada);
    } catch (error) {
      console.error('Erro ao marcar como devolvido:', error);
      alert('Erro ao atualizar status de devolução');
    }
  };

  // Converter compras antigas para exibição
  const comprasParaExibicao = compras.map(compra => {
    if (compra.itens && Array.isArray(compra.itens)) {
      return compra;
    } else {
      // Converter estrutura antiga
      return {
        ...compra,
        itens: [{
          id: compra.id + '_item',
          tipo: compra.tipo,
          cor: compra.cor,
          tamanho: compra.tamanho,
          codigoInterno: compra.codigoInterno,
          produto: compra.produto,
          custoUnitario: compra.custoUnitario,
          precoSugerido: compra.precoSugerido,
          precoVendaVista: compra.precoVendaVista,
          precoVenda3x: compra.precoVenda3x,
          lucroVista: compra.lucroVista,
          lucro3x: compra.lucro3x,
          custo3x: compra.custo3x,
          devolvido: compra.devolvido || false,
        }],
      };
    }
  });

  const comprasFiltradas = comprasParaExibicao.filter((c) => {
    const matchFiltro = 
      (c.codigoFornecedor && c.codigoFornecedor.toLowerCase().includes(filtro.toLowerCase())) ||
      (c.fornecedor && c.fornecedor.toLowerCase().includes(filtro.toLowerCase())) ||
      (c.itens && c.itens.some(item => 
        (item.codigoInterno && item.codigoInterno.toLowerCase().includes(filtro.toLowerCase())) ||
        (item.tipo && item.tipo.toLowerCase().includes(filtro.toLowerCase())) ||
        (item.produto && item.produto.toLowerCase().includes(filtro.toLowerCase()))
      ));
    return matchFiltro;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Compras
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie suas compras e fornecedores
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handleCorrigirCodigos}
              disabled={corrigindoCodigos}
            >
              {corrigindoCodigos ? '⏳ Corrigindo...' : '🔧 Corrigir Códigos'}
            </Button>
            <button 
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              className="px-4 py-2 text-white rounded-lg text-sm font-medium flex items-center gap-2"
              style={{ backgroundColor: '#174759' }}
            >
              + Nova Compra
            </button>
          </div>
        </div>

      {/* Formulário */}
      {mostrarFormulario && (
        <Card title={compraEditando ? 'Editar Compra' : 'Nova Compra'} className="mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cabeçalho da Compra */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados da Compra</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Compra *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={cabecalhoCompra.dataCompra}
                      onChange={(e) => {
                        const valorFormatado = formatarDataEmTempoReal(e.target.value);
                        setCabecalhoCompra({ ...cabecalhoCompra, dataCompra: valorFormatado });
                      }}
                      placeholder="dd/mm/aaaa"
                      maxLength={10}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent"
                    />
                    <input
                      type="date"
                      value={formatarDataParaISO(cabecalhoCompra.dataCompra)}
                      onChange={(e) => {
                        if (e.target.value) {
                          const dataBR = converterISOparaBR(e.target.value);
                          setCabecalhoCompra({ ...cabecalhoCompra, dataCompra: dataBR });
                        }
                      }}
                      className="absolute right-0 top-0 h-full w-10 opacity-0 cursor-pointer"
                      title="Abrir calendário"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">📅</span>
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fornecedor *
                  </label>
                  <input
                    type="text"
                    required
                    value={fornecedorInput}
                    onChange={(e) => {
                      setFornecedorInput(e.target.value);
                      setCabecalhoCompra({ ...cabecalhoCompra, fornecedor: e.target.value });
                      setMostrarFornecedores(true);
                    }}
                    onFocus={() => {
                      if (fornecedorInput) {
                        setMostrarFornecedores(true);
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => setMostrarFornecedores(false), 200);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent"
                    placeholder="Digite o nome do fornecedor..."
                  />
                  {mostrarFornecedores && fornecedorInput && fornecedoresFiltradosAutocomplete.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {fornecedoresFiltradosAutocomplete.map((fornecedor) => (
                        <div
                          key={fornecedor.id}
                          onClick={() => selecionarFornecedor(fornecedor)}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{fornecedor.nomeFantasia}</div>
                          <div className="text-sm text-gray-500">Código: {fornecedor.codigo}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código Fornecedor *
                  </label>
                  <input
                    type="text"
                    required
                    value={cabecalhoCompra.codigoFornecedor}
                    onChange={(e) => setCabecalhoCompra({ ...cabecalhoCompra, codigoFornecedor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Pagamento da Compra */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pagamento da Compra</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Forma de Pagamento *
                  </label>
                  <select
                    required
                    value={cabecalhoCompra.formaPagamentoCompra}
                    onChange={(e) => setCabecalhoCompra({ ...cabecalhoCompra, formaPagamentoCompra: e.target.value, parcelas: e.target.value === 'Pix' || e.target.value === 'Dinheiro' ? 1 : cabecalhoCompra.parcelas })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent bg-white"
                  >
                    <option value="">Selecione a forma de pagamento</option>
                    <option value="Pix">Pix</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Cartão Crédito">Cartão Crédito</option>
                    <option value="Boleto">Boleto</option>
                  </select>
                </div>
                {cabecalhoCompra.formaPagamentoCompra === 'Cartão Crédito' || cabecalhoCompra.formaPagamentoCompra === 'Boleto' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Parcelas *
                    </label>
                    <select
                      required
                      value={cabecalhoCompra.parcelas}
                      onChange={(e) => setCabecalhoCompra({ ...cabecalhoCompra, parcelas: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent bg-white"
                    >
                      <option value="1">1x</option>
                      <option value="2">2x</option>
                      <option value="3">3x</option>
                      <option value="4">4x</option>
                      <option value="5">5x</option>
                      <option value="6">6x</option>
                    </select>
                  </div>
                ) : null}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {cabecalhoCompra.formaPagamentoCompra && (cabecalhoCompra.formaPagamentoCompra === 'Pix' || cabecalhoCompra.formaPagamentoCompra === 'Dinheiro') 
                  ? 'Pagamento à vista será lançado diretamente no caixa.'
                  : cabecalhoCompra.formaPagamentoCompra 
                    ? `A compra será parcelada em ${cabecalhoCompra.parcelas}x e criará ${cabecalhoCompra.parcelas} lançamento(s) em Contas a Pagar.`
                    : 'Selecione a forma de pagamento para definir como será lançado.'}
              </p>
            </div>

            {/* Lista de Itens */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Produtos</h3>
              </div>

              {itens.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-4">
                    Nenhum produto adicionado. Clique em "Adicionar Produto" para começar.
                  </p>
                  <Button type="button" variant="secondary" onClick={adicionarItem}>
                    + Adicionar Produto
                  </Button>
                </div>
              )}

              {itens.map((item, index) => (
                <div key={item.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-semibold text-gray-700">Produto {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removerItem(item.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remover
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                      <select
                        required
                        value={item.tipo}
                        onChange={(e) => atualizarItem(item.id, 'tipo', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent bg-white"
                      >
                        <option value="">Selecione</option>
                        <option value="Camiseta">Camiseta</option>
                        <option value="CJT Leg + Top">CJT Leg + Top</option>
                        <option value="CJT Sht + Top">CJT Sht + Top</option>
                        <option value="Macaquinho">Macaquinho</option>
                        <option value="Regata">Regata</option>
                        <option value="Leg">Leg</option>
                        <option value="Top">Top</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cor *</label>
                      <div className="flex gap-2">
                        <select
                          required
                          value={item.cor}
                          onChange={(e) => {
                            if (e.target.value === '__nova__') {
                              setMostrarAdicionarCor({ ...mostrarAdicionarCor, [item.id]: true });
                              setNovaCor({ ...novaCor, [item.id]: '' });
                            } else {
                              atualizarItem(item.id, 'cor', e.target.value);
                              setMostrarAdicionarCor({ ...mostrarAdicionarCor, [item.id]: false });
                            }
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent bg-white"
                        >
                          <option value="">Selecione</option>
                          {cores.map((cor) => (
                            <option key={cor} value={cor}>
                              {cor}
                            </option>
                          ))}
                          <option value="__nova__">+ Adicionar Nova Cor</option>
                        </select>
                        {mostrarAdicionarCor[item.id] && (
                          <div className="flex gap-2 flex-1">
                            <input
                              type="text"
                              value={novaCor[item.id] || ''}
                              onChange={(e) => setNovaCor({ ...novaCor, [item.id]: e.target.value })}
                              placeholder="Nome da cor"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && novaCor[item.id]) {
                                  e.preventDefault();
                                  adicionarNovaCor(novaCor[item.id], item.id);
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => adicionarNovaCor(novaCor[item.id], item.id)}
                              disabled={!novaCor[item.id]}
                              className="px-3 py-2 bg-[#174759] text-white rounded-lg hover:bg-[#0f2f3d] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              ✓
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setMostrarAdicionarCor({ ...mostrarAdicionarCor, [item.id]: false });
                                setNovaCor({ ...novaCor, [item.id]: '' });
                              }}
                              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tamanho *</label>
                      <select
                        required
                        value={item.tamanho}
                        onChange={(e) => atualizarItem(item.id, 'tamanho', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent bg-white"
                      >
                        <option value="">Selecione</option>
                        <option value="P">P</option>
                        <option value="M">M</option>
                        <option value="G">G</option>
                        <option value="GG">GG</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Código Interno</label>
                      <input
                        type="text"
                        value={item.codigoInterno}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Produto</label>
                      <input
                        type="text"
                        value={item.produto}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Custo Unitário *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                        <input
                          type="text"
                          required
                          value={item.custoUnitarioInput}
                          onChange={(e) => {
                            const valorFormatado = formatarValorEmTempoReal(e.target.value);
                            atualizarItemValorFormatado(item.id, 'custoUnitario', valorFormatado);
                          }}
                          placeholder="0,00"
                          className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preço Sugerido</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                        <input
                          type="text"
                          value={item.precoSugeridoInput}
                          readOnly
                          className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preço Venda à Vista *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                        <input
                          type="text"
                          required
                          value={item.precoVendaVistaInput}
                          onChange={(e) => {
                            const valorFormatado = formatarValorEmTempoReal(e.target.value);
                            atualizarItemValorFormatado(item.id, 'precoVendaVista', valorFormatado);
                          }}
                          placeholder="0,00"
                          className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preço Venda 3x *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                        <input
                          type="text"
                          required
                          value={item.precoVenda3xInput}
                          onChange={(e) => {
                            const valorFormatado = formatarValorEmTempoReal(e.target.value);
                            atualizarItemValorFormatado(item.id, 'precoVenda3x', valorFormatado);
                          }}
                          placeholder="0,00"
                          className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Parcelamento</label>
                      <input
                        type="text"
                        value={item.precoVenda3x > 0 ? `3 x ${formatarMoeda(item.precoVenda3x / 3)}` : '3 x R$ 0,00'}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Custo 3x *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                        <input
                          type="text"
                          required
                          value={item.custo3xInput}
                          onChange={(e) => {
                            const valorFormatado = formatarValorEmTempoReal(e.target.value);
                            atualizarItemValorFormatado(item.id, 'custo3x', valorFormatado);
                          }}
                          placeholder="0,00"
                          className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lucro à Vista</label>
                      <input
                        type="text"
                        value={item.lucroVista > 0 ? `${item.lucroVista.toFixed(2)}%` : '0%'}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lucro 3x</label>
                      <input
                        type="text"
                        value={item.lucro3x > 0 ? `${item.lucro3x.toFixed(2)}%` : '0%'}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {itens.length > 0 && (
                <div className="flex justify-center pt-2">
                  <Button type="button" variant="secondary" onClick={adicionarItem}>
                    + Adicionar Produto
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="submit" variant="primary">
                {compraEditando ? '💾 Salvar Alterações' : '➕ Adicionar Compra'}
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
              placeholder="🔍 Pesquisar por código, tipo, produto ou fornecedor..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Lista de Compras */}
      <Card>
        {comprasFiltradas.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            Nenhuma compra encontrada
          </p>
        ) : (
          <div className="space-y-6">
            {comprasFiltradas.map((compra) => {
              const dataFormatada = compra.dataCompra ? formatarDataParaInput(compra.dataCompra) : '-';
              return (
                <div key={compra.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Cabeçalho da Compra */}
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-6">
                        <div>
                          <span className="text-xs text-gray-500">Data:</span>
                          <span className="ml-2 font-medium text-gray-900">{dataFormatada}</span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Fornecedor:</span>
                          <span className="ml-2 font-medium text-gray-900">{compra.fornecedor || '-'}</span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Forma de Pagamento:</span>
                          <span className="ml-2 font-medium text-gray-900">{compra.formaPagamento || '-'}</span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Código Fornecedor:</span>
                          <span className="ml-2 font-medium text-gray-900">{compra.codigoFornecedor || '-'}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(compra)}
                          className="p-2 text-gray-400 hover:text-[#174759] transition-colors"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(compra.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Excluir"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Itens da Compra */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Código Interno</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Tipo</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Produto</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Cor</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Tamanho</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Custo Unit.</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Preço Vista</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Preço 3x</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Parcelamento</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Lucro Vista</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Lucro 3x</th>
                          <th className="text-center text-xs font-semibold text-gray-500 uppercase pb-3 px-4">Devolvido</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {compra.itens && compra.itens.map((item, itemIndex) => (
                          <tr key={item.id || itemIndex} className={`hover:bg-gray-50 ${item.devolvido ? 'opacity-60 bg-red-50' : ''}`}>
                            <td className="py-4 px-4 text-sm font-medium text-gray-900">{item.codigoInterno || '-'}</td>
                            <td className="py-4 px-4 text-sm text-gray-600">{item.tipo || '-'}</td>
                            <td className="py-4 px-4 text-sm text-gray-600">{item.produto || '-'}</td>
                            <td className="py-4 px-4 text-sm text-gray-600">{item.cor || '-'}</td>
                            <td className="py-4 px-4 text-sm text-gray-600">{item.tamanho || '-'}</td>
                            <td className="py-4 px-4 text-sm text-gray-600">{formatarMoeda(item.custoUnitario || 0)}</td>
                            <td className="py-4 px-4 text-sm font-semibold text-gray-900">{formatarMoeda(item.precoVendaVista || 0)}</td>
                            <td className="py-4 px-4 text-sm font-semibold text-gray-900">{formatarMoeda(item.precoVenda3x || 0)}</td>
                            <td className="py-4 px-4 text-sm font-medium text-gray-700">
                              {item.precoVenda3x > 0 ? `3 x ${formatarMoeda((item.precoVenda3x || 0) / 3)}` : '3 x R$ 0,00'}
                            </td>
                            <td className="py-4 px-4 text-sm text-green-600 font-semibold">
                              {item.lucroVista > 0 ? `${item.lucroVista.toFixed(2)}%` : '0%'}
                            </td>
                            <td className="py-4 px-4 text-sm text-green-600 font-semibold">
                              {item.lucro3x > 0 ? `${item.lucro3x.toFixed(2)}%` : '0%'}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <button
                                onClick={() => handleMarcarDevolvido(compra, item.id || item.codigoInterno)}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                  item.devolvido
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                                title={item.devolvido ? 'Marcar como não devolvido' : 'Marcar como devolvido'}
                              >
                                {item.devolvido ? '✓ Devolvido' : 'Marcar Devolvido'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
    </div>
  );
}

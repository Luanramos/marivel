import { lerDados, salvarDados } from '@/lib/data';

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

// Função para extrair tipo e tamanho de um código existente
const extrairTipoETamanho = (codigoInterno) => {
  if (!codigoInterno) return { tipo: null, tamanho: null };
  
  // Tentar extrair a abreviação (3 letras no início)
  const matchAbrev = codigoInterno.match(/^([A-Z]{3})/);
  const tamanho = codigoInterno.slice(-1); // Último caractere é o tamanho
  
  if (matchAbrev) {
    const abreviacao = matchAbrev[1];
    // Encontrar o tipo correspondente à abreviação
    const tipo = Object.keys(tipoAbreviacoes).find(
      key => tipoAbreviacoes[key] === abreviacao
    );
    return { tipo, tamanho };
  }
  
  return { tipo: null, tamanho };
};

export async function POST(request) {
  try {
    const dados = lerDados();
    
    // Usar um Map para evitar duplicação de códigos
    // Chave: código atual, Valor: objeto com informações do item
    const codigosUnicos = new Map();
    
    // 1. Coletar produtos do estoque (prioridade, pois são a fonte mais confiável)
    if (dados.produtos && dados.produtos.length > 0) {
      dados.produtos.forEach(produto => {
        if (produto.codigo) {
          // Tentar extrair tipo e tamanho do código se não estiverem no produto
          let tipoProduto = produto.tipo;
          let tamanho = produto.tamanho;
          
          if (!tipoProduto || !tamanho) {
            const tipoExtraido = extrairTipoETamanho(produto.codigo);
            if (tipoExtraido.tipo) tipoProduto = tipoProduto || tipoExtraido.tipo;
            if (tipoExtraido.tamanho) tamanho = tamanho || tipoExtraido.tamanho;
          }
          
          if (tipoProduto && tamanho) {
            // Usar a data do produto
            const dataCadastro = produto.dataCadastro || new Date(0).toISOString();
            
            codigosUnicos.set(produto.codigo, {
              codigoAtual: produto.codigo,
              tipoProduto: tipoProduto,
              tamanho: tamanho,
              dataCadastro: dataCadastro,
            });
          }
        }
      });
    }
    
    // 2. Coletar itens de compras (para pegar a data de cadastro mais antiga se o código não estiver no estoque)
    if (dados.compras && dados.compras.length > 0) {
      dados.compras.forEach(compra => {
        if (compra.itens && Array.isArray(compra.itens)) {
          compra.itens.forEach((item) => {
            if (item.codigoInterno) {
              // Tentar extrair tipo e tamanho do código se não estiverem no item
              let tipoProduto = item.tipo;
              let tamanho = item.tamanho;
              
              if (!tipoProduto || !tamanho) {
                const tipoExtraido = extrairTipoETamanho(item.codigoInterno);
                if (tipoExtraido.tipo) tipoProduto = tipoProduto || tipoExtraido.tipo;
                if (tipoExtraido.tamanho) tamanho = tamanho || tipoExtraido.tamanho;
              }
              
              if (tipoProduto && tamanho) {
                const dataCompra = compra.dataCadastro || new Date(0).toISOString();
                
                // Se já existe, atualizar apenas se a data for mais antiga
                if (codigosUnicos.has(item.codigoInterno)) {
                  const existente = codigosUnicos.get(item.codigoInterno);
                  const dataExistente = new Date(existente.dataCadastro);
                  const dataNova = new Date(dataCompra);
                  if (dataNova < dataExistente) {
                    existente.dataCadastro = dataNova.toISOString();
                  }
                } else {
                  // Se não existe, adicionar
                  codigosUnicos.set(item.codigoInterno, {
                    codigoAtual: item.codigoInterno,
                    tipoProduto: tipoProduto,
                    tamanho: tamanho,
                    dataCadastro: dataCompra,
                  });
                }
              }
            }
          });
        } else if (compra.codigoInterno) {
          // Estrutura antiga
          let tipoProduto = compra.tipo;
          let tamanho = compra.tamanho;
          
          if (!tipoProduto || !tamanho) {
            const tipoExtraido = extrairTipoETamanho(compra.codigoInterno);
            if (tipoExtraido.tipo) tipoProduto = tipoProduto || tipoExtraido.tipo;
            if (tipoExtraido.tamanho) tamanho = tamanho || tipoExtraido.tamanho;
          }
          
          if (tipoProduto && tamanho) {
            const dataCompra = compra.dataCadastro || new Date(0).toISOString();
            
            if (codigosUnicos.has(compra.codigoInterno)) {
              const existente = codigosUnicos.get(compra.codigoInterno);
              const dataExistente = new Date(existente.dataCadastro);
              const dataNova = new Date(dataCompra);
              if (dataNova < dataExistente) {
                existente.dataCadastro = dataNova.toISOString();
              }
            } else {
              codigosUnicos.set(compra.codigoInterno, {
                codigoAtual: compra.codigoInterno,
                tipoProduto: tipoProduto,
                tamanho: tamanho,
                dataCadastro: dataCompra,
              });
            }
          }
        }
      });
    }
    
    // Converter Map para Array
    const itensParaCorrigir = Array.from(codigosUnicos.values());
    
    // Ordenar por data de cadastro (mais antigo primeiro)
    // Se a data for igual, ordenar por código atual para manter consistência
    itensParaCorrigir.sort((a, b) => {
      const dataA = new Date(a.dataCadastro);
      const dataB = new Date(b.dataCadastro);
      if (dataA.getTime() === dataB.getTime()) {
        // Se as datas forem iguais, ordenar por código atual
        return (a.codigoAtual || '').localeCompare(b.codigoAtual || '');
      }
      return dataA - dataB;
    });
    
    // Criar mapa de códigos antigos para novos
    const mapaCodigos = new Map();
    let proximoNumero = 1;
    
    // Gerar novos códigos sequenciais GLOBALMENTE
    // A numeração é única e sequencial, independente do tipo
    itensParaCorrigir.forEach(item => {
      // Verificar se o tipo existe no mapeamento
      if (!item.tipoProduto || !tipoAbreviacoes[item.tipoProduto]) {
        console.warn(`Tipo não encontrado para item: ${item.codigoAtual}, tipo: ${item.tipoProduto}`);
        // Tentar extrair do código atual
        const tipoExtraido = extrairTipoETamanho(item.codigoAtual);
        if (tipoExtraido.tipo && tipoAbreviacoes[tipoExtraido.tipo]) {
          item.tipoProduto = tipoExtraido.tipo;
        }
      }
      
      // Verificar se o tamanho existe
      if (!item.tamanho) {
        const tipoExtraido = extrairTipoETamanho(item.codigoAtual);
        if (tipoExtraido.tamanho) {
          item.tamanho = tipoExtraido.tamanho;
        }
      }
      
      // Só gerar código se tiver tipo e tamanho válidos
      if (item.tipoProduto && tipoAbreviacoes[item.tipoProduto] && item.tamanho) {
        const abreviacao = tipoAbreviacoes[item.tipoProduto];
        const novoCodigo = `${abreviacao}${String(proximoNumero).padStart(5, '0')}${item.tamanho}`;
        
        mapaCodigos.set(item.codigoAtual, novoCodigo);
        proximoNumero++;
      } else {
        console.warn(`Item ignorado por falta de tipo/tamanho: ${item.codigoAtual}, tipo: ${item.tipoProduto}, tamanho: ${item.tamanho}`);
      }
    });
    
    // Atualizar produtos
    if (dados.produtos && dados.produtos.length > 0) {
      dados.produtos.forEach(produto => {
        if (produto.codigo && mapaCodigos.has(produto.codigo)) {
          produto.codigo = mapaCodigos.get(produto.codigo);
          produto.ultimaAtualizacao = new Date().toISOString();
        }
      });
    }
    
    // Atualizar compras
    if (dados.compras && dados.compras.length > 0) {
      dados.compras.forEach(compra => {
        if (compra.itens && Array.isArray(compra.itens)) {
          compra.itens.forEach(item => {
            if (item.codigoInterno && mapaCodigos.has(item.codigoInterno)) {
              item.codigoInterno = mapaCodigos.get(item.codigoInterno);
            }
          });
          compra.ultimaAtualizacao = new Date().toISOString();
        } else if (compra.codigoInterno && mapaCodigos.has(compra.codigoInterno)) {
          // Estrutura antiga
          compra.codigoInterno = mapaCodigos.get(compra.codigoInterno);
          compra.ultimaAtualizacao = new Date().toISOString();
        }
      });
    }
    
    // Atualizar condicionais
    if (dados.condicionais && dados.condicionais.length > 0) {
      dados.condicionais.forEach(condicional => {
        if (condicional.itens && Array.isArray(condicional.itens)) {
          condicional.itens.forEach(item => {
            if (item.codigoInterno && mapaCodigos.has(item.codigoInterno)) {
              item.codigoInterno = mapaCodigos.get(item.codigoInterno);
            }
          });
        } else if (condicional.codigoInterno && mapaCodigos.has(condicional.codigoInterno)) {
          condicional.codigoInterno = mapaCodigos.get(condicional.codigoInterno);
        }
        condicional.ultimaAtualizacao = new Date().toISOString();
      });
    }
    
    // Atualizar vendas
    if (dados.vendas && dados.vendas.length > 0) {
      dados.vendas.forEach(venda => {
        if (venda.itens && Array.isArray(venda.itens)) {
          venda.itens.forEach(item => {
            if (item.codigo && mapaCodigos.has(item.codigo)) {
              item.codigo = mapaCodigos.get(item.codigo);
            }
          });
          venda.ultimaAtualizacao = new Date().toISOString();
        }
      });
    }
    
    // Salvar dados
    salvarDados(dados);
    
    return Response.json({
      success: true,
      totalCorrigidos: mapaCodigos.size,
      mensagem: `${mapaCodigos.size} códigos foram corrigidos com sucesso!`,
    });
  } catch (error) {
    console.error('Erro ao corrigir códigos:', error);
    return Response.json(
      { error: 'Erro ao corrigir códigos', message: error.message },
      { status: 500 }
    );
  }
}

import { lerDados, salvarDados } from '@/lib/data';

// Função para gerar código sequencial
function gerarCodigoCondicional(condicionais) {
  if (!condicionais || condicionais.length === 0) {
    return '1';
  }
  
  // Encontra o maior código numérico
  const codigosNumericos = condicionais
    .map(c => {
      const codigo = c.codigoCond || '0';
      const num = parseInt(codigo, 10);
      return isNaN(num) ? 0 : num;
    })
    .filter(num => num > 0);
  
  if (codigosNumericos.length === 0) {
    return '1';
  }
  
  const maiorCodigo = Math.max(...codigosNumericos);
  return String(maiorCodigo + 1);
}

export async function GET() {
  try {
    const dados = lerDados();
    return Response.json(dados.condicionais || []);
  } catch (error) {
    console.error('Erro ao buscar condicionais:', error);
    return Response.json({ error: 'Erro ao buscar condicionais' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const condicional = await request.json();
    const dados = lerDados();

    if (!dados.condicionais) {
      dados.condicionais = [];
    }

    const novoCondicional = {
      ...condicional,
      codigoCond: gerarCodigoCondicional(dados.condicionais),
      id: Date.now().toString(),
      dataCadastro: new Date().toISOString(),
      ultimaAtualizacao: new Date().toISOString(),
    };

    dados.condicionais.push(novoCondicional);

    // Atualizar campo condicional no estoque
    if (!dados.produtos) {
      dados.produtos = [];
    }

    // Atualizar campo condicional dos produtos baseado no status de cada item
    const itens = novoCondicional.itens && Array.isArray(novoCondicional.itens) 
      ? novoCondicional.itens 
      : novoCondicional.codigoInterno 
        ? [{ 
            codigoInterno: novoCondicional.codigoInterno,
            status: novoCondicional.status || 'Com Cliente' // Compatibilidade com estrutura antiga
          }]
        : [];

    itens.forEach(item => {
      if (item.codigoInterno && item.status === 'Com Cliente') {
        const produtoIndex = dados.produtos.findIndex(
          p => p.codigo && p.codigo.toLowerCase() === item.codigoInterno.toLowerCase()
        );

        if (produtoIndex >= 0) {
          const produto = dados.produtos[produtoIndex];
          dados.produtos[produtoIndex] = {
            ...produto,
            condicional: 1, // Marcar como tendo condicional
            ultimaAtualizacao: new Date().toISOString(),
          };
        }
      }
    });

    salvarDados(dados);

    return Response.json(novoCondicional, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar condicional:', error);
    return Response.json({ error: 'Erro ao criar condicional' }, { status: 500 });
  }
}


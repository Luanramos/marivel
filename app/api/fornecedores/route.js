import { lerDados, salvarDados } from '@/lib/data';

// Função para gerar código sequencial
function gerarCodigoFornecedor(fornecedores) {
  if (!fornecedores || fornecedores.length === 0) {
    return '1';
  }
  
  // Encontra o maior código numérico
  const codigosNumericos = fornecedores
    .map(f => {
      const codigo = f.codigo || '0';
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
    return Response.json(dados.fornecedores || []);
  } catch (error) {
    console.error('Erro ao buscar fornecedores:', error);
    return Response.json({ error: 'Erro ao buscar fornecedores' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const fornecedor = await request.json();
    const dados = lerDados();

    if (!dados.fornecedores) {
      dados.fornecedores = [];
    }

    const novoFornecedor = {
      ...fornecedor,
      codigo: gerarCodigoFornecedor(dados.fornecedores),
      id: Date.now().toString(),
      dataCadastro: new Date().toISOString(),
      ultimaAtualizacao: new Date().toISOString(),
    };

    dados.fornecedores.push(novoFornecedor);
    salvarDados(dados);

    return Response.json(novoFornecedor, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar fornecedor:', error);
    return Response.json({ error: 'Erro ao criar fornecedor' }, { status: 500 });
  }
}


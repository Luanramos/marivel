import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'estoque.json');

export function lerDados() {
  try {
    // Criar diretório se não existir
    const dataDir = path.dirname(dataFilePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Criar arquivo se não existir
    if (!fs.existsSync(dataFilePath)) {
      const dadosIniciais = {
        produtos: [],
        movimentacoes: [],
        compras: [],
        fornecedores: [],
        condicionais: [],
        clientes: [],
        cores: [
          'Azul Cand',
          'Branco',
          'Cinza',
          'Esmeralda',
          'Lilás',
          'Marinho',
          'Menta',
          'Militar',
          'Petroleo',
          'Preto',
          'Pink',
          'Rosa Cand',
          'Terracota'
        ]
      };
      fs.writeFileSync(dataFilePath, JSON.stringify(dadosIniciais, null, 2));
      return dadosIniciais;
    }

    const fileContents = fs.readFileSync(dataFilePath, 'utf8');
    const dados = JSON.parse(fileContents);
    // Garantir que compras, fornecedores, condicionais, clientes e cores existem no objeto
    if (!dados.compras) {
      dados.compras = [];
    }
    if (!dados.fornecedores) {
      dados.fornecedores = [];
    }
    if (!dados.condicionais) {
      dados.condicionais = [];
    }
    if (!dados.clientes) {
      dados.clientes = [];
    }
    if (!dados.cores) {
      dados.cores = [
        'Azul Cand',
        'Branco',
        'Cinza',
        'Esmeralda',
        'Lilás',
        'Marinho',
        'Menta',
        'Militar',
        'Petroleo',
        'Preto',
        'Pink',
        'Rosa Cand',
        'Terracota'
      ];
    }
    return dados;
  } catch (error) {
    console.error('Erro ao ler dados:', error);
    return { produtos: [], movimentacoes: [], compras: [], fornecedores: [], condicionais: [] };
  }
}

export function salvarDados(dados) {
  try {
    const dataDir = path.dirname(dataFilePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(dataFilePath, JSON.stringify(dados, null, 2));
    return true;
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
    throw error;
  }
}


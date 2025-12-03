// Formatar valores monetários para Real Brasileiro
export function formatarMoeda(valor) {
  if (valor === null || valor === undefined || valor === '') return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

// Formatar valor para input monetário (mostra formatado com separadores de milhares)
export function formatarValorInput(valor) {
  if (valor === null || valor === undefined || valor === 0 || valor === '') return '';
  // Formata com separadores de milhares e 2 casas decimais (formato brasileiro)
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true, // Ativa separadores de milhares
  }).format(valor);
}

// Converter valor formatado de volta para número
export function parseValorInput(valorFormatado) {
  if (!valorFormatado || valorFormatado === '') return 0;
  // Remove tudo que não é número, vírgula ou ponto
  let valorLimpo = valorFormatado.replace(/[^\d,.-]/g, '');
  
  // Se tem vírgula, é formato brasileiro (1.234,56)
  if (valorLimpo.includes(',')) {
    // Remove pontos (milhares) e substitui vírgula por ponto (decimal)
    valorLimpo = valorLimpo.replace(/\./g, '').replace(',', '.');
  } else if (valorLimpo.includes('.')) {
    // Se só tem ponto e tem mais de 3 caracteres, pode ser formato de milhares
    const partes = valorLimpo.split('.');
    if (partes.length > 2) {
      // Múltiplos pontos = formato de milhares, remover todos
      valorLimpo = valorLimpo.replace(/\./g, '');
    }
  }
  
  const valor = parseFloat(valorLimpo);
  return isNaN(valor) ? 0 : valor;
}

// Formatar valor em tempo real enquanto digita (com separadores de milhares)
export function formatarValorEmTempoReal(valorDigitado) {
  if (!valorDigitado || valorDigitado === '') return '';
  
  // Remove tudo exceto números, vírgula e ponto
  let valorLimpo = valorDigitado.replace(/[^\d,.-]/g, '');
  
  if (valorLimpo === '') return '';
  
  // Se já está formatado, converte para número primeiro
  const valorNumerico = parseValorInput(valorLimpo);
  
  // Formata com separadores de milhares
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(valorNumerico);
}

// Gerar código aleatório para produto (formato: #ABC123)
export function gerarCodigoProduto() {
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numeros = '0123456789';
  
  // 3 letras aleatórias
  const letrasAleatorias = Array.from({ length: 3 }, () => 
    letras[Math.floor(Math.random() * letras.length)]
  ).join('');
  
  // 3 números aleatórios
  const numerosAleatorios = Array.from({ length: 3 }, () => 
    numeros[Math.floor(Math.random() * numeros.length)]
  ).join('');
  
  return `#${letrasAleatorias}${numerosAleatorios}`;
}

export function getBaseUrl() {
  if (typeof window === 'undefined') {
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      return process.env.NEXT_PUBLIC_SITE_URL;
    }
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    return null;
  }
  
  return window.location.origin;
}

export function getAbsoluteUrl(path = '') {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return cleanPath;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

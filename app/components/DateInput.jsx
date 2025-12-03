'use client';

// Formatar data para input (dd/mm/aaaa)
export const formatarDataParaInput = (data) => {
  if (!data) return '';
  const date = data instanceof Date ? data : new Date(data);
  if (isNaN(date.getTime())) return '';
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const ano = date.getFullYear();
  return `${dia}/${mes}/${ano}`;
};

// Converter data do input (dd/mm/aaaa) para Date
export const parseDataDoInput = (dataStr) => {
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
export const formatarDataEmTempoReal = (valor) => {
  const numeros = valor.replace(/\D/g, '');
  if (numeros.length === 0) return '';
  if (numeros.length <= 2) return numeros;
  if (numeros.length <= 4) return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
  return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4, 8)}`;
};

// Converter data para formato ISO (aaaa-mm-dd) para input type="date"
export const formatarDataParaISO = (data) => {
  if (!data) return '';
  // Se já está no formato ISO, retornar
  if (data.match(/^\d{4}-\d{2}-\d{2}$/)) return data;
  
  // Tentar converter de Date
  const date = data instanceof Date ? data : new Date(data);
  if (!isNaN(date.getTime())) {
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = date.getFullYear();
    return `${ano}-${mes}-${dia}`;
  }
  
  // Tentar converter de dd/mm/aaaa
  const partes = data.split('/');
  if (partes.length === 3) {
    const dia = partes[0];
    const mes = partes[1];
    const ano = partes[2];
    if (ano && mes && dia && ano.length === 4) {
      return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    }
  }
  return '';
};

// Converter de ISO (aaaa-mm-dd) para dd/mm/aaaa
export const converterISOparaBR = (isoStr) => {
  if (!isoStr) return '';
  const partes = isoStr.split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return isoStr;
};

export default function DateInput({ value, onChange, required = false, placeholder = "dd/mm/aaaa", className = "" }) {
  return (
    <div className="relative">
      <input
        type="text"
        required={required}
        value={value}
        onChange={(e) => {
          const valorFormatado = formatarDataEmTempoReal(e.target.value);
          onChange(valorFormatado);
        }}
        placeholder={placeholder}
        maxLength={10}
        className={`w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174759] focus:border-transparent ${className}`}
      />
      <input
        type="date"
        value={formatarDataParaISO(value)}
        onChange={(e) => {
          if (e.target.value) {
            const dataBR = converterISOparaBR(e.target.value);
            onChange(dataBR);
          }
        }}
        className="absolute right-0 top-0 h-full w-10 opacity-0 cursor-pointer z-10"
        title="Abrir calendário"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-0">📅</span>
    </div>
  );
}


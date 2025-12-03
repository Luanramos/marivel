export default function StatusBadge({ status }) {
  const statusConfig = {
    'Ativo': {
      bg: 'bg-green-100',
      text: 'text-green-800',
      label: 'Ativo'
    },
    'Baixo': {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      label: 'Baixo'
    },
    'Crítico': {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      label: 'Crítico'
    },
    'Esgotado': {
      bg: 'bg-red-100',
      text: 'text-red-800',
      label: 'Esgotado'
    }
  };

  const config = statusConfig[status];

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}


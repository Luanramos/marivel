export default function Button({
  variant = 'primary',
  children,
  className = '',
  ...props
}) {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'text-white focus:ring-offset-2',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  };
  
  const primaryStyle = variant === 'primary' ? {
    backgroundColor: '#174759',
    '--hover-bg': '#0f2f3d',
  } : {};
  
  const primaryClassName = variant === 'primary' 
    ? 'hover:bg-[#0f2f3d] focus:ring-[#174759]' 
    : '';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${variant === 'primary' ? primaryClassName : ''} ${className}`}
      style={primaryStyle}
      {...props}
    >
      {children}
    </button>
  );
}


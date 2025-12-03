export default function Card({ title, children, className = '', icon }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}


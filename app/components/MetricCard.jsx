export default function MetricCard({ title, value, icon, trend, color }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
  };

  const iconBgClasses = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    red: 'bg-red-100',
    purple: 'bg-purple-100',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl shadow-lg p-6 text-white relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 ${iconBgClasses[color]} rounded-lg flex items-center justify-center text-2xl`}>
            {icon}
          </div>
          {trend && (
            <div className={`text-sm font-semibold ${trend.isPositive ? 'text-green-200' : 'text-red-200'}`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </div>
          )}
        </div>
        <p className="text-sm opacity-90 mb-1">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
    </div>
  );
}


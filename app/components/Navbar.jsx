'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/produtos', label: 'Estoque', icon: '📦' },
    { href: '/compras', label: 'Compras', icon: '🛒' },
    { href: '/vendas', label: 'Vendas', icon: '💰' },
    { href: '/condicionais', label: 'Condicionais', icon: '📋' },
    { href: '/fornecedores', label: 'Fornecedores', icon: '🏢' },
    { href: '/clientes', label: 'Clientes', icon: '👥' },
    { href: '/investimentos', label: 'Investimentos', icon: '💵' },
    { href: '/caixa', label: 'Caixa', icon: '💵' },
    { href: '/contas-a-receber', label: 'Contas a Receber', icon: '📋' },
    { href: '/contas-a-pagar', label: 'Contas a Pagar', icon: '📋' },
    { href: '/relatorios', label: 'Relatórios', icon: '📈' },
  ];

  // Dividir os itens em duas linhas
  const primeiraLinha = navItems.slice(0, Math.ceil(navItems.length / 2));
  const segundaLinha = navItems.slice(Math.ceil(navItems.length / 2));

  return (
    <nav style={{ background: 'linear-gradient(to right, #174759, #71f1ce)' }} className="shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col">
          {/* Primeira linha: Logo e primeira metade dos itens */}
          <div className="flex justify-between items-center h-16">
            <div className="flex">
              <Link href="/" className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
                    <span className="text-2xl">📦</span>
                  </div>
                  <span className="text-2xl font-bold text-white">
                    MAV FitWear
                  </span>
                </div>
              </Link>
            </div>
            <div className="flex space-x-2">
              {primeiraLinha.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-white shadow-md'
                        : 'text-white hover:bg-white hover:bg-opacity-20'
                    }`}
                    style={isActive ? { color: '#174759' } : {}}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          {/* Segunda linha: Segunda metade dos itens */}
          <div className="flex justify-end items-center h-16 pb-2">
            <div className="flex space-x-2">
              {segundaLinha.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-white shadow-md'
                        : 'text-white hover:bg-white hover:bg-opacity-20'
                    }`}
                    style={isActive ? { color: '#174759' } : {}}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}


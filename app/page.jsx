'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/produtos');
  }, [router]);

  return null;
  const { produtos, movimentacoes } = useEstoque();

  // Calcular estatísticas
  const totalProdutos = produtos.reduce((sum, p) => sum + (p.estoque || 0), 0);
  const produtosBaixoEstoque = produtos.filter(
    (p) => (p.estoque || 0) === 0
  ).length;
  
  const valorTotalEstoque = produtos.reduce(
    (total, p) => total + (p.estoque || 0) * (p.precoVenda || 0),
    0
  );

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const movimentacoesHoje = movimentacoes.filter((m) => {
    const dataMovimentacao = new Date(m.data);
    dataMovimentacao.setHours(0, 0, 0, 0);
    return dataMovimentacao.getTime() === hoje.getTime();
  }).length;

  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const entradasMes = movimentacoes.filter(
    (m) => m.tipo === 'entrada' && new Date(m.data) >= inicioMes
  ).length;
  const saidasMes = movimentacoes.filter(
    (m) => m.tipo === 'saida' && new Date(m.data) >= inicioMes
  ).length;

  const ultimasMovimentacoes = [...movimentacoes]
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 5);

  // Calcular categorias por tipo
  const categorias = produtos.reduce((acc, p) => {
    const tipo = p.tipo || 'Sem tipo';
    acc[tipo] = (acc[tipo] || 0) + (p.estoque || 0);
    return acc;
  }, {});

  const totalItens = Object.values(categorias).reduce((sum, val) => sum + val, 0);

  // Função para obter status do produto
  const getProductStatus = (produto) => {
    const estoque = produto.estoque || 0;
    if (estoque === 0) return 'Esgotado';
    if (estoque <= 5) return 'Crítico';
    if (estoque <= 10) return 'Baixo';
    return 'Ativo';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total de Produtos"
            value={totalProdutos}
            icon="📦"
            trend={{ value: "12,5% vs último mês", isPositive: true }}
            color="blue"
          />
          <MetricCard
            title="Entradas Hoje"
            value={entradasMes}
            icon="📥"
            trend={{ value: "5% vs último mês", isPositive: false }}
            color="green"
          />
          <MetricCard
            title="Valor Total"
            value={formatarMoeda(valorTotalEstoque)}
            icon="💰"
            trend={{ value: "8,5% vs último mês", isPositive: true }}
            color="green"
          />
          <MetricCard
            title="Produtos Pendentes"
            value={produtosBaixoEstoque}
            icon="⚠️"
            trend={{ value: "12 itens até 30d", isPositive: false }}
            color="purple"
          />
        </div>

      {/* Gráficos e Categorias */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Controle de Estoque - Gráfico */}
        <div className="lg:col-span-2">
          <Card title="Controle de Estoque" className="h-full">
            <div className="flex gap-4 mb-6">
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium">
                Mês
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                Semana
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                Dia
              </button>
            </div>
            <div className="h-64 flex items-end justify-between gap-2">
              {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'].map((mes, idx) => (
                <div key={mes} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col gap-1">
                    <div 
                      className="w-full bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600"
                      style={{ height: `${80 + idx * 20}px` }}
                    ></div>
                    <div 
                      className="w-full bg-green-500 rounded-t-lg transition-all hover:bg-green-600"
                      style={{ height: `${60 + idx * 15}px` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">{mes}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-6 mt-6 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Geral Atual do Estoque</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Estoque Ideal</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Categorias - Gráfico de Rosca */}
        <Card title="Categorias">
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="20"
                  strokeDasharray="75 251"
                  transform="rotate(-90 50 50)"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="20"
                  strokeDasharray="50 251"
                  strokeDashoffset="-75"
                  transform="rotate(-90 50 50)"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="20"
                  strokeDasharray="40 251"
                  strokeDashoffset="-125"
                  transform="rotate(-90 50 50)"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="20"
                  strokeDasharray="86 251"
                  strokeDashoffset="-165"
                  transform="rotate(-90 50 50)"
                />
              </svg>
            </div>
          </div>
          <div className="space-y-3">
            {Object.entries(categorias).map(([categoria, quantidade], idx) => {
              const cores = ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500'];
              const porcentagem = ((quantidade / totalItens) * 100).toFixed(0);
              return (
                <div key={categoria} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 ${cores[idx % cores.length]} rounded-full`}></div>
                    <span className="text-sm text-gray-700">{categoria}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{porcentagem}%</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Atividades Recentes e Status do Estoque */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atividades Recentes */}
        <Card title="Atividades recentes">
          <div className="space-y-4">
            {ultimasMovimentacoes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhuma atividade recente</p>
            ) : (
              ultimasMovimentacoes.slice(0, 4).map((mov) => {
                const produto = produtos.find((p) => p.id === mov.produtoId);
                const icones = ['🎯', '📦', '✅', '🔄'];
                return (
                  <div key={mov.id} className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                      {icones[Math.floor(Math.random() * icones.length)]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {mov.tipo === 'entrada' ? 'Novo fornecedor' : 'Produto atualizado'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {produto?.produto || 'Produto'} • {mov.motivo}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {new Date(mov.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                );
              })
            )}
          </div>
          <Link
            href="/movimentacoes"
            className="block text-center text-blue-600 hover:text-blue-800 font-medium text-sm mt-4"
          >
            VER TUDO
          </Link>
        </Card>

        {/* Status do Estoque */}
        <Card title="Status do Estoque">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3">Produto</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3">Código</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3">Tipo</th>
                  <th className="text-center text-xs font-semibold text-gray-500 uppercase pb-3">Estoque Total</th>
                  <th className="text-center text-xs font-semibold text-gray-500 uppercase pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {produtos.slice(0, 4).map((produto) => {
                  const status = getProductStatus(produto);
                  const estoque = produto.estoque || 0;
                  const porcentagem = estoque > 0 ? Math.min((estoque / 20) * 100, 100) : 0;
                  const corBarra = porcentagem > 50 ? 'bg-green-500' : porcentagem > 25 ? 'bg-yellow-500' : 'bg-red-500';
                  const nomeProduto = produto.produto || 'Sem nome';
                  
                  return (
                    <tr key={produto.id} className="hover:bg-gray-50">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                            {nomeProduto.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{nomeProduto}</span>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-gray-600">{produto.codigo || '-'}</td>
                      <td className="py-3 text-sm text-gray-600">{produto.tipo || '-'}</td>
                      <td className="py-3">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-sm font-semibold text-gray-900">{estoque} unidades</span>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div className={`${corBarra} h-1.5 rounded-full`} style={{ width: `${porcentagem}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <StatusBadge status={status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Link
            href="/produtos"
            className="block text-center text-blue-600 hover:text-blue-800 font-medium text-sm mt-4"
          >
            VER TUDO
          </Link>
        </Card>
      </div>
    </div>
    </div>
  );
}


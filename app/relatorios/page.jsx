'use client';

import { useEstoque } from '@/lib/EstoqueContext';
import Card from '../components/Card';
import { formatarMoeda } from '@/lib/utils';

export default function RelatoriosPage() {
  const { produtos, movimentacoes } = useEstoque();

  // Estatísticas Gerais
  const totalProdutos = produtos.length;
  const valorTotalEstoque = produtos.reduce(
    (total, p) => total + p.quantidadeAtual * p.precoCompra,
    0
  );
  const valorTotalVenda = produtos.reduce(
    (total, p) => total + p.quantidadeAtual * p.precoVenda,
    0
  );
  const margemLucro = valorTotalVenda - valorTotalEstoque;
  const percentualMargem = valorTotalEstoque > 0 
    ? ((margemLucro / valorTotalEstoque) * 100).toFixed(2)
    : '0.00';

  // Produtos por Categoria
  const produtosPorCategoria = produtos.reduce((acc, produto) => {
    if (!acc[produto.categoria]) {
      acc[produto.categoria] = [];
    }
    acc[produto.categoria].push(produto);
    return acc;
  }, {});

  // Top 5 Produtos com Maior Valor em Estoque
  const topProdutosValor = [...produtos]
    .map((p) => ({
      ...p,
      valorTotal: p.quantidadeAtual * p.precoCompra,
    }))
    .sort((a, b) => b.valorTotal - a.valorTotal)
    .slice(0, 5);

  // Produtos com Baixo Estoque
  const produtosBaixoEstoque = produtos.filter(
    (p) => p.quantidadeAtual <= p.quantidadeMinima
  );

  // Movimentações por Mês
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  const movimentacoesMesAtual = movimentacoes.filter((m) => {
    const data = new Date(m.data);
    return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
  });

  const entradasMes = movimentacoesMesAtual.filter((m) => m.tipo === 'entrada').length;
  const saidasMes = movimentacoesMesAtual.filter((m) => m.tipo === 'saida').length;

  const quantidadeEntradaMes = movimentacoesMesAtual
    .filter((m) => m.tipo === 'entrada')
    .reduce((total, m) => total + m.quantidade, 0);
  
  const quantidadeSaidaMes = movimentacoesMesAtual
    .filter((m) => m.tipo === 'saida')
    .reduce((total, m) => total + m.quantidade, 0);

  // Produtos Mais Movimentados
  const produtosMaisMovimentados = movimentacoes.reduce((acc, mov) => {
    if (!acc[mov.produtoId]) {
      acc[mov.produtoId] = {
        entradas: 0,
        saidas: 0,
        total: 0,
      };
    }
    if (mov.tipo === 'entrada') {
      acc[mov.produtoId].entradas += mov.quantidade;
    } else {
      acc[mov.produtoId].saidas += mov.quantidade;
    }
    acc[mov.produtoId].total += mov.quantidade;
    return acc;
  }, {});

  const topMovimentados = Object.entries(produtosMaisMovimentados)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 5)
    .map(([produtoId, dados]) => ({
      produto: produtos.find((p) => p.id === produtoId),
      ...dados,
    }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Relatórios
        </h1>
        <p className="text-gray-600 mt-2">
          Análises e insights do seu estoque
        </p>
      </div>

      {/* Resumo Financeiro */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          💰 Resumo Financeiro
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-blue-500">
            <div>
              <p className="text-sm text-gray-600">Valor Total (Custo)</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatarMoeda(valorTotalEstoque)}
              </p>
            </div>
          </Card>
          <Card className="border-l-4 border-green-500">
            <div>
              <p className="text-sm text-gray-600">Valor Total (Venda)</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatarMoeda(valorTotalVenda)}
              </p>
            </div>
          </Card>
          <Card className="border-l-4 border-purple-500">
            <div>
              <p className="text-sm text-gray-600">Margem de Lucro</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatarMoeda(margemLucro)}
              </p>
            </div>
          </Card>
          <Card className="border-l-4 border-orange-500">
            <div>
              <p className="text-sm text-gray-600">Percentual de Margem</p>
              <p className="text-2xl font-bold text-gray-900">
                {percentualMargem}%
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Movimentações do Mês */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          📊 Movimentações do Mês Atual
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-green-500">
            <div>
              <p className="text-sm text-gray-600">Entradas</p>
              <p className="text-2xl font-bold text-green-600">
                {entradasMes} operações
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {quantidadeEntradaMes} unidades
              </p>
            </div>
          </Card>
          <Card className="border-l-4 border-red-500">
            <div>
              <p className="text-sm text-gray-600">Saídas</p>
              <p className="text-2xl font-bold text-red-600">
                {saidasMes} operações
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {quantidadeSaidaMes} unidades
              </p>
            </div>
          </Card>
          <Card className="border-l-4 border-blue-500">
            <div>
              <p className="text-sm text-gray-600">Saldo</p>
              <p className={`text-2xl font-bold ${
                quantidadeEntradaMes - quantidadeSaidaMes >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {quantidadeEntradaMes - quantidadeSaidaMes >= 0 ? '+' : ''}
                {quantidadeEntradaMes - quantidadeSaidaMes} unidades
              </p>
            </div>
          </Card>
          <Card className="border-l-4 border-purple-500">
            <div>
              <p className="text-sm text-gray-600">Total Movimentações</p>
              <p className="text-2xl font-bold text-gray-900">
                {movimentacoesMesAtual.length}
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Produtos por Categoria */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          📦 Produtos por Categoria
        </h2>
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(produtosPorCategoria).map(([categoria, prods]) => (
              <div
                key={categoria}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  {categoria}
                </h3>
                <p className="text-sm text-gray-600">
                  {prods.length} produto(s)
                </p>
                <p className="text-sm text-gray-600">
                  Estoque: {prods.reduce((sum, p) => sum + p.quantidadeAtual, 0)} unidades
                </p>
                <p className="text-sm text-gray-600">
                  Valor: {formatarMoeda(
                    prods.reduce((sum, p) => sum + p.quantidadeAtual * p.precoCompra, 0)
                  )}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top 5 Produtos por Valor */}
        <Card title="💎 Top 5 Produtos por Valor em Estoque">
          {topProdutosValor.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              Nenhum produto cadastrado
            </p>
          ) : (
            <div className="space-y-3">
              {topProdutosValor.map((produto, index) => (
                <div
                  key={produto.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-gray-400">#{index + 1}</span>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {produto.nome}
                          </p>
                          <p className="text-sm text-gray-600">
                            {produto.codigo} - {produto.quantidadeAtual} unidades
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        {formatarMoeda(produto.valorTotal)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Produtos Mais Movimentados */}
        <Card title="🔥 Top 5 Produtos Mais Movimentados">
          {topMovimentados.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              Nenhuma movimentação registrada
            </p>
          ) : (
            <div className="space-y-3">
              {topMovimentados.map((item, index) => (
                <div
                  key={item.produto?.id || index}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-gray-400">#{index + 1}</span>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {item.produto?.nome || 'Produto não encontrado'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.produto?.codigo || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-purple-600">
                        {item.total} unid.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-600">
                      📥 {item.entradas} entradas
                    </span>
                    <span className="text-red-600">
                      📤 {item.saidas} saídas
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Alertas de Estoque Baixo */}
      {produtosBaixoEstoque.length > 0 && (
        <div className="mt-8">
          <Card title="⚠️ Alertas de Estoque Baixo" className="border-l-4 border-red-500">
            <div className="space-y-3">
              {produtosBaixoEstoque.map((produto) => (
                <div
                  key={produto.id}
                  className="p-4 bg-red-50 rounded-lg border border-red-200"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {produto.nome}
                      </p>
                      <p className="text-sm text-gray-600">
                        {produto.codigo} - {produto.categoria}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-600 font-semibold">
                        Estoque: {produto.quantidadeAtual}
                      </p>
                      <p className="text-sm text-gray-600">
                        Mínimo: {produto.quantidadeMinima}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}


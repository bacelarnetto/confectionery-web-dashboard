import { ShoppingBag, DollarSign, Clock, Receipt, Plus, LayoutGrid } from 'lucide-react'
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts'
import KpiCard from './KpiCard'
import SectionHeader from './SectionHeader'
import { VendasKpis, TopProduto, PedidoStatus } from '../services/dashboardService'

interface VendasBlockProps {
  kpis?: VendasKpis
  topProdutos?: TopProduto[]
  pedidosStatus?: PedidoStatus[]
  isLoadingKpis: boolean
  isLoadingTop: boolean
  isLoadingStatus: boolean
  formatCurrency: Intl.NumberFormat
}

const RANKING_CHART_COLORS = ['#f59e0b', '#6366f1', '#22c55e', '#ec4899', '#06b6d4', '#f97316', '#a855f7', '#84cc16']

const STATUS_CHART_COLORS: Record<string, string> = {
  RASCUNHO: '#9ca3af',
  CONFIRMADO: '#3b82f6',
  EM_PRODUCAO: '#a855f7',
  PRONTO: '#22c55e',
  A_CAMINHO: '#f59e0b',
  ENTREGUE: '#14b8a6',
  CONCLUIDO: '#059669',
  CANCELADO: '#ef4444',
}

function ChartSkeleton() {
  return <div className="h-72 bg-gray-100 rounded-xl animate-pulse" />
}

export default function VendasBlock({
  kpis,
  topProdutos = [],
  pedidosStatus = [],
  isLoadingKpis,
  isLoadingTop,
  isLoadingStatus,
  formatCurrency,
}: VendasBlockProps) {
  return (
    <section id="secao-vendas" className="space-y-4 pt-2">
      <SectionHeader
        id="secao-vendas"
        title="Vendas & Pedidos"
        subtitle="Acompanhamento comercial, volume de pedidos e produtos mais procurados"
        icon={<ShoppingBag size={18} />}
        actions={[
          {
            label: 'Novo Pedido',
            to: '/vendas/pedidos/novo',
            primary: true,
            icon: <Plus size={13} />,
          },
          {
            label: 'Mural de Pedidos',
            to: '/vendas/mural',
            icon: <LayoutGrid size={13} />,
          },
          {
            label: 'Ver Pedidos',
            to: '/vendas/pedidos',
          },
        ]}
      />

      {/* KPIs de Vendas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Pedidos no Mês"
          value={kpis?.totalPedidosMes ?? '—'}
          icon={<ShoppingBag size={20} />}
          variant="blue"
          isLoading={isLoadingKpis}
          to="/vendas/pedidos"
        />
        <KpiCard
          title="Receita de Vendas"
          value={kpis ? formatCurrency.format(kpis.receitaMes) : '—'}
          icon={<DollarSign size={20} />}
          variant="emerald"
          isLoading={isLoadingKpis}
          subtitle="Total faturado no mês corrente"
        />
        <KpiCard
          title="Pedidos em Aberto"
          value={kpis?.pedidosAbertos ?? '—'}
          icon={<Clock size={20} />}
          variant="amber"
          isLoading={isLoadingKpis}
          to="/vendas/mural"
          subtitle="Ver no mural de produção"
        />
        <KpiCard
          title="Ticket Médio"
          value={kpis ? formatCurrency.format(kpis.ticketMedio) : '—'}
          icon={<Receipt size={20} />}
          variant="purple"
          isLoading={isLoadingKpis}
          subtitle="Média por pedido fechado"
        />
      </div>

      {/* Gráficos de Vendas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        {/* Top 5 Produtos */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Top 5 Produtos Mais Vendidos</h3>
              <p className="text-xs text-gray-500">Classificação por quantidade de unidades vendidas</p>
            </div>
          </div>
          {isLoadingTop ? (
            <ChartSkeleton />
          ) : !topProdutos?.length ? (
            <div className="h-72 flex items-center justify-center text-sm text-gray-400">
              Nenhuma venda registrada no período
            </div>
          ) : (
            <div className="w-full h-72 min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 300, height: 288 }}>
                <BarChart data={topProdutos} margin={{ top: 5, right: 20, bottom: 5, left: 0 }} layout="vertical">
                  <CartesianGrid stroke="#f3f4f6" strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    dataKey="nome"
                    type="category"
                    stroke="#4b5563"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={130}
                  />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '0.5rem', color: '#fff' }}
                    itemStyle={{ color: '#f3f4f6' }}
                    formatter={(v: any) => [`${v} un.`, 'Quantidade']}
                  />
                  <Bar dataKey="totalVendido" radius={[0, 4, 4, 0]} name="Qtd Vendida">
                    {topProdutos.map((entry, index) => (
                      <Cell key={entry.nome} fill={RANKING_CHART_COLORS[index % RANKING_CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Pedidos por Status */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Distribuição de Pedidos por Status</h3>
              <p className="text-xs text-gray-500">Status atual de todos os pedidos no sistema</p>
            </div>
          </div>
          {isLoadingStatus ? (
            <ChartSkeleton />
          ) : !pedidosStatus?.length ? (
            <div className="h-72 flex items-center justify-center text-sm text-gray-400">
              Nenhum pedido registrado
            </div>
          ) : (
            <div className="w-full h-72 min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 300, height: 288 }}>
                <BarChart data={pedidosStatus} margin={{ top: 10, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid stroke="#f3f4f6" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="status"
                    stroke="#9ca3af"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => v.replace('_', ' ')}
                  />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '0.5rem', color: '#fff' }}
                    formatter={(v: any) => [`${v} pedido(s)`, 'Total']}
                    labelFormatter={(l) => `Status: ${String(l).replace('_', ' ')}`}
                  />
                  <Bar
                    dataKey="total"
                    name="Pedidos"
                    radius={[4, 4, 0, 0]}
                    label={{ position: 'top', fontSize: 11, fill: '#6b7280' }}
                  >
                    {pedidosStatus.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_CHART_COLORS[entry.status] ?? '#9ca3af'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}


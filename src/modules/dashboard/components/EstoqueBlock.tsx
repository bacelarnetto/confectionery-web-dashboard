import { Package, PiggyBank, AlertCircle, Truck, ShoppingCart, Plus } from 'lucide-react'
import {
  LineChart,
  Line,
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
import { DashboardKpis, MovimentacaoDia, EstoqueVolume } from '../services/dashboardService'

interface EstoqueBlockProps {
  kpis?: DashboardKpis
  movimentacoes?: MovimentacaoDia[]
  estoqueVolumes?: EstoqueVolume[]
  isLoadingKpis: boolean
  isLoadingMov: boolean
  isLoadingEst: boolean
  formatCurrency: Intl.NumberFormat
}

const RANKING_CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#84cc16']

function ChartSkeleton() {
  return <div className="h-72 bg-gray-100 rounded-xl animate-pulse" />
}

export default function EstoqueBlock({
  kpis,
  movimentacoes = [],
  estoqueVolumes = [],
  isLoadingKpis,
  isLoadingMov,
  isLoadingEst,
  formatCurrency,
}: EstoqueBlockProps) {
  const hasItensEmBaixa = (kpis?.itensEmBaixa ?? 0) > 0

  return (
    <section id="secao-estoque" className="space-y-4 pt-2">
      <SectionHeader
        id="secao-estoque"
        title="Estoque & Insumos"
        subtitle="Controle de matérias-primas, reposição e fluxo de entradas e saídas"
        icon={<Package size={18} />}
        actions={[
          {
            label: 'Nova Entrada',
            to: '/estoque-insumos/entradas/nova',
            primary: true,
            icon: <Plus size={13} />,
          },
          {
            label: 'Insumos',
            to: '/estoque-insumos',
          },
          {
            label: 'Movimentações',
            to: '/estoque-insumos/movimentacoes',
          },
        ]}
      />

      {/* KPIs de Estoque */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Valor em Estoque"
          value={kpis ? formatCurrency.format(kpis.totalEstoque) : '—'}
          icon={<PiggyBank size={20} />}
          variant="emerald"
          isLoading={isLoadingKpis}
          to="/estoque-insumos"
          subtitle="Capital alocado em insumos"
        />
        <KpiCard
          title="Itens em Baixa"
          value={kpis?.itensEmBaixa ?? '—'}
          icon={<AlertCircle size={20} />}
          variant={hasItensEmBaixa ? 'rose' : 'default'}
          isLoading={isLoadingKpis}
          to="/estoque-insumos"
          subtitle={hasItensEmBaixa ? 'Requer reposição imediata' : 'Estoque em níveis normais'}
        />
        <KpiCard
          title="Fornecedores Ativos"
          value={kpis?.fornecedoresAtivos ?? '—'}
          icon={<Truck size={20} />}
          variant="blue"
          isLoading={isLoadingKpis}
          to="/compras/fornecedores"
        />
        <KpiCard
          title="Compras de Insumos"
          value={kpis ? formatCurrency.format(kpis.comprasMes) : '—'}
          icon={<ShoppingCart size={20} />}
          variant="amber"
          isLoading={isLoadingKpis}
          to="/compras/compras"
          subtitle="Total em compras no mês"
        />
      </div>

      {/* Gráficos de Estoque */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        {/* Movimentações (7 dias) */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Movimentações — Últimos 7 dias</h3>
              <p className="text-xs text-gray-500">Fluxo diário comparativo de entradas e saídas</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Entradas
              </span>
              <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Saídas
              </span>
            </div>
          </div>
          {isLoadingMov ? (
            <ChartSkeleton />
          ) : !movimentacoes?.length ? (
            <div className="h-72 flex items-center justify-center text-sm text-gray-400">
              Sem movimentações nos últimos 7 dias
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={movimentacoes} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid stroke="#f3f4f6" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '0.5rem', color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="entradas" stroke="#10b981" strokeWidth={2.5} name="Entradas" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="saidas" stroke="#ef4444" strokeWidth={2.5} name="Saídas" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Maiores Volumes */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Maiores Volumes em Estoque</h3>
              <p className="text-xs text-gray-500">Insumos com maior volume físico armazenado</p>
            </div>
          </div>
          {isLoadingEst ? (
            <ChartSkeleton />
          ) : !estoqueVolumes?.length ? (
            <div className="h-72 flex items-center justify-center text-sm text-gray-400">
              Sem dados de volume em estoque
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={estoqueVolumes} margin={{ top: 5, right: 20, bottom: 5, left: 0 }} layout="vertical">
                  <CartesianGrid stroke="#f3f4f6" strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    dataKey="name"
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
                    formatter={(v: any) => [`${v} un./kg`, 'Quantidade']}
                  />
                  <Bar dataKey="qtd" radius={[0, 4, 4, 0]} name="Quantidade">
                    {estoqueVolumes.map((entry, index) => (
                      <Cell key={entry.name} fill={RANKING_CHART_COLORS[index % RANKING_CHART_COLORS.length]} />
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


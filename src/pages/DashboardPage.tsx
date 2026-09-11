import { useMemo } from 'react'
import { Link } from 'react-router'
import {
  TrendingUp,
  PackageMinus,
  AlertCircle,
  PiggyBank,
  ShoppingBag,
  DollarSign,
  Clock,
  Receipt,
  HandCoins,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  Cell,
  PieChart as RechartsPieChart,
  Pie,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts'
import {
  useDashboardKpis,
  useMovimentacoesRecentes,
  useEstoqueMaioresVolumes,
  useHistoricoCompras,
  useVendasKpis,
  useTopProdutos,
  usePedidosPorStatus,
} from '../modules/dashboard/hooks/useDashboard'
import { useResumoMes } from '../modules/financeiro/hooks/useFinanceiro'

// --- Components ---

interface KpiCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  isLoading?: boolean
}

function KpiCard({ title, value, icon, isLoading }: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="p-2 bg-gray-50 rounded-lg text-gray-600">{icon}</div>
      </div>
      <div>
        {isLoading ? (
          <div className="h-8 bg-gray-200 rounded animate-pulse w-32" />
        ) : (
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        )}
      </div>
    </div>
  )
}

function ChartSkeleton() {
  return <div className="h-72 bg-gray-100 rounded-lg animate-pulse" />
}

// Mesmas cores dos badges de status de Pedido (ver STATUS_COLORS em PedidoListPage.tsx), só que em
// hex pro fill do gráfico em vez de classe Tailwind.
// Paleta pra gráficos de ranking (item 1, item 2, ...) sem categoria fixa — cicla por índice.
const RANKING_CHART_COLORS = ['#f59e0b', '#6366f1', '#22c55e', '#ec4899', '#06b6d4', '#f97316', '#a855f7', '#84cc16']

const STATUS_CHART_COLORS: Record<string, string> = {
  RASCUNHO: '#9ca3af',
  CONFIRMADO: '#3b82f6',
  EM_PRODUCAO: '#a855f7',
  PRONTO: '#22c55e',
  ENTREGUE: '#14b8a6',
  CANCELADO: '#ef4444',
}

function mesAtual(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

// Card "Resumo do Mês" (F5) — conectado ao GET /api/financeiro/resumo?mes= do mês atual.
function ResumoMesSection() {
  const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
  const mes = mesAtual()
  const { data: resumo, isLoading } = useResumoMes(mes)

  const pieData = (resumo?.gastosPorCategoria ?? []).map((c) => ({ name: c.tipoGastoNome, value: c.valor }))
  const totalPendente = resumo?.recebimentosPendentes?.total ?? 0
  const qtdPendente = resumo?.recebimentosPendentes?.quantidade ?? 0

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Financeiro — Resumo do Mês {mes.replace('-', '/')}
        </h2>
        <div className="flex items-center gap-3 text-sm">
          <Link to="/financeiro/gastos" className="font-medium text-amber-600 hover:text-amber-700">
            Gastos
          </Link>
          <Link to="/financeiro/contas-receber" className="font-medium text-amber-600 hover:text-amber-700">
            Contas a Receber
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Receita"
          value={resumo ? fmt.format(resumo.receita) : '—'}
          icon={<DollarSign size={20} className="text-emerald-600" />}
          isLoading={isLoading}
        />
        <KpiCard
          title="Gastos"
          value={resumo ? fmt.format(resumo.gastos) : '—'}
          icon={<Receipt size={20} className="text-red-500" />}
          isLoading={isLoading}
        />
        <KpiCard
          title="Custo dos Doces (COGS)"
          value={resumo ? fmt.format(resumo.cogsInsumos) : '—'}
          icon={<PackageMinus size={20} className="text-amber-600" />}
          isLoading={isLoading}
        />
        <KpiCard
          title="Lucro Real"
          value={resumo ? fmt.format(resumo.lucroReal) : '—'}
          icon={<PiggyBank size={20} />}
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-6">Gastos por Categoria</h3>
          {isLoading ? (
            <ChartSkeleton />
          ) : pieData.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-sm text-gray-400">Nenhum gasto no mês</div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {pieData.map((entry, index) => (
                      <Cell key={entry.name} fill={RANKING_CHART_COLORS[index % RANKING_CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(v: any) => [fmt.format(Number(v)), '']} />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-gray-900">A Receber</h3>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <HandCoins size={20} />
            </div>
          </div>
          {isLoading ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse w-40" />
          ) : (
            <>
              <p className="text-3xl font-semibold text-gray-900">{fmt.format(totalPendente)}</p>
              <p className="text-sm text-gray-500 mt-2">{qtdPendente} conta(s) pendente(s) de recebimento</p>
              <div className="mt-auto pt-6">
                <Link
                  to="/financeiro/contas-receber"
                  className="inline-flex items-center justify-center w-full gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
                >
                  Ver contas a receber
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default function DashboardPage() {
  const formatCurrency = useMemo(
    () => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }),
    []
  )

  const { data: kpis, isLoading: kpisLoading } = useDashboardKpis()
  const { data: movimentacoes, isLoading: movLoading } = useMovimentacoesRecentes()
  const { data: estoqueVolumes, isLoading: estLoading } = useEstoqueMaioresVolumes()
  const { data: historicoCompras, isLoading: hisLoading } = useHistoricoCompras()
  const { data: vendasKpis, isLoading: vendKpisLoading } = useVendasKpis()
  const { data: topProdutos, isLoading: topLoading } = useTopProdutos()
  const { data: pedidosStatus, isLoading: statusLoading } = usePedidosPorStatus()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Visão geral do estoque, compras e vendas da confeitaria.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Valor em Estoque"
          value={kpis ? formatCurrency.format(kpis.totalEstoque) : '—'}
          icon={<PiggyBank size={20} />}
          isLoading={kpisLoading}
        />
        <KpiCard
          title="Gastos (Mês Atual)"
          value={kpis ? formatCurrency.format(kpis.comprasMes) : '—'}
          icon={<TrendingUp size={20} />}
          isLoading={kpisLoading}
        />
        <KpiCard
          title="Produtos em Baixa"
          value={kpis?.itensEmBaixa ?? '—'}
          icon={<AlertCircle size={20} className="text-red-500" />}
          isLoading={kpisLoading}
        />
        <KpiCard
          title="Fornecedores Ativos"
          value={kpis?.fornecedoresAtivos ?? '—'}
          icon={<PackageMinus size={20} />}
          isLoading={kpisLoading}
        />
      </div>

      {/* Vendas KPI Cards */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Vendas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Pedidos (Mês Atual)"
            value={vendasKpis?.totalPedidosMes ?? '—'}
            icon={<ShoppingBag size={20} />}
            isLoading={vendKpisLoading}
          />
          <KpiCard
            title="Receita (Mês Atual)"
            value={vendasKpis ? formatCurrency.format(vendasKpis.receitaMes) : '—'}
            icon={<DollarSign size={20} />}
            isLoading={vendKpisLoading}
          />
          <KpiCard
            title="Pedidos em Aberto"
            value={vendasKpis?.pedidosAbertos ?? '—'}
            icon={<Clock size={20} className="text-amber-500" />}
            isLoading={vendKpisLoading}
          />
          <KpiCard
            title="Ticket Médio"
            value={vendasKpis ? formatCurrency.format(vendasKpis.ticketMedio) : '—'}
            icon={<Receipt size={20} />}
            isLoading={vendKpisLoading}
          />
        </div>
      </div>

      {/* Financeiro — Resumo do Mês */}
      <ResumoMesSection />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Movements Line Chart */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-6">Movimentações - Últimos 7 dias</h3>
          {movLoading ? (
            <ChartSkeleton />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={movimentacoes ?? []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <Line type="monotone" dataKey="entradas" stroke="#10b981" strokeWidth={2} name="Entradas" />
                  <Line type="monotone" dataKey="saidas" stroke="#ef4444" strokeWidth={2} name="Saídas" />
                  <CartesianGrid stroke="#e5e7eb" strokeDasharray="5 5" vertical={false} />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Stock Levels Bar Chart */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-6">Maiores Volumes em Estoque</h3>
          {estLoading ? (
            <ChartSkeleton />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={estoqueVolumes ?? []}
                  margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                  layout="vertical"
                >
                  <CartesianGrid stroke="#e5e7eb" strokeDasharray="5 5" horizontal={false} />
                  <XAxis type="number" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={120}
                  />
                  <RechartsTooltip />
                  <Bar dataKey="qtd" radius={[0, 4, 4, 0]} name="Quantidade">
                    {(estoqueVolumes ?? []).map((entry, index) => (
                      <Cell key={entry.name} fill={RANKING_CHART_COLORS[index % RANKING_CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top Produtos Bar Chart */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-6">Top 5 Produtos Mais Vendidos</h3>
          {topLoading ? (
            <ChartSkeleton />
          ) : !topProdutos?.length ? (
            <div className="h-72 flex items-center justify-center text-sm text-gray-400">Sem dados de vendas</div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topProdutos}
                  margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                  layout="vertical"
                >
                  <CartesianGrid stroke="#e5e7eb" strokeDasharray="5 5" horizontal={false} />
                  <XAxis type="number" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    dataKey="nome"
                    type="category"
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={130}
                  />
                  <RechartsTooltip />
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

        {/* Pedidos por Status Bar Chart */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-6">Pedidos por Status</h3>
          {statusLoading ? (
            <ChartSkeleton />
          ) : !pedidosStatus?.length ? (
            <div className="h-72 flex items-center justify-center text-sm text-gray-400">Sem pedidos registrados</div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pedidosStatus} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid stroke="#e5e7eb" strokeDasharray="5 5" vertical={false} />
                  <XAxis
                    dataKey="status"
                    stroke="#6b7280"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => v.replace('_', ' ')}
                  />
                  <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <RechartsTooltip formatter={(v: any) => [v, 'Pedidos']} labelFormatter={(l) => l.replace('_', ' ')} />
                  <Bar
                    dataKey="total"
                    name="Pedidos"
                    radius={[4, 4, 0, 0]}
                    label={{ position: 'top', fontSize: 12, fill: '#6b7280' }}
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

        {/* Purchase Expenses Area Chart */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
          <h3 className="text-base font-semibold text-gray-900 mb-6">Histórico de Gastos com Compras</h3>
          {hisLoading ? (
            <ChartSkeleton />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicoCompras ?? []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `R$ ${val}`}
                  />
                  <CartesianGrid stroke="#e5e7eb" strokeDasharray="5 5" vertical={false} />
                  <RechartsTooltip formatter={(value: any) => [formatCurrency.format(Number(value)), 'Gastos']} />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorExpenses)"
                    strokeWidth={2}
                    name="Gastos"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

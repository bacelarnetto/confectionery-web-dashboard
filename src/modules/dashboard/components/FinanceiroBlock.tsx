import { Link } from 'react-router'
import {
  DollarSign,
  Receipt,
  PackageMinus,
  PiggyBank,
  HandCoins,
  Plus,
  ArrowRight,
} from 'lucide-react'
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts'
import KpiCard from './KpiCard'
import SectionHeader from './SectionHeader'
import { ResumoMes } from '../../financeiro/types/resumo'
import { HistoricoCompra } from '../services/dashboardService'

interface FinanceiroBlockProps {
  resumo?: ResumoMes
  historicoCompras?: HistoricoCompra[]
  isLoadingResumo: boolean
  isLoadingHistorico: boolean
  formatCurrency: Intl.NumberFormat
  mesFormatado: string
}

const PIE_COLORS = ['#f59e0b', '#6366f1', '#10b981', '#ec4899', '#06b6d4', '#f97316', '#a855f7', '#84cc16']

function ChartSkeleton() {
  return <div className="h-72 bg-gray-100 rounded-xl animate-pulse" />
}

export default function FinanceiroBlock({
  resumo,
  historicoCompras = [],
  isLoadingResumo,
  isLoadingHistorico,
  formatCurrency,
  mesFormatado,
}: FinanceiroBlockProps) {
  const pieData = (resumo?.gastosPorCategoria ?? []).map((c) => ({
    name: c.tipoGastoNome,
    value: c.valor,
  }))

  const totalPendente = resumo?.recebimentosPendentes?.total ?? 0
  const qtdPendente = resumo?.recebimentosPendentes?.quantidade ?? 0
  const lucroReal = resumo?.lucroReal ?? 0

  return (
    <section id="secao-financeiro" className="space-y-4 pt-2">
      <SectionHeader
        id="secao-financeiro"
        title={`Financeiro & Compras — ${mesFormatado}`}
        subtitle="Resultado financeiro consolidado do mês, custos operacionais e fluxo a receber"
        icon={<DollarSign size={18} />}
        actions={[
          {
            label: 'Novo Gasto',
            to: '/financeiro/gastos/novo',
            primary: true,
            icon: <Plus size={13} />,
          },
          {
            label: 'Contas a Receber',
            to: '/financeiro/contas-receber',
          },
          {
            label: 'Gastos',
            to: '/financeiro/gastos',
          },
          {
            label: 'Compras',
            to: '/compras/compras',
          },
        ]}
      />

      {/* KPIs Financeiros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Receita Recebida"
          value={resumo ? formatCurrency.format(resumo.receita) : '—'}
          icon={<DollarSign size={20} />}
          variant="emerald"
          isLoading={isLoadingResumo}
          to="/financeiro/contas-receber"
          subtitle="Entradas liquidadas no mês (regime de caixa)"
        />
        <KpiCard
          title="Gastos Totais"
          value={resumo ? formatCurrency.format(resumo.gastos) : '—'}
          icon={<Receipt size={20} />}
          variant="rose"
          isLoading={isLoadingResumo}
          to="/financeiro/gastos"
          subtitle="Despesas operacionais e fixas"
        />
        <KpiCard
          title="Custo dos Doces (COGS)"
          value={resumo ? formatCurrency.format(resumo.cogsInsumos) : '—'}
          icon={<PackageMinus size={20} />}
          variant="amber"
          isLoading={isLoadingResumo}
          subtitle="Insumos consumidos na produção"
        />
        <KpiCard
          title="Lucro Real"
          value={resumo ? formatCurrency.format(lucroReal) : '—'}
          icon={<PiggyBank size={20} />}
          variant={lucroReal >= 0 ? 'emerald' : 'rose'}
          isLoading={isLoadingResumo}
          subtitle="Receita − Gastos − Custo dos Doces"
        />
      </div>

      {/* Grid: Pizza de Gastos + Card A Receber */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        {/* Gastos por Categoria */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Gastos por Categoria</h3>
              <p className="text-xs text-gray-500">Distribuição das despesas operacionais no mês</p>
            </div>
            <Link
              to="/financeiro/gastos"
              className="text-xs font-medium text-amber-600 hover:text-amber-700 inline-flex items-center gap-1"
            >
              Ver gastos <ArrowRight size={12} />
            </Link>
          </div>
          {isLoadingResumo ? (
            <ChartSkeleton />
          ) : pieData.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-sm text-gray-400">
              Nenhum gasto registrado neste mês
            </div>
          ) : (
            <div className="w-full h-72 min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 300, height: 288 }}>
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '0.5rem', color: '#fff' }}
                    formatter={(v: any) => [formatCurrency.format(Number(v)), 'Valor']}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Card Destaque: A Receber */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  Previsão de Entrada
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-2">Contas a Receber Pendentes</h3>
                <p className="text-xs text-gray-500 mt-0.5">Valores de pedidos entregues e contas avulsas a receber</p>
              </div>
              <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                <HandCoins size={24} />
              </div>
            </div>

            <div className="my-6 p-4 rounded-xl bg-gradient-to-br from-emerald-50/60 to-emerald-100/30 border border-emerald-200">
              {isLoadingResumo ? (
                <div className="h-10 bg-emerald-200/50 rounded animate-pulse w-48" />
              ) : (
                <>
                  <p className="text-3xl font-extrabold text-emerald-950">
                    {formatCurrency.format(totalPendente)}
                  </p>
                  <p className="text-xs font-medium text-emerald-800 mt-1">
                    {qtdPendente} recebimento(s) aguardando liquidação
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="pt-2">
            <Link
              to="/financeiro/contas-receber"
              className="inline-flex items-center justify-center w-full gap-2 px-4 py-2.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-xs"
            >
              <span>Gerenciar contas a receber</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Histórico de Compras (Área Total) */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs mt-4 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Histórico de Gastos com Compras</h3>
            <p className="text-xs text-gray-500">Evolução mensal de aquisições de insumos</p>
          </div>
          <Link
            to="/compras/compras"
            className="text-xs font-medium text-amber-600 hover:text-amber-700 inline-flex items-center gap-1"
          >
            Ver compras <ArrowRight size={12} />
          </Link>
        </div>
        {isLoadingHistorico ? (
          <ChartSkeleton />
        ) : !historicoCompras?.length ? (
          <div className="h-72 flex items-center justify-center text-sm text-gray-400">
            Nenhum histórico disponível
          </div>
        ) : (
          <div className="w-full h-72 min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 300, height: 288 }}>
              <AreaChart data={historicoCompras} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `R$ ${val}`}
                />
                <CartesianGrid stroke="#f3f4f6" strokeDasharray="3 3" vertical={false} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '0.5rem', color: '#fff' }}
                  formatter={(value: any) => [formatCurrency.format(Number(value)), 'Total em Compras']}
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorPurchases)"
                  name="Compras"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </section>
  )
}


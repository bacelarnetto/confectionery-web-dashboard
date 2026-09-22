import { Link } from 'react-router'
import { DollarSign, PiggyBank, ShoppingBag, Package, AlertTriangle, Clock, HandCoins } from 'lucide-react'
import KpiCard from './KpiCard'
import { DashboardKpis, VendasKpis } from '../services/dashboardService'
import { ResumoMes } from '../../financeiro/types/resumo'

interface DestaquesProps {
  kpis?: DashboardKpis
  vendasKpis?: VendasKpis
  resumo?: ResumoMes
  isLoadingKpis: boolean
  isLoadingVendas: boolean
  isLoadingResumo: boolean
  formatCurrency: Intl.NumberFormat
}

export default function DestaquesExecutivos({
  kpis,
  vendasKpis,
  resumo,
  isLoadingKpis,
  isLoadingVendas,
  isLoadingResumo,
  formatCurrency,
}: DestaquesProps) {
  const itensEmBaixa = kpis?.itensEmBaixa ?? 0
  const pedidosAbertos = vendasKpis?.pedidosAbertos ?? 0
  const totalReceber = resumo?.recebimentosPendentes?.total ?? 0
  const qtdReceber = resumo?.recebimentosPendentes?.quantidade ?? 0
  const lucroReal = resumo?.lucroReal ?? 0

  const hasAnyAlert = itensEmBaixa > 0 || pedidosAbertos > 0 || qtdReceber > 0

  return (
    <div id="secao-resumo" className="space-y-4">
      {/* 4 Cards Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Receita Recebida"
          value={resumo ? formatCurrency.format(resumo.receita) : (vendasKpis ? formatCurrency.format(vendasKpis.receitaMes) : '—')}
          icon={<DollarSign size={20} />}
          variant="emerald"
          isLoading={isLoadingResumo || isLoadingVendas}
          subtitle="Entradas liquidadas no mês (regime de caixa)"
        />
        <KpiCard
          title="Lucro Real Estimado"
          value={resumo ? formatCurrency.format(lucroReal) : '—'}
          icon={<PiggyBank size={20} />}
          variant={lucroReal >= 0 ? 'emerald' : 'rose'}
          isLoading={isLoadingResumo}
          subtitle="Receita − Despesas − COGS"
        />
        <KpiCard
          title="Volume de Pedidos"
          value={vendasKpis?.totalPedidosMes ?? '—'}
          icon={<ShoppingBag size={20} />}
          variant="blue"
          isLoading={isLoadingVendas}
          to="/vendas/pedidos"
          subtitle="Total de pedidos no mês"
        />
        <KpiCard
          title="Total em Estoque"
          value={kpis ? formatCurrency.format(kpis.totalEstoque) : '—'}
          icon={<Package size={20} />}
          variant="purple"
          isLoading={isLoadingKpis}
          to="/estoque-insumos"
          subtitle="Valor do inventário ativo"
        />
      </div>

      {/* Faixa de Alertas e Ações Rápidas */}
      {hasAnyAlert && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-900 font-semibold">
            <AlertTriangle size={16} className="text-amber-600 shrink-0" />
            <span>Atenção Operacional no Momento:</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {itensEmBaixa > 0 && (
              <Link
                to="/estoque-insumos"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-100/90 text-red-800 hover:bg-red-200 transition-colors font-medium border border-red-200 shadow-2xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <strong>{itensEmBaixa}</strong> produto(s) em baixa no estoque
              </Link>
            )}

            {pedidosAbertos > 0 && (
              <Link
                to="/vendas/mural"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100/90 text-amber-900 hover:bg-amber-200 transition-colors font-medium border border-amber-300 shadow-2xs"
              >
                <Clock size={12} className="text-amber-700" />
                <strong>{pedidosAbertos}</strong> pedido(s) em aberto no mural
              </Link>
            )}

            {qtdReceber > 0 && (
              <Link
                to="/financeiro/contas-receber"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100/90 text-emerald-900 hover:bg-emerald-200 transition-colors font-medium border border-emerald-300 shadow-2xs"
              >
                <HandCoins size={12} className="text-emerald-700" />
                <strong>{formatCurrency.format(totalReceber)}</strong> a receber ({qtdReceber})
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}


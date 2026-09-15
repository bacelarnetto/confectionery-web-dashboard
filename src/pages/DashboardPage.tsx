import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { RotateCw, Calendar } from 'lucide-react'
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
import DashboardQuickNav from '../modules/dashboard/components/DashboardQuickNav'
import DestaquesExecutivos from '../modules/dashboard/components/DestaquesExecutivos'
import VendasBlock from '../modules/dashboard/components/VendasBlock'
import EstoqueBlock from '../modules/dashboard/components/EstoqueBlock'
import FinanceiroBlock from '../modules/dashboard/components/FinanceiroBlock'

function mesAtual(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function getMesNomeFormatado(): string {
  const now = new Date()
  const nomeMes = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(now)
  const ano = now.getFullYear()
  return `${nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)} de ${ano}`
}

export default function DashboardPage() {
  const queryClient = useQueryClient()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const formatCurrency = useMemo(
    () => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }),
    []
  )

  const mes = useMemo(() => mesAtual(), [])
  const mesFormatado = useMemo(() => getMesNomeFormatado(), [])

  // Dados do Dashboard
  const { data: kpis, isLoading: kpisLoading } = useDashboardKpis()
  const { data: movimentacoes, isLoading: movLoading } = useMovimentacoesRecentes()
  const { data: estoqueVolumes, isLoading: estLoading } = useEstoqueMaioresVolumes()
  const { data: historicoCompras, isLoading: hisLoading } = useHistoricoCompras()
  const { data: vendasKpis, isLoading: vendKpisLoading } = useVendasKpis()
  const { data: topProdutos, isLoading: topLoading } = useTopProdutos()
  const { data: pedidosStatus, isLoading: statusLoading } = usePedidosPorStatus()
  const { data: resumo, isLoading: resumoLoading } = useResumoMes(mes)

  async function handleRefresh() {
    setIsRefreshing(true)
    await queryClient.invalidateQueries({
      predicate: (query) =>
        (typeof query.queryKey[0] === 'string' && query.queryKey[0].startsWith('dashboard')) ||
        query.queryKey[0] === 'financeiro',
    })
    setTimeout(() => setIsRefreshing(false), 500)
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Cabeçalho Principal do Dashboard */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Painel de Controle</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">
              <Calendar size={12} />
              {mesFormatado}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Visão unificada das vendas, estoque, compras e saúde financeira da confeitaria.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors cursor-pointer disabled:opacity-60 shadow-2xs"
            title="Atualizar todos os dados do painel"
          >
            <RotateCw size={14} className={isRefreshing ? 'animate-spin text-amber-600' : ''} />
            <span>{isRefreshing ? 'Atualizando...' : 'Atualizar Dados'}</span>
          </button>
        </div>
      </div>

      {/* Barra de Navegação Rápida com Badges */}
      <DashboardQuickNav
        pedidosAbertosCount={vendasKpis?.pedidosAbertos}
        itensEmBaixaCount={kpis?.itensEmBaixa}
        contasPendentesCount={resumo?.recebimentosPendentes?.quantidade}
      />

      {/* 1. Destaques Executivos & Alertas */}
      <DestaquesExecutivos
        kpis={kpis}
        vendasKpis={vendasKpis}
        resumo={resumo}
        isLoadingKpis={kpisLoading}
        isLoadingVendas={vendKpisLoading}
        isLoadingResumo={resumoLoading}
        formatCurrency={formatCurrency}
      />

      {/* 2. Bloco Vendas & Pedidos */}
      <VendasBlock
        kpis={vendasKpis}
        topProdutos={topProdutos}
        pedidosStatus={pedidosStatus}
        isLoadingKpis={vendKpisLoading}
        isLoadingTop={topLoading}
        isLoadingStatus={statusLoading}
        formatCurrency={formatCurrency}
      />

      {/* 3. Bloco Estoque & Insumos */}
      <EstoqueBlock
        kpis={kpis}
        movimentacoes={movimentacoes}
        estoqueVolumes={estoqueVolumes}
        isLoadingKpis={kpisLoading}
        isLoadingMov={movLoading}
        isLoadingEst={estLoading}
        formatCurrency={formatCurrency}
      />

      {/* 4. Bloco Financeiro & Compras */}
      <FinanceiroBlock
        resumo={resumo}
        historicoCompras={historicoCompras}
        isLoadingResumo={resumoLoading}
        isLoadingHistorico={hisLoading}
        formatCurrency={formatCurrency}
        mesFormatado={mesFormatado}
      />
    </div>
  )
}

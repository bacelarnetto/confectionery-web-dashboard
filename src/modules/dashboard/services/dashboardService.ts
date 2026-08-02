import api from '../../../lib/axios'

export interface DashboardKpis {
  totalEstoque: number
  comprasMes: number
  itensEmBaixa: number
  fornecedoresAtivos: number
}

export interface MovimentacaoDia {
  date: string
  entradas: number
  saidas: number
}

export interface EstoqueVolume {
  name: string
  qtd: number
}

export interface HistoricoCompra {
  month: string
  expenses: number
}

export interface VendasKpis {
  totalPedidosMes: number
  receitaMes: number
  pedidosAbertos: number
  ticketMedio: number
}

export interface TopProduto {
  nome: string
  totalVendido: number
}

export interface PedidoStatus {
  status: string
  total: number
}

const dashboardService = {
  getKpis(): Promise<DashboardKpis> {
    return api.get<DashboardKpis>('/dashboard/kpis').then((res) => res.data)
  },

  getMovimentacoesRecentes(): Promise<MovimentacaoDia[]> {
    return api.get<MovimentacaoDia[]>('/dashboard/movimentacoes-recentes').then((res) => res.data)
  },

  getEstoqueMaioresVolumes(): Promise<EstoqueVolume[]> {
    return api.get<EstoqueVolume[]>('/dashboard/estoque-maiores-volumes').then((res) => res.data)
  },

  getHistoricoCompras(): Promise<HistoricoCompra[]> {
    return api.get<HistoricoCompra[]>('/dashboard/historico-compras').then((res) => res.data)
  },

  getVendasKpis(): Promise<VendasKpis> {
    return api.get<VendasKpis>('/dashboard/vendas-kpis').then((res) => res.data)
  },

  getTopProdutos(): Promise<TopProduto[]> {
    return api.get<TopProduto[]>('/dashboard/top-produtos').then((res) => res.data)
  },

  getPedidosPorStatus(): Promise<PedidoStatus[]> {
    return api.get<PedidoStatus[]>('/dashboard/pedidos-por-status').then((res) => res.data)
  },
}

export default dashboardService

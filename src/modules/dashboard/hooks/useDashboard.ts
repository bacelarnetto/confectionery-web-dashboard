import { useQuery } from '@tanstack/react-query'
import dashboardService from '../services/dashboardService'

export function useDashboardKpis() {
  return useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: () => dashboardService.getKpis(),
    staleTime: 60_000,
  })
}

export function useMovimentacoesRecentes() {
  return useQuery({
    queryKey: ['dashboard-movimentacoes'],
    queryFn: () => dashboardService.getMovimentacoesRecentes(),
    staleTime: 60_000,
  })
}

export function useEstoqueMaioresVolumes() {
  return useQuery({
    queryKey: ['dashboard-estoque-volumes'],
    queryFn: () => dashboardService.getEstoqueMaioresVolumes(),
    staleTime: 60_000,
  })
}

export function useHistoricoCompras() {
  return useQuery({
    queryKey: ['dashboard-historico-compras'],
    queryFn: () => dashboardService.getHistoricoCompras(),
    staleTime: 60_000,
  })
}

export function useVendasKpis() {
  return useQuery({
    queryKey: ['dashboard-vendas-kpis'],
    queryFn: () => dashboardService.getVendasKpis(),
    staleTime: 60_000,
  })
}

export function useTopProdutos() {
  return useQuery({
    queryKey: ['dashboard-top-produtos'],
    queryFn: () => dashboardService.getTopProdutos(),
    staleTime: 60_000,
  })
}

export function usePedidosPorStatus() {
  return useQuery({
    queryKey: ['dashboard-pedidos-por-status'],
    queryFn: () => dashboardService.getPedidosPorStatus(),
    staleTime: 60_000,
  })
}

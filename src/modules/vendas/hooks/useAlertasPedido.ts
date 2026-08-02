import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import alertaPedidoService from '../services/alertaPedidoService'

export function useAlertasPedidoAtivos() {
  return useQuery({
    queryKey: ['alertas-pedido', 'ativos'],
    queryFn: () => alertaPedidoService.getAtivos(),
    staleTime: 30_000,
  })
}

export function useCountAlertasPedidoAtivos() {
  return useQuery({
    queryKey: ['alertas-pedido', 'count'],
    queryFn: () => alertaPedidoService.countAtivos(),
    staleTime: 30_000,
  })
}

export function useReconhecerAlertaPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => alertaPedidoService.reconhecer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertas-pedido'] })
    },
  })
}

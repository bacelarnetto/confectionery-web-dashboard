import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import pedidoService from '../services/pedidoService'
import { PedidoInsertForm, PedidoUpdateForm, PagamentoPedidoInsertForm } from '../types/pedido'

const QUERY_KEY = ['pedidos']

export function usePedidos(page = 0, size = 20, filters?: { clienteId?: number; status?: string }) {
  return useQuery({
    queryKey: [...QUERY_KEY, page, size, filters],
    queryFn: () => pedidoService.getAll(page, size, filters),
  })
}

export function usePedido(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => pedidoService.getById(id),
    enabled: id > 0,
  })
}

export function useCreatePedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PedidoInsertForm) => pedidoService.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); toast.success('Pedido registrado!') },
  })
}

export function useUpdatePedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PedidoUpdateForm }) => pedidoService.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); toast.success('Pedido atualizado!') },
  })
}

export function useUpdatePedidoStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => pedidoService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      // Virar ENTREGUE (ou sair desse status, ex: reabrir) muda se o pedido aparece em contas a
      // receber -- sem isso o ícone de "entregue mas não pago" na lista fica com dado velho.
      queryClient.invalidateQueries({ queryKey: ['contas-receber'] })
      toast.success('Status atualizado!')
    },
  })
}

export function usePagamentosPedido(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id, 'pagamentos'],
    queryFn: () => pedidoService.getPagamentosPedido(id),
    enabled: id > 0,
  })
}

export function useRegistrarPagamentoPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PagamentoPedidoInsertForm }) =>
      pedidoService.registrarPagamentoPedido(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['contas-receber'] })
      queryClient.invalidateQueries({ queryKey: ['resumo'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-vendas-kpis'] })
      toast.success('Pagamento registrado!')
    },
  })
}

export function useDownloadReciboPagamento() {
  return useMutation({
    mutationFn: (pedidoId: number) => pedidoService.getReciboPagamentoPdf(pedidoId),
    onSuccess: (data, pedidoId) => {
      const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `recibo-pedido-${pedidoId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Download em andamento...')
    },
    onError: () => {
      toast.error('Erro ao baixar recibo de pagamento.')
    },
  })
}

export function useUpdateMotivoPendenciaPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, motivoPendencia }: { id: number; motivoPendencia?: string }) =>
      pedidoService.updateMotivoPendencia(id, motivoPendencia),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['contas-receber'] })
      toast.success('Motivo de pendência atualizado!')
    },
  })
}

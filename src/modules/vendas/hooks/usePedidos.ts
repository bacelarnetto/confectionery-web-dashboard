import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import pedidoService from '../services/pedidoService'
import { PedidoInsertForm, PedidoUpdateForm } from '../types/pedido'

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
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); toast.success('Status atualizado!') },
  })
}

export function useDeletePedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => pedidoService.remove(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); toast.success('Pedido removido!') },
  })
}

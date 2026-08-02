import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import clienteService from '../services/clienteService'
import { ClienteInsertForm, ClienteUpdateForm } from '../types/cliente'

const QUERY_KEY = ['clientes']

export function useClientes(page = 0, size = 20, filters?: { nome?: string }) {
  return useQuery({
    queryKey: [...QUERY_KEY, page, size, filters],
    queryFn: () => clienteService.getAll(page, size, filters),
  })
}

export function useCliente(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => clienteService.getById(id),
    enabled: id > 0,
  })
}

export function useCreateCliente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ClienteInsertForm) => clienteService.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); toast.success('Cliente cadastrado!') },
  })
}

export function useUpdateCliente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ClienteUpdateForm }) => clienteService.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); toast.success('Cliente atualizado!') },
  })
}

export function useDeleteCliente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => clienteService.remove(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); toast.success('Cliente removido!') },
  })
}

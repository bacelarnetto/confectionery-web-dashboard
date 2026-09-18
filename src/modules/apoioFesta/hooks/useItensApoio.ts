import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import itemApoioService from '../services/itemApoioService'
import { ItemApoioInsertForm, ItemApoioUpdateForm } from '../types/itemApoio'

const QUERY_KEY = ['itens-apoio']

export function useItensApoio(page = 0, size = 50) {
  return useQuery({
    queryKey: [...QUERY_KEY, page, size],
    queryFn: () => itemApoioService.getAll(page, size),
  })
}

export function useItemApoio(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => itemApoioService.getById(id),
    enabled: id > 0,
  })
}

export function useCreateItemApoio() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ItemApoioInsertForm) => itemApoioService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Item de apoio criado com sucesso!')
    },
  })
}

export function useUpdateItemApoio() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ItemApoioUpdateForm }) =>
      itemApoioService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Item de apoio atualizado com sucesso!')
    },
  })
}

export function useDeleteItemApoio() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => itemApoioService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Item de apoio removido com sucesso!')
    },
  })
}

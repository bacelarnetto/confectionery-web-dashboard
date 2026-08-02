import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import insumoService from '../services/insumoService'
import { InsumoInsertForm, InsumoUpdateForm } from '../types/insumo'

const QUERY_KEY = ['insumos']

export function useInsumos(
  page = 0,
  size = 20,
  filters?: { id?: number; categoriaId?: number; nome?: string }
) {
  return useQuery({
    queryKey: [...QUERY_KEY, page, size, filters],
    queryFn: () => insumoService.getAll(page, size, filters),
  })
}

export function useInsumo(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => insumoService.getById(id),
    enabled: id > 0,
  })
}

export function useCreateInsumo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: InsumoInsertForm) => insumoService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Insumo criado com sucesso!')
    },
  })
}

export function useUpdateInsumo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: InsumoUpdateForm }) =>
      insumoService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Insumo atualizado com sucesso!')
    },
  })
}

export function useDeleteInsumo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => insumoService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Insumo removido com sucesso!')
    },
  })
}

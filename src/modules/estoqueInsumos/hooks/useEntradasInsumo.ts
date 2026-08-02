import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import entradaInsumoService from '../services/entradaInsumoService'
import { EntradaInsumoInsertForm, EntradaInsumoUpdateForm } from '../types/entradaInsumo'

const QUERY_KEY = ['entradas-insumo']

export function useEntradasInsumo(
  page = 0,
  size = 20,
  filters?: {
    compraId?: number;
    dataInicial?: string;
    dataFinal?: string;
  }
) {
  return useQuery({
    queryKey: [...QUERY_KEY, page, size, filters],
    queryFn: () => entradaInsumoService.getAll(page, size, filters),
  })
}

export function useEntradaInsumo(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => entradaInsumoService.getById(id),
    enabled: id > 0,
  })
}

export function useCreateEntradaInsumo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: EntradaInsumoInsertForm) => entradaInsumoService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Entrada criada com sucesso!')
    },
  })
}

export function useUpdateEntradaInsumo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EntradaInsumoUpdateForm }) =>
      entradaInsumoService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Entrada atualizada com sucesso!')
    },
  })
}

export function useDeleteEntradaInsumo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => entradaInsumoService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Entrada removida com sucesso!')
    },
  })
}

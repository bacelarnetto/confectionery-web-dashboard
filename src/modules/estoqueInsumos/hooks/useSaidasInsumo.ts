import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import saidaInsumoService from '../services/saidaInsumoService'
import { SaidaInsumoInsertForm } from '../types/saidaInsumo'

const QUERY_KEY = ['saidas-insumo']

export function useSaidasInsumo(
  page = 0,
  size = 20,
  filters?: {
    tipoId?: number;
    dataInicial?: string;
    dataFinal?: string;
  }
) {
  return useQuery({
    queryKey: [...QUERY_KEY, page, size, filters],
    queryFn: () => saidaInsumoService.getAll(page, size, filters),
  })
}

export function useSaidaInsumo(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => saidaInsumoService.getById(id),
    enabled: id > 0,
  })
}

export function useCreateSaidaInsumo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SaidaInsumoInsertForm) => saidaInsumoService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Saída criada com sucesso!')
    },
  })
}

export function useDeleteSaidaInsumo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => saidaInsumoService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Saída removida com sucesso!')
    },
  })
}

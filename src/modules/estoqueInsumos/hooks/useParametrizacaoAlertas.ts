import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import parametrizacaoAlertaService from '../services/parametrizacaoAlertaService'
import { ParametrizacaoAlertaInsertForm, ParametrizacaoAlertaUpdateForm } from '../types/alerta'

const QUERY_KEY = ['parametrizacao-alertas']

export function useParametrizacaoAlertas() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => parametrizacaoAlertaService.getAll(),
  })
}

export function useParametrizacaoAlerta(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => parametrizacaoAlertaService.getById(id),
    enabled: id > 0,
  })
}

export function useParametrizacaoPorInsumo(insumoId: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'insumo', insumoId],
    queryFn: () => parametrizacaoAlertaService.getByInsumoId(insumoId),
    enabled: insumoId > 0,
    retry: false, // Prevents react-query from retrying indefinitely if it errors with 404 (not configured yet)
  })
}

export function useCreateParametrizacaoAlerta() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ParametrizacaoAlertaInsertForm) => parametrizacaoAlertaService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Parametrização criada!')
    },
    onError: () => toast.error('Erro ao criar parametrização.'),
  })
}

export function useUpdateParametrizacaoAlerta() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ParametrizacaoAlertaUpdateForm }) =>
      parametrizacaoAlertaService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Parametrização atualizada!')
    },
    onError: () => toast.error('Erro ao atualizar parametrização.'),
  })
}

export function useDeleteParametrizacaoAlerta() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => parametrizacaoAlertaService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Parametrização removida!')
    },
    onError: () => toast.error('Erro ao remover parametrização.'),
  })
}

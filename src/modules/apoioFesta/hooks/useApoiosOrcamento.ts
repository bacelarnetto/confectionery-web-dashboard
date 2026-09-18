import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import apoioOrcamentoService from '../services/apoioOrcamentoService'
import { ApoioOrcamentoInsertForm } from '../types/apoioOrcamento'

const QUERY_KEY = ['apoios-orcamento']

export function useApoiosOrcamento(orcamentoId: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, orcamentoId],
    queryFn: () => apoioOrcamentoService.getAll(orcamentoId),
    enabled: orcamentoId > 0,
  })
}

export function useCreateApoioOrcamento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ApoioOrcamentoInsertForm) => apoioOrcamentoService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Apoio de festa proposto no orçamento!')
    },
  })
}

export function useRemoverApoioOrcamento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => apoioOrcamentoService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Apoio removido da proposta.')
    },
  })
}

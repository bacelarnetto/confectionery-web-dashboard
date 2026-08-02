import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import fabricacaoService from '../services/fabricacaoService'
import { FabricacaoInsertForm } from '../types/fabricacao'

const QUERY_KEY = ['fabricacoes']

export function useFabricacoes(page = 0, size = 20) {
  return useQuery({
    queryKey: [...QUERY_KEY, page, size],
    queryFn: () => fabricacaoService.getAll(page, size),
  })
}

export function useCreateFabricacao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: FabricacaoInsertForm) => fabricacaoService.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); queryClient.invalidateQueries({ queryKey: ['estoque-produto'] }); toast.success('Fabricação registrada!') },
  })
}

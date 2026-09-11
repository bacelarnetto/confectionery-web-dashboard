import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import dadosEmissorService from '../services/dadosEmissorService'
import { DadosEmissorUpdateForm } from '../types/dadosEmissor'

const QUERY_KEY = ['dados-emissor']

export function useDadosEmissor() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => dadosEmissorService.get(),
  })
}

export function useUpdateDadosEmissor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: DadosEmissorUpdateForm) => dadosEmissorService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Dados da empresa atualizados!')
    },
  })
}

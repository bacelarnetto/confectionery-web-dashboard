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

export function useLogoDadosEmissor(enabled: boolean) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'logo'],
    queryFn: () => dadosEmissorService.getLogo(),
    enabled,
  })
}

export function useUploadLogoDadosEmissor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ arquivo, usuario }: { arquivo: File; usuario: string }) =>
      dadosEmissorService.uploadLogo(arquivo, usuario),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Logo enviado!')
    },
  })
}

export function useDeleteLogoDadosEmissor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (usuario: string) => dadosEmissorService.deleteLogo(usuario),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Logo removido!')
    },
  })
}

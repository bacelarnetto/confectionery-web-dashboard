import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import alertaProdutoService from '../services/alertaProdutoService'

const QUERY_KEY = ['alertas-produto']

export function useAlertasProduto(
  page = 0,
  size = 20,
  filters?: { ativo?: boolean; tipoId?: number }
) {
  return useQuery({
    queryKey: [...QUERY_KEY, page, size, filters],
    queryFn: () => alertaProdutoService.getAll(page, size, filters),
  })
}

export function useAlertasProdutoCountAtivos() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'count-ativos'],
    queryFn: () => alertaProdutoService.countAtivos(),
    staleTime: 60_000,
    refetchInterval: 60_000,
  })
}

export function useResolverAlertaProduto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => alertaProdutoService.resolver(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Alerta resolvido!')
    },
    onError: () => toast.error('Erro ao resolver alerta.'),
  })
}

export function useVerificarAlertasProduto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => alertaProdutoService.verificar(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Verificação concluída!')
    },
    onError: () => toast.error('Erro ao verificar alertas.'),
  })
}

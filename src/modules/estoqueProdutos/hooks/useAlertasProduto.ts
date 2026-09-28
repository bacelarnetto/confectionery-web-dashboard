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

// Sino do header (mesma política do F4, reteste 2026-09-28): polling, foco da janela, refetch
// ao abrir o dropdown e invalidação pelo MutationCache (main.tsx).
export function useAlertasProdutoCountAtivos() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'count-ativos'],
    // Polling em background (sino e menu lateral): sem toast; a falha aparece no dropdown do sino.
    queryFn: () => alertaProdutoService.countAtivos({ silentError: true }),
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  })
}

export function useAlertasProdutoRecentes(size = 5) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'recentes', size],
    queryFn: () => alertaProdutoService.getAll(0, size, { ativo: true }, { silentError: true }),
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
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

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import alertaService from '../services/alertaService'

const QUERY_KEY = ['alertas']

export function useAlertas(
  page = 0,
  size = 20,
  filters?: { ativo?: boolean; tipoId?: number }
) {
  return useQuery({
    queryKey: [...QUERY_KEY, page, size, filters],
    queryFn: () => alertaService.getAll(page, size, filters),
  })
}

export function useAlertasCountAtivos() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'count-ativos'],
    queryFn: () => alertaService.countAtivos(),
    staleTime: 60_000,
    refetchInterval: 60_000,
  })
}

export function useResolverAlerta() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => alertaService.resolver(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Alerta resolvido!')
    },
    onError: () => toast.error('Erro ao resolver alerta.'),
  })
}

export function useVerificarAlertas() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => alertaService.verificar(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Verificação concluída!')
    },
    onError: () => toast.error('Erro ao verificar alertas.'),
  })
}

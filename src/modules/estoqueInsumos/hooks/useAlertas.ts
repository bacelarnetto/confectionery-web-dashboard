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

// Sino do header (reteste 2026-09-28, F4): o header fica montado a sessão inteira, então sem
// polling a lista do dropdown só era buscada no boot -- a contagem tinha refetchInterval, a
// lista não. As duas agora atualizam por polling, ao voltar o foco da janela e ao abrir o
// dropdown (refetch no Header); depois de qualquer mutation, o MutationCache (main.tsx) invalida.
export function useAlertasCountAtivos() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'count-ativos'],
    // Polling em background (sino e menu lateral): sem toast; a falha aparece no dropdown do sino.
    queryFn: () => alertaService.countAtivos({ silentError: true }),
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  })
}

export function useAlertasRecentes(size = 5) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'recentes', size],
    queryFn: () => alertaService.getAll(0, size, { ativo: true }, { silentError: true }),
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
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

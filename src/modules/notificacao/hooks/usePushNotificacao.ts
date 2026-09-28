import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import pushSubscriptionService from '../services/pushSubscriptionService'
import { isPushSuportado, getInscricaoLocal, inscrever, desinscreverLocal, endpointDe } from '../lib/webPush'

const QUERY_KEY = ['push-subscription']
// Fora de QUERY_KEY de propósito: as invalidações de ativar/desativar não devem rebuscar a chave.
const VAPID_QUERY_KEY = ['push-vapid-public-key']

export interface EstadoPush {
  // Inscrição do servidor aponta para ESTE navegador (mesmo endpoint da inscrição local).
  ativoNesteNavegador: boolean
  // Usuário tem inscrição, mas de outro navegador -- ativar aqui substitui (1 por usuário).
  ativoEmOutroNavegador: boolean
}

export function usePushNotificacao(usuario: string) {
  const queryClient = useQueryClient()
  const suportado = isPushSuportado()

  // Buscada uma vez por sessão (só em navegador com Push API); null = sem chave no backend.
  const chave = useQuery({
    queryKey: VAPID_QUERY_KEY,
    enabled: suportado,
    staleTime: Infinity,
    retry: false,
    queryFn: pushSubscriptionService.getVapidPublicKey,
  })
  const vapidPublicKey = chave.data ?? null
  const habilitado = suportado && !!vapidPublicKey

  const estado = useQuery({
    queryKey: [...QUERY_KEY, usuario],
    enabled: habilitado,
    queryFn: async (): Promise<EstadoPush> => {
      const [servidor, local] = await Promise.all([pushSubscriptionService.get(usuario), getInscricaoLocal()])
      const endpointServidor = endpointDe(servidor?.subscriptionJson)
      const ativoNesteNavegador = !!local && !!endpointServidor && local.endpoint === endpointServidor
      return { ativoNesteNavegador, ativoEmOutroNavegador: !!servidor && !ativoNesteNavegador }
    },
  })

  const ativar = useMutation({
    mutationFn: async () => {
      const sub = await inscrever(vapidPublicKey!)
      try {
        await pushSubscriptionService.registrar(sub)
      } catch (err) {
        // Não deixa uma inscrição local órfã que o backend não conhece.
        await sub.unsubscribe().catch(() => undefined)
        throw err
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Notificações ativadas neste navegador.')
    },
    onError: (err) => {
      // Erros HTTP já viram toast no interceptor do axios; aqui só os do navegador.
      if (err instanceof Error && err.message === 'PERMISSAO_NEGADA') {
        toast.error('Permissão de notificação negada no navegador.')
      } else if (!(err as { isAxiosError?: boolean })?.isAxiosError) {
        toast.error('Não foi possível ativar as notificações neste navegador.')
      }
    },
  })

  const desativar = useMutation({
    mutationFn: async () => {
      await pushSubscriptionService.remover(usuario)
      await desinscreverLocal()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Notificações desativadas neste navegador.')
    },
    onError: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })

  return { suportado, habilitado, carregandoChave: chave.isLoading, estado, ativar, desativar }
}

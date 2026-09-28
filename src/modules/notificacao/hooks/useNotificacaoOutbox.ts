import { useQuery } from '@tanstack/react-query'
import notificacaoOutboxService from '../services/notificacaoOutboxService'
import { NotificacaoOutboxStatus } from '../types/notificacaoOutbox'

const QUERY_KEY = ['notificacao-outbox']

export function useNotificacaoOutbox(page = 0, size = 20, status?: NotificacaoOutboxStatus) {
  return useQuery({
    queryKey: [...QUERY_KEY, page, size, status ?? ''],
    queryFn: () => notificacaoOutboxService.getAll(page, size, status),
  })
}

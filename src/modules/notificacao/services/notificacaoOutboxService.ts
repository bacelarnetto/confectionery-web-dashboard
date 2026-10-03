import api from '../../../lib/axios'
import { normalizePage, RawPage, PageResponse } from '../../../lib/pagination'
import { NotificacaoOutbox, NotificacaoOutboxStatus } from '../types/notificacaoOutbox'

const notificacaoOutboxService = {
  // Só ADMIN (403 para os demais perfis).
  getAll(page = 0, size = 20, status?: NotificacaoOutboxStatus): Promise<PageResponse<NotificacaoOutbox>> {
    return api
      .get<RawPage<NotificacaoOutbox>>('/notificacao/outbox', {
        params: { page, size, ...(status ? { status } : {}) },
      })
      .then((res) => normalizePage(res.data))
  },
}

export default notificacaoOutboxService

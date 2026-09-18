import api from '../../../lib/axios'
import { ApoioFesta, ApoioFestaInsertForm, ApoioFestaStatus } from '../types/apoioFesta'
import { normalizePage, RawPage, PageResponse } from '../../../lib/pagination'

export type { PageResponse }

export interface ApoioFestaFiltros {
  pedidoId?: number
  itemApoioId?: number
  status?: ApoioFestaStatus
  /** Instant (ISO com hora, ex. "2026-09-20T12:00:00Z") -- o backend deriva o dia calendário a
   * partir dele (fuso America/Sao_Paulo). Nunca mandar uma data pura, o back não usa LocalDate
   * em nenhuma superfície pública. */
  dia?: string
}

const apoioFestaService = {
  getAll(page = 0, size = 20, filtros?: ApoioFestaFiltros): Promise<PageResponse<ApoioFesta>> {
    return api
      .get<RawPage<ApoioFesta>>('/apoio-festa', { params: { page, size, ...filtros } })
      .then((res) => normalizePage(res.data))
  },

  create(data: ApoioFestaInsertForm): Promise<ApoioFesta> {
    return api.post<ApoioFesta>('/apoio-festa', data).then((res) => res.data)
  },

  cancelar(id: number): Promise<ApoioFesta> {
    return api
      .put<ApoioFesta>(`/apoio-festa/${id}/cancelar`, null, { headers: { usuario: '' } })
      .then((res) => res.data)
  },
}

export default apoioFestaService

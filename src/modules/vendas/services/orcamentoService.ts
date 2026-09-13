import api from '../../../lib/axios'
import { Orcamento, OrcamentoInsertForm, OrcamentoUpdateForm } from '../types/orcamento'
import { normalizePage, RawPage, PageResponse } from '../../../lib/pagination'

export type { PageResponse }

const orcamentoService = {
  getAll(
    page = 0,
    size = 20,
    filters?: { clienteId?: number; status?: string },
  ): Promise<PageResponse<Orcamento>> {
    return api.get<RawPage<Orcamento>>('/orcamento', { params: { page, size, ...filters } }).then((r) => normalizePage(r.data))
  },
  getById(id: number): Promise<Orcamento> {
    return api.get(`/orcamento/${id}`).then((r) => r.data)
  },
  create(data: OrcamentoInsertForm): Promise<Orcamento> {
    return api.post('/orcamento', data, { skipErrorToast: true }).then((r) => r.data)
  },
  update(id: number, data: OrcamentoUpdateForm): Promise<Orcamento> {
    return api.put(`/orcamento/${id}`, data, { skipErrorToast: true }).then((r) => r.data)
  },
  updateStatus(id: number, status: string): Promise<Orcamento> {
    return api
      .put(`/orcamento/${id}/status`, { status }, { headers: { usuario: '' }, skipErrorToast: true })
      .then((r) => r.data)
  },
  getPdf(id: number): Promise<{ blob: Blob; contentDisposition?: string }> {
    return api
      .get(`/orcamento/${id}/pdf`, { responseType: 'blob' })
      .then((r) => ({ blob: r.data, contentDisposition: r.headers['content-disposition'] }))
  },
}

export default orcamentoService

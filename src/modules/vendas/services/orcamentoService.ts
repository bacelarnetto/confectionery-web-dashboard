import api from '../../../lib/axios'
import { Orcamento, OrcamentoInsertForm, OrcamentoUpdateForm } from '../types/orcamento'

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

const orcamentoService = {
  getAll(
    page = 0,
    size = 20,
    filters?: { clienteId?: number; status?: string },
  ): Promise<PageResponse<Orcamento>> {
    return api.get('/orcamento', { params: { page, size, ...filters } }).then((r) => r.data)
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
      .put(`/orcamento/${id}/status`, { status }, { headers: { usuario: 'netto' }, skipErrorToast: true })
      .then((r) => r.data)
  },
  getPdf(id: number): Promise<Blob> {
    return api.get(`/orcamento/${id}/pdf`, { responseType: 'blob' }).then((r) => r.data)
  },
}

export default orcamentoService

import api from '../../../lib/axios'
import { FormaPagamento, FormaPagamentoInsertForm, FormaPagamentoUpdateForm } from '../types/formaPagamento'
import { normalizePage, RawPage, PageResponse } from '../../../lib/pagination'

export type { PageResponse }

const formaPagamentoService = {
  getAll(page = 0, size = 50, nome?: string): Promise<PageResponse<FormaPagamento>> {
    return api
      .get<RawPage<FormaPagamento>>('/forma-pagamento', { params: { page, size, ...(nome ? { nome } : {}) } })
      .then((res) => normalizePage(res.data))
  },

  getById(id: number): Promise<FormaPagamento> {
    return api.get<FormaPagamento>(`/forma-pagamento/${id}`).then((res) => res.data)
  },

  create(data: FormaPagamentoInsertForm): Promise<FormaPagamento> {
    return api.post<FormaPagamento>('/forma-pagamento', data).then((res) => res.data)
  },

  update(id: number, data: FormaPagamentoUpdateForm): Promise<FormaPagamento> {
    return api.put<FormaPagamento>(`/forma-pagamento/${id}`, data).then((res) => res.data)
  },

  remove(id: number): Promise<void> {
    return api.delete(`/forma-pagamento/${id}`, { headers: { usuario: '' } }).then(() => undefined)
  },
}

export default formaPagamentoService

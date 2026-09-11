import api from '../../../lib/axios'
import { FormaPagamento, FormaPagamentoInsertForm, FormaPagamentoUpdateForm } from '../types/formaPagamento'

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

const formaPagamentoService = {
  getAll(page = 0, size = 50, nome?: string): Promise<PageResponse<FormaPagamento>> {
    return api
      .get<PageResponse<FormaPagamento>>('/forma-pagamento', { params: { page, size, ...(nome ? { nome } : {}) } })
      .then((res) => res.data)
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
    return api.delete(`/forma-pagamento/${id}`, { headers: { usuario: 'netto' } }).then(() => undefined)
  },
}

export default formaPagamentoService

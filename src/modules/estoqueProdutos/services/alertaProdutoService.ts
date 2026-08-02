import api from '../../../lib/axios'
import { AlertaProduto } from '../types/alertaProduto'

interface PageResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  number: number
}

const alertaProdutoService = {
  getAll(
    page = 0,
    size = 20,
    filters?: { ativo?: boolean; tipoId?: number }
  ): Promise<PageResponse<AlertaProduto>> {
    return api
      .get<PageResponse<AlertaProduto>>('/alerta-produto', { params: { page, size, ...filters } })
      .then((res) => res.data)
  },

  getById(id: number): Promise<AlertaProduto> {
    return api.get<AlertaProduto>(`/alerta-produto/${id}`).then((res) => res.data)
  },

  countAtivos(): Promise<number> {
    return api.get<number>('/alerta-produto/count-ativos').then((res) => res.data)
  },

  resolver(id: number): Promise<AlertaProduto> {
    return api
      .put<AlertaProduto>(`/alerta-produto/${id}/resolver`, null, { headers: { usuario: 'netto' } })
      .then((res) => res.data)
  },

  verificar(): Promise<void> {
    return api.post('/alerta-produto/verificar').then(() => undefined)
  },
}

export default alertaProdutoService

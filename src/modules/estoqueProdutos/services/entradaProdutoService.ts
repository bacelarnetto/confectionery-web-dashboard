import api from '../../../lib/axios'
import { EntradaProduto, EntradaProdutoInsertForm } from '../types/entradaProduto'

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

const entradaProdutoService = {
  getAll(page = 0, size = 20): Promise<PageResponse<EntradaProduto>> {
    return api.get<PageResponse<EntradaProduto>>('/entrada-produto', { params: { page, size } }).then((r) => r.data)
  },
  getById(id: number): Promise<EntradaProduto> {
    return api.get<EntradaProduto>(`/entrada-produto/${id}`).then((r) => r.data)
  },
  create(data: EntradaProdutoInsertForm): Promise<EntradaProduto> {
    return api.post<EntradaProduto>('/entrada-produto', data, { skipErrorToast: true }).then((r) => r.data)
  },
}

export default entradaProdutoService

import api from '../../../lib/axios'
import { Produto, ProdutoInsertForm, ProdutoUpdateForm } from '../types/produto'

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

const produtoService = {
  getAll(page = 0, size = 20, filters?: { nome?: string }): Promise<PageResponse<Produto>> {
    return api.get('/produto', { params: { page, size, ...filters } }).then((r) => r.data)
  },
  getById(id: number): Promise<Produto> {
    return api.get(`/produto/${id}`).then((r) => r.data)
  },
  create(data: ProdutoInsertForm): Promise<Produto> {
    return api.post('/produto', data).then((r) => r.data)
  },
  update(id: number, data: ProdutoUpdateForm): Promise<Produto> {
    return api.put(`/produto/${id}`, data).then((r) => r.data)
  },
  remove(id: number): Promise<void> {
    return api.delete(`/produto/${id}`, { headers: { usuario: 'netto' } }).then(() => undefined)
  },
}

export default produtoService

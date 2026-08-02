import api from '../../../lib/axios'
import { Complemento, ComplementoInsertForm, ComplementoUpdateForm } from '../types/complemento'

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

const complementoService = {
  getAll(page = 0, size = 20, filters?: { nome?: string }): Promise<PageResponse<Complemento>> {
    return api.get('/complemento', { params: { page, size, ...filters } }).then((r) => r.data)
  },
  getById(id: number): Promise<Complemento> {
    return api.get(`/complemento/${id}`).then((r) => r.data)
  },
  getByProdutoId(produtoId: number): Promise<Complemento[]> {
    return api.get(`/complemento/produto/${produtoId}`).then((r) => r.data)
  },
  create(data: ComplementoInsertForm): Promise<Complemento> {
    return api.post('/complemento', data).then((r) => r.data)
  },
  update(id: number, data: ComplementoUpdateForm): Promise<Complemento> {
    return api.put(`/complemento/${id}`, data).then((r) => r.data)
  },
  remove(id: number): Promise<void> {
    return api.delete(`/complemento/${id}`, { headers: { usuario: 'netto' } }).then(() => undefined)
  },
  associarProduto(produtoId: number, complementoId: number): Promise<void> {
    return api.post(`/complemento/produto/${produtoId}/${complementoId}`).then(() => undefined)
  },
  desassociarProduto(produtoId: number, complementoId: number): Promise<void> {
    return api.delete(`/complemento/produto/${produtoId}/${complementoId}`).then(() => undefined)
  },
}

export default complementoService

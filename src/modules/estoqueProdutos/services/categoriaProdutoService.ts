import api from '../../../lib/axios'
import { CategoriaProduto, CategoriaProdutoInsertForm, CategoriaProdutoUpdateForm } from '../types/categoriaProduto'

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

const categoriaProdutoService = {
  getAll(page = 0, size = 20, filters?: { id?: number; nome?: string }): Promise<PageResponse<CategoriaProduto>> {
    return api
      .get<PageResponse<CategoriaProduto>>('/categoria-produto', { params: { page, size, ...filters } })
      .then((res) => res.data)
  },

  getById(id: number): Promise<CategoriaProduto> {
    return api.get<CategoriaProduto>(`/categoria-produto/${id}`).then((res) => res.data)
  },

  create(data: CategoriaProdutoInsertForm): Promise<CategoriaProduto> {
    return api.post<CategoriaProduto>('/categoria-produto', data).then((res) => res.data)
  },

  update(id: number, data: CategoriaProdutoUpdateForm): Promise<CategoriaProduto> {
    return api.put<CategoriaProduto>(`/categoria-produto/${id}`, data).then((res) => res.data)
  },

  remove(id: number): Promise<void> {
    return api
      .delete(`/categoria-produto/${id}`, { headers: { usuario: 'netto' } })
      .then(() => undefined)
  },
}

export default categoriaProdutoService

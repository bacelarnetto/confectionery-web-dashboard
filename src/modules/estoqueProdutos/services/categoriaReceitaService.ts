import api from '../../../lib/axios'
import { CategoriaReceita, CategoriaReceitaInsertForm, CategoriaReceitaUpdateForm } from '../types/categoriaReceita'

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

const categoriaReceitaService = {
  getAll(page = 0, size = 20, filters?: { nome?: string }): Promise<PageResponse<CategoriaReceita>> {
    return api.get('/categoria-receita', { params: { page, size, ...filters } }).then((r) => r.data)
  },
  getById(id: number): Promise<CategoriaReceita> {
    return api.get(`/categoria-receita/${id}`).then((r) => r.data)
  },
  create(data: CategoriaReceitaInsertForm): Promise<CategoriaReceita> {
    return api.post('/categoria-receita', data).then((r) => r.data)
  },
  update(id: number, data: CategoriaReceitaUpdateForm): Promise<CategoriaReceita> {
    return api.put(`/categoria-receita/${id}`, data).then((r) => r.data)
  },
  remove(id: number): Promise<void> {
    return api.delete(`/categoria-receita/${id}`, { headers: { usuario: 'netto' } }).then(() => undefined)
  },
}

export default categoriaReceitaService

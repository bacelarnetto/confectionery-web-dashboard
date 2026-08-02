import api from '../../../lib/axios'
import { CategoriaInsumo, CategoriaInsumoInsertForm, CategoriaInsumoUpdateForm } from '../types/categoriaInsumo'

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

const categoriaInsumoService = {
  getAll(page = 0, size = 20, filters?: { id?: number; nome?: string }): Promise<PageResponse<CategoriaInsumo>> {
    return api
      .get<PageResponse<CategoriaInsumo>>('/categoria-insumo', { params: { page, size, ...filters } })
      .then((res) => res.data)
  },

  getById(id: number): Promise<CategoriaInsumo> {
    return api.get<CategoriaInsumo>(`/categoria-insumo/${id}`).then((res) => res.data)
  },

  create(data: CategoriaInsumoInsertForm): Promise<CategoriaInsumo> {
    return api.post<CategoriaInsumo>('/categoria-insumo', data).then((res) => res.data)
  },

  update(id: number, data: CategoriaInsumoUpdateForm): Promise<CategoriaInsumo> {
    return api.put<CategoriaInsumo>(`/categoria-insumo/${id}`, data).then((res) => res.data)
  },

  remove(id: number): Promise<void> {
    return api
      .delete(`/categoria-insumo/${id}`, { headers: { usuario: 'netto' } })
      .then(() => undefined)
  },
}

export default categoriaInsumoService

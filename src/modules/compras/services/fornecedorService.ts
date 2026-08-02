import api from '../../../lib/axios'
import { Fornecedor, FornecedorInsertForm, FornecedorUpdateForm } from '../types/fornecedor'

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

const fornecedorService = {
  getAll(page = 0, size = 20, filters?: { id?: number; nome?: string; cnpj?: string }): Promise<PageResponse<Fornecedor>> {
    return api
      .get<PageResponse<Fornecedor>>('/fornecedor', { params: { page, size, ...filters } })
      .then((res) => res.data)
  },

  getById(id: number): Promise<Fornecedor> {
    return api.get<Fornecedor>(`/fornecedor/${id}`).then((res) => res.data)
  },

  create(data: FornecedorInsertForm): Promise<Fornecedor> {
    return api.post<Fornecedor>('/fornecedor', data).then((res) => res.data)
  },

  update(id: number, data: FornecedorUpdateForm): Promise<Fornecedor> {
    return api.put<Fornecedor>(`/fornecedor/${id}`, data).then((res) => res.data)
  },

  remove(id: number): Promise<void> {
    return api
      .delete(`/fornecedor/${id}`, { headers: { usuario: 'netto' } })
      .then(() => undefined)
  },
}

export default fornecedorService
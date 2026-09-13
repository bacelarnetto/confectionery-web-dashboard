import api from '../../../lib/axios'
import { Fornecedor, FornecedorInsertForm, FornecedorUpdateForm } from '../types/fornecedor'
import { normalizePage, RawPage, PageResponse } from '../../../lib/pagination'

export type { PageResponse }

const fornecedorService = {
  getAll(page = 0, size = 20, filters?: { id?: number; nome?: string; cnpj?: string }): Promise<PageResponse<Fornecedor>> {
    return api
      .get<RawPage<Fornecedor>>('/fornecedor', { params: { page, size, ...filters } })
      .then((res) => normalizePage(res.data))
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
      .delete(`/fornecedor/${id}`, { headers: { usuario: '' } })
      .then(() => undefined)
  },
}

export default fornecedorService
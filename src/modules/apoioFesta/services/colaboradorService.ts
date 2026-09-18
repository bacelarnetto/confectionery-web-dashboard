import api from '../../../lib/axios'
import { Colaborador, ColaboradorInsertForm, ColaboradorUpdateForm } from '../types/colaborador'
import { normalizePage, RawPage, PageResponse } from '../../../lib/pagination'

export type { PageResponse }

const colaboradorService = {
  getAll(page = 0, size = 50, nome?: string): Promise<PageResponse<Colaborador>> {
    return api
      .get<RawPage<Colaborador>>('/colaborador', { params: { page, size, ...(nome ? { nome } : {}) } })
      .then((res) => normalizePage(res.data))
  },

  getById(id: number): Promise<Colaborador> {
    return api.get<Colaborador>(`/colaborador/${id}`).then((res) => res.data)
  },

  create(data: ColaboradorInsertForm): Promise<Colaborador> {
    return api.post<Colaborador>('/colaborador', data).then((res) => res.data)
  },

  update(id: number, data: ColaboradorUpdateForm): Promise<Colaborador> {
    return api.put<Colaborador>(`/colaborador/${id}`, data).then((res) => res.data)
  },

  remove(id: number): Promise<void> {
    return api.delete(`/colaborador/${id}`, { headers: { usuario: '' } }).then(() => undefined)
  },
}

export default colaboradorService

import api from '../../../lib/axios'
import { Insumo, InsumoInsertForm, InsumoUpdateForm } from '../types/insumo'
import { PageResponse } from './categoriaInsumoService'
import { normalizePage, RawPage } from '../../../lib/pagination'

const insumoService = {
  getAll(
    page = 0,
    size = 20,
    filters?: {
      id?: number;
      categoriaId?: number;
      nome?: string;
      perecivel?: boolean;
    }
  ): Promise<PageResponse<Insumo>> {
    return api
      .get<RawPage<Insumo>>('/insumo', { params: { page, size, ...filters } })
      .then((res) => normalizePage(res.data))
  },

  getById(id: number): Promise<Insumo> {
    return api.get<Insumo>(`/insumo/${id}`).then((res) => res.data)
  },

  create(data: InsumoInsertForm): Promise<Insumo> {
    return api.post<Insumo>('/insumo', data).then((res) => res.data)
  },

  update(id: number, data: InsumoUpdateForm): Promise<Insumo> {
    return api.put<Insumo>(`/insumo/${id}`, data).then((res) => res.data)
  },

  remove(id: number): Promise<void> {
    return api
      .delete(`/insumo/${id}`, { headers: { usuario: '' } })
      .then(() => undefined)
  },
}

export default insumoService

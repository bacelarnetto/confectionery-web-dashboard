import api from '../../../lib/axios'
import { ItemApoio, ItemApoioInsertForm, ItemApoioUpdateForm, DisponibilidadeDia } from '../types/itemApoio'
import { normalizePage, RawPage, PageResponse } from '../../../lib/pagination'

export type { PageResponse, DisponibilidadeDia }

const itemApoioService = {
  getAll(page = 0, size = 50): Promise<PageResponse<ItemApoio>> {
    return api
      .get<RawPage<ItemApoio>>('/item-apoio', { params: { page, size } })
      .then((res) => normalizePage(res.data))
  },

  getById(id: number): Promise<ItemApoio> {
    return api.get<ItemApoio>(`/item-apoio/${id}`).then((res) => res.data)
  },

  create(data: ItemApoioInsertForm): Promise<ItemApoio> {
    return api.post<ItemApoio>('/item-apoio', data).then((res) => res.data)
  },

  update(id: number, data: ItemApoioUpdateForm): Promise<ItemApoio> {
    return api.put<ItemApoio>(`/item-apoio/${id}`, data).then((res) => res.data)
  },

  remove(id: number): Promise<void> {
    return api.delete(`/item-apoio/${id}`, { headers: { usuario: '' } }).then(() => undefined)
  },

  getDisponibilidade(id: number, mes: string): Promise<DisponibilidadeDia[]> {
    // Um 404 aqui é esperado enquanto o endpoint backend não existir e o hook de disponibilidade
    // cai no fallback client-side — skipErrorToast evita o toast genérico de "Endpoint não encontrado".
    return api
      .get<DisponibilidadeDia[]>(`/item-apoio/${id}/disponibilidade`, { params: { mes }, skipErrorToast: true })
      .then((res) => res.data)
  },
}

export default itemApoioService

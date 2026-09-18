import api from '../../../lib/axios'
import { ItemApoio, ItemApoioInsertForm, ItemApoioUpdateForm } from '../types/itemApoio'
import { normalizePage, RawPage, PageResponse } from '../../../lib/pagination'

export type { PageResponse }

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
}

export default itemApoioService

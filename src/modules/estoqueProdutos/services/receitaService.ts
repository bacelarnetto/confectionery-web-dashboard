import api from '../../../lib/axios'
import { Receita, ReceitaInsertForm, ReceitaUpdateForm } from '../types/receita'
import { PageResponse } from './produtoService'
import { normalizePage, RawPage } from '../../../lib/pagination'

const receitaService = {
  getAll(page = 0, size = 20, filters?: { nome?: string }): Promise<PageResponse<Receita>> {
    return api.get<RawPage<Receita>>('/receita', { params: { page, size, ...filters } }).then((r) => normalizePage(r.data))
  },
  getById(id: number): Promise<Receita> {
    return api.get(`/receita/${id}`).then((r) => r.data)
  },
  create(data: ReceitaInsertForm): Promise<Receita> {
    return api.post('/receita', data, { skipErrorToast: true }).then((r) => r.data)
  },
  update(id: number, data: ReceitaUpdateForm): Promise<Receita> {
    return api.put(`/receita/${id}`, data, { skipErrorToast: true }).then((r) => r.data)
  },
  remove(id: number): Promise<void> {
    return api.delete(`/receita/${id}`, { headers: { usuario: '' } }).then(() => undefined)
  },
}

export default receitaService

import api from '../../../lib/axios'
import { AlertaInsumo } from '../types/alerta'

interface PageResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  number: number
}

const alertaService = {
  getAll(
    page = 0,
    size = 20,
    filters?: { ativo?: boolean; tipoId?: number }
  ): Promise<PageResponse<AlertaInsumo>> {
    return api
      .get<PageResponse<AlertaInsumo>>('/alerta', { params: { page, size, ...filters } })
      .then((res) => res.data)
  },

  getById(id: number): Promise<AlertaInsumo> {
    return api.get<AlertaInsumo>(`/alerta/${id}`).then((res) => res.data)
  },

  countAtivos(): Promise<number> {
    return api.get<number>('/alerta/count-ativos').then((res) => res.data)
  },

  resolver(id: number): Promise<AlertaInsumo> {
    return api
      .put<AlertaInsumo>(`/alerta/${id}/resolver`, null, { headers: { usuario: 'netto' } })
      .then((res) => res.data)
  },

  verificar(): Promise<void> {
    return api.post('/alerta/verificar').then(() => undefined)
  },
}

export default alertaService

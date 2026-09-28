import { AxiosRequestConfig } from 'axios'
import api from '../../../lib/axios'
import { AlertaInsumo } from '../types/alerta'
import { normalizePage, RawPage, PageResponse } from '../../../lib/pagination'

const alertaService = {
  getAll(
    page = 0,
    size = 20,
    filters?: { ativo?: boolean; tipoId?: number },
    config?: Pick<AxiosRequestConfig, 'silentError'>
  ): Promise<PageResponse<AlertaInsumo>> {
    return api
      .get<RawPage<AlertaInsumo>>('/alerta', { params: { page, size, ...filters }, ...config })
      .then((res) => normalizePage(res.data))
  },

  getById(id: number): Promise<AlertaInsumo> {
    return api.get<AlertaInsumo>(`/alerta/${id}`).then((res) => res.data)
  },

  countAtivos(config?: Pick<AxiosRequestConfig, 'silentError'>): Promise<number> {
    return api.get<number>('/alerta/count-ativos', config).then((res) => res.data)
  },

  resolver(id: number): Promise<AlertaInsumo> {
    return api
      .put<AlertaInsumo>(`/alerta/${id}/resolver`, null, { headers: { usuario: '' } })
      .then((res) => res.data)
  },

  verificar(): Promise<void> {
    return api.post('/alerta/verificar').then(() => undefined)
  },
}

export default alertaService

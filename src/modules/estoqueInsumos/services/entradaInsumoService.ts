import api from '../../../lib/axios'
import { EntradaInsumo, EntradaInsumoInsertForm, EntradaInsumoUpdateForm } from '../types/entradaInsumo'
import { PageResponse } from './categoriaInsumoService'
import { normalizePage, RawPage } from '../../../lib/pagination'

const entradaInsumoService = {
  getAll(
    page = 0,
    size = 20,
    filters?: {
      compraId?: number;
      dataInicial?: string;
      dataFinal?: string;
      origem?: 'COMPRA' | 'MANUAL';
      pendentePreenchimento?: boolean;
    }
  ): Promise<PageResponse<EntradaInsumo>> {
    return api
      .get<RawPage<EntradaInsumo>>('/entrada-insumo', { params: { page, size, ...filters } })
      .then((res) => normalizePage(res.data))
  },

  getById(id: number): Promise<EntradaInsumo> {
    return api.get<EntradaInsumo>(`/entrada-insumo/${id}`).then((res) => res.data)
  },

  create(data: EntradaInsumoInsertForm): Promise<EntradaInsumo> {
    return api.post<EntradaInsumo>('/entrada-insumo', data, { skipErrorToast: true }).then((res) => res.data)
  },

  update(id: number, data: EntradaInsumoUpdateForm): Promise<EntradaInsumo> {
    return api.put<EntradaInsumo>(`/entrada-insumo/${id}`, data, { skipErrorToast: true }).then((res) => res.data)
  },

  remove(id: number): Promise<void> {
    return api
      .delete(`/entrada-insumo/${id}`, { headers: { usuario: '' } })
      .then(() => undefined)
  },
}

export default entradaInsumoService

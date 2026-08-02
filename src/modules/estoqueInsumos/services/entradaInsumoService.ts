import api from '../../../lib/axios'
import { EntradaInsumo, EntradaInsumoInsertForm, EntradaInsumoUpdateForm } from '../types/entradaInsumo'
import { PageResponse } from './categoriaInsumoService'

const entradaInsumoService = {
  getAll(
    page = 0,
    size = 20,
    filters?: {
      compraId?: number;
      dataInicial?: string;
      dataFinal?: string;
    }
  ): Promise<PageResponse<EntradaInsumo>> {
    return api
      .get<PageResponse<EntradaInsumo>>('/entrada-insumo', { params: { page, size, ...filters } })
      .then((res) => res.data)
  },

  getById(id: number): Promise<EntradaInsumo> {
    return api.get<EntradaInsumo>(`/entrada-insumo/${id}`).then((res) => res.data)
  },

  create(data: EntradaInsumoInsertForm): Promise<EntradaInsumo> {
    return api.post<EntradaInsumo>('/entrada-insumo', data).then((res) => res.data)
  },

  update(id: number, data: EntradaInsumoUpdateForm): Promise<EntradaInsumo> {
    return api.put<EntradaInsumo>(`/entrada-insumo/${id}`, data).then((res) => res.data)
  },

  remove(id: number): Promise<void> {
    return api
      .delete(`/entrada-insumo/${id}`, { headers: { usuario: 'netto' } })
      .then(() => undefined)
  },
}

export default entradaInsumoService

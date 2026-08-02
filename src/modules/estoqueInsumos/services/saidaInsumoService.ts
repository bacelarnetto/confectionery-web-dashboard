import api from '../../../lib/axios'
import { SaidaInsumo, SaidaInsumoInsertForm } from '../types/saidaInsumo'
import { PageResponse } from './categoriaInsumoService'

const saidaInsumoService = {
  getAll(
    page = 0,
    size = 20,
    filters?: {
      tipoId?: number;
      dataInicial?: string;
      dataFinal?: string;
    }
  ): Promise<PageResponse<SaidaInsumo>> {
    return api
      .get<PageResponse<SaidaInsumo>>('/saida-insumo', { params: { page, size, ...filters } })
      .then((res) => res.data)
  },

  getById(id: number): Promise<SaidaInsumo> {
    return api.get<SaidaInsumo>(`/saida-insumo/${id}`).then((res) => res.data)
  },

  create(data: SaidaInsumoInsertForm): Promise<SaidaInsumo> {
    return api.post<SaidaInsumo>('/saida-insumo', data).then((res) => res.data)
  },

  remove(id: number): Promise<void> {
    return api
      .delete(`/saida-insumo/${id}`, { headers: { usuario: 'netto' } })
      .then(() => undefined)
  },
}

export default saidaInsumoService

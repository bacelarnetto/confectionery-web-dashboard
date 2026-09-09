import api from '../../../lib/axios'
import { EstoqueInsumo, EstoqueValorizado } from '../types/estoqueInsumo'
import { PageResponse } from './categoriaInsumoService'

const estoqueInsumoService = {
  getAll(
    page = 0,
    size = 20,
    filters?: {
      insumoId?: number;
      categoriaId?: number;
    }
  ): Promise<PageResponse<EstoqueInsumo>> {
    return api
      .get<PageResponse<EstoqueInsumo>>('/estoque-insumo', { params: { page, size, ...filters } })
      .then((res) => res.data)
  },

  getByInsumoId(insumoId: number): Promise<EstoqueInsumo> {
    return api.get<EstoqueInsumo>(`/estoque-insumo/insumo/${insumoId}`).then((res) => res.data)
  },

  getValorizado(): Promise<EstoqueValorizado[]> {
    return api.get<EstoqueValorizado[]>('/estoque-insumo/valorizado').then((res) => res.data)
  },
}

export default estoqueInsumoService

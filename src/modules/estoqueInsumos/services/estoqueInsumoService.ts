import api from '../../../lib/axios'
import { EstoqueInsumo, EstoqueValorizado } from '../types/estoqueInsumo'
import { PageResponse } from './categoriaInsumoService'
import { normalizePage, RawPage } from '../../../lib/pagination'

const estoqueInsumoService = {
  getAll(
    page = 0,
    size = 20,
    filters?: {
      insumoId?: number;
      categoriaId?: number;
      statusSaldo?: 'COM_SALDO' | 'ZERADO';
    }
  ): Promise<PageResponse<EstoqueInsumo>> {
    return api
      .get<RawPage<EstoqueInsumo>>('/estoque-insumo', { params: { page, size, ...filters } })
      .then((res) => normalizePage(res.data))
  },

  getByInsumoId(insumoId: number): Promise<EstoqueInsumo> {
    return api.get<EstoqueInsumo>(`/estoque-insumo/insumo/${insumoId}`).then((res) => res.data)
  },

  getValorizado(): Promise<EstoqueValorizado[]> {
    return api.get<EstoqueValorizado[]>('/estoque-insumo/valorizado').then((res) => res.data)
  },
}

export default estoqueInsumoService

import api from '../../../lib/axios'
import { Movimentacao } from '../types/movimentacao'
import { PageResponse } from './categoriaInsumoService'
import { normalizePage, RawPage } from '../../../lib/pagination'

const movimentacaoService = {
  getAll(
    page = 0,
    size = 20,
    filters?: { tipo?: string }
  ): Promise<PageResponse<Movimentacao>> {
    return api
      .get<RawPage<Movimentacao>>('/movimentacao', { params: { page, size, ...filters } })
      .then((res) => normalizePage(res.data))
  },

  getBySaidaId(itemSaidaInsumoId: number): Promise<Movimentacao[]> {
    return api.get<Movimentacao[]>(`/movimentacao/saida/${itemSaidaInsumoId}`).then((res) => res.data)
  },
}

export default movimentacaoService

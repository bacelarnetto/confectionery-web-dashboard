import api from '../../../lib/axios'
import { Movimentacao } from '../types/movimentacao'
import { PageResponse } from './categoriaInsumoService'

const movimentacaoService = {
  getAll(
    page = 0,
    size = 20,
    filters?: { tipo?: string }
  ): Promise<PageResponse<Movimentacao>> {
    return api
      .get<PageResponse<Movimentacao>>('/movimentacao', { params: { page, size, ...filters } })
      .then((res) => res.data)
  },

  getBySaidaId(itemSaidaInsumoId: number): Promise<Movimentacao[]> {
    return api.get<Movimentacao[]>(`/movimentacao/saida/${itemSaidaInsumoId}`).then((res) => res.data)
  },
}

export default movimentacaoService

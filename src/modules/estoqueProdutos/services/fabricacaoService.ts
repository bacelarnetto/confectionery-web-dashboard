import api from '../../../lib/axios'
import { Fabricacao, FabricacaoInsertForm } from '../types/fabricacao'
import { PageResponse } from './produtoService'
import { normalizePage, RawPage } from '../../../lib/pagination'

const fabricacaoService = {
  getAll(page = 0, size = 20): Promise<PageResponse<Fabricacao>> {
    return api.get<RawPage<Fabricacao>>('/fabricacao', { params: { page, size } }).then((r) => normalizePage(r.data))
  },
  create(data: FabricacaoInsertForm): Promise<Fabricacao> {
    return api.post('/fabricacao', data).then((r) => r.data)
  },
}

export default fabricacaoService

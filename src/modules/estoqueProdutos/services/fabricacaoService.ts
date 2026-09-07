import api from '../../../lib/axios'
import { Fabricacao, FabricacaoInsertForm } from '../types/fabricacao'
import { PageResponse } from './produtoService'

const fabricacaoService = {
  getAll(page = 0, size = 20): Promise<PageResponse<Fabricacao>> {
    return api.get('/fabricacao', { params: { page, size } }).then((r) => r.data)
  },
  create(data: FabricacaoInsertForm): Promise<Fabricacao> {
    return api.post('/fabricacao', data).then((r) => r.data)
  },
}

export default fabricacaoService

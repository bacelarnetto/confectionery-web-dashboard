import api from '../../../lib/axios'
import { EstoqueProduto } from '../types/estoqueProduto'
import { PageResponse } from './produtoService'
import { normalizePage, RawPage } from '../../../lib/pagination'

const estoqueProdutoService = {
  getAll(page = 0, size = 20, produtoId?: number): Promise<PageResponse<EstoqueProduto>> {
    return api.get<RawPage<EstoqueProduto>>('/estoque-produto', { params: { page, size, produtoId } }).then((r) => normalizePage(r.data))
  },
  subtrair(produtoId: number, quantidade: number): Promise<void> {
    return api.put('/estoque-produto/subtrair', { produtoId, quantidade }).then(() => undefined)
  },
}

export default estoqueProdutoService

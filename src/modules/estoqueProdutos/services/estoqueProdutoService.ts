import api from '../../../lib/axios'
import { EstoqueProduto } from '../types/estoqueProduto'
import { PageResponse } from './categoriaReceitaService'

const estoqueProdutoService = {
  getAll(page = 0, size = 20, produtoId?: number): Promise<PageResponse<EstoqueProduto>> {
    return api.get('/estoque-produto', { params: { page, size, produtoId } }).then((r) => r.data)
  },
  subtrair(produtoId: number, quantidade: number): Promise<void> {
    return api.put('/estoque-produto/subtrair', { produtoId, quantidade }).then(() => undefined)
  },
}

export default estoqueProdutoService

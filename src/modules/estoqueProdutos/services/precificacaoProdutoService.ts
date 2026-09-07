import api from '../../../lib/axios'
import { PrecificacaoProduto, PrecificacaoProdutoInsertForm } from '../types/precificacaoProduto'
import { PageResponse } from './produtoService'

const precificacaoProdutoService = {
  getAll(page = 0, size = 20, produtoId?: number): Promise<PageResponse<PrecificacaoProduto>> {
    return api.get('/precificacao-produto', { params: { page, size, produtoId } }).then((r) => r.data)
  },
  getVigenteByProdutoId(produtoId: number): Promise<PrecificacaoProduto | null> {
    return api.get(`/precificacao-produto/vigente/${produtoId}`).then((r) => r.data).catch(() => null)
  },
  create(data: PrecificacaoProdutoInsertForm): Promise<PrecificacaoProduto> {
    return api.post('/precificacao-produto', data).then((r) => r.data)
  },
}

export default precificacaoProdutoService

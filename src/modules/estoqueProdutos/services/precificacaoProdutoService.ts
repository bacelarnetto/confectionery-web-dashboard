import api from '../../../lib/axios'
import {
  PrecificacaoProduto,
  PrecificacaoProdutoInsertForm,
  PrecificacaoProdutoSimularForm,
  PrecificacaoProdutoSimulacao,
} from '../types/precificacaoProduto'
import { PageResponse } from './produtoService'
import { normalizePage, RawPage } from '../../../lib/pagination'

const precificacaoProdutoService = {
  getAll(page = 0, size = 20, produtoId?: number): Promise<PageResponse<PrecificacaoProduto>> {
    return api.get<RawPage<PrecificacaoProduto>>('/precificacao-produto', { params: { page, size, produtoId } }).then((r) => normalizePage(r.data))
  },
  // Um produto sem PrecificacaoProduto vigente é um estado de negócio normal (nem todo
  // produto foi precificado ainda), não uma falha — skipErrorToast evita que o 404 dispare
  // o toast genérico global; o catch trata qualquer erro (404 ou outro) como "sem preço",
  // deixando o formulário seguir com o preenchimento manual de valorUnitario.
  getVigenteByProdutoId(produtoId: number): Promise<PrecificacaoProduto | null> {
    return api.get(`/precificacao-produto/vigente/${produtoId}`, { skipErrorToast: true }).then((r) => r.data).catch(() => null)
  },
  create(data: PrecificacaoProdutoInsertForm): Promise<PrecificacaoProduto> {
    return api.post('/precificacao-produto', data, { skipErrorToast: true }).then((r) => r.data)
  },
  // Um 400 aqui é regra de negócio (produto sem receita cadastrada), não falha técnica —
  // skipErrorToast evita o toast genérico global; a UI já trata esse estado inline.
  simular(data: PrecificacaoProdutoSimularForm): Promise<PrecificacaoProdutoSimulacao> {
    return api.post('/precificacao-produto/simular', data, { skipErrorToast: true }).then((r) => r.data)
  },
}

export default precificacaoProdutoService

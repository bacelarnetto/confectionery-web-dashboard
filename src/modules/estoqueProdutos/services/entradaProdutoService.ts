import api from '../../../lib/axios'
import { EntradaProduto, EntradaProdutoInsertForm } from '../types/entradaProduto'
import { normalizePage, RawPage, PageResponse } from '../../../lib/pagination'

export type { PageResponse }

const entradaProdutoService = {
  getAll(page = 0, size = 20): Promise<PageResponse<EntradaProduto>> {
    return api.get<RawPage<EntradaProduto>>('/entrada-produto', { params: { page, size } }).then((r) => normalizePage(r.data))
  },
  getById(id: number): Promise<EntradaProduto> {
    return api.get<EntradaProduto>(`/entrada-produto/${id}`).then((r) => r.data)
  },
  create(data: EntradaProdutoInsertForm): Promise<EntradaProduto> {
    return api.post<EntradaProduto>('/entrada-produto', data, { skipErrorToast: true }).then((r) => r.data)
  },
  // 204 = entrada e o estoque que ela criou excluídos. 400 (regra de negócio: lote com saída, ou
  // entrada anterior ao controle de lotes) vem com a mensagem pronta -- o toast do interceptor mostra.
  remove(id: number): Promise<void> {
    return api.delete(`/entrada-produto/${id}`, { headers: { usuario: '' } }).then(() => undefined)
  },
}

export default entradaProdutoService

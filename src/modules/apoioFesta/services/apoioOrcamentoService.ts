import api from '../../../lib/axios'
import { ApoioOrcamento, ApoioOrcamentoInsertForm } from '../types/apoioOrcamento'

// Diferente de /apoio-festa, essa lista não é paginada -- devolve o array direto (proposta pré-
// aprovação, sempre um número pequeno de itens por orçamento).
const apoioOrcamentoService = {
  getAll(orcamentoId: number): Promise<ApoioOrcamento[]> {
    return api.get<ApoioOrcamento[]>('/apoio-orcamento', { params: { orcamentoId } }).then((r) => r.data)
  },

  create(data: ApoioOrcamentoInsertForm): Promise<ApoioOrcamento> {
    return api.post<ApoioOrcamento>('/apoio-orcamento', data).then((r) => r.data)
  },

  remove(id: number): Promise<void> {
    return api.delete(`/apoio-orcamento/${id}`, { headers: { usuario: '' } }).then(() => undefined)
  },
}

export default apoioOrcamentoService

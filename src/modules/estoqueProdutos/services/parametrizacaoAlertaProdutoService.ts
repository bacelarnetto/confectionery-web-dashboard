import api from '../../../lib/axios'
import {
  ParametrizacaoAlertaProduto,
  ParametrizacaoAlertaProdutoInsertForm,
  ParametrizacaoAlertaProdutoUpdateForm,
} from '../types/alertaProduto'

const parametrizacaoAlertaProdutoService = {
  getAll(): Promise<ParametrizacaoAlertaProduto[]> {
    return api.get<ParametrizacaoAlertaProduto[]>('/parametrizacao-alerta-produto').then((res) => res.data)
  },

  getById(id: number): Promise<ParametrizacaoAlertaProduto> {
    return api.get<ParametrizacaoAlertaProduto>(`/parametrizacao-alerta-produto/${id}`).then((res) => res.data)
  },

  getByProdutoId(produtoId: number): Promise<ParametrizacaoAlertaProduto> {
    return api
      .get<ParametrizacaoAlertaProduto>(`/parametrizacao-alerta-produto/produto/${produtoId}`)
      .then((res) => res.data)
  },

  create(data: ParametrizacaoAlertaProdutoInsertForm): Promise<ParametrizacaoAlertaProduto> {
    return api.post<ParametrizacaoAlertaProduto>('/parametrizacao-alerta-produto', data).then((res) => res.data)
  },

  update(id: number, data: ParametrizacaoAlertaProdutoUpdateForm): Promise<ParametrizacaoAlertaProduto> {
    return api.put<ParametrizacaoAlertaProduto>(`/parametrizacao-alerta-produto/${id}`, data).then((res) => res.data)
  },

  remove(id: number): Promise<void> {
    return api.delete(`/parametrizacao-alerta-produto/${id}`).then(() => undefined)
  },
}

export default parametrizacaoAlertaProdutoService

import api from '../../../lib/axios'
import { ParametrizacaoAlerta, ParametrizacaoAlertaInsertForm, ParametrizacaoAlertaUpdateForm } from '../types/alerta'

const parametrizacaoAlertaService = {
  getAll(): Promise<ParametrizacaoAlerta[]> {
    return api.get<ParametrizacaoAlerta[]>('/parametrizacao-alerta').then((res) => res.data)
  },

  getById(id: number): Promise<ParametrizacaoAlerta> {
    return api.get<ParametrizacaoAlerta>(`/parametrizacao-alerta/${id}`).then((res) => res.data)
  },

  getByInsumoId(insumoId: number): Promise<ParametrizacaoAlerta | null> {
    // 404 aqui é o estado normal (insumo ainda sem parametrização cadastrada) — não é erro.
    return api
      .get<ParametrizacaoAlerta>(`/parametrizacao-alerta/insumo/${insumoId}`, { skipErrorToast: true })
      .then((res) => res.data)
      .catch((err) => {
        if (err?.response?.status === 404) return null
        throw err
      })
  },

  create(data: ParametrizacaoAlertaInsertForm): Promise<ParametrizacaoAlerta> {
    return api.post<ParametrizacaoAlerta>('/parametrizacao-alerta', data).then((res) => res.data)
  },

  update(id: number, data: ParametrizacaoAlertaUpdateForm): Promise<ParametrizacaoAlerta> {
    return api.put<ParametrizacaoAlerta>(`/parametrizacao-alerta/${id}`, data).then((res) => res.data)
  },

  remove(id: number): Promise<void> {
    return api
      .delete(`/parametrizacao-alerta/${id}`, { headers: { usuario: 'netto' } })
      .then(() => undefined)
  },
}

export default parametrizacaoAlertaService

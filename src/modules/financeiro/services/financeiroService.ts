import api from '../../../lib/axios'
import { TipoGasto, TipoGastoInsertForm, TipoGastoUpdateForm } from '../types/tipoGasto'
import { Gasto, GastoInsertForm, GastoUpdateForm } from '../types/gasto'
import {
  ContaAvulsa,
  ContaAvulsaInsertForm,
  ContaAvulsaUpdateForm,
  ContaReceber,
  RecebimentoAvulsaForm,
} from '../types/contaReceber'
import { ResumoMes } from '../types/resumo'

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

const financeiroService = {
  // --- Tipos de gasto (F2) ---
  getTiposGasto(page = 0, size = 50, nome?: string): Promise<PageResponse<TipoGasto>> {
    return api
      .get<PageResponse<TipoGasto>>('/financeiro/tipos-gasto', {
        params: { page, size, ...(nome ? { nome } : {}) },
      })
      .then((res) => res.data)
  },

  getTipoGasto(id: number): Promise<TipoGasto> {
    return api.get<TipoGasto>(`/financeiro/tipos-gasto/${id}`).then((res) => res.data)
  },

  createTipoGasto(data: TipoGastoInsertForm): Promise<TipoGasto> {
    return api.post<TipoGasto>('/financeiro/tipos-gasto', data).then((res) => res.data)
  },

  updateTipoGasto(id: number, data: TipoGastoUpdateForm): Promise<TipoGasto> {
    return api.put<TipoGasto>(`/financeiro/tipos-gasto/${id}`, data).then((res) => res.data)
  },

  deleteTipoGasto(id: number): Promise<void> {
    return api
      .delete(`/financeiro/tipos-gasto/${id}`, { headers: { usuario: 'netto' } })
      .then(() => undefined)
  },

  // --- Gastos (F3) ---
  getGastos(
    page = 0,
    size = 50,
    filters?: { mes?: string; tipoGastoId?: number },
  ): Promise<PageResponse<Gasto>> {
    return api
      .get<PageResponse<Gasto>>('/financeiro/gastos', { params: { page, size, ...filters } })
      .then((res) => res.data)
  },

  getGasto(id: number): Promise<Gasto> {
    return api.get<Gasto>(`/financeiro/gastos/${id}`).then((res) => res.data)
  },

  createGasto(data: GastoInsertForm): Promise<Gasto> {
    return api.post<Gasto>('/financeiro/gastos', data).then((res) => res.data)
  },

  updateGasto(id: number, data: GastoUpdateForm): Promise<Gasto> {
    return api.put<Gasto>(`/financeiro/gastos/${id}`, data).then((res) => res.data)
  },

  deleteGasto(id: number): Promise<void> {
    return api
      .delete(`/financeiro/gastos/${id}`, { headers: { usuario: 'netto' } })
      .then(() => undefined)
  },

  repetirGasto(id: number): Promise<Gasto> {
    return api.post<Gasto>(`/financeiro/gastos/${id}/repetir`).then((res) => res.data)
  },

  // --- Resumo do mês (F5) ---
  getResumo(mes: string): Promise<ResumoMes> {
    return api.get<ResumoMes>('/financeiro/resumo', { params: { mes } }).then((res) => res.data)
  },

  // --- Contas a receber (F4) ---
  getContasReceber(apenasPendentes = true): Promise<ContaReceber[]> {
    return api
      .get<ContaReceber[]>('/financeiro/contas-a-receber', { params: { apenasPendentes } })
      .then((res) => res.data)
  },

  getContaAvulsa(id: number): Promise<ContaAvulsa> {
    return api.get<ContaAvulsa>(`/financeiro/contas-a-receber/avulsas/${id}`).then((res) => res.data)
  },

  createContaAvulsa(data: ContaAvulsaInsertForm): Promise<ContaAvulsa> {
    return api.post<ContaAvulsa>('/financeiro/contas-a-receber/avulsas', data).then((res) => res.data)
  },

  updateContaAvulsa(id: number, data: ContaAvulsaUpdateForm): Promise<ContaAvulsa> {
    return api.put<ContaAvulsa>(`/financeiro/contas-a-receber/avulsas/${id}`, data).then((res) => res.data)
  },

  deleteContaAvulsa(id: number): Promise<void> {
    return api
      .delete(`/financeiro/contas-a-receber/avulsas/${id}`, { headers: { usuario: 'netto' } })
      .then(() => undefined)
  },

  registrarRecebimentoAvulsa(id: number, data: RecebimentoAvulsaForm): Promise<ContaAvulsa> {
    return api
      .post<ContaAvulsa>(`/financeiro/contas-a-receber/avulsas/${id}/recebimentos`, data)
      .then((res) => res.data)
  },
}

export default financeiroService
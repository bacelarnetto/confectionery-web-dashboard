import api from '../../../lib/axios'
import { Compra, CompraInsertForm, CompraUpdateForm } from '../types/compra'
import { PageResponse } from './fornecedorService'
import { EntradaInsumoInsertForm } from '../../estoqueInsumos/types/entradaInsumo'

const compraService = {
  getAll(
    page = 0,
    size = 20,
    filters?: {
      fornecedorId?: number;
      status?: string;
      dataInicial?: string;
      dataFinal?: string;
    }
  ): Promise<PageResponse<Compra>> {
    return api
      .get<PageResponse<Compra>>('/compra', { params: { page, size, ...filters } })
      .then((res) => res.data)
  },

  getById(id: number): Promise<Compra> {
    return api.get<Compra>(`/compra/${id}`).then((res) => res.data)
  },

  create(data: CompraInsertForm): Promise<Compra> {
    return api.post<Compra>('/compra', data).then((res) => res.data)
  },

  update(id: number, data: CompraUpdateForm): Promise<Compra> {
    return api.put<Compra>(`/compra/${id}`, data).then((res) => res.data)
  },

  updateStatus(id: number, status: string): Promise<void> {
    return api.put(`/compra/${id}/status`, null, { params: { status } }).then(() => undefined)
  },

  // Opção A: frontend orquestra — monta o DTO e envia ao endpoint from-compra,
  // sem que o backend precise importar o módulo compras
  gerarEntradaInsumo(compraId: number, payload: EntradaInsumoInsertForm): Promise<void> {
    return api.post(`/entrada-insumo/from-compra/${compraId}`, payload).then(() => undefined)
  },

  downloadPdf(id: number): Promise<Blob> {
    return api
      .get(`/compra/${id}/pedido-pdf`, { responseType: 'blob' })
      .then((res) => res.data)
  },

  remove(id: number): Promise<void> {
    return api
      .delete(`/compra/${id}`, { headers: { usuario: 'netto' } })
      .then(() => undefined)
  },
}

export default compraService
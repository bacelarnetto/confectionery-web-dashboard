import api from '../../../lib/axios'
import { Pedido, PedidoInsertForm, PedidoUpdateForm, PagamentoPedido, PagamentoPedidoInsertForm } from '../types/pedido'

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

const pedidoService = {
  getAll(
    page = 0,
    size = 20,
    filters?: { clienteId?: number; status?: string },
  ): Promise<PageResponse<Pedido>> {
    return api.get('/pedido', { params: { page, size, ...filters } }).then((r) => r.data)
  },
  getBySemana(dataEntregaInicial: string, dataEntregaFinal: string): Promise<PageResponse<Pedido>> {
    return api
      .get('/pedido', { params: { size: 200, dataEntregaInicial, dataEntregaFinal, sort: 'dataEntrega,asc' } })
      .then((r) => r.data)
  },
  getById(id: number): Promise<Pedido> {
    return api.get(`/pedido/${id}`).then((r) => r.data)
  },
  create(data: PedidoInsertForm): Promise<Pedido> {
    return api.post('/pedido', data, { skipErrorToast: true }).then((r) => r.data)
  },
  update(id: number, data: PedidoUpdateForm): Promise<Pedido> {
    return api.put(`/pedido/${id}`, data, { skipErrorToast: true }).then((r) => r.data)
  },
  updateStatus(id: number, status: string): Promise<Pedido> {
    return api
      .put(`/pedido/${id}/status`, { status }, { headers: { usuario: 'netto' } })
      .then((r) => r.data)
  },
  getPagamentosPedido(id: number): Promise<PagamentoPedido[]> {
    return api.get(`/pedido/${id}/pagamentos`).then((r) => r.data)
  },
  registrarPagamentoPedido(id: number, data: PagamentoPedidoInsertForm): Promise<PagamentoPedido> {
    return api.post(`/pedido/${id}/pagamentos`, data).then((r) => r.data)
  },
  updateMotivoPendencia(id: number, motivoPendencia?: string): Promise<Pedido> {
    return api
      .put(`/pedido/${id}`, { motivoPendencia, updatedBy: 'netto' }, { skipErrorToast: true })
      .then((r) => r.data)
  },
  getReciboPagamentoPdf(id: number): Promise<Blob> {
    return api.get(`/pedido/${id}/recibo-pdf`, { responseType: 'blob' }).then((r) => r.data)
  },
}

export default pedidoService

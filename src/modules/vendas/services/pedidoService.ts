import api from '../../../lib/axios'
import { Pedido, PedidoInsertForm, PedidoUpdateForm, PagamentoPedido, PagamentoPedidoInsertForm } from '../types/pedido'
import { normalizePage, RawPage, PageResponse } from '../../../lib/pagination'

export type { PageResponse }

const pedidoService = {
  getAll(
    page = 0,
    size = 20,
    filters?: { clienteId?: number; status?: string },
  ): Promise<PageResponse<Pedido>> {
    return api.get<RawPage<Pedido>>('/pedido', { params: { page, size, ...filters } }).then((r) => normalizePage(r.data))
  },
  getBySemana(dataEntregaInicial: string, dataEntregaFinal: string): Promise<PageResponse<Pedido>> {
    return api
      .get<RawPage<Pedido>>('/pedido', { params: { size: 200, dataEntregaInicial, dataEntregaFinal, sort: 'dataEntrega,asc' } })
      .then((r) => normalizePage(r.data))
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
      .put(`/pedido/${id}/status`, { status }, { headers: { usuario: '' } })
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
      .put(`/pedido/${id}`, { motivoPendencia, updatedBy: '' }, { skipErrorToast: true })
      .then((r) => r.data)
  },
  getReciboPagamentoPdf(id: number): Promise<{ blob: Blob; contentDisposition?: string }> {
    return api
      .get(`/pedido/${id}/recibo-pdf`, { responseType: 'blob' })
      .then((r) => ({ blob: r.data, contentDisposition: r.headers['content-disposition'] }))
  },
}

export default pedidoService

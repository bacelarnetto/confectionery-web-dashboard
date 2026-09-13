import api from '../../../lib/axios'
import { AlertaPedido, AlertaPedidoStatus, AlertaPedidoTipo } from '../types/alertaPedido'
import { normalizePage, RawPage, PageResponse } from '../../../lib/pagination'

export type { PageResponse }

const alertaPedidoService = {
  getAtivos(page = 0, size = 50, tipo?: AlertaPedidoTipo): Promise<PageResponse<AlertaPedido>> {
    return api
      .get<RawPage<AlertaPedido>>('/alerta-pedido', {
        params: { page, size, status: 'ATIVO' as AlertaPedidoStatus, tipo },
      })
      .then((r) => normalizePage(r.data))
  },
  countAtivos(): Promise<number> {
    return api.get('/alerta-pedido/count-ativos').then((r) => r.data)
  },
  reconhecer(id: number): Promise<AlertaPedido> {
    return api
      .put(`/alerta-pedido/${id}/reconhecer`, null, { headers: { usuario: '' } })
      .then((r) => r.data)
  },
  verificar(): Promise<void> {
    return api.post('/alerta-pedido/verificar').then(() => undefined)
  },
}

export default alertaPedidoService

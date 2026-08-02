export type AlertaPedidoTipo =
  | 'SEMANAL'
  | 'TRES_DIAS'
  | 'DOIS_DIAS'
  | 'UM_DIA'
  | 'NO_DIA'
  | 'ATRASADO'

export type AlertaPedidoStatus = 'ATIVO' | 'RECONHECIDO'

export interface AlertaPedido {
  id: number
  pedidoId: number
  clienteNome?: string
  dataEntregaPedido?: string
  tipo: AlertaPedidoTipo
  status: AlertaPedidoStatus
  ingredientesInsuficientes: boolean
  dataGeracao: string
  dataReconhecimento?: string
  reconhecidoPor?: string
}

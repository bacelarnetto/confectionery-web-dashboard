export interface ItemPedidoComplemento {
  id?: number
  complementoId?: number
  complementoNome?: string
  valorVenda?: number
}

export interface ItemPedido {
  id?: number
  produtoId: number
  quantidade: number
  valorUnitario: number
  valorTotal?: number
  desconto?: number
  ignorarComplementoPadrao?: boolean
  complementoIds?: number[]
  complementos?: ItemPedidoComplemento[]
}

export interface Pedido {
  id: number
  clienteId?: number
  clienteNome?: string
  enderecoId?: number
  status?: string
  dataEntrega?: string
  valorTotal?: number
  valorFrete?: number
  retirar: boolean
  observacao?: string
  motivoPendencia?: string
  itens: ItemPedido[]
  createdBy: string
  createdOn: string
  updatedBy?: string
  updatedOn?: string
}

export interface PedidoInsertForm {
  clienteId: number
  enderecoId?: number
  retirar?: boolean
  dataEntrega?: string
  valorFrete?: number
  observacao?: string
  itens: {
    produtoId: number
    quantidade: number
    valorUnitario: number
    desconto?: number
    ignorarComplementoPadrao?: boolean
    complementoIds?: number[]
  }[]
  createdBy: string
}

export interface PedidoUpdateForm {
  enderecoId?: number
  retirar?: boolean
  dataEntrega?: string
  valorFrete?: number
  observacao?: string
  motivoPendencia?: string
  itens?: {
    produtoId: number
    quantidade: number
    valorUnitario: number
    desconto?: number
    ignorarComplementoPadrao?: boolean
    complementoIds?: number[]
  }[]
  updatedBy: string
}

export interface PagamentoPedido {
  id: number
  pedidoId: number
  valor: number
  dataPagamento: string
  observacao?: string
  createdOn?: string
}

export interface PagamentoPedidoInsertForm {
  valor: number
  dataPagamento: string
  observacao?: string
  createdBy: string
}

export const PEDIDO_STATUS = [
  'RASCUNHO',
  'CONFIRMADO',
  'EM_PRODUCAO',
  'PRONTO',
  'ENTREGUE',
  'CANCELADO',
] as const

export type PedidoStatus = (typeof PEDIDO_STATUS)[number]

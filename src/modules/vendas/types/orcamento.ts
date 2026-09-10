export interface ItemOrcamento {
  id?: number
  produtoId: number
  quantidade: number
  valorUnitario: number
  valorTotal?: number
  desconto?: number
  ignorarComplementoPadrao?: boolean
  complementos?: { id?: number; complementoId?: number; complementoNome?: string; valorVenda?: number }[]
}

export interface Orcamento {
  id: number
  clienteId?: number
  clienteNome?: string
  enderecoId?: number
  status?: string
  dataValidade?: string
  valorTotal?: number
  valorFrete?: number
  pedidoId?: number
  observacao?: string
  itens: ItemOrcamento[]
  createdBy: string
  createdOn: string
  updatedBy?: string
  updatedOn?: string
}

export interface OrcamentoInsertForm {
  clienteId: number
  enderecoId?: number
  dataValidade?: string
  valorFrete?: number
  observacao?: string
  itens: {
    produtoId: number
    quantidade: number
    valorUnitario: number
    desconto?: number
    ignorarComplementoPadrao: boolean
    complementoIds: number[]
  }[]
  createdBy: string
}

export interface OrcamentoUpdateForm {
  enderecoId?: number
  dataValidade?: string
  valorFrete?: number
  observacao?: string
  itens?: {
    produtoId: number
    quantidade: number
    valorUnitario: number
    desconto?: number
    ignorarComplementoPadrao: boolean
    complementoIds: number[]
  }[]
  updatedBy: string
}

export const ORCAMENTO_STATUS = ['ABERTO', 'CONVERTIDO', 'REJEITADO', 'EXPIRADO'] as const

export type OrcamentoStatus = (typeof ORCAMENTO_STATUS)[number]

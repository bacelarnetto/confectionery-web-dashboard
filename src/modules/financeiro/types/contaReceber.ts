export type OrigemContaReceber = 'PEDIDO' | 'AVULSA'

export type StatusContaReceber = 'ABERTO' | 'PARCIAL' | 'PAGO'

export interface ContaReceber {
  origem: OrigemContaReceber
  idRef: number
  pedidoId?: number
  clienteNome?: string
  descricao?: string
  valor: number
  valorRecebido: number
  saldo: number
  status: StatusContaReceber
  motivo?: string
  dataReferencia?: string
}

export interface ContaAvulsa {
  id: number
  descricao: string
  valor: number
  valorRecebido: number
  status: StatusContaReceber
  motivo?: string
  dataVencimento?: string
  dataUltimoRecebimento?: string
  createdOn?: string
}

export interface ContaAvulsaInsertForm {
  descricao: string
  valor: number
  motivo?: string
  dataVencimento?: string
  createdBy?: string
}

export interface ContaAvulsaUpdateForm {
  descricao: string
  valor: number
  motivo?: string
  dataVencimento?: string
  updatedBy?: string
}

export interface RecebimentoAvulsaForm {
  valor: number
  dataRecebimento: string
}
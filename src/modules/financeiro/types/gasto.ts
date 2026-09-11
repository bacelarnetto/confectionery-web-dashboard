export interface Gasto {
  id: number
  tipoGastoId: number
  tipoGastoNome?: string
  descricao?: string
  valor: number
  dataCompetencia?: string
  dataPagamento?: string
  recorrente: boolean
  documento?: string
  createdOn?: string
}

export interface GastoInsertForm {
  tipoGastoId: number
  descricao?: string
  valor: number
  dataCompetencia?: string
  dataPagamento?: string
  recorrente?: boolean
  documento?: string
  createdBy?: string
}

export interface GastoUpdateForm {
  tipoGastoId: number
  descricao?: string
  valor: number
  dataCompetencia?: string
  dataPagamento?: string
  recorrente?: boolean
  documento?: string
  updatedBy?: string
}
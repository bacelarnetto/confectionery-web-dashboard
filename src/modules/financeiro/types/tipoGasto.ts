export interface TipoGasto {
  id: number
  nome: string
  createdOn?: string
}

export interface TipoGastoInsertForm {
  nome: string
  createdBy?: string
}

export interface TipoGastoUpdateForm {
  nome: string
  updatedBy?: string
}
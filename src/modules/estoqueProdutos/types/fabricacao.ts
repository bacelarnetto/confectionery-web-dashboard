export interface Fabricacao {
  id: number
  receitaId: number
  quantidade: number
  observacao?: string
  createdBy: string
  createdOn: string
}

export interface FabricacaoInsertForm {
  receitaId: number
  quantidade: number
  observacao?: string
  dataFabricacao?: string
  dataValidade?: string
  createdBy: string
}

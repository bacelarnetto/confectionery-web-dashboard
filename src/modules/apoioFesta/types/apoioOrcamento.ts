export interface ApoioOrcamento {
  id: number
  itemApoioId: number
  itemApoioNome: string
  orcamentoId: number
  horaInicio: string
  horaFim: string
  incluiMaoDeObra: boolean
  colaboradorId?: number
  colaboradorNome?: string
  valorTotal: number
  createdOn?: string
  createdBy?: string
}

export interface ApoioOrcamentoInsertForm {
  itemApoioId: number
  orcamentoId: number
  horaInicio: string
  horaFim: string
  incluiMaoDeObra?: boolean
  colaboradorId?: number
  createdBy?: string
}

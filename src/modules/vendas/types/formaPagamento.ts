export interface FormaPagamento {
  id: number
  nome: string
  createdOn?: string
}

export interface FormaPagamentoInsertForm {
  nome: string
  createdBy?: string
}

export interface FormaPagamentoUpdateForm {
  nome: string
  updatedBy?: string
}

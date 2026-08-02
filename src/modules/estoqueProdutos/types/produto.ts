export interface Produto {
  id: number
  nome: string
  descricao?: string
  createdBy: string
  createdOn: string
  updatedBy?: string
  updatedOn?: string
}

export interface ProdutoInsertForm {
  nome: string
  descricao?: string
  createdBy: string
}

export interface ProdutoUpdateForm {
  nome?: string
  descricao?: string
  updatedBy: string
}

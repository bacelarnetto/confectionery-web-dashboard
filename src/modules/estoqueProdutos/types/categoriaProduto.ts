export interface CategoriaProduto {
  id: number
  nome: string
  descricao?: string
  createdBy: string
  createdOn: string
  updatedBy?: string
  updatedOn?: string
}

export interface CategoriaProdutoInsertForm {
  nome: string
  descricao?: string
  createdBy: string
}

export interface CategoriaProdutoUpdateForm {
  nome: string
  descricao?: string
  updatedBy: string
}

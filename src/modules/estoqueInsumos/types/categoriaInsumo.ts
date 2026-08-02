export interface CategoriaInsumo {
  id: number
  nome: string
  descricao?: string
  createdBy: string
  createdOn: string
  updatedBy?: string
  updatedOn?: string
}

export interface CategoriaInsumoInsertForm {
  nome: string
  descricao?: string
  createdBy: string
}

export interface CategoriaInsumoUpdateForm {
  nome: string
  descricao?: string
  updatedBy: string
}

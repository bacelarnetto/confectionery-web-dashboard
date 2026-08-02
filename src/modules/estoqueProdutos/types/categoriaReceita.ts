export interface CategoriaReceita {
  id: number
  nome: string
  descricao?: string
}

export interface CategoriaReceitaInsertForm {
  nome: string
  descricao?: string
}

export interface CategoriaReceitaUpdateForm {
  nome?: string
  descricao?: string
}

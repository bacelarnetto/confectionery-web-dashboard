export interface Ingrediente {
  id?: number
  insumoId: number
  quantidade: number
  observacao?: string
}

export interface Receita {
  id: number
  nome: string
  categoriaReceitaId: number
  produtoId: number
  modoPreparo?: string
  tempoPreparo?: string
  ingredientes: Ingrediente[]
  createdBy: string
  createdOn: string
  updatedBy?: string
  updatedOn?: string
}

export interface ReceitaInsertForm {
  nome: string
  categoriaReceitaId: number
  produtoId: number
  modoPreparo?: string
  tempoPreparo?: string
  ingredientes: Ingrediente[]
  createdBy: string
}

export interface ReceitaUpdateForm {
  nome?: string
  categoriaReceitaId?: number
  modoPreparo?: string
  tempoPreparo?: string
  ingredientes?: Ingrediente[]
  updatedBy: string
}

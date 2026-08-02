export interface Insumo {
  id: number
  nome: string
  descricao?: string
  valor: number
  marca?: string
  perecivel: boolean
  unidadeMedida: string
  categoriaId?: number
  categoriaNome?: string
  createdBy: string
  createdOn: string
  updatedBy?: string
  updatedOn?: string
}

export interface InsumoInsertForm {
  nome: string
  descricao?: string
  valor: number
  marca?: string
  perecivel: boolean
  unidadeMedida: string
  categoriaId: number
  createdBy: string
}

export interface InsumoUpdateForm {
  nome: string
  descricao?: string
  valor: number
  marca?: string
  perecivel: boolean
  unidadeMedida: string
  categoriaId: number
  updatedBy: string
}

export interface Complemento {
  id: number
  categoria: string
  nome: string
  insumoId?: number
  valorCusto?: number
  valorVenda?: number
  descricao?: string
}

export interface ComplementoInsertForm {
  categoria: string
  nome: string
  insumoId: number
  valorCusto: number
  valorVenda: number
  descricao?: string
}

export interface ComplementoUpdateForm {
  categoria?: string
  nome?: string
  insumoId?: number
  valorCusto?: number
  valorVenda?: number
  descricao?: string
}

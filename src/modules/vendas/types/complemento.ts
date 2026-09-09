export interface Complemento {
  id: number
  categoria: string
  nome: string
  insumoId?: number
  insumoNome?: string
  valorCusto?: number
  valorVenda?: number
  descricao?: string
  padrao?: boolean
}

export interface ComplementoInsertForm {
  categoria: string
  nome: string
  insumoId: number
  valorCusto: number
  valorVenda: number
  descricao?: string
  padrao?: boolean
}

export interface ComplementoUpdateForm {
  categoria?: string
  nome?: string
  insumoId?: number
  valorCusto?: number
  valorVenda?: number
  descricao?: string
  padrao?: boolean
}

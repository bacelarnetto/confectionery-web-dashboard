export interface AlertaProduto {
  id: number
  data: string
  ativo: boolean
  tipoId: number
  tipoDescricao?: string
  quantidadeAtualEstoque?: number
  quantidadeMinimaEstoque?: number
  dataValidade?: string
  produtoId?: number
  produtoNome?: string
  estoqueProdutoId?: number
  resolvidoEm?: string
  resolvidoPor?: string
}

export interface ParametrizacaoAlertaProduto {
  id?: number
  produtoId?: number
  produtoNome?: string
  quantidadeMinimaEstoque: number
  quantidadeDiasVencimento: number
}

export interface ParametrizacaoAlertaProdutoInsertForm {
  produtoId: number
  quantidadeMinimaEstoque: number
  quantidadeDiasVencimento: number
}

export interface ParametrizacaoAlertaProdutoUpdateForm {
  quantidadeMinimaEstoque?: number
  quantidadeDiasVencimento?: number
}

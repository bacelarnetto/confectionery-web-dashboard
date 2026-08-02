export interface PrecificacaoProduto {
  id: number
  produtoId: number
  valorCustoIngrediente: number
  valorCustoFixo: number
  margemLucro: number
  valorVenda: number
  dataInicioVigencia: string
  dataFimVigencia?: string
  createdBy: string
  createdOn: string
}

export interface PrecificacaoProdutoInsertForm {
  produtoId: number
  valorCustoIngrediente: number
  valorCustoFixo: number
  margemLucro: number
  valorVenda: number
  createdBy: string
}

export interface PrecificacaoProduto {
  id: number
  produtoId: number
  receitaId: number | null
  valorCustoIngrediente: number
  valorCustoFixo: number
  margemLucro: number
  valorVendaSugerido: number
  valorVenda: number
  dataInicioVigencia: string
  dataFimVigencia?: string
  createdBy: string
  createdOn: string
}

export interface PrecificacaoProdutoInsertForm {
  produtoId: number
  valorCustoIngrediente?: number | null
  valorCustoFixo: number
  margemLucro: number
  valorVenda?: number | null
  createdBy: string
}

export interface PrecificacaoProdutoSimularForm {
  produtoId: number
  valorCustoIngrediente?: number | null
  valorCustoFixo: number
  margemLucro: number
}

export interface PrecificacaoProdutoBreakdown {
  custoTotal: number
  lucroBruto: number
}

export interface PrecificacaoProdutoSimulacao {
  produtoId: number
  receitaId: number | null
  valorCustoIngrediente: number
  valorCustoFixo: number
  margemLucro: number
  valorVendaSugerido: number
  breakdown: PrecificacaoProdutoBreakdown
}

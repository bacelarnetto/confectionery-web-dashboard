export interface EstoqueProduto {
  id: number
  produtoId: number
  quantidade: number
  dataFabricacao?: string
  dataValidade?: string
  createdOn: string
}

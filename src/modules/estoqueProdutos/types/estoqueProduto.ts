export type OrigemEstoqueProduto = 'FABRICACAO' | 'TERCEIRIZADO'

export interface EstoqueProduto {
  id: number
  produtoId: number
  produtoNome?: string
  quantidade: number
  dataFabricacao?: string
  dataValidade?: string
  createdOn: string
  origem?: OrigemEstoqueProduto
}

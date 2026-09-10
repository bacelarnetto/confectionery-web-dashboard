export interface ItemEntradaProduto {
  id?: number
  produtoId: number
  quantidade: number
  valorCustoUnitario: number
  valorCustoTotal?: number
  dataValidade?: string
  dataFabricacao?: string
}

export interface EntradaProduto {
  id: number
  fornecedorId?: number
  dataRecebimento?: string
  observacao?: string
  itens: ItemEntradaProduto[]
  createdBy: string
  createdOn: string
  updatedBy?: string
  updatedOn?: string
}

export interface EntradaProdutoInsertForm {
  fornecedorId?: number
  dataRecebimento?: string
  observacao?: string
  itens: {
    produtoId: number
    quantidade: number
    valorCustoUnitario: number
    dataValidade?: string
    dataFabricacao?: string
  }[]
  createdBy: string
}

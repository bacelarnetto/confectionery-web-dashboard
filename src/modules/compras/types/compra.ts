export interface ItemCompra {
  id?: number
  insumoId: number
  quantidade: number
  valorCustoUnitario: number
  valorCustoTotal?: number
  comprado?: boolean
}

export interface Compra {
  id: number
  status: string
  fornecedorId?: number
  itens: ItemCompra[]
  createdBy: string
  createdOn: string
  updatedBy?: string
  updatedOn?: string
}

export interface CompraInsertForm {
  fornecedorId?: number
  status: string
  itens: ItemCompra[]
  createdBy: string
}

export interface CompraUpdateForm {
  fornecedorId?: number
  status: string
  itens: ItemCompra[]
  updatedBy: string
}
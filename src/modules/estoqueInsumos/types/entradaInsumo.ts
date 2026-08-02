export interface ItemEntradaInsumo {
  id?: number
  insumoId: number
  quantidade: number
  lote?: string
  dataValidade?: string
  dataFabricacao?: string
  valorCustoUnitario: number
  valorCustoTotal: number
  createdBy?: string
  updatedBy?: string
}

export interface EntradaInsumo {
  id: number
  compraId?: number
  usuarioId: number
  valorTotal: number
  valorFrete?: number
  numeroNotaFiscal?: number
  valorImposto?: number
  createdBy: string
  createdOn: string
  updatedBy?: string
  updatedOn?: string
  itens: ItemEntradaInsumo[]
}

export interface EntradaInsumoInsertForm {
  compraId?: number
  usuarioId: number
  valorTotal: number
  valorFrete?: number
  numeroNotaFiscal?: number
  valorImposto?: number
  createdBy: string
  itens: Omit<ItemEntradaInsumo, 'id' | 'createdBy' | 'updatedBy'>[]
}

export interface EntradaInsumoUpdateForm {
  compraId?: number
  usuarioId: number
  valorTotal: number
  valorFrete?: number
  numeroNotaFiscal?: number
  valorImposto?: number
  updatedBy: string
  itens: (ItemEntradaInsumo | Omit<ItemEntradaInsumo, 'id' | 'createdBy' | 'updatedBy'>)[]
}

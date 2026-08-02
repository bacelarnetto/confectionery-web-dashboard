export interface ItemSaidaInsumo {
  id?: number
  insumoId: number
  quantidade: number
  lote?: string
  dataValidade?: string
  dataFabricacao?: string
  valorCustoUnitario: number
  valorCustoTotal: number
}

export interface SaidaInsumo {
  id: number
  valorTotal: number
  tipoId: number
  usuarioId: number
  produtoId?: number
  pedidoId?: number
  createdBy: string
  createdOn: string
  updatedBy?: string
  updatedOn?: string
  itens: ItemSaidaInsumo[]
}

export interface SaidaInsumoInsertForm {
  valorTotal: number
  tipoId: number
  usuarioId: number
  produtoId?: number
  pedidoId?: number
  createdBy: string
  itens: Omit<ItemSaidaInsumo, 'id'>[]
}

export interface SaidaInsumoUpdateForm {
  valorTotal: number
  tipoId: number
  usuarioId: number
  produtoId?: number
  pedidoId?: number
  updatedBy: string
  itens: (ItemSaidaInsumo | Omit<ItemSaidaInsumo, 'id'>)[]
}

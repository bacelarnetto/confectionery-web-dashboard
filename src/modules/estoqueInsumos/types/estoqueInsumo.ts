export interface EstoqueInsumo {
  id: number
  insumoId: number
  insumoNome: string
  quantidade: number
  createdBy: string
  createdOn: string
  updatedBy?: string
  updatedOn?: string
}

export interface EstoqueValorizado {
  insumoId: number
  insumoNome: string
  quantidadeTotal: number
  valorTotal: number
  valorCustoMedio: number
}

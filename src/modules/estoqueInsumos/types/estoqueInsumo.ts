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

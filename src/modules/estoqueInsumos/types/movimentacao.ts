export type EstoqueMovimentacaoEnum = 'ADICAO' | 'SUBTRACAO' | 'ATUALIZACAO' | 'RESTAURACAO' | string

export interface Movimentacao {
  id: number
  insumoId?: number
  insumoNome?: string
  itemEntradaInsumoId?: number
  itemSaidaInsumoId?: number
  tipo: EstoqueMovimentacaoEnum
  origem?: string
  quantidadeCausadora: number
  quantidadeResultante: number
  quantidadeSensibilizada: number
  createdOn?: string
  createdBy?: string
}

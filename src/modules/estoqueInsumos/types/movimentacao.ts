export type EstoqueMovimentacaoEnum = 'ADICAO' | 'SUBTRACAO' | 'ATUALIZACAO' | 'RESTAURACAO' | string

export interface Movimentacao {
  id: number
  itemEntradaInsumoId?: number
  itemSaidaInsumoId?: number
  tipo: EstoqueMovimentacaoEnum
  quantidadeCausadora: number
  quantidadeResultante: number
  quantidadeSensibilizada: number
}

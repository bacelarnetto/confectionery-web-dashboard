export interface AlertaInsumo {
  id: number
  data: string
  ativo: boolean
  tipoId: number
  tipoDescricao?: string
  quantidadeAtualEstoque?: number
  quantidadeMinimaEstoque?: number
  quantidadeMaximaEstoque?: number
  dataValidade?: string
  insumoId?: number
  insumoNome?: string
  itemEntradaInsumoId?: number
  resolvidoEm?: string
  resolvidoPor?: string
}

export interface ParametrizacaoAlerta {
  id?: number
  insumoId?: number
  insumoNome?: string
  quantidadeMinimaEstoque: number
  quantidadeMaximaEstoque: number
  quantidadeDiasVencimento: number
}

export interface ParametrizacaoAlertaInsertForm {
  insumoId: number
  quantidadeMinimaEstoque: number
  quantidadeMaximaEstoque: number
  quantidadeDiasVencimento: number
  createdBy: string
}

export interface ParametrizacaoAlertaUpdateForm {
  quantidadeMinimaEstoque: number
  quantidadeMaximaEstoque: number
  quantidadeDiasVencimento: number
  updatedBy: string
}

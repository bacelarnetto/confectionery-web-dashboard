export type TipoSaidaInsumo =
  | 'PRODUCAO'
  | 'SUPLEMENTACAO_INTERNA'
  | 'PERDA_OU_ROUBO'
  | 'DOACAO'
  | 'TROCA'
  | 'VENCIMENTO'

export const TIPO_SAIDA_LABELS: Record<TipoSaidaInsumo, string> = {
  PRODUCAO: 'Produção',
  SUPLEMENTACAO_INTERNA: 'Suplementação interna',
  PERDA_OU_ROUBO: 'Perda ou roubo',
  DOACAO: 'Doação',
  TROCA: 'Troca',
  VENCIMENTO: 'Vencimento',
}

export const TIPO_SAIDA_CODIGOS: Record<TipoSaidaInsumo, number> = {
  PRODUCAO: 1,
  SUPLEMENTACAO_INTERNA: 2,
  PERDA_OU_ROUBO: 3,
  DOACAO: 4,
  TROCA: 5,
  VENCIMENTO: 6,
}

export interface ItemSaidaInsumo {
  id?: number
  insumoId: number
  insumoNome?: string
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
  tipo: string
  tipoId?: number
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
  tipo: TipoSaidaInsumo
  produtoId?: number
  pedidoId?: number
  createdBy: string
  itens: Omit<ItemSaidaInsumo, 'id'>[]
}

export interface SaidaInsumoUpdateForm {
  valorTotal: number
  tipo: TipoSaidaInsumo
  produtoId?: number
  pedidoId?: number
  updatedBy: string
  itens: (ItemSaidaInsumo | Omit<ItemSaidaInsumo, 'id'>)[]
}

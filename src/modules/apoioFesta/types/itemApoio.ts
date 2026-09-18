export type ItemApoioTipo = 'CARRINHO' | 'TACHO' | 'DECORACAO' | 'BANDEJA' | 'TOALHA_MESA' | 'OUTRO'

export const ITEM_APOIO_TIPOS: ItemApoioTipo[] = ['CARRINHO', 'TACHO', 'DECORACAO', 'BANDEJA', 'TOALHA_MESA', 'OUTRO']

export const ITEM_APOIO_TIPO_LABELS: Record<ItemApoioTipo, string> = {
  CARRINHO: 'Carrinho',
  TACHO: 'Tacho',
  DECORACAO: 'Decoração',
  BANDEJA: 'Bandeja',
  TOALHA_MESA: 'Toalha de Mesa',
  OUTRO: 'Outro',
}

export interface ItemApoio {
  id: number
  nome: string
  tipo: ItemApoioTipo
  valorHora: number
  quantidade: number
  /** Tarifa/hora do atendente que acompanha o item -- null quando o item não oferece esse serviço. */
  valorHoraMaoDeObra?: number | null
  createdOn?: string
}

export interface ItemApoioInsertForm {
  nome: string
  tipo: ItemApoioTipo
  valorHora: number
  quantidade: number
  valorHoraMaoDeObra?: number | null
  createdBy?: string
}

export interface ItemApoioUpdateForm {
  nome: string
  tipo: ItemApoioTipo
  valorHora: number
  quantidade: number
  valorHoraMaoDeObra?: number | null
  updatedBy?: string
}

export interface DisponibilidadeDia {
  dia: string
  quantidadeTotal: number
  quantidadeOcupada: number
  quantidadeLivre: number
}

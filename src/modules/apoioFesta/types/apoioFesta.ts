export type ApoioFestaStatus = 'ATIVO' | 'CANCELADO'

export interface ApoioFesta {
  id: number
  itemApoioId: number
  itemApoioNome: string
  pedidoId: number
  horaInicio: string
  horaFim: string
  incluiMaoDeObra: boolean
  /** Snapshot do momento da criação, não é join ao vivo -- some (fica null) só se nunca foi setado; se o
   * colaborador for excluído depois, colaboradorNome continua aparecendo certo no histórico. */
  colaboradorId?: number
  colaboradorNome?: string
  valorTotal: number
  status: ApoioFestaStatus
  canceladoEm?: string
  canceladoPor?: string
  createdOn?: string
  createdBy?: string
  updatedOn?: string
  updatedBy?: string
}

export interface ApoioFestaInsertForm {
  itemApoioId: number
  pedidoId: number
  horaInicio: string
  horaFim: string
  /** Default false no backend se omitido -- só mandar true quando o item tiver valorHoraMaoDeObra. */
  incluiMaoDeObra?: boolean
  /** Independente de incluiMaoDeObra -- pode setar colaborador sem mão de obra incluída, ou incluir
   * mão de obra sem colaborador. 404 se o id não existir. */
  colaboradorId?: number
  createdBy?: string
}

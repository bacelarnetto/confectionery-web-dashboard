export const PEDIDO_STATUS_ORDEM: string[] = [
  'RASCUNHO',
  'CONFIRMADO',
  'EM_PRODUCAO',
  'PRONTO',
  'A_CAMINHO',
  'ENTREGUE',
  'CONCLUIDO',
]

// Pedido de retirada no local (`retirar=true`) não passa por A_CAMINHO -- de PRONTO vai direto
// pra ENTREGUE (achado #71, decisão do dono, backend já implementado). Sem backfill: um pedido
// de retirada que já esteja gravado em A_CAMINHO (dado legado) segue o fluxo normal a partir daí --
// por isso o pill de A_CAMINHO só some quando NÃO é o status atual; se for, precisa continuar
// aparecendo (senão a pill do status atual do pedido desaparece da tela, e os índices usados por
// `tituloStatusPill` pra calcular "status já avançado" quebram).
export function statusOrdemVisivel(retirar?: boolean, atual?: string): string[] {
  if (!retirar) return PEDIDO_STATUS_ORDEM
  return PEDIDO_STATUS_ORDEM.filter((s) => s !== 'A_CAMINHO' || s === atual)
}

// Status para os quais dá pra migrar a partir de `atual`: o PRÓXIMO passo da ordem canônica
// (evolução natural, sem pular) + CANCELADO (regra de negócio: cancelável de qualquer status,
// exceto CONCLUIDO e já CANCELADO). Nunca inclui o próprio status atual.
export function statusDisponiveisPara(atual: string | undefined, retirar?: boolean): string[] {
  if (!atual) return ['RASCUNHO', 'CANCELADO']
  if (atual === 'CONCLUIDO' || atual === 'CANCELADO') return []
  if (retirar && atual === 'PRONTO') return ['ENTREGUE', 'CANCELADO']
  const idx = PEDIDO_STATUS_ORDEM.indexOf(atual)
  if (idx >= 0 && idx < PEDIDO_STATUS_ORDEM.length - 1) {
    return [PEDIDO_STATUS_ORDEM[idx + 1], 'CANCELADO']
  }
  return ['CANCELADO']
}

export function tituloStatusPill(status: string, atual?: string, retirar?: boolean): string | undefined {
  if (!atual) return undefined
  if (atual === 'CANCELADO') return 'Pedido cancelado — não é possível alterar'
  if (atual === 'CONCLUIDO') return 'Pedido concluído — não é possível alterar'
  const ordem = statusOrdemVisivel(retirar, atual)
  const i = ordem.indexOf(status)
  const j = ordem.indexOf(atual)
  if (j >= 0 && i >= 0 && i < j) return 'Status já avançado'
  if (i > j + 1) {
    const anterior = ordem[i - 1]
    return `Para mudar para ${status.replace('_', ' ')}, o pedido precisa estar em ${anterior.replace('_', ' ')}`
  }
  return undefined
}

export const STATUS_COLORS: Record<string, string> = {
  RASCUNHO: 'bg-gray-100 text-gray-600',
  CONFIRMADO: 'bg-blue-100 text-blue-800',
  EM_PRODUCAO: 'bg-purple-100 text-purple-800',
  PRONTO: 'bg-green-100 text-green-800',
  A_CAMINHO: 'bg-amber-100 text-amber-800',
  ENTREGUE: 'bg-orange-100 text-orange-800',
  CONCLUIDO: 'bg-emerald-100 text-emerald-800',
  CANCELADO: 'bg-red-100 text-red-800',
}

// Status em que faz sentido oferecer registrar um pagamento na hora: CONFIRMADO é o momento comum
// do adiantamento (sugere 50% do total); ENTREGUE é quando o saldo costuma ser quitado (sugere o
// saldo inteiro, sem percentual). Pedido do dono -- ver conversa sobre "onde colocamos o
// adiantamento dos 50%".
export const STATUS_QUE_SUGEREM_PAGAMENTO: Record<string, number | undefined> = {
  CONFIRMADO: 0.5,
  ENTREGUE: undefined,
}

export const STATUS_TERMINAIS = ['CANCELADO', 'ENTREGUE', 'CONCLUIDO']

export interface PrazoEntrega {
  label: string
  badgeClass: string
}

// Converte a data de entrega em um badge de urgência, seguindo a mesma lógica de cor dos alertas
// de pedido: vermelho = atrasado, laranja = hoje, amarelo = ainda dá tempo (até 3 dias). Pedidos
// em status terminal ou sem data de entrega não geram badge.
export function getPrazoEntrega(dataEntrega?: string, status?: string): PrazoEntrega | null {
  if (!dataEntrega) return null
  if (STATUS_TERMINAIS.includes(status ?? '')) return null

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const entrega = new Date(dataEntrega)
  entrega.setHours(0, 0, 0, 0)
  const diffDays = Math.round((entrega.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return { label: 'Atrasado', badgeClass: 'bg-red-100 text-red-700' }
  if (diffDays === 0) return { label: 'Hoje', badgeClass: 'bg-orange-100 text-orange-700' }
  if (diffDays <= 3) {
    return {
      label: diffDays === 1 ? 'Em 1 dia' : `Em ${diffDays} dias`,
      badgeClass: 'bg-yellow-100 text-yellow-800',
    }
  }
  return null
}

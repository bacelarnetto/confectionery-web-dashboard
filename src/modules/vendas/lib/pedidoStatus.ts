export const STATUS_COLORS: Record<string, string> = {
  RASCUNHO: 'bg-gray-100 text-gray-600',
  CONFIRMADO: 'bg-blue-100 text-blue-800',
  EM_PRODUCAO: 'bg-purple-100 text-purple-800',
  PRONTO: 'bg-green-100 text-green-800',
  A_CAMINHO: 'bg-amber-100 text-amber-800',
  ENTREGUE: 'bg-gray-100 text-gray-700',
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

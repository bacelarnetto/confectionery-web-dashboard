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

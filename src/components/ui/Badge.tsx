interface BadgeProps {
  status: string
}

const statusStyles: Record<string, string> = {
  // Compras
  RASCUNHO:     'bg-gray-100 text-gray-600',
  PENDENTE:     'bg-yellow-100 text-yellow-800',
  EM_ANDAMENTO: 'bg-blue-100 text-blue-700',
  CONFIRMADA:   'bg-green-100 text-green-800',
  CANCELADA:    'bg-red-100 text-red-700',
  // Estoque / outros
  RECEBIDA:     'bg-green-100 text-green-800',
  // Perfil de usuário (F9)
  ADMIN:        'bg-purple-100 text-purple-700',
  ESTOQUE:      'bg-blue-100 text-blue-700',
  VENDAS:       'bg-green-100 text-green-800',
  PRODUCAO:     'bg-orange-100 text-orange-700',
  // Orçamento (F10)
  ABERTO:       'bg-amber-100 text-amber-800',
  CONVERTIDO:   'bg-green-100 text-green-800',
  REJEITADO:    'bg-red-100 text-red-700',
  EXPIRADO:     'bg-gray-100 text-gray-600',
  PADRAO:       'bg-indigo-100 text-indigo-700',
  // Origem do lote de estoque de produto (F17)
  FABRICACAO:   'bg-blue-100 text-blue-700',
  TERCEIRIZADO: 'bg-teal-100 text-teal-700',
}

const statusLabels: Record<string, string> = {
  RASCUNHO:     'Rascunho',
  PENDENTE:     'Pendente',
  EM_ANDAMENTO: 'Em andamento',
  CONFIRMADA:   'Confirmada',
  CANCELADA:    'Cancelada',
  RECEBIDA:     'Recebida',
  ADMIN:        'Admin',
  ESTOQUE:      'Estoque',
  VENDAS:       'Vendas',
  PRODUCAO:     'Produção',
  ABERTO:       'Aberto',
  CONVERTIDO:   'Convertido',
  REJEITADO:    'Rejeitado',
  EXPIRADO:     'Expirado',
  PADRAO:       'Padrão',
  FABRICACAO:   'Fabricação',
  TERCEIRIZADO: 'Terceirizado',
}

export default function Badge({ status }: BadgeProps) {
  const style = statusStyles[status] ?? 'bg-gray-100 text-gray-700'
  const label = statusLabels[status] ?? status

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${style}`}>
      {label}
    </span>
  )
}
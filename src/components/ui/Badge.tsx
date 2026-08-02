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
}

const statusLabels: Record<string, string> = {
  RASCUNHO:     'Rascunho',
  PENDENTE:     'Pendente',
  EM_ANDAMENTO: 'Em andamento',
  CONFIRMADA:   'Confirmada',
  CANCELADA:    'Cancelada',
  RECEBIDA:     'Recebida',
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
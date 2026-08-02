import { AlertTriangle, MapPin, Package } from 'lucide-react'
import { Pedido } from '../types/pedido'

function getUrgencyColor(dataEntrega?: string, status?: string): string {
  if (status === 'ENTREGUE' || status === 'CANCELADO') {
    return 'bg-gray-100 opacity-60'
  }
  if (!dataEntrega) return 'bg-green-100'

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const entrega = new Date(dataEntrega)
  entrega.setHours(0, 0, 0, 0)
  const diffDays = Math.floor((entrega.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'bg-red-200'  // atrasado
  if (diffDays === 0) return 'bg-red-200' // hoje
  if (diffDays === 1) return 'bg-orange-200'
  if (diffDays <= 3) return 'bg-yellow-200'
  return 'bg-green-100'
}

const STATUS_BADGE: Record<string, string> = {
  RASCUNHO:    'bg-gray-200 text-gray-700',
  CONFIRMADO:  'bg-blue-100 text-blue-800',
  EM_PRODUCAO: 'bg-purple-100 text-purple-800',
  PRONTO:      'bg-green-200 text-green-800',
  ENTREGUE:    'bg-gray-200 text-gray-600',
  CANCELADO:   'bg-red-100 text-red-700',
}

function formatDateTime(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

function formatCurrency(val?: number) {
  if (val == null) return '—'
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface Props {
  pedido: Pedido
  hasAlerta?: boolean
  onClick: () => void
  rotation: string
}

export default function PedidoStickyCard({ pedido, hasAlerta, onClick, rotation }: Props) {
  const bgColor = getUrgencyColor(pedido.dataEntrega, pedido.status)
  const isDone = pedido.status === 'ENTREGUE' || pedido.status === 'CANCELADO'
  const statusBadge = STATUS_BADGE[pedido.status ?? ''] ?? 'bg-gray-100 text-gray-600'

  return (
    <div
      onClick={onClick}
      className={`
        ${bgColor}
        ${rotation}
        ${isDone ? 'line-through opacity-60' : ''}
        rounded-sm shadow-md p-4 cursor-pointer
        hover:rotate-0 hover:shadow-lg hover:opacity-100
        transition-all duration-150
        border-t-4 border-t-yellow-400
        min-w-[200px] max-w-[240px]
        flex flex-col gap-2
      `}
    >
      <p className="font-bold text-gray-800 text-base leading-tight truncate">
        {pedido.clienteNome ?? (pedido.clienteId ? `Cliente #${pedido.clienteId}` : '—')}
      </p>

      <div className="flex items-center gap-1 text-xs text-gray-600">
        <Package size={12} />
        <span>{formatDateTime(pedido.dataEntrega)}</span>
      </div>

      <p className="text-sm font-semibold text-gray-700">{formatCurrency(pedido.valorTotal)}</p>

      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge}`}>
          {pedido.status}
        </span>
        {pedido.retirar ? (
          <span className="text-xs text-gray-500">Retirada</span>
        ) : (
          <MapPin size={12} className="text-gray-400" />
        )}
      </div>

      {hasAlerta && (
        <span className="flex items-center gap-1 text-xs text-orange-700 font-medium">
          <AlertTriangle size={12} /> Ingredientes insuficientes
        </span>
      )}
    </div>
  )
}

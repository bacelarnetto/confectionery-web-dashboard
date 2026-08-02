import { useState } from 'react'
import { ChevronLeft, ChevronRight, KanbanSquare } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import pedidoService from '../services/pedidoService'
import { useAlertasPedidoAtivos } from '../hooks/useAlertasPedido'
import PedidoStickyCard from '../components/PedidoStickyCard'
import PedidoDetalheModal from '../components/PedidoDetalheModal'
import { Pedido } from '../types/pedido'

const ROTATIONS = [
  'rotate-[-1deg]',
  'rotate-[1deg]',
  'rotate-[-0.5deg]',
  'rotate-[0.5deg]',
  'rotate-[-1.5deg]',
  'rotate-[1.5deg]',
]

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatIso(d: Date) {
  return d.toISOString()
}

function formatWeekLabel(monday: Date): string {
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit' }
  return `${monday.toLocaleDateString('pt-BR', opts)} – ${sunday.toLocaleDateString('pt-BR', opts)}`
}

export default function PedidoMuralPage() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [selected, setSelected] = useState<Pedido | null>(null)

  const monday = getMondayOfWeek(new Date())
  monday.setDate(monday.getDate() + weekOffset * 7)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  const { data, isLoading } = useQuery({
    queryKey: ['pedidos-mural', formatIso(monday)],
    queryFn: () => pedidoService.getBySemana(formatIso(monday), formatIso(sunday)),
    staleTime: 30_000,
  })

  const { data: alertasData } = useAlertasPedidoAtivos()
  const pedidosComAlerta = new Set(
    alertasData?.content
      .filter((a) => a.ingredientesInsuficientes)
      .map((a) => a.pedidoId) ?? [],
  )

  const pedidos = data?.content ?? []

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <KanbanSquare className="text-blue-600" size={28} />
        <h1 className="text-2xl font-bold text-gray-800">Mural da Semana</h1>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setWeekOffset((w) => w - 1)}
          className="p-2 rounded-lg border hover:bg-gray-100"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-medium text-gray-700 min-w-[160px] text-center">
          {formatWeekLabel(monday)}
        </span>
        <button
          onClick={() => setWeekOffset((w) => w + 1)}
          className="p-2 rounded-lg border hover:bg-gray-100"
        >
          <ChevronRight size={18} />
        </button>
        {weekOffset !== 0 && (
          <button
            onClick={() => setWeekOffset(0)}
            className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Semana atual
          </button>
        )}
      </div>

      {isLoading && <p className="text-gray-500">Carregando pedidos...</p>}

      {!isLoading && pedidos.length === 0 && (
        <p className="text-gray-400 text-center py-16 text-lg">
          Nenhum pedido com data de entrega nessa semana.
        </p>
      )}

      <div className="flex flex-wrap gap-4">
        {pedidos.map((pedido, idx) => (
          <PedidoStickyCard
            key={pedido.id}
            pedido={pedido}
            hasAlerta={pedidosComAlerta.has(pedido.id)}
            rotation={ROTATIONS[idx % ROTATIONS.length]}
            onClick={() => setSelected(pedido)}
          />
        ))}
      </div>

      {selected && (
        <PedidoDetalheModal pedido={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}

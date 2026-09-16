import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, KanbanSquare } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import pedidoService from '../services/pedidoService'
import { useAlertasPedidoAtivos } from '../hooks/useAlertasPedido'
import PedidoStickyCard from '../components/PedidoStickyCard'
import PedidoDetalheModal from '../components/PedidoDetalheModal'
import { Pedido } from '../types/pedido'

type FilterType = 'todos' | 'hoje' | 'proximos' | 'fds' | 'abertos'

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
  const queryClient = useQueryClient()
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

  const [filterType, setFilterType] = useState<FilterType>('todos')

  const filteredPedidos = useMemo(() => {
    if (filterType === 'todos') return pedidos

    const now = new Date()
    now.setHours(0, 0, 0, 0)

    return pedidos.filter((p) => {
      if (filterType === 'abertos') {
        return !['ENTREGUE', 'CONCLUIDO', 'CANCELADO'].includes(p.status ?? '')
      }

      if (!p.dataEntrega) return false
      const d = new Date(p.dataEntrega)
      const dZero = new Date(d)
      dZero.setHours(0, 0, 0, 0)
      const diffDays = Math.round((dZero.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (filterType === 'hoje') return diffDays === 0
      if (filterType === 'proximos') return diffDays >= 0 && diffDays <= 3
      if (filterType === 'fds') {
        const day = d.getDay()
        return day === 0 || day === 6
      }
      return true
    })
  }, [pedidos, filterType])

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <KanbanSquare className="text-blue-600" size={28} />
        <h1 className="text-2xl font-bold text-gray-800">Mural da Semana</h1>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset((w) => w - 1)}
            className="p-2 rounded-lg border hover:bg-gray-100 cursor-pointer"
            title="Semana anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-semibold text-gray-700 min-w-[160px] text-center bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-2xs">
            {formatWeekLabel(monday)}
          </span>
          <button
            onClick={() => setWeekOffset((w) => w + 1)}
            className="p-2 rounded-lg border hover:bg-gray-100 cursor-pointer"
            title="Próxima semana"
          >
            <ChevronRight size={18} />
          </button>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
            >
              Semana atual
            </button>
          )}
        </div>

        {/* Pílulas de filtro de prazo */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setFilterType('todos')}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
              filterType === 'todos'
                ? 'bg-gray-900 text-white shadow-2xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Todos ({pedidos.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('hoje')}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
              filterType === 'hoje'
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            🔥 Hoje
          </button>
          <button
            type="button"
            onClick={() => setFilterType('proximos')}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
              filterType === 'proximos'
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Próximos 3 Dias
          </button>
          <button
            type="button"
            onClick={() => setFilterType('fds')}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
              filterType === 'fds'
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Fim de Semana
          </button>
          <button
            type="button"
            onClick={() => setFilterType('abertos')}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
              filterType === 'abertos'
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Em Aberto
          </button>
        </div>
      </div>

      {isLoading && <p className="text-gray-500">Carregando pedidos...</p>}

      {!isLoading && filteredPedidos.length === 0 && (
        <p className="text-gray-400 text-center py-16 text-sm">
          {filterType === 'todos'
            ? 'Nenhum pedido com data de entrega nessa semana.'
            : 'Nenhum pedido encontrado para o filtro selecionado nesta semana.'}
        </p>
      )}

      <div className="flex flex-wrap gap-4">
        {filteredPedidos.map((pedido, idx) => (
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
        <PedidoDetalheModal
          pedido={selected}
          onClose={() => {
            setSelected(null)
            queryClient.invalidateQueries({ queryKey: ['pedidos-mural'] })
          }}
          onUpdated={() => {
            queryClient.invalidateQueries({ queryKey: ['pedidos-mural'] })
          }}
        />
      )}
    </div>
  )
}

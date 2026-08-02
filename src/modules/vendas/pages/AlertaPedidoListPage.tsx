import { CalendarClock } from 'lucide-react'
import { AlertaPedido, AlertaPedidoTipo } from '../types/alertaPedido'
import { useAlertasPedidoAtivos, useReconhecerAlertaPedido } from '../hooks/useAlertasPedido'
import { useNavigate } from 'react-router'

const TIPO_CONFIG: Record<AlertaPedidoTipo, { label: string; bg: string; text: string; badge: string }> = {
  ATRASADO:  { label: 'Atrasado',    bg: 'bg-red-50',    text: 'text-red-800',    badge: 'bg-red-600 text-white' },
  NO_DIA:    { label: 'Hoje',        bg: 'bg-orange-50', text: 'text-orange-800', badge: 'bg-orange-500 text-white' },
  UM_DIA:    { label: 'Amanhã',      bg: 'bg-yellow-50', text: 'text-yellow-800', badge: 'bg-yellow-400 text-yellow-900' },
  DOIS_DIAS: { label: '2 dias',      bg: 'bg-yellow-50', text: 'text-yellow-800', badge: 'bg-yellow-400 text-yellow-900' },
  TRES_DIAS: { label: '3 dias',      bg: 'bg-yellow-50', text: 'text-yellow-800', badge: 'bg-yellow-400 text-yellow-900' },
  SEMANAL:   { label: 'Semanal',     bg: 'bg-blue-50',   text: 'text-blue-800',   badge: 'bg-blue-500 text-white' },
}

const TIPO_ORDER: AlertaPedidoTipo[] = ['ATRASADO', 'NO_DIA', 'UM_DIA', 'DOIS_DIAS', 'TRES_DIAS', 'SEMANAL']

function formatDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

function AlertaCard({ alerta }: { alerta: AlertaPedido }) {
  const navigate = useNavigate()
  const { mutate: reconhecer, isPending } = useReconhecerAlertaPedido()
  const cfg = TIPO_CONFIG[alerta.tipo]

  return (
    <div className={`${cfg.bg} border border-gray-200 rounded-lg p-4 flex flex-col gap-2`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className={`font-semibold text-base ${cfg.text}`}>{alerta.clienteNome ?? '—'}</p>
          <p className="text-sm text-gray-500">Entrega: {formatDate(alerta.dataEntregaPedido)}</p>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${cfg.badge}`}>{cfg.label}</span>
      </div>

      {alerta.ingredientesInsuficientes && (
        <p className="text-xs font-medium text-orange-700 bg-orange-100 rounded px-2 py-1">
          ⚠️ Ingredientes insuficientes
        </p>
      )}

      <div className="flex gap-2 mt-1">
        <button
          onClick={() => navigate(`/vendas/pedidos/${alerta.pedidoId}/editar`)}
          className="text-xs text-blue-600 hover:underline"
        >
          Ver pedido
        </button>
        <button
          disabled={isPending}
          onClick={() => reconhecer(alerta.id)}
          className="ml-auto text-xs bg-gray-700 hover:bg-gray-900 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          Reconhecer
        </button>
      </div>
    </div>
  )
}

export default function AlertaPedidoListPage() {
  const { data, isLoading } = useAlertasPedidoAtivos()

  if (isLoading) return <p className="p-6 text-gray-500">Carregando alertas...</p>

  const alertas = data?.content ?? []

  const grouped = TIPO_ORDER.reduce<Record<string, AlertaPedido[]>>((acc, tipo) => {
    const items = alertas.filter((a) => a.tipo === tipo)
    if (items.length > 0) acc[tipo] = items
    return acc
  }, {})

  const totalAtivos = alertas.length

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <CalendarClock className="text-red-600" size={28} />
        <h1 className="text-2xl font-bold text-gray-800">Alertas de Pedidos</h1>
        {totalAtivos > 0 && (
          <span className="bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full">
            {totalAtivos}
          </span>
        )}
      </div>

      {totalAtivos === 0 && (
        <p className="text-gray-500 text-center py-12">Nenhum alerta ativo no momento.</p>
      )}

      <div className="flex flex-col gap-6">
        {(Object.entries(grouped) as [AlertaPedidoTipo, AlertaPedido[]][]).map(([tipo, items]) => (
          <section key={tipo}>
            <h2 className={`text-sm font-bold uppercase tracking-wider mb-3 ${TIPO_CONFIG[tipo].text}`}>
              {TIPO_CONFIG[tipo].label} — {items.length} pedido{items.length !== 1 ? 's' : ''}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((a) => (
                <AlertaCard key={a.id} alerta={a} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

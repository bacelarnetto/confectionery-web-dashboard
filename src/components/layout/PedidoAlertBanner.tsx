import { CalendarClock } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useCountAlertasPedidoAtivos } from '../../modules/vendas/hooks/useAlertasPedido'
import { useAlertasPedidoAtivos } from '../../modules/vendas/hooks/useAlertasPedido'

export default function PedidoAlertBanner() {
  const navigate = useNavigate()
  const { data: count } = useCountAlertasPedidoAtivos()
  const { data: alertasData } = useAlertasPedidoAtivos()

  if (!count || count === 0) return null

  const temAtrasado = alertasData?.content.some((a) => a.tipo === 'ATRASADO') ?? false
  const bgColor = temAtrasado ? 'bg-red-600' : 'bg-orange-500'

  return (
    <div className={`${bgColor} text-white px-4 py-2 flex items-center gap-3`}>
      <CalendarClock size={18} />
      <span className="text-sm font-medium flex-1">
        ⚠ {count} pedido{count !== 1 ? 's' : ''} precisa{count === 1 ? '' : 'm'} de atenção
      </span>
      <button
        onClick={() => navigate('/alertas-pedido')}
        className="text-sm font-bold underline hover:no-underline"
      >
        Ver alertas
      </button>
    </div>
  )
}

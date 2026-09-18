import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'

interface Props {
  open: boolean
  pedidoId: number
  statusAtual: string | undefined
  statusNovo: string
  isPending: boolean
  onConfirm: () => void
  onCancel: () => void
}

function formatarStatus(s: string) {
  return s.replace('_', ' ')
}

const AVISOS: Record<string, string> = {
  EM_PRODUCAO: 'Ao confirmar, o estoque será debitado automaticamente.',
  CANCELADO: 'Ao confirmar, os pagamentos serão estornados e o estoque pode ser revertido.',
  ENTREGUE: 'Você poderá registrar o pagamento em seguida.',
  CONFIRMADO: 'Você poderá registrar o pagamento em seguida.',
}

export default function ConfirmarMudancaStatusModal({
  open,
  pedidoId,
  statusAtual,
  statusNovo,
  isPending,
  onConfirm,
  onCancel,
}: Props) {
  const aviso = AVISOS[statusNovo]

  return (
    <Modal open={open} onClose={onCancel} title="Confirmar mudança de status">
      <div className="text-sm text-gray-600 space-y-3">
        <p>
          Pedido <span className="font-semibold text-gray-900">#{pedidoId}</span>
        </p>
        <p className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
            {statusAtual ? formatarStatus(statusAtual) : 'Sem status'}
          </span>
          <span aria-hidden>→</span>
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
            {formatarStatus(statusNovo)}
          </span>
        </p>
        {aviso && (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            {aviso}
          </p>
        )}
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Voltar
        </Button>
        <Button
          type="button"
          variant={statusNovo === 'CANCELADO' ? 'danger' : 'primary'}
          onClick={onConfirm}
          isLoading={isPending}
        >
          Confirmar mudança
        </Button>
      </div>
    </Modal>
  )
}
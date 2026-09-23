import { useState, useEffect, FormEvent } from 'react'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import { usePedido, usePagamentosPedido, useRegistrarPagamentoPedido } from '../hooks/usePedidos'
import { useFormasPagamento } from '../hooks/useFormasPagamento'
import { formatCurrency } from '../../../lib/format'
import PedidoErroModal from './PedidoErroModal'

const inputClass =
  'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent placeholder:text-gray-400'

function hoje(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

interface Props {
  pedidoId: number
  open: boolean
  onClose: () => void
  // Sugere um percentual do valor total do pedido (ex: 0.5 pro adiantamento na confirmação) em vez
  // do saldo inteiro -- sem isso, sugere o saldo restante (uso: pagamento avulso ou na entrega).
  percentualSugerido?: number
  title?: string
}

export default function RegistrarPagamentoModal({
  pedidoId,
  open,
  onClose,
  percentualSugerido,
  title = 'Registrar pagamento',
}: Props) {
  const { data: pedido } = usePedido(open ? pedidoId : 0)
  const { data: pagamentos } = usePagamentosPedido(open ? pedidoId : 0)
  const { data: formasPagamentoData } = useFormasPagamento(0, 100)
  const registrarMutation = useRegistrarPagamentoPedido()

  const formasPagamento = formasPagamentoData?.content ?? []
  const totalPago = (pagamentos ?? []).reduce((acc, p) => acc + (p.valor ?? 0), 0)
  const saldo = (pedido?.valorTotal ?? 0) - totalPago
  const valorSugerido = percentualSugerido != null ? (pedido?.valorTotal ?? 0) * percentualSugerido : saldo

  const [valor, setValor] = useState('')
  const [dataPagamento, setDataPagamento] = useState(hoje())
  const [formaPagamentoId, setFormaPagamentoId] = useState('')
  const [observacao, setObservacao] = useState('')
  const [valorInicializado, setValorInicializado] = useState(false)
  const [erro, setErro] = useState<unknown>(null)

  // Reseta tudo (menos o valor) já na abertura -- o valor sugerido depende de usePedido/
  // usePagamentosPedido, que ainda não voltaram nesse exato instante (é um fetch novo, o modal só
  // recebe o pedidoId). Preencher aqui direto pegaria 0 sempre.
  useEffect(() => {
    if (open) {
      setDataPagamento(hoje())
      setFormaPagamentoId('')
      setObservacao('')
      setValorInicializado(false)
    }
  }, [open, pedidoId])

  // Assim que o pedido carrega, preenche o valor sugerido uma única vez por abertura -- não
  // sobrescreve de novo se o usuário já começou a digitar (ex: pagamentos revalidando em segundo
  // plano enquanto o modal segue aberto).
  useEffect(() => {
    if (open && !valorInicializado && pedido) {
      setValor(valorSugerido > 0 ? valorSugerido.toFixed(2) : '')
      setValorInicializado(true)
    }
  }, [open, valorInicializado, pedido, valorSugerido])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    registrarMutation.mutate(
      {
        id: pedidoId,
        data: {
          valor: Number(valor),
          dataPagamento: new Date(`${dataPagamento}T00:00:00`).toISOString(),
          formaPagamentoId: Number(formaPagamentoId),
          observacao: observacao || undefined,
          createdBy: '',
        },
      },
      {
        onSuccess: onClose,
        // Achado C da homologação (2026-09-23): sem isso, um 403 (perfil sem permissão) deixava o
        // modal aberto sem nenhum feedback -- o toast global do interceptor ainda dispara, mas o
        // usuário fica sem explicação dentro do próprio modal, achando que o clique não funcionou.
        onError: setErro,
      },
    )
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      {pedido && (
        <p className="text-sm text-gray-500 mb-4 -mt-1">
          Total do pedido {formatCurrency(pedido.valorTotal)} · já pago {formatCurrency(totalPago)} · saldo{' '}
          <span className="font-medium text-gray-700">{formatCurrency(saldo)}</span>
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Valor (R$) <span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            required
            className={inputClass}
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data do pagamento <span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="date"
            value={dataPagamento}
            onChange={(e) => setDataPagamento(e.target.value)}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Forma de pagamento <span className="text-red-500 ml-0.5">*</span>
          </label>
          <select
            value={formaPagamentoId}
            onChange={(e) => setFormaPagamentoId(e.target.value)}
            required
            className={inputClass}
          >
            <option value="">Selecione...</option>
            {formasPagamento.map((f) => (
              <option key={f.id} value={f.id}>{f.nome}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
          <input
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            className={inputClass}
            placeholder="Opcional"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={registrarMutation.isPending}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-60"
          >
            Cancelar
          </button>
          <Button type="submit" isLoading={registrarMutation.isPending}>
            Registrar
          </Button>
        </div>
      </form>

      <PedidoErroModal open={!!erro} onClose={() => setErro(null)} erro={erro} pedidoId={pedidoId} />
    </Modal>
  )
}

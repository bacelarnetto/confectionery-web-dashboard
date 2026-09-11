import { useState, useEffect, FormEvent } from 'react'
import { HandCoins } from 'lucide-react'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import { Pedido } from '../types/pedido'
import { usePagamentosPedido, useRegistrarPagamentoPedido, useUpdateMotivoPendenciaPedido } from '../hooks/usePedidos'
import { formatCurrency } from '../../../lib/format'

const inputClass =
  'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent placeholder:text-gray-400'

function formatData(dateStr?: string) {
  if (!dateStr) return '—'
  try {
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
      new Date(dateStr),
    )
  } catch {
    return dateStr
  }
}

function hoje(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

interface Props {
  pedidoId: number
  pedido: Pedido
}

export default function PedidoPagamentoCard({ pedidoId, pedido }: Props) {
  const { data: pagamentos, isLoading } = usePagamentosPedido(pedidoId)
  const registrarMutation = useRegistrarPagamentoPedido()
  const updateMotivoMutation = useUpdateMotivoPendenciaPedido()

  const [showModal, setShowModal] = useState(false)
  const [valor, setValor] = useState('')
  const [dataPagamento, setDataPagamento] = useState(hoje())
  const [observacao, setObservacao] = useState('')
  const [motivo, setMotivo] = useState('')

  useEffect(() => {
    setMotivo(pedido.motivoPendencia ?? '')
  }, [pedido.motivoPendencia])

  const listaPagamentos = pagamentos ?? []
  const totalPago = listaPagamentos.reduce((acc, p) => acc + (p.valor ?? 0), 0)
  const saldo = (pedido.valorTotal ?? 0) - totalPago

  function openModal() {
    setValor(saldo > 0 ? String(saldo) : '')
    setDataPagamento(hoje())
    setObservacao('')
    setShowModal(true)
  }

  function handleSubmitPagamento(e: FormEvent) {
    e.preventDefault()
    registrarMutation.mutate(
      {
        id: pedidoId,
        data: { valor: Number(valor), dataPagamento, observacao: observacao || undefined, createdBy: 'netto' },
      },
      { onSettled: () => setShowModal(false) },
    )
  }

  function handleSalvarMotivo() {
    updateMotivoMutation.mutate({ id: pedidoId, motivoPendencia: motivo || undefined })
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Pagamento</h3>
          <button
            type="button"
            onClick={openModal}
            disabled={saldo <= 0 || registrarMutation.isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <HandCoins size={14} />
            Registrar Pagamento
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500">Total do pedido</p>
            <p className="text-base font-semibold text-gray-900">{formatCurrency(pedido.valorTotal)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total pago</p>
            <p className="text-base font-semibold text-emerald-600">{formatCurrency(totalPago)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Saldo a receber</p>
            <p className={`text-base font-semibold ${saldo > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
              {formatCurrency(saldo)}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="h-8 bg-gray-100 rounded animate-pulse" />
        ) : listaPagamentos.length > 0 ? (
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="text-xs text-gray-500 border-b">
                <th className="text-left pb-1">Data</th>
                <th className="text-right pb-1">Valor</th>
                <th className="text-left pb-1">Observação</th>
              </tr>
            </thead>
            <tbody>
              {listaPagamentos.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="py-1.5">{formatData(p.dataPagamento)}</td>
                  <td className="text-right py-1.5 font-medium">{formatCurrency(p.valor)}</td>
                  <td className="py-1.5 text-gray-600">{p.observacao ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-400 mb-4">Nenhum pagamento registrado para este pedido.</p>
        )}

        <div className="border-t border-gray-100 pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Motivo de pendência (não pagamento)</label>
          <div className="flex items-start gap-2">
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={2}
              className={inputClass}
              placeholder="Ex: pedido já entregue, cliente vai pagar no pix na sexta..."
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleSalvarMotivo}
              isLoading={updateMotivoMutation.isPending}
            >
              Salvar motivo
            </Button>
          </div>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Registrar pagamento">
        <form onSubmit={handleSubmitPagamento} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor (R$) <span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max={saldo}
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
              onClick={() => setShowModal(false)}
              disabled={registrarMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-60"
            >
              Cancelar
            </button>
            <Button type="submit" isLoading={registrarMutation.isPending}>
              Registrar
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
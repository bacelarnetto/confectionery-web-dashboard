import { useState, useEffect } from 'react'
import { useAuth } from 'react-oidc-context'
import { HandCoins, Download, Pencil } from 'lucide-react'
import Button from '../../../components/ui/Button'
import { Pedido } from '../types/pedido'
import { usePagamentosPedido, useUpdateMotivoPendenciaPedido, useDownloadReciboPagamento } from '../hooks/usePedidos'
import RegistrarPagamentoModal from './RegistrarPagamentoModal'
import { formatCurrency } from '../../../lib/format'
import { getRoles } from '../../../lib/auth'
import { podeRegistrarPagamentoPedido, podeEditarDadosPedido } from '../lib/pedidoPermissoes'

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

interface Props {
  pedidoId: number
  pedido: Pedido
  /** Total recalculado pelo form em edição (`calcularResumo`), ainda não salvo -- quando presente,
   * o card mostra esse valor (e o saldo derivado dele) em vez do `pedido.valorTotal` persistido, com
   * um indicador visual de "em edição". Passado só pelo `PedidoFormPage`; Mural/Detalhe não usam. */
  valorTotalEmEdicao?: number
}

export default function PedidoPagamentoCard({ pedidoId, pedido, valorTotalEmEdicao }: Props) {
  const auth = useAuth()
  const perfis = getRoles(auth.user)
  const podePagar = podeRegistrarPagamentoPedido(perfis)
  // updateMotivoPendencia reaproveita o PUT /pedido/{id} genérico (não é um endpoint de
  // pagamento) -- segue a mesma regra de "editar dados", não a de "registrar pagamento".
  const podeEditarMotivo = podeEditarDadosPedido(perfis, pedido.status)
  const { data: pagamentos, isLoading } = usePagamentosPedido(pedidoId)
  const updateMotivoMutation = useUpdateMotivoPendenciaPedido()
  const downloadReciboMutation = useDownloadReciboPagamento()

  const [showModal, setShowModal] = useState(false)
  const [motivo, setMotivo] = useState('')

  useEffect(() => {
    setMotivo(pedido.motivoPendencia ?? '')
  }, [pedido.motivoPendencia])

  const listaPagamentos = pagamentos ?? []
  const totalPago = listaPagamentos.reduce((acc, p) => acc + (p.valor ?? 0), 0)
  const totalReferencia = valorTotalEmEdicao ?? pedido.valorTotal ?? 0
  // Só marca "em edição" quando o valor do form realmente diverge do persistido -- não só por estar
  // em edição (o form abre com os mesmos valores). Tolerância de meio centavo evita ruído de ponto
  // flutuante entre a soma do form e o valorTotal salvo pelo backend.
  const emEdicao = valorTotalEmEdicao != null && Math.abs(valorTotalEmEdicao - (pedido.valorTotal ?? 0)) > 0.005
  const saldo = totalReferencia - totalPago

  function handleSalvarMotivo() {
    updateMotivoMutation.mutate({ id: pedidoId, motivoPendencia: motivo || undefined })
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Pagamento</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => downloadReciboMutation.mutate(pedidoId)}
              disabled={listaPagamentos.length === 0 || downloadReciboMutation.isPending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Baixar recibo de pagamento"
            >
              <Download size={14} />
              Baixar Recibo
            </button>
            {podePagar && (
              <button
                type="button"
                onClick={() => setShowModal(true)}
                disabled={saldo <= 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded-lg shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-600"
              >
                <HandCoins size={14} />
                Registrar Pagamento
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              Total do pedido
              {emEdicao && (
                <span
                  title="Ainda não salvo -- reflete os itens/frete/apoio em edição no formulário"
                  className="inline-flex items-center gap-0.5 text-[10px] font-medium text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded"
                >
                  <Pencil size={9} /> em edição
                </span>
              )}
            </p>
            <p className="text-base font-semibold text-gray-900">{formatCurrency(totalReferencia)}</p>
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
                <th className="text-left pb-1 pl-4">Forma</th>
                <th className="text-left pb-1 pl-4">Observação</th>
              </tr>
            </thead>
            <tbody>
              {listaPagamentos.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="py-1.5">{formatData(p.dataPagamento)}</td>
                  <td className="text-right py-1.5 font-medium">{formatCurrency(p.valor)}</td>
                  <td className="py-1.5 pl-4 text-gray-600">{p.formaPagamentoNome ?? '—'}</td>
                  <td className="py-1.5 pl-4 text-gray-600">{p.observacao ?? '—'}</td>
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
              disabled={!podeEditarMotivo}
              title={podeEditarMotivo ? undefined : 'Seu perfil não tem permissão para editar dados deste pedido.'}
              className={inputClass}
              placeholder="Ex: pedido já entregue, cliente vai pagar no pix na sexta..."
            />
            <Button
              type="button"
              onClick={handleSalvarMotivo}
              isLoading={updateMotivoMutation.isPending}
              disabled={!podeEditarMotivo}
              title={podeEditarMotivo ? undefined : 'Seu perfil não tem permissão para editar dados deste pedido.'}
            >
              Salvar motivo
            </Button>
          </div>
        </div>
      </div>

      <RegistrarPagamentoModal pedidoId={pedidoId} open={showModal} onClose={() => setShowModal(false)} />
    </>
  )
}

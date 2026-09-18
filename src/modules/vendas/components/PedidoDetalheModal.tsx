import { useState } from 'react'
import { X, ExternalLink, Printer } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Pedido } from '../types/pedido'
import { usePedido, useUpdatePedidoStatus } from '../hooks/usePedidos'
import { useCliente } from '../hooks/useClientes'
import { useApoiosFesta } from '../../apoioFesta/hooks/useApoiosFesta'
import PedidoPagamentoCard from './PedidoPagamentoCard'
import RegistrarPagamentoModal from './RegistrarPagamentoModal'
import ComandaProducaoModal from './ComandaProducaoModal'
import ConfirmarMudancaStatusModal from './ConfirmarMudancaStatusModal'
import { STATUS_COLORS, STATUS_QUE_SUGEREM_PAGAMENTO, PEDIDO_STATUS_ORDEM, statusDisponiveisPara, tituloStatusPill } from '../lib/pedidoStatus'
import { formatEndereco } from '../lib/endereco'



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
  onClose: () => void
  onUpdated?: () => void
}

export default function PedidoDetalheModal({ pedido, onClose, onUpdated }: Props) {
  const navigate = useNavigate()
  const statusMutation = useUpdatePedidoStatus()
  // Puxa a versão ao vivo do pedido -- o `pedido` recebido por prop é a foto de quando o Mural
  // buscou a lista; sem isso, mudar o status aqui deixaria o seletor mostrando o valor antigo até
  // fechar e reabrir o modal.
  const { data: pedidoAtual } = usePedido(pedido.id)
  const atual = pedidoAtual ?? pedido
  const statusAtual = atual.status
  // Backend já enriquece `atual.endereco`; só busca o cliente à parte como fallback
  // para pedidos anteriores a esse enriquecimento.
  const { data: cliente } = useCliente(atual.endereco ? 0 : (atual.clienteId ?? 0))
  const enderecoEntrega = atual.endereco ?? cliente?.enderecos?.find((e) => e.id === atual.enderecoId)

  const { data: apoioData } = useApoiosFesta(0, 50, { pedidoId: atual.id, status: 'ATIVO' })
  const apoiosAtivos = apoioData?.content ?? []

  const [percentualSugerido, setPercentualSugerido] = useState<number | undefined>()
  const [showPagamentoPrompt, setShowPagamentoPrompt] = useState(false)
  const [showComanda, setShowComanda] = useState(false)
  const [statusConfirmTarget, setStatusConfirmTarget] = useState<string | null>(null)

  function handleStatusChange(status: string) {
    statusMutation.mutate(
      { id: pedido.id, status },
      {
        onSuccess: () => {
          onUpdated?.()
          if (status in STATUS_QUE_SUGEREM_PAGAMENTO) {
            setPercentualSugerido(STATUS_QUE_SUGEREM_PAGAMENTO[status])
            setShowPagamentoPrompt(true)
          }
        },
      },
    )
  }

  function handleConfirmarMudancaStatus() {
    if (statusConfirmTarget) {
      handleStatusChange(statusConfirmTarget)
      setStatusConfirmTarget(null)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold text-gray-800">Detalhes do Pedido #{atual.id}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Cliente</p>
              <p className="font-medium">{atual.clienteNome ?? `Cliente #${atual.clienteId ?? '—'}`}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Data do pedido</p>
              <p className="font-medium">{formatDateTime(atual.createdOn)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Data de entrega</p>
              <p className="font-semibold text-gray-800">{formatDateTime(atual.dataEntrega)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Entrega</p>
              <p className="font-medium">{atual.retirar ? 'Retirada no local' : 'Entrega'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Frete</p>
              <p className="font-medium">{formatCurrency(atual.valorFrete)}</p>
            </div>
          </div>

          {statusAtual && (
            <div>
              <p className="text-gray-500 text-xs mb-2">Status</p>
              <div className="flex flex-wrap items-center gap-2">
                {PEDIDO_STATUS_ORDEM.map((s) => {
                  const isAtual = s === statusAtual
                  const disponivel = statusDisponiveisPara(statusAtual).includes(s)
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => disponivel && setStatusConfirmTarget(s)}
                      disabled={isAtual || !disponivel || statusMutation.isPending}
                      title={isAtual ? 'Status atual' : disponivel ? undefined : tituloStatusPill(s, statusAtual)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors disabled:cursor-default ${
                        isAtual
                          ? `${STATUS_COLORS[s] ?? 'bg-gray-100 text-gray-700'} border-transparent ring-2 ring-offset-1 ring-gray-300`
                          : disponivel
                            ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400 cursor-pointer'
                            : 'bg-white text-gray-400 border-gray-200 disabled:opacity-60'
                      }`}
                    >
                      {s.replace('_', ' ')}
                    </button>
                  )
                })}
                <span className="mx-1 h-5 w-px bg-gray-200" aria-hidden />
                <button
                  type="button"
                  onClick={() => statusDisponiveisPara(statusAtual).includes('CANCELADO') && setStatusConfirmTarget('CANCELADO')}
                  disabled={statusAtual === 'CANCELADO' || !statusDisponiveisPara(statusAtual).includes('CANCELADO') || statusMutation.isPending}
                  title={
                    statusAtual === 'CANCELADO'
                      ? 'Status atual'
                      : statusDisponiveisPara(statusAtual).includes('CANCELADO')
                        ? undefined
                        : tituloStatusPill('CANCELADO', statusAtual)
                  }
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors disabled:cursor-default ${
                    statusAtual === 'CANCELADO'
                      ? `${STATUS_COLORS.CANCELADO} border-transparent ring-2 ring-offset-1 ring-gray-300`
                      : statusDisponiveisPara(statusAtual).includes('CANCELADO')
                        ? 'bg-white text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 cursor-pointer'
                        : 'bg-white text-gray-400 border-gray-200 disabled:opacity-60'
                  }`}
                >
                  Cancelado
                </button>
              </div>
            </div>
          )}

          {!atual.retirar && enderecoEntrega && (
            <div className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              <p className="text-gray-500 text-xs mb-0.5">Endereço de entrega</p>
              <p className="font-medium text-gray-800">{formatEndereco(enderecoEntrega)}</p>
            </div>
          )}

          <div>
            <p className="text-gray-500 text-xs mb-2">Itens</p>
            {atual.itens.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhum item</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 border-b">
                    <th className="text-left pb-1">Produto</th>
                    <th className="text-right pb-1">Qtd</th>
                    <th className="text-right pb-1">Unit.</th>
                    <th className="text-right pb-1">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {atual.itens.map((item, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-1">
                        #{item.produtoId}
                        {!!item.desconto && (
                          <p className="text-xs text-gray-400">Desconto: {formatCurrency(item.desconto)}</p>
                        )}
                      </td>
                      <td className="text-right py-1">{item.quantidade}</td>
                      <td className="text-right py-1">{formatCurrency(item.valorUnitario)}</td>
                      <td className="text-right py-1">{formatCurrency(item.valorTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {apoiosAtivos.length > 0 && (
            <div>
              <p className="text-gray-500 text-xs mb-2">Apoio de Festa (Locação)</p>
              <div className="space-y-2 bg-amber-50/70 border border-amber-200 rounded-lg p-3 text-sm">
                {apoiosAtivos.map((a) => (
                  <div key={a.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {a.itemApoioNome}
                        {a.incluiMaoDeObra && (
                          <span className="ml-1.5 inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-blue-100 text-blue-800">
                            + atendente {a.colaboradorNome ? `(${a.colaboradorNome})` : ''}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(a.horaInicio)} até {formatDateTime(a.horaFim)}
                      </p>
                    </div>
                    <span className="font-medium text-gray-900">{formatCurrency(a.valorTotal)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t pt-3">
            <span className="font-bold text-gray-800">Total</span>
            <span className="font-bold text-lg">{formatCurrency(atual.valorTotal)}</span>
          </div>

          <PedidoPagamentoCard pedidoId={atual.id} pedido={atual} />
        </div>

        <div className="px-5 pb-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowComanda(true)}
            disabled={atual.status === 'CANCELADO'}
            title={atual.status === 'CANCELADO' ? 'Pedido cancelado — comanda de produção indisponível' : undefined}
            className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 rounded-lg transition-colors cursor-pointer text-sm shadow-xs disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-amber-500"
          >
            <Printer size={16} /> Imprimir Comanda
          </button>
          <button
            onClick={() => {
              onClose()
              navigate(`/vendas/pedidos/${atual.id}/editar`, { state: { from: '/vendas/mural' } })
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors cursor-pointer text-sm shadow-xs"
          >
            <ExternalLink size={16} /> Ir para o pedido
          </button>
        </div>
      </div>

      {showComanda && (
        <ComandaProducaoModal
          pedido={atual}
          open={showComanda}
          onClose={() => setShowComanda(false)}
        />
      )}

      <RegistrarPagamentoModal
        pedidoId={pedido.id}
        open={showPagamentoPrompt}
        onClose={() => setShowPagamentoPrompt(false)}
        percentualSugerido={percentualSugerido}
        title={percentualSugerido != null ? 'Registrar adiantamento' : 'Registrar pagamento'}
      />

      <ConfirmarMudancaStatusModal
        open={!!statusConfirmTarget}
        pedidoId={pedido.id}
        statusAtual={atual.status}
        statusNovo={statusConfirmTarget ?? ''}
        isPending={statusMutation.isPending}
        onConfirm={handleConfirmarMudancaStatus}
        onCancel={() => setStatusConfirmTarget(null)}
      />
    </div>
  )
}

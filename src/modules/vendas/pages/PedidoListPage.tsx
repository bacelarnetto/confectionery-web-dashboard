import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from 'react-oidc-context'
import { Plus, Eye, Ban, Search, X, CircleDollarSign, Printer, Clock } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import PageableTable from '../../../components/ui/PageableTable'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import { usePedidos, useUpdatePedidoStatus } from '../hooks/usePedidos'
import { useDebounce } from '../../../hooks/useDebounce'
import { Pedido, PEDIDO_STATUS } from '../types/pedido'
import { formatCurrency } from '../../../lib/format'
import { getRoles } from '../../../lib/auth'
import { useTodasContasReceberPendentes } from '../../financeiro/hooks/useFinanceiro'
import RegistrarPagamentoModal from '../components/RegistrarPagamentoModal'
import ComandaProducaoModal from '../components/ComandaProducaoModal'
import ConfirmarMudancaStatusModal from '../components/ConfirmarMudancaStatusModal'
import PedidoErroModal from '../components/PedidoErroModal'
import { STATUS_COLORS, STATUS_QUE_SUGEREM_PAGAMENTO, getPrazoEntrega } from '../lib/pedidoStatus'
import { podeCriarPedido, podeAlterarStatusPedido, statusDisponiveisParaPerfil, podeRegistrarPagamentoPedido } from '../lib/pedidoPermissoes'

const TABLE_HEADERS = ['ID', 'Cliente', 'Status', 'Valor Total', 'Frete', 'Retirada', 'Criado em', 'Entrega', 'Ações']

function formatDateTimeParts(dateStr: string | undefined) {
  if (!dateStr) return { data: '—', hora: null }
  const d = new Date(dateStr)
  const data = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d)
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return { data, hora: hora !== '00:00' ? hora : null }
}

export default function PedidoListPage() {
  const navigate = useNavigate()
  const auth = useAuth()
  const perfis = getRoles(auth.user)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [filters, setFilters] = useState({ clienteId: '', status: '' })
  const [showFilters, setShowFilters] = useState(false)
  const [comandaPedido, setComandaPedido] = useState<Pedido | null>(null)
  const debouncedFilters = useDebounce(filters)

  const activeFilters =
    debouncedFilters.clienteId || debouncedFilters.status
      ? {
          ...(debouncedFilters.clienteId ? { clienteId: Number(debouncedFilters.clienteId) } : {}),
          ...(debouncedFilters.status ? { status: debouncedFilters.status } : {}),
        }
      : undefined

  const { data, isLoading } = usePedidos(page, pageSize, activeFilters)
  const statusMutation = useUpdatePedidoStatus()

  // Contas a receber pendentes (ABERTO/PARCIAL) já vêm agregadas do financeiro -- evita 1 fetch de
  // pagamentos por linha da lista. Usado só pra marcar visualmente pedido ENTREGUE ainda não pago.
  const { data: contasReceber } = useTodasContasReceberPendentes()
  const pedidosNaoPagosIds = useMemo(
    () =>
      new Set(
        (contasReceber ?? []).filter((c) => c.origem === 'PEDIDO' && c.pedidoId != null).map((c) => c.pedidoId!),
      ),
    [contasReceber],
  )

  const pedidos = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  const [cancelTarget, setCancelTarget] = useState<{ id: number; nome: string } | null>(null)
  const [pagamentoPrompt, setPagamentoPrompt] = useState<{ pedidoId: number; percentualSugerido?: number } | null>(null)
  const [statusConfirmTarget, setStatusConfirmTarget] = useState<{
    pedidoId: number
    statusNovo: string
    statusAtual: string | undefined
  } | null>(null)
  const [erroModal, setErroModal] = useState<{ erro: unknown; pedidoId?: number } | null>(null)

  function handleStatusChange(pedidoId: number, status: string) {
    statusMutation.mutate(
      { id: pedidoId, status },
      {
        onSuccess: () => {
          if (status in STATUS_QUE_SUGEREM_PAGAMENTO && podeRegistrarPagamentoPedido(perfis)) {
            setPagamentoPrompt({ pedidoId, percentualSugerido: STATUS_QUE_SUGEREM_PAGAMENTO[status] })
          }
        },
        onError: (err) => {
          setErroModal({ erro: err, pedidoId })
        },
      },
    )
  }

  function handleStatusConfirm() {
    if (statusConfirmTarget) {
      handleStatusChange(statusConfirmTarget.pedidoId, statusConfirmTarget.statusNovo)
      setStatusConfirmTarget(null)
    }
  }

  function handleFilterChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(0)
  }

  function clearFilters() {
    setFilters({ clienteId: '', status: '' })
    setPage(0)
  }

  function handleCancelConfirm() {
    if (!cancelTarget) return
    const id = cancelTarget.id
    statusMutation.mutate(
      { id, status: 'CANCELADO' },
      {
        onSettled: () => setCancelTarget(null),
        onError: (err) => {
          setErroModal({ erro: err, pedidoId: id })
        },
      },
    )
  }

  const hasFilters = filters.clienteId || filters.status

  return (
    <div>
      <PageHeader title="Pedidos" subtitle="Gerencie os pedidos da confeitaria">
        {podeCriarPedido(perfis) && (
          <button
            onClick={() => navigate('/vendas/pedidos/novo')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
          >
            <Plus size={16} />
            Novo Pedido
          </button>
        )}
      </PageHeader>

      <div className="mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
            showFilters || hasFilters
              ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Search size={15} />
          Filtros
          {hasFilters && (
            <span className="px-1.5 py-0.5 text-xs bg-amber-500 text-white rounded-full leading-none">
              {[filters.clienteId, filters.status].filter(Boolean).length}
            </span>
          )}
        </button>

        {showFilters && (
          <div className="mt-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente ID</label>
                <input
                  type="number"
                  value={filters.clienteId}
                  onChange={(e) => handleFilterChange('clienteId', e.target.value)}
                  placeholder="ID do cliente..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Todos os status</option>
                  {PEDIDO_STATUS.map((s) => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
            </div>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
              >
                <X size={14} />
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>

      <PageableTable
        headers={TABLE_HEADERS}
        isLoading={isLoading}
        isEmpty={!isLoading && pedidos.length === 0}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalElements={data?.totalElements}
        pageSize={pageSize}
        onPageSizeChange={(size) => { setPageSize(size); setPage(0) }}
      >
        {pedidos.map((p) => {
          const prazoEntrega = getPrazoEntrega(p.dataEntrega, p.status)
          return (
          <tr key={p.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3 text-gray-500 text-sm">{p.id}</td>
            <td className="px-4 py-3 text-gray-700 font-medium">{p.clienteNome ?? p.clienteId ?? '—'}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-1.5">
                {p.status ? (
                  podeAlterarStatusPedido(perfis) ? (
                    (() => {
                      const disponiveis = statusDisponiveisParaPerfil(p.status, perfis)
                      return (
                        <select
                          value={p.status}
                          onChange={(e) =>
                            setStatusConfirmTarget({
                              pedidoId: p.id,
                              statusNovo: e.target.value,
                              statusAtual: p.status,
                            })
                          }
                          disabled={disponiveis.length === 0}
                          className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${STATUS_COLORS[p.status] ?? 'bg-gray-100 text-gray-700'}`}
                        >
                          <option value={p.status} disabled>
                            {p.status.replace('_', ' ')} (atual)
                          </option>
                          {disponiveis.map((s) => (
                            <option key={s} value={s}>
                              {s.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      )
                    })()
                  ) : (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[p.status] ?? 'bg-gray-100 text-gray-700'}`}>
                      {p.status.replace('_', ' ')}
                    </span>
                  )
                ) : '—'}
                {p.status === 'ENTREGUE' && pedidosNaoPagosIds.has(p.id) && (
                  <span title="Entregue mas ainda não pago" className="flex-shrink-0">
                    <CircleDollarSign size={16} className="text-red-500" />
                  </span>
                )}
              </div>
            </td>
            <td className="px-4 py-3 font-medium text-gray-900">
              {formatCurrency(p.valorTotal)}
            </td>
            <td className="px-4 py-3 text-gray-600">
              {formatCurrency(p.valorFrete)}
            </td>
            <td className="px-4 py-3 text-gray-600">
              {p.retirar ? (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Sim</span>
              ) : (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Não</span>
              )}
            </td>
            <td className="px-4 py-3 text-gray-600">{formatDateTimeParts(p.createdOn).data}</td>
            <td className="px-4 py-3">
              {p.dataEntrega ? (() => {
                const parts = formatDateTimeParts(p.dataEntrega)
                return (
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-medium text-gray-700">{parts.data}</span>
                      {parts.hora && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-900 bg-amber-100/90 px-1.5 py-0.2 rounded border border-amber-200 shadow-2xs">
                          <Clock size={10} className="text-amber-800" /> {parts.hora}
                        </span>
                      )}
                    </div>
                    {prazoEntrega && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${prazoEntrega.badgeClass}`}>
                        {prazoEntrega.label}
                      </span>
                    )}
                  </div>
                )
              })() : (
                <span className="text-gray-400 text-xs">—</span>
              )}
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setComandaPedido(p)}
                  disabled={p.status === 'CANCELADO'}
                  className="p-1.5 rounded-md text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
                  title={p.status === 'CANCELADO' ? 'Pedido cancelado — comanda de produção indisponível' : 'Imprimir Comanda de Produção'}
                >
                  <Printer size={15} />
                </button>
                <button
                  onClick={() => navigate(`/vendas/pedidos/${p.id}/editar`)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Editar"
                >
                  <Eye size={15} />
                </button>
                {p.status && statusDisponiveisParaPerfil(p.status, perfis).includes('CANCELADO') && (
                  <button
                    onClick={() => setCancelTarget({ id: p.id, nome: `Pedido #${p.id}` })}
                    className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Cancelar"
                  >
                    <Ban size={15} />
                  </button>
                )}
              </div>
            </td>
          </tr>
          )
        })}
      </PageableTable>

      <Modal open={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Cancelar pedido">
        <p className="text-sm text-gray-600 mb-5">
          Tem certeza que deseja cancelar{' '}
          <span className="font-semibold text-gray-900">"{cancelTarget?.nome}"</span>? O pedido fica marcado como{' '}
          <span className="font-semibold text-gray-900">cancelado</span> e sai do fluxo normal — ele continua no
          histórico, mas não é possível desfazer o cancelamento por aqui.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setCancelTarget(null)}
            disabled={statusMutation.isPending}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-60"
          >
            Voltar
          </button>
          <Button type="button" variant="danger" onClick={handleCancelConfirm} isLoading={statusMutation.isPending}>
            Cancelar pedido
          </Button>
        </div>
      </Modal>

      {statusConfirmTarget && (
        <ConfirmarMudancaStatusModal
          open
          pedidoId={statusConfirmTarget.pedidoId}
          statusAtual={statusConfirmTarget.statusAtual}
          statusNovo={statusConfirmTarget.statusNovo}
          isPending={statusMutation.isPending}
          onConfirm={handleStatusConfirm}
          onCancel={() => setStatusConfirmTarget(null)}
        />
      )}

      {pagamentoPrompt && (
        <RegistrarPagamentoModal
          pedidoId={pagamentoPrompt.pedidoId}
          open
          onClose={() => setPagamentoPrompt(null)}
          percentualSugerido={pagamentoPrompt.percentualSugerido}
          title={pagamentoPrompt.percentualSugerido != null ? 'Registrar adiantamento' : 'Registrar pagamento'}
        />
      )}

      {comandaPedido && (
        <ComandaProducaoModal
          pedido={comandaPedido}
          open={!!comandaPedido}
          onClose={() => setComandaPedido(null)}
        />
      )}

      {erroModal && (
        <PedidoErroModal
          open={!!erroModal}
          onClose={() => setErroModal(null)}
          erro={erroModal.erro}
          pedidoId={erroModal.pedidoId}
        />
      )}
    </div>
  )
}

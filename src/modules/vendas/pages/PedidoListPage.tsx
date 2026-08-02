import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Eye, Trash2, Search, X } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import PageableTable from '../../../components/ui/PageableTable'
import DeleteConfirmModal from '../../../components/ui/DeleteConfirmModal'
import { usePedidos, useDeletePedido, useUpdatePedidoStatus } from '../hooks/usePedidos'
import { useDebounce } from '../../../hooks/useDebounce'
import { PEDIDO_STATUS } from '../types/pedido'

const TABLE_HEADERS = ['ID', 'Cliente', 'Status', 'Valor Total', 'Frete', 'Retirada', 'Criado em', 'Entrega', 'Ações']

const STATUS_COLORS: Record<string, string> = {
  RASCUNHO: 'bg-gray-100 text-gray-600',
  CONFIRMADO: 'bg-blue-100 text-blue-800',
  EM_PRODUCAO: 'bg-purple-100 text-purple-800',
  PRONTO: 'bg-green-100 text-green-800',
  ENTREGUE: 'bg-gray-100 text-gray-700',
  CANCELADO: 'bg-red-100 text-red-800',
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateStr))
}

export default function PedidoListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState({ clienteId: '', status: '' })
  const [showFilters, setShowFilters] = useState(false)
  const debouncedFilters = useDebounce(filters)

  const activeFilters =
    debouncedFilters.clienteId || debouncedFilters.status
      ? {
          ...(debouncedFilters.clienteId ? { clienteId: Number(debouncedFilters.clienteId) } : {}),
          ...(debouncedFilters.status ? { status: debouncedFilters.status } : {}),
        }
      : undefined

  const { data, isLoading } = usePedidos(page, 20, activeFilters)
  const deleteMutation = useDeletePedido()
  const statusMutation = useUpdatePedidoStatus()

  const pedidos = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nome: string } | null>(null)

  function handleFilterChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(0)
  }

  function clearFilters() {
    setFilters({ clienteId: '', status: '' })
    setPage(0)
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) })
  }

  const hasFilters = filters.clienteId || filters.status

  return (
    <div>
      <PageHeader title="Pedidos" subtitle="Gerencie os pedidos da confeitaria">
        <button
          onClick={() => navigate('/vendas/pedidos/novo')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
        >
          <Plus size={16} />
          Novo Pedido
        </button>
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
      >
        {pedidos.map((p) => (
          <tr key={p.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3 text-gray-500 text-sm">{p.id}</td>
            <td className="px-4 py-3 text-gray-700 font-medium">{p.clienteNome ?? p.clienteId ?? '—'}</td>
            <td className="px-4 py-3">
              {p.status ? (
                <select
                  value={p.status}
                  onChange={(e) => statusMutation.mutate({ id: p.id, status: e.target.value })}
                  className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLORS[p.status] ?? 'bg-gray-100 text-gray-700'}`}
                >
                  {PEDIDO_STATUS.map((s) => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              ) : '—'}
            </td>
            <td className="px-4 py-3 font-medium text-gray-900">
              {p.valorTotal != null ? `R$ ${Number(p.valorTotal).toFixed(2)}` : '—'}
            </td>
            <td className="px-4 py-3 text-gray-600">
              {p.valorFrete != null ? `R$ ${Number(p.valorFrete).toFixed(2)}` : '—'}
            </td>
            <td className="px-4 py-3 text-gray-600">
              {p.retirar ? (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Sim</span>
              ) : (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Não</span>
              )}
            </td>
            <td className="px-4 py-3 text-gray-600">{formatDate(p.createdOn)}</td>
            <td className="px-4 py-3 text-gray-600">
              {p.dataEntrega ? (
                <span className="font-medium">{formatDate(p.dataEntrega)}</span>
              ) : (
                <span className="text-gray-400 text-xs">—</span>
              )}
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/vendas/pedidos/${p.id}/editar`)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Editar"
                >
                  <Eye size={15} />
                </button>
                <button
                  onClick={() => setDeleteTarget({ id: p.id, nome: `Pedido #${p.id}` })}
                  className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Remover"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </PageableTable>

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        itemName={deleteTarget?.nome}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}

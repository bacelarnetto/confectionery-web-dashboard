import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Search, X, Ban, ExternalLink } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import PageableTable from '../../../components/ui/PageableTable'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import { useApoiosFesta, useCancelarApoioFesta } from '../hooks/useApoiosFesta'
import { useItensApoio } from '../hooks/useItensApoio'
import { ApoioFesta, ApoioFestaStatus } from '../types/apoioFesta'
import { formatCurrency } from '../../../lib/format'

const TABLE_HEADERS = ['ID', 'Item', 'Colaborador', 'Pedido', 'Início', 'Fim', 'Valor', 'Status', 'Ações']

function formatDateTime(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

export default function ApoioFestaListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [filters, setFilters] = useState<{ itemApoioId: string; pedidoId: string; status: '' | ApoioFestaStatus; dia: string }>({
    itemApoioId: '',
    pedidoId: '',
    status: 'ATIVO',
    dia: '',
  })
  const [showFilters, setShowFilters] = useState(false)

  const { data: itensData } = useItensApoio(0, 100)
  const itensApoio = itensData?.content ?? []

  const filterParams = {
    ...(filters.itemApoioId ? { itemApoioId: Number(filters.itemApoioId) } : {}),
    ...(filters.pedidoId ? { pedidoId: Number(filters.pedidoId) } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.dia ? { dia: new Date(`${filters.dia}T12:00:00`).toISOString() } : {}),
  }

  const { data, isLoading } = useApoiosFesta(page, pageSize, Object.keys(filterParams).length > 0 ? filterParams : undefined)
  const cancelarMutation = useCancelarApoioFesta()

  const apoios = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  const [cancelTarget, setCancelTarget] = useState<ApoioFesta | null>(null)

  function handleFilterChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(0)
  }

  function clearFilters() {
    setFilters({ itemApoioId: '', pedidoId: '', status: '', dia: '' })
    setPage(0)
  }

  function handleCancelConfirm() {
    if (!cancelTarget) return
    cancelarMutation.mutate(cancelTarget.id, { onSettled: () => setCancelTarget(null) })
  }

  return (
    <div>
      <PageHeader title="Apoios de Festa" subtitle="Locações de carrinho, tacho, decoração e outros equipamentos, por pedido" />

      <div className="mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
            showFilters || Object.values(filters).some((v) => v)
              ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Search size={15} />
          Filtros
          {Object.values(filters).filter(Boolean).length > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-amber-500 text-white rounded-full leading-none">
              {Object.values(filters).filter(Boolean).length}
            </span>
          )}
        </button>

        {showFilters && (
          <div className="mt-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item de Apoio</label>
                <select
                  value={filters.itemApoioId}
                  onChange={(e) => handleFilterChange('itemApoioId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="">Todos</option>
                  {itensApoio.map((i) => (
                    <option key={i.id} value={i.id}>{i.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pedido ID</label>
                <input
                  type="number"
                  value={filters.pedidoId}
                  onChange={(e) => handleFilterChange('pedidoId', e.target.value)}
                  placeholder="ID do pedido..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="">Todos</option>
                  <option value="ATIVO">Ativo</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dia</label>
                <input
                  type="date"
                  value={filters.dia}
                  onChange={(e) => handleFilterChange('dia', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
            {Object.values(filters).some((v) => v) && (
              <button onClick={clearFilters} className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900">
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
        isEmpty={!isLoading && apoios.length === 0}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalElements={data?.totalElements}
        pageSize={pageSize}
        onPageSizeChange={(size) => { setPageSize(size); setPage(0) }}
      >
        {apoios.map((a) => (
          <tr key={a.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3 text-gray-500 text-sm">{a.id}</td>
            <td className="px-4 py-3 font-medium text-gray-900">
              {a.itemApoioNome}
              {a.incluiMaoDeObra && (
                <span className="ml-1.5 inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  + atendente
                </span>
              )}
            </td>
            <td className="px-4 py-3 text-gray-600 text-sm">{a.colaboradorNome ?? '—'}</td>
            <td className="px-4 py-3">
              <button
                onClick={() => navigate(`/vendas/pedidos/${a.pedidoId}/editar`)}
                className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
                title="Ir para o pedido"
              >
                #{a.pedidoId} <ExternalLink size={12} />
              </button>
            </td>
            <td className="px-4 py-3 text-gray-600 text-sm">{formatDateTime(a.horaInicio)}</td>
            <td className="px-4 py-3 text-gray-600 text-sm">{formatDateTime(a.horaFim)}</td>
            <td className="px-4 py-3 text-gray-900 font-medium">{formatCurrency(a.valorTotal)}</td>
            <td className="px-4 py-3">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  a.status === 'ATIVO' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {a.status === 'ATIVO' ? 'Ativo' : 'Cancelado'}
              </span>
            </td>
            <td className="px-4 py-3">
              {a.status === 'ATIVO' && (
                <button
                  onClick={() => setCancelTarget(a)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Cancelar apoio de festa"
                >
                  <Ban size={15} />
                </button>
              )}
            </td>
          </tr>
        ))}
      </PageableTable>

      <Modal open={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Cancelar apoio de festa">
        <p className="text-sm text-gray-600 mb-5">
          Tem certeza que deseja cancelar o apoio{' '}
          <span className="font-semibold text-gray-900">"{cancelTarget?.itemApoioNome}"</span> do pedido{' '}
          <span className="font-semibold text-gray-900">#{cancelTarget?.pedidoId}</span>? O valor{' '}
          <span className="font-semibold text-gray-900">{formatCurrency(cancelTarget?.valorTotal)}</span> é
          removido do total do pedido automaticamente. Não é possível desfazer.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setCancelTarget(null)}
            disabled={cancelarMutation.isPending}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-60"
          >
            Voltar
          </button>
          <Button type="button" variant="danger" onClick={handleCancelConfirm} isLoading={cancelarMutation.isPending}>
            Cancelar apoio
          </Button>
        </div>
      </Modal>
    </div>
  )
}

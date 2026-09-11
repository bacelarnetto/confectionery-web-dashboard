import { useState } from 'react'
import { CheckCircle, RefreshCw, ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import Table from '../../../components/ui/Table'
import Modal from '../../../components/ui/Modal'
import { useAlertasProduto, useResolverAlertaProduto, useVerificarAlertasProduto } from '../hooks/useAlertasProduto'

const TABLE_HEADERS = ['ID', 'Tipo', 'Produto', 'Qtd Atual', 'Referência', 'Data', 'Status', 'Ações']

const TIPO_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Vencimento', color: 'bg-orange-100 text-orange-700' },
  2: { label: 'Estoque Mínimo', color: 'bg-red-100 text-red-700' },
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—'
  try {
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateStr))
  } catch { return dateStr }
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          {Array.from({ length: 8 }).map((_, j) => (
            <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-3/4" /></td>
          ))}
        </tr>
      ))}
    </>
  )
}

export default function AlertaProdutoListPage() {
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState<{ ativo?: string; tipoId?: string }>({})
  const [showFilters, setShowFilters] = useState(false)
  const [resolveTarget, setResolveTarget] = useState<{ id: number } | null>(null)

  const filterParams = {
    ...(filters.ativo !== undefined && filters.ativo !== '' ? { ativo: filters.ativo === 'true' } : {}),
    ...(filters.tipoId ? { tipoId: Number(filters.tipoId) } : {}),
  }

  const { data, isLoading } = useAlertasProduto(page, 20, Object.keys(filterParams).length > 0 ? filterParams : undefined)
  const resolverMutation = useResolverAlertaProduto()
  const verificarMutation = useVerificarAlertasProduto()

  const alertas = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  function handleFilterChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(0)
  }

  function clearFilters() {
    setFilters({})
    setPage(0)
  }

  function handleResolveConfirm() {
    if (!resolveTarget) return
    resolverMutation.mutate(resolveTarget.id, { onSettled: () => setResolveTarget(null) })
  }

  return (
    <div>
      <PageHeader title="Alertas de Produtos" subtitle="Monitore vencimentos e níveis de estoque de produtos">
        <button
          onClick={() => verificarMutation.mutate()}
          disabled={verificarMutation.isPending}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 disabled:opacity-60 transition-colors"
        >
          <RefreshCw size={16} className={verificarMutation.isPending ? 'animate-spin' : ''} />
          Verificar Agora
        </button>
      </PageHeader>

      <div className="mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
            showFilters || Object.values(filters).some(v => v)
              ? 'bg-amber-50 border-amber-300 text-amber-700'
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.ativo ?? ''}
                  onChange={(e) => handleFilterChange('ativo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Todos</option>
                  <option value="true">Ativos</option>
                  <option value="false">Resolvidos</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={filters.tipoId ?? ''}
                  onChange={(e) => handleFilterChange('tipoId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Todos</option>
                  <option value="1">Vencimento</option>
                  <option value="2">Estoque Mínimo</option>
                </select>
              </div>
            </div>
            {Object.values(filters).some(v => v) && (
              <button onClick={clearFilters} className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900">
                <X size={14} /> Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>

      <Table headers={TABLE_HEADERS} isEmpty={!isLoading && alertas.length === 0}>
        {isLoading ? <SkeletonRows /> : (
          alertas.map((a) => {
            const tipo = TIPO_LABELS[a.tipoId] ?? { label: String(a.tipoId), color: 'bg-gray-100 text-gray-700' }
            return (
              <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">#{a.id}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${tipo.color}`}>{tipo.label}</span>
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{a.produtoNome ?? `#${a.produtoId}`}</td>
                <td className="px-4 py-3 text-gray-600">{a.quantidadeAtualEstoque ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500 text-sm">
                  {a.tipoId === 1
                    ? `Vence: ${formatDate(a.dataValidade)}`
                    : `Mín: ${a.quantidadeMinimaEstoque}`}
                </td>
                <td className="px-4 py-3 text-gray-500 text-sm">{formatDate(a.data)}</td>
                <td className="px-4 py-3">
                  {a.ativo
                    ? <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Ativo</span>
                    : <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Resolvido</span>}
                </td>
                <td className="px-4 py-3">
                  {a.ativo && (
                    <button
                      onClick={() => setResolveTarget({ id: a.id })}
                      className="p-1.5 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                      title="Resolver"
                    >
                      <CheckCircle size={15} />
                    </button>
                  )}
                </td>
              </tr>
            )
          })
        )}
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 disabled:opacity-40">
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm text-gray-600">Página {page + 1} de {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 disabled:opacity-40">
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      <Modal open={!!resolveTarget} onClose={() => setResolveTarget(null)} title="Resolver alerta">
        <p className="text-sm text-gray-600 mb-5">Confirma a resolução do alerta <span className="font-semibold">#{resolveTarget?.id}</span>?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setResolveTarget(null)} className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100">Cancelar</button>
          <button onClick={handleResolveConfirm} disabled={resolverMutation.isPending} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-60">
            {resolverMutation.isPending ? 'Resolvendo...' : 'Resolver'}
          </button>
        </div>
      </Modal>
    </div>
  )
}

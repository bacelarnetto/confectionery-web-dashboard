import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from 'react-oidc-context'
import { Plus, Trash2, Search, X, Eye } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import PageableTable from '../../../components/ui/PageableTable'
import DeleteConfirmModal from '../../../components/ui/DeleteConfirmModal'
import { useSaidasInsumo, useDeleteSaidaInsumo } from '../hooks/useSaidasInsumo'
import { useDebounce } from '../../../hooks/useDebounce'
import { formatCurrency } from '../../../lib/format'
import { TIPO_SAIDA_CODIGOS, TIPO_SAIDA_LABELS, TipoSaidaInsumo, SaidaInsumo } from '../types/saidaInsumo'
import { hasRole } from '../../../lib/auth'

function formatData(dateStr?: string): string {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d)
  } catch {
    return dateStr
  }
}

const TABLE_HEADERS = ['ID', 'Tipo', 'Insumos', 'Valor Total', 'Produto ID', 'Usuário', 'Ações']

export default function SaidaInsumoListPage() {
  const navigate = useNavigate()
  const auth = useAuth()
  const isAdmin = hasRole(auth.user, 'ADMIN')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [filters, setFilters] = useState({
    tipo: '',
    dataInicial: '',
    dataFinal: '',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [detalheTarget, setDetalheTarget] = useState<SaidaInsumo | null>(null)

  const debouncedFilters = useDebounce(filters)
  const filterParams = {
    ...(debouncedFilters.tipo ? { tipoId: TIPO_SAIDA_CODIGOS[debouncedFilters.tipo as TipoSaidaInsumo] } : {}),
    ...(debouncedFilters.dataInicial ? { dataInicial: debouncedFilters.dataInicial } : {}),
    ...(debouncedFilters.dataFinal ? { dataFinal: debouncedFilters.dataFinal } : {}),
  }

  const { data, isLoading } = useSaidasInsumo(page, pageSize, Object.keys(filterParams).length > 0 ? filterParams : undefined)
  const deleteMutation = useDeleteSaidaInsumo()

  const saidas = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  const [deleteTarget, setDeleteTarget] = useState<{ id: number } | null>(null)

  function handleFilterChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(0)
  }

  function clearFilters() {
    setFilters({ tipo: '', dataInicial: '', dataFinal: '' })
    setPage(0)
  }

  function handleDeleteConfirm() {
    if (!deleteTarget || !isAdmin) return
    deleteMutation.mutate(deleteTarget.id, {
      onSettled: () => setDeleteTarget(null),
    })
  }

  return (
    <div>
      <PageHeader
        title="Saídas de Insumo"
        subtitle="Gerencie as saídas de insumos do estoque"
      >
        <button
          onClick={() => navigate('/estoque-insumos/saidas/nova')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors cursor-pointer"
        >
          <Plus size={16} />
          Nova Saída
        </button>
      </PageHeader>

      <div className="mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors cursor-pointer ${
            showFilters || Object.values(filters).some(v => v)
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={filters.tipo}
                  onChange={(e) => handleFilterChange('tipo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  {(Object.keys(TIPO_SAIDA_CODIGOS) as TipoSaidaInsumo[]).map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {TIPO_SAIDA_LABELS[tipo]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Inicial</label>
                <input
                  type="date"
                  value={filters.dataInicial}
                  onChange={(e) => handleFilterChange('dataInicial', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Final</label>
                <input
                  type="date"
                  value={filters.dataFinal}
                  onChange={(e) => handleFilterChange('dataFinal', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
            {Object.values(filters).some(v => v) && (
              <button
                onClick={clearFilters}
                className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
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
        isEmpty={!isLoading && saidas.length === 0}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalElements={data?.totalElements}
        pageSize={pageSize}
        onPageSizeChange={(size) => { setPageSize(size); setPage(0) }}
      >
        {saidas.map((s) => (
          <tr key={s.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3 font-medium text-gray-900">
              <button
                type="button"
                onClick={() => setDetalheTarget(s)}
                className="font-semibold text-gray-900 hover:text-amber-600 hover:underline cursor-pointer"
                title="Visualizar detalhes da saída"
              >
                #{s.id}
              </button>
            </td>
            <td className="px-4 py-3 text-gray-600">{TIPO_SAIDA_LABELS[s.tipo as TipoSaidaInsumo] ?? s.tipo}</td>
            <td className="px-4 py-3 text-gray-600">
              {s.itens.map((item) => item.insumoNome ?? `#${item.insumoId}`).join(', ') || '—'}
            </td>
            <td className="px-4 py-3 text-gray-600">{formatCurrency(s.valorTotal)}</td>
            <td className="px-4 py-3 text-gray-600">{s.produtoId ?? '—'}</td>
            <td className="px-4 py-3 text-gray-600">{s.createdBy}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDetalheTarget(s)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                  title="Visualizar detalhes"
                >
                  <Eye size={15} />
                </button>
                {isAdmin && (
                  <button
                    onClick={() => setDeleteTarget({ id: s.id })}
                    className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Remover saída"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </PageableTable>

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        itemName={`Saída #${deleteTarget?.id}`}
        isPending={deleteMutation.isPending}
      />

      {/* Modal de Detalhes da Saída */}
      {detalheTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <Eye size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Detalhes da Saída #{detalheTarget.id}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Tipo: {TIPO_SAIDA_LABELS[detalheTarget.tipo as TipoSaidaInsumo] ?? detalheTarget.tipo}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetalheTarget(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                title="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div>
                  <span className="text-xs text-gray-500 block">Tipo</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {TIPO_SAIDA_LABELS[detalheTarget.tipo as TipoSaidaInsumo] ?? detalheTarget.tipo}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Valor Total</span>
                  <span className="text-sm font-semibold text-amber-600">
                    {formatCurrency(detalheTarget.valorTotal)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Registrado por</span>
                  <span className="text-sm font-medium text-gray-700">
                    {detalheTarget.createdBy || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Data</span>
                  <span className="text-sm font-medium text-gray-700">
                    {formatData(detalheTarget.createdOn)}
                  </span>
                </div>
                {detalheTarget.produtoId && (
                  <div>
                    <span className="text-xs text-gray-500 block">Produto ID</span>
                    <span className="text-sm font-medium text-gray-700">
                      #{detalheTarget.produtoId}
                    </span>
                  </div>
                )}
                {detalheTarget.pedidoId && (
                  <div>
                    <span className="text-xs text-gray-500 block">Pedido ID</span>
                    <span className="text-sm font-medium text-gray-700">
                      #{detalheTarget.pedidoId}
                    </span>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  Itens da Saída ({detalheTarget.itens.length})
                </h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-600 uppercase font-medium border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2.5">Insumo</th>
                        <th className="px-3 py-2.5">Qtd</th>
                        <th className="px-3 py-2.5">Custo Unit.</th>
                        <th className="px-3 py-2.5">Custo Total</th>
                        <th className="px-3 py-2.5">Lote</th>
                        <th className="px-3 py-2.5">Validade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {detalheTarget.itens.map((it, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-3 py-2 font-medium text-gray-900">
                            {it.insumoNome ?? `#${it.insumoId}`}
                          </td>
                          <td className="px-3 py-2 text-gray-600">
                            {it.quantidade}
                          </td>
                          <td className="px-3 py-2 text-gray-600">
                            {formatCurrency(it.valorCustoUnitario)}
                          </td>
                          <td className="px-3 py-2 font-medium text-gray-800">
                            {formatCurrency(it.valorCustoTotal)}
                          </td>
                          <td className="px-3 py-2 text-gray-500">
                            {it.lote || '—'}
                          </td>
                          <td className="px-3 py-2 text-gray-500">
                            {formatData(it.dataValidade)}
                          </td>
                        </tr>
                      ))}
                      {detalheTarget.itens.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-3 py-4 text-center text-gray-400">
                            Nenhum item registrado nesta saída.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50">
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => {
                    const idToDelete = detalheTarget.id
                    setDetalheTarget(null)
                    setDeleteTarget({ id: idToDelete })
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Excluir Saída</span>
                </button>
              ) : (
                <span className="text-xs text-gray-400">Somente administradores podem excluir saídas.</span>
              )}
              <button
                type="button"
                onClick={() => setDetalheTarget(null)}
                className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ml-auto cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

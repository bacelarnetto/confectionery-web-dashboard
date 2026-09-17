import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Trash2, Search, X } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import PageableTable from '../../../components/ui/PageableTable'
import DeleteConfirmModal from '../../../components/ui/DeleteConfirmModal'
import { useSaidasInsumo, useDeleteSaidaInsumo } from '../hooks/useSaidasInsumo'
import { useDebounce } from '../../../hooks/useDebounce'
import { formatCurrency } from '../../../lib/format'
import { TIPO_SAIDA_CODIGOS, TIPO_SAIDA_LABELS, TipoSaidaInsumo } from '../types/saidaInsumo'

const TABLE_HEADERS = ['ID', 'Tipo', 'Insumos', 'Valor Total', 'Produto ID', 'Usuário', 'Ações']

export default function SaidaInsumoListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [filters, setFilters] = useState({
    tipo: '',
    dataInicial: '',
    dataFinal: '',
  })
  const [showFilters, setShowFilters] = useState(false)

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
    if (!deleteTarget) return
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
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
        >
          <Plus size={16} />
          Nova Saída
        </button>
      </PageHeader>

      <div className="mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
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
            <td className="px-4 py-3 font-medium text-gray-900">#{s.id}</td>
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
                  onClick={() => setDeleteTarget({ id: s.id })}
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
        itemName={`Saída #${deleteTarget?.id}`}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}

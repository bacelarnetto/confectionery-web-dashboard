import { useState } from 'react'
import { ChevronLeft, ChevronRight, Search, X, PiggyBank } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import Table from '../../../components/ui/Table'
import { useEstoqueInsumos, useEstoqueValorizado } from '../hooks/useEstoqueInsumos'
import { useDebounce } from '../../../hooks/useDebounce'

const TABLE_HEADERS = ['ID', 'Insumo', 'Quantidade', 'Valor Imobilizado', 'Última Atualização', 'Atualizado Por']

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          {Array.from({ length: 5 }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export default function EstoqueInsumoListPage() {
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState({
    insumoId: '',
    categoriaId: '',
  })
  const [showFilters, setShowFilters] = useState(false)

  const debouncedFilters = useDebounce(filters)
  const filterParams = {
    ...(debouncedFilters.insumoId ? { insumoId: Number(debouncedFilters.insumoId) } : {}),
    ...(debouncedFilters.categoriaId ? { categoriaId: Number(debouncedFilters.categoriaId) } : {}),
  }

  const { data, isLoading } = useEstoqueInsumos(page, 20, Object.keys(filterParams).length > 0 ? filterParams : undefined)
  const { data: valorizadoData } = useEstoqueValorizado()

  const estoque = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  const valorizadoPorInsumo = new Map((valorizadoData ?? []).map((v) => [v.insumoId, v]))
  const valorTotalImobilizado = (valorizadoData ?? []).reduce((acc, v) => acc + v.valorTotal, 0)

  function handleFilterChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(0)
  }

  function clearFilters() {
    setFilters({ insumoId: '', categoriaId: '' })
    setPage(0)
  }

  return (
    <div>
      <PageHeader
        title="Estoque de Insumos"
        subtitle="Acompanhe o saldo atual dos insumos no estoque"
      />

      <div className="mb-4 bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4 max-w-sm">
        <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-600">
          <PiggyBank size={22} />
        </div>
        <div>
          <p className="text-sm text-gray-500">Capital imobilizado em insumos</p>
          <p className="text-xl font-semibold text-gray-900">{formatCurrency(valorTotalImobilizado)}</p>
        </div>
      </div>

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Insumo ID</label>
                <input
                  type="number"
                  value={filters.insumoId}
                  onChange={(e) => handleFilterChange('insumoId', e.target.value)}
                  placeholder="ID do insumo..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria ID</label>
                <input
                  type="number"
                  value={filters.categoriaId}
                  onChange={(e) => handleFilterChange('categoriaId', e.target.value)}
                  placeholder="ID da categoria..."
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

      <Table headers={TABLE_HEADERS} isEmpty={!isLoading && estoque.length === 0}>
        {isLoading ? (
          <SkeletonRows />
        ) : (
          estoque.map((e) => (
            <tr key={e.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">#{e.id}</td>
              <td className="px-4 py-3 text-gray-600">
                {e.insumoNome} <span className="text-xs text-gray-400">({e.insumoId})</span>
              </td>
              <td className="px-4 py-3 text-gray-900 font-medium">
                {e.quantidade.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-emerald-700 font-medium">
                {valorizadoPorInsumo.has(e.insumoId) ? formatCurrency(valorizadoPorInsumo.get(e.insumoId)!.valorTotal) : '—'}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {formatDate(e.updatedOn || e.createdOn)}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {e.updatedBy || e.createdBy || '—'}
              </td>
            </tr>
          ))
        )}
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm text-gray-600">
            Página {page + 1} de {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 disabled:opacity-40 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  )
}

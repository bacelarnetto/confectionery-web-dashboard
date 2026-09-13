import { useState } from 'react'
import { Search, X, PiggyBank } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import PageableTable from '../../../components/ui/PageableTable'
import { useEstoqueInsumos, useEstoqueValorizado } from '../hooks/useEstoqueInsumos'
import { useDebounce } from '../../../hooks/useDebounce'

const TABLE_HEADERS = ['ID', 'Insumo', 'Quantidade', 'Valor Imobilizado', 'Última Atualização', 'Atualizado Por']

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
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
  const [pageSize, setPageSize] = useState(20)
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

  const { data, isLoading } = useEstoqueInsumos(page, pageSize, Object.keys(filterParams).length > 0 ? filterParams : undefined)
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

      <PageableTable
        headers={TABLE_HEADERS}
        isLoading={isLoading}
        isEmpty={!isLoading && estoque.length === 0}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalElements={data?.totalElements}
        pageSize={pageSize}
        onPageSizeChange={(size) => { setPageSize(size); setPage(0) }}
      >
        {estoque.map((e) => (
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
        ))}
      </PageableTable>
    </div>
  )
}

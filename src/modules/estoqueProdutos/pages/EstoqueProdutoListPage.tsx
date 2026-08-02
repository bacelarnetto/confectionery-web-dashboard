import { useState } from 'react'
import { Search, X } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import PageableTable from '../../../components/ui/PageableTable'
import { useEstoqueProdutos } from '../hooks/useEstoqueProdutos'
import { useDebounce } from '../../../hooks/useDebounce'

const TABLE_HEADERS = ['ID', 'Produto ID', 'Quantidade', 'Data de Fabricação', 'Data de Validade', 'Criado em']

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('pt-BR').format(new Date(dateStr))
}

export default function EstoqueProdutoListPage() {
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState({ produtoId: '' })
  const [showFilters, setShowFilters] = useState(false)
  const debouncedFilters = useDebounce(filters)

  const produtoId = debouncedFilters.produtoId ? Number(debouncedFilters.produtoId) : undefined

  const { data, isLoading } = useEstoqueProdutos(page, 20, produtoId)

  const estoques = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  function handleFilterChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(0)
  }

  function clearFilters() {
    setFilters({ produtoId: '' })
    setPage(0)
  }

  return (
    <div>
      <PageHeader title="Estoque de Produtos" subtitle="Acompanhe os lotes de produtos fabricados" />

      <div className="mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
            showFilters || filters.produtoId
              ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Search size={15} />
          Filtros
          {filters.produtoId && (
            <span className="px-1.5 py-0.5 text-xs bg-amber-500 text-white rounded-full leading-none">1</span>
          )}
        </button>

        {showFilters && (
          <div className="mt-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-1">Produto ID</label>
              <input
                type="number"
                value={filters.produtoId}
                onChange={(e) => handleFilterChange('produtoId', e.target.value)}
                placeholder="ID do produto..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            {filters.produtoId && (
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
        isEmpty={!isLoading && estoques.length === 0}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      >
        {estoques.map((e) => (
          <tr key={e.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3 text-gray-500 text-sm">{e.id}</td>
            <td className="px-4 py-3 text-gray-600">{e.produtoId}</td>
            <td className="px-4 py-3 font-medium text-gray-900">{e.quantidade.toFixed(2)}</td>
            <td className="px-4 py-3 text-gray-600">{formatDate(e.dataFabricacao)}</td>
            <td className="px-4 py-3 text-gray-600">
              {e.dataValidade ? (
                <span
                  className={
                    new Date(e.dataValidade) < new Date()
                      ? 'text-red-600 font-medium'
                      : 'text-gray-600'
                  }
                >
                  {formatDate(e.dataValidade)}
                </span>
              ) : (
                '—'
              )}
            </td>
            <td className="px-4 py-3 text-gray-600">{formatDate(e.createdOn)}</td>
          </tr>
        ))}
      </PageableTable>
    </div>
  )
}

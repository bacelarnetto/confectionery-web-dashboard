import { useState } from 'react'
import { Search, X } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import PageableTable from '../../../components/ui/PageableTable'
import { useMovimentacoes } from '../hooks/useMovimentacoes'

const TABLE_HEADERS = [
  'ID',
  'Tipo',
  'Entrada Ref.',
  'Saída Ref.',
  'Qtd Causadora',
  'Qtd Sensibilizada',
  'Qtd Resultante',
]

function getTipoBadge(tipo: string) {
  switch (tipo) {
    case 'ADICAO':
    case 'RESTAURACAO':
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-md">{tipo}</span>
    case 'SUBTRACAO':
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-md">{tipo}</span>
    case 'ATUALIZACAO':
      return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-md">{tipo}</span>
    default:
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md">{tipo}</span>
  }
}

export default function MovimentacaoListPage() {
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState({ tipo: '' })
  const [showFilters, setShowFilters] = useState(false)

  const filterParams = filters.tipo ? { tipo: filters.tipo } : undefined

  const { data, isLoading } = useMovimentacoes(page, 20, filterParams)

  const movimentacoes = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  function handleFilterChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(0)
  }

  function clearFilters() {
    setFilters({ tipo: '' })
    setPage(0)
  }

  return (
    <div>
      <PageHeader
        title="Movimentações de Estoque"
        subtitle="Histórico de entradas, saídas e atualizações de estoque"
      />

      <div className="mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
            showFilters || filters.tipo
              ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Search size={15} />
          Filtros
          {filters.tipo && (
            <span className="px-1.5 py-0.5 text-xs bg-amber-500 text-white rounded-full leading-none">1</span>
          )}
        </button>

        {showFilters && (
          <div className="mt-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={filters.tipo}
                  onChange={(e) => handleFilterChange('tipo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="ADICAO">ADICAO</option>
                  <option value="SUBTRACAO">SUBTRACAO</option>
                  <option value="ATUALIZACAO">ATUALIZACAO</option>
                  <option value="RESTAURACAO">RESTAURACAO</option>
                </select>
              </div>
            </div>
            {filters.tipo && (
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
        isEmpty={!isLoading && movimentacoes.length === 0}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      >
        {movimentacoes.map((m) => (
          <tr key={m.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3 font-medium text-gray-900">#{m.id}</td>
            <td className="px-4 py-3">
              {getTipoBadge(m.tipo)}
            </td>
            <td className="px-4 py-3 text-gray-600">
              {m.itemEntradaInsumoId ? `#${m.itemEntradaInsumoId}` : '—'}
            </td>
            <td className="px-4 py-3 text-gray-600">
              {m.itemSaidaInsumoId ? `#${m.itemSaidaInsumoId}` : '—'}
            </td>
            <td className="px-4 py-3 text-gray-600">
              {m.quantidadeCausadora.toFixed(2)}
            </td>
            <td className="px-4 py-3 text-gray-600">
              {m.quantidadeSensibilizada.toFixed(2)}
            </td>
            <td className="px-4 py-3 font-medium text-gray-900">
              {m.quantidadeResultante.toFixed(2)}
            </td>
          </tr>
        ))}
      </PageableTable>
    </div>
  )
}

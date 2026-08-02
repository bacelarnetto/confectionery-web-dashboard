import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import PageableTable from '../../../components/ui/PageableTable'
import DeleteConfirmModal from '../../../components/ui/DeleteConfirmModal'
import { useInsumos, useDeleteInsumo } from '../hooks/useInsumos'
import { useDebounce } from '../../../hooks/useDebounce'

const TABLE_HEADERS = ['ID', 'Nome', 'Valor', 'Marca', 'Unidade', 'Categoria', 'Tipo', 'Ações']

export default function InsumoListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState({
    id: '',
    nome: '',
    categoriaId: '',
  })
  const [showFilters, setShowFilters] = useState(false)

  const debouncedFilters = useDebounce(filters)
  const filterParams = {
    ...(debouncedFilters.id ? { id: Number(debouncedFilters.id) } : {}),
    ...(debouncedFilters.nome ? { nome: debouncedFilters.nome } : {}),
    ...(debouncedFilters.categoriaId ? { categoriaId: Number(debouncedFilters.categoriaId) } : {}),
  }

  const { data, isLoading } = useInsumos(page, 20, Object.keys(filterParams).length > 0 ? filterParams : undefined)
  const deleteMutation = useDeleteInsumo()

  const insumos = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nome: string } | null>(null)

  function handleFilterChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(0)
  }

  function clearFilters() {
    setFilters({ id: '', nome: '', categoriaId: '' })
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
        title="Insumos"
        subtitle="Gerencie os insumos do estoque"
      >
        <button
          onClick={() => navigate('/estoque-insumos/insumos/novo')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
        >
          <Plus size={16} />
          Novo Insumo
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                <input
                  type="number"
                  value={filters.id}
                  onChange={(e) => handleFilterChange('id', e.target.value)}
                  placeholder="ID do insumo..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={filters.nome}
                  onChange={(e) => handleFilterChange('nome', e.target.value)}
                  placeholder="Buscar por nome..."
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
        isEmpty={!isLoading && insumos.length === 0}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      >
        {insumos.map((i) => (
          <tr key={i.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3 text-gray-500 text-sm">{i.id}</td>
            <td className="px-4 py-3 font-medium text-gray-900">{i.nome}</td>
            <td className="px-4 py-3 text-gray-600">R$ {i.valor.toFixed(2)}</td>
            <td className="px-4 py-3 text-gray-600">{i.marca ?? '—'}</td>
            <td className="px-4 py-3">
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full font-mono">
                {i.unidadeMedida}
              </span>
            </td>
            <td className="px-4 py-3 text-gray-600">{i.categoriaNome ?? i.categoriaId ?? '—'}</td>
            <td className="px-4 py-3">
              {i.perecivel
                ? <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">🌡 Perecível</span>
                : <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-500 rounded-full">Não perecível</span>
              }
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/estoque-insumos/insumos/${i.id}/editar`)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Editar"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => setDeleteTarget({ id: i.id, nome: i.nome })}
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

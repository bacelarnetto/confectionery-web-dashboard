import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import PageableTable from '../../../components/ui/PageableTable'
import DeleteConfirmModal from '../../../components/ui/DeleteConfirmModal'
import { useFornecedores, useDeleteFornecedor } from '../hooks/useFornecedores'
import { useDebounce } from '../../../hooks/useDebounce'
import { maskPhone } from '../../../lib/format'

const TABLE_HEADERS = ['ID', 'Nome', 'CNPJ', 'Telefone', 'E-mail', 'Ações']

export default function FornecedorListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState({ id: '', nome: '', cnpj: '' })
  const [showFilters, setShowFilters] = useState(false)
  const debouncedFilters = useDebounce(filters)
  const activeFilters: { id?: number; nome?: string; cnpj?: string } | undefined =
    Object.values(debouncedFilters).some(Boolean)
      ? {
          ...(debouncedFilters.id ? { id: Number(debouncedFilters.id) } : {}),
          ...(debouncedFilters.nome ? { nome: debouncedFilters.nome } : {}),
          ...(debouncedFilters.cnpj ? { cnpj: debouncedFilters.cnpj } : {}),
        }
      : undefined
  const { data, isLoading } = useFornecedores(page, 20, activeFilters)
  const deleteMutation = useDeleteFornecedor()

  const fornecedores = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nome: string } | null>(null)

  function handleFilterChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(0)
  }

  function clearFilters() {
    setFilters({ id: '', nome: '', cnpj: '' })
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
        title="Fornecedores"
        subtitle="Gerencie os fornecedores de insumos"
      >
        <button
          onClick={() => navigate('/compras/fornecedores/novo')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
        >
          <Plus size={16} />
          Novo Fornecedor
        </button>
      </PageHeader>

      <div className="mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
            showFilters || Object.values(filters).some(Boolean)
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
                  placeholder="ID do fornecedor..."
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
                <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                <input
                  type="text"
                  value={filters.cnpj}
                  onChange={(e) => handleFilterChange('cnpj', e.target.value)}
                  placeholder="Buscar por CNPJ..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
            {Object.values(filters).some(Boolean) && (
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
        isEmpty={!isLoading && fornecedores.length === 0}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      >
        {fornecedores.map((f) => (
          <tr key={f.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3 text-gray-500 text-sm">{f.id}</td>
            <td className="px-4 py-3 font-medium text-gray-900">{f.nome}</td>
            <td className="px-4 py-3 text-gray-600">{f.cnpj ?? '—'}</td>
            <td className="px-4 py-3 text-gray-600">{f.telefone ? maskPhone(f.telefone) : '—'}</td>
            <td className="px-4 py-3 text-gray-600">{f.email ?? '—'}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/compras/fornecedores/${f.id}/editar`)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Editar"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => setDeleteTarget({ id: f.id, nome: f.nome })}
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
        itemName={`Fornecedor "${deleteTarget?.nome}"`}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}

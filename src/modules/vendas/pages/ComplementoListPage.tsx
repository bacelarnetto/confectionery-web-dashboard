import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import PageableTable from '../../../components/ui/PageableTable'
import DeleteConfirmModal from '../../../components/ui/DeleteConfirmModal'
import Badge from '../../../components/ui/Badge'
import { useComplementos, useDeleteComplemento } from '../hooks/useComplementos'
import { useDebounce } from '../../../hooks/useDebounce'

const TABLE_HEADERS = ['ID', 'Categoria', 'Nome', 'Insumo', 'Custo (R$)', 'Venda (R$)', 'Padrão', 'Ações']

export default function ComplementoListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState({ nome: '' })
  const [showFilters, setShowFilters] = useState(false)
  const debouncedFilters = useDebounce(filters)

  const activeFilters = debouncedFilters.nome ? { nome: debouncedFilters.nome } : undefined

  const { data, isLoading } = useComplementos(page, 20, activeFilters)
  const deleteMutation = useDeleteComplemento()

  const complementos = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nome: string } | null>(null)

  function handleDeleteConfirm() {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) })
  }

  return (
    <div>
      <PageHeader title="Complementos" subtitle="Adicionais e opcionais dos produtos">
        <button
          onClick={() => navigate('/vendas/complementos/novo')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
        >
          <Plus size={16} />
          Novo Complemento
        </button>
      </PageHeader>

      <div className="mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
            showFilters || filters.nome
              ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Search size={15} />
          Filtros
          {filters.nome && (
            <span className="px-1.5 py-0.5 text-xs bg-amber-500 text-white rounded-full leading-none">1</span>
          )}
        </button>

        {showFilters && (
          <div className="mt-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm max-w-sm">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                value={filters.nome}
                onChange={(e) => { setFilters({ nome: e.target.value }); setPage(0) }}
                placeholder="Buscar por nome..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            {filters.nome && (
              <button
                onClick={() => { setFilters({ nome: '' }); setPage(0) }}
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
        isEmpty={!isLoading && complementos.length === 0}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      >
        {complementos.map((c) => (
          <tr key={c.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3 text-gray-500 text-sm">{c.id}</td>
            <td className="px-4 py-3 text-gray-600">
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full">{c.categoria}</span>
            </td>
            <td className="px-4 py-3 font-medium text-gray-900">{c.nome}</td>
            <td className="px-4 py-3 text-gray-600 text-sm">{c.insumoNome ?? (c.insumoId ? `ID ${c.insumoId}` : '—')}</td>
            <td className="px-4 py-3 text-gray-600">{c.valorCusto != null ? c.valorCusto.toFixed(2) : '—'}</td>
            <td className="px-4 py-3 text-gray-900 font-medium">{c.valorVenda != null ? c.valorVenda.toFixed(2) : '—'}</td>
            <td className="px-4 py-3">
              {c.padrao && <Badge status="PADRAO" />}
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/vendas/complementos/${c.id}/editar`)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Editar"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => setDeleteTarget({ id: c.id, nome: c.nome })}
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

import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import PageableTable from '../../../components/ui/PageableTable'
import DeleteConfirmModal from '../../../components/ui/DeleteConfirmModal'
import { useDebounce } from '../../../hooks/useDebounce'
import { useFormasPagamento, useDeleteFormaPagamento } from '../hooks/useFormasPagamento'

const TABLE_HEADERS = ['ID', 'Nome', 'Ações']

export default function FormaPagamentoListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [nomeFilter, setNomeFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const debouncedNome = useDebounce(nomeFilter)
  const { data, isLoading } = useFormasPagamento(page, 20, debouncedNome || undefined)
  const deleteMutation = useDeleteFormaPagamento()

  const formas = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nome: string } | null>(null)

  function handleDeleteConfirm() {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, {
      onSettled: () => setDeleteTarget(null),
    })
  }

  return (
    <div>
      <PageHeader title="Formas de Pagamento" subtitle="Formas de pagamento aceitas nos pedidos">
        <button
          onClick={() => navigate('/vendas/formas-pagamento/novo')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
        >
          <Plus size={16} />
          Nova Forma de Pagamento
        </button>
      </PageHeader>

      <div className="mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
            showFilters || nomeFilter
              ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Search size={15} />
          Filtros
          {nomeFilter && (
            <span className="px-1.5 py-0.5 text-xs bg-amber-500 text-white rounded-full leading-none">
              1
            </span>
          )}
        </button>

        {showFilters && (
          <div className="mt-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                value={nomeFilter}
                onChange={(e) => { setNomeFilter(e.target.value); setPage(0) }}
                placeholder="Buscar por nome..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            {nomeFilter && (
              <button
                onClick={() => setNomeFilter('')}
                className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
              >
                <X size={14} />
                Limpar filtro
              </button>
            )}
          </div>
        )}
      </div>

      <PageableTable
        headers={TABLE_HEADERS}
        isLoading={isLoading}
        isEmpty={!isLoading && formas.length === 0}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      >
        {formas.map((f) => (
          <tr key={f.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3 text-gray-500 text-sm">{f.id}</td>
            <td className="px-4 py-3 font-medium text-gray-900">{f.nome}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/vendas/formas-pagamento/${f.id}/editar`)}
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
        itemName={`Forma de pagamento "${deleteTarget?.nome}"`}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}

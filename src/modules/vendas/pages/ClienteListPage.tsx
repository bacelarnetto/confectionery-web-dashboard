import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from 'react-oidc-context'
import { Plus, Pencil, Trash2, Search, X, Eye, EyeOff } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import PageableTable from '../../../components/ui/PageableTable'
import DeleteConfirmModal from '../../../components/ui/DeleteConfirmModal'
import { useClientes, useDeleteCliente } from '../hooks/useClientes'
import { useDebounce } from '../../../hooks/useDebounce'
import { maskPhone, maskCpf, formatCpf } from '../../../lib/format'
import { hasRole } from '../../../lib/auth'

const TABLE_HEADERS = ['ID', 'Nome', 'CPF', 'Celular', 'E-mail', 'Endereços', 'Ações']

export default function ClienteListPage() {
  const navigate = useNavigate()
  const auth = useAuth()
  const podeRevelarCpf = hasRole(auth.user, 'ADMIN')
  const [cpfsRevelados, setCpfsRevelados] = useState<Set<number>>(new Set())
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [filters, setFilters] = useState({ nome: '' })
  const [showFilters, setShowFilters] = useState(false)
  const debouncedFilters = useDebounce(filters)

  const activeFilters = debouncedFilters.nome ? { nome: debouncedFilters.nome } : undefined

  const { data, isLoading } = useClientes(page, pageSize, activeFilters)
  const deleteMutation = useDeleteCliente()

  const clientes = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nome: string } | null>(null)

  function toggleCpf(id: number) {
    setCpfsRevelados((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleFilterChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(0)
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) })
  }

  return (
    <div>
      <PageHeader title="Clientes" subtitle="Gerencie os clientes da confeitaria">
        <button
          onClick={() => navigate('/vendas/clientes/novo')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
        >
          <Plus size={16} />
          Novo Cliente
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
                onChange={(e) => handleFilterChange('nome', e.target.value)}
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
        isEmpty={!isLoading && clientes.length === 0}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalElements={data?.totalElements}
        pageSize={pageSize}
        onPageSizeChange={(size) => { setPageSize(size); setPage(0) }}
      >
        {clientes.map((c) => (
          <tr key={c.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3 text-gray-500 text-sm">{c.id}</td>
            <td className="px-4 py-3 font-medium text-gray-900">{c.nome}</td>
            <td className="px-4 py-3 text-gray-600">
              {c.cpf ? (
                <span className="inline-flex items-center gap-1.5">
                  {cpfsRevelados.has(c.id) ? formatCpf(c.cpf) : maskCpf(c.cpf)}
                  {podeRevelarCpf && (
                    <button
                      type="button"
                      onClick={() => toggleCpf(c.id)}
                      className="p-0.5 rounded text-gray-400 hover:text-gray-600 transition-colors"
                      title={cpfsRevelados.has(c.id) ? 'Ocultar CPF' : 'Revelar CPF'}
                    >
                      {cpfsRevelados.has(c.id) ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  )}
                </span>
              ) : (
                '—'
              )}
            </td>
            <td className="px-4 py-3 text-gray-600">{c.celular || c.telefone ? maskPhone(c.celular ?? c.telefone) : '—'}</td>
            <td className="px-4 py-3 text-gray-600">{c.email ?? '—'}</td>
            <td className="px-4 py-3 text-gray-600">{c.enderecos?.length ?? 0}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/vendas/clientes/${c.id}/editar`)}
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

import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import PageableTable from '../../../components/ui/PageableTable'
import DeleteConfirmModal from '../../../components/ui/DeleteConfirmModal'
import { useUsuarios, useDeleteUsuario } from '../hooks/useUsuarios'

const TABLE_HEADERS = ['Nome', 'Email', 'Ações']

export default function UsuarioListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const { data, isLoading } = useUsuarios(page)
  const deleteMutation = useDeleteUsuario()

  const usuarios = data?.content ?? []
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
      <PageHeader
        title="Usuários"
        subtitle="Gerencie os usuários do sistema"
      >
        <button
          onClick={() => navigate('/usuarios/novo')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
        >
          <Plus size={16} />
          Novo Usuário
        </button>
      </PageHeader>

      <PageableTable
        headers={TABLE_HEADERS}
        isLoading={isLoading}
        isEmpty={!isLoading && usuarios.length === 0}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      >
        {usuarios.map((u) => (
          <tr key={u.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3 font-medium text-gray-900">{u.nome}</td>
            <td className="px-4 py-3 text-gray-600">{u.email ?? '—'}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/usuarios/${u.id}/editar`)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Editar"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => setDeleteTarget({ id: u.id, nome: u.nome })}
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
        itemName={`Usuário "${deleteTarget?.nome}"`}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}

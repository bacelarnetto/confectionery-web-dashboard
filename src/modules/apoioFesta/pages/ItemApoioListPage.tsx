import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import PageableTable from '../../../components/ui/PageableTable'
import DeleteConfirmModal from '../../../components/ui/DeleteConfirmModal'
import { useItensApoio, useDeleteItemApoio } from '../hooks/useItensApoio'
import { ITEM_APOIO_TIPO_LABELS } from '../types/itemApoio'
import { formatCurrency } from '../../../lib/format'

const TABLE_HEADERS = ['ID', 'Nome', 'Tipo', 'Valor/Hora', 'Mão de Obra/Hora', 'Frota (qtd)', 'Ações']

export default function ItemApoioListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const { data, isLoading } = useItensApoio(page, pageSize)
  const deleteMutation = useDeleteItemApoio()

  const itens = data?.content ?? []
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
      <PageHeader title="Itens de Apoio" subtitle="Catálogo de equipamentos alugáveis (carrinho, tacho, decoração...)">
        <button
          onClick={() => navigate('/vendas/itens-apoio/novo')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
        >
          <Plus size={16} />
          Novo Item de Apoio
        </button>
      </PageHeader>

      <PageableTable
        headers={TABLE_HEADERS}
        isLoading={isLoading}
        isEmpty={!isLoading && itens.length === 0}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalElements={data?.totalElements}
        pageSize={pageSize}
        onPageSizeChange={(size) => { setPageSize(size); setPage(0) }}
      >
        {itens.map((i) => (
          <tr key={i.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3 text-gray-500 text-sm">{i.id}</td>
            <td className="px-4 py-3 font-medium text-gray-900">{i.nome}</td>
            <td className="px-4 py-3">
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                {ITEM_APOIO_TIPO_LABELS[i.tipo] ?? i.tipo}
              </span>
            </td>
            <td className="px-4 py-3 text-gray-600">{formatCurrency(i.valorHora)}</td>
            <td className="px-4 py-3 text-gray-600">
              {i.valorHoraMaoDeObra != null ? formatCurrency(i.valorHoraMaoDeObra) : <span className="text-gray-400 text-xs">—</span>}
            </td>
            <td className="px-4 py-3 text-gray-600">{i.quantidade}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/vendas/itens-apoio/${i.id}/editar`)}
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
        itemName={`Item de apoio "${deleteTarget?.nome}"`}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}

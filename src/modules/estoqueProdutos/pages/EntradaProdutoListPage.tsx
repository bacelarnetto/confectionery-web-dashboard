import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Trash2 } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import PageableTable from '../../../components/ui/PageableTable'
import DeleteConfirmModal from '../../../components/ui/DeleteConfirmModal'
import { useEntradasProduto, useDeleteEntradaProduto } from '../hooks/useEntradasProduto'
import { formatCurrency } from '../../../lib/format'

const TABLE_HEADERS = ['ID', 'Fornecedor ID', 'Produtos', 'Valor Total', 'Recebido em', 'Criado por', 'Criado em', 'Ações']

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d)
}

export default function EntradaProdutoListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)

  const { data, isLoading } = useEntradasProduto(page, pageSize)
  const deleteMutation = useDeleteEntradaProduto()
  const [deleteTarget, setDeleteTarget] = useState<{ id: number } | null>(null)

  function handleDeleteConfirm() {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, {
      onSettled: () => setDeleteTarget(null),
    })
  }

  const entradas = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <div>
      <PageHeader
        title="Entradas de Produto"
        subtitle="Produto que entra no estoque sem passar pela Fabricação — terceirizado ou comprado pronto"
      >
        <button
          onClick={() => navigate('/estoque-produtos/entradas/nova')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
        >
          <Plus size={16} />
          Nova Entrada
        </button>
      </PageHeader>

      <PageableTable
        headers={TABLE_HEADERS}
        isLoading={isLoading}
        isEmpty={!isLoading && entradas.length === 0}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalElements={data?.totalElements}
        pageSize={pageSize}
        onPageSizeChange={(size) => { setPageSize(size); setPage(0) }}
      >
        {entradas.map((e) => {
          const valorTotal = e.itens.reduce((acc, it) => acc + (it.valorCustoTotal ?? it.valorCustoUnitario * it.quantidade), 0)
          return (
            <tr key={e.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-gray-500 text-sm">{e.id}</td>
              <td className="px-4 py-3 text-gray-600">{e.fornecedorId ?? '—'}</td>
              <td className="px-4 py-3 text-gray-600">
                <div className="flex flex-col gap-1">
                  {e.itens.map((item, idx) => (
                    <div key={idx} className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="text-gray-900 font-medium">
                        {item.produtoNome ?? `#${item.produtoId}`}
                      </span>
                      <span className="text-gray-400 font-mono text-[11px]">(qtd: {item.quantidade})</span>
                    </div>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(valorTotal)}</td>
              <td className="px-4 py-3 text-gray-600">{formatDate(e.dataRecebimento)}</td>
              <td className="px-4 py-3 text-gray-600">{e.createdBy}</td>
              <td className="px-4 py-3 text-gray-600">{formatDate(e.createdOn)}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => setDeleteTarget({ id: e.id })}
                  className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Excluir entrada"
                >
                  <Trash2 size={15} />
                </button>
              </td>
            </tr>
          )
        })}
      </PageableTable>

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        itemName={`Entrada #${deleteTarget?.id}`}
        isPending={deleteMutation.isPending}
        aviso="O estoque criado por esta entrada também será removido. Só é possível excluir se nada dela foi vendido ou usado ainda."
      />
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import Table from '../../../components/ui/Table'
import Modal from '../../../components/ui/Modal'
import { useParametrizacaoAlertasProduto, useDeleteParametrizacaoAlertaProduto } from '../hooks/useParametrizacaoAlertasProduto'

const TABLE_HEADERS = ['ID', 'Produto', 'Qtd Mínima', 'Dias Vencimento', 'Ações']

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          {Array.from({ length: 5 }).map((_, j) => (
            <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-3/4" /></td>
          ))}
        </tr>
      ))}
    </>
  )
}

export default function ParametrizacaoAlertaProdutoListPage() {
  const navigate = useNavigate()
  const [deleteTarget, setDeleteTarget] = useState<{ id: number } | null>(null)

  const { data: parametrizacoes, isLoading } = useParametrizacaoAlertasProduto()
  const deleteMutation = useDeleteParametrizacaoAlertaProduto()

  function handleDeleteConfirm() {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) })
  }

  return (
    <div>
      <PageHeader title="Parametrização de Alertas de Produtos" subtitle="Configure limites de estoque e vencimento por produto">
        <button
          onClick={() => navigate('/estoque-produtos/parametrizacao-alertas/nova')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
        >
          <Plus size={16} /> Nova Parametrização
        </button>
      </PageHeader>

      <Table headers={TABLE_HEADERS} isEmpty={!isLoading && (parametrizacoes?.length ?? 0) === 0}>
        {isLoading ? <SkeletonRows /> : (
          (parametrizacoes ?? []).map((p) => (
            <tr key={p.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-gray-500 font-mono text-xs">#{p.id}</td>
              <td className="px-4 py-3 font-medium text-gray-900">{p.produtoNome ?? `#${p.produtoId}`}</td>
              <td className="px-4 py-3 text-gray-600">{p.quantidadeMinimaEstoque}</td>
              <td className="px-4 py-3 text-gray-600">{p.quantidadeDiasVencimento} dias</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/estoque-produtos/parametrizacao-alertas/${p.id}/editar`)}
                    className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Editar"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget({ id: p.id! })}
                    className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Remover"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </Table>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirmar exclusão">
        <p className="text-sm text-gray-600 mb-5">
          Tem certeza que deseja remover a parametrização <span className="font-semibold">#{deleteTarget?.id}</span>?
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
          <button onClick={handleDeleteConfirm} disabled={deleteMutation.isPending} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-60">
            {deleteMutation.isPending ? 'Removendo...' : 'Remover'}
          </button>
        </div>
      </Modal>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Eye, Trash2, ArrowRight, Download } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import PageableTable from '../../../components/ui/PageableTable'
import DeleteConfirmModal from '../../../components/ui/DeleteConfirmModal'
import Badge from '../../../components/ui/Badge'
import { useOrcamentos, useDeleteOrcamento, useDownloadOrcamentoPdf } from '../hooks/useOrcamentos'

const TABLE_HEADERS = ['ID', 'Cliente', 'Status', 'Valor Total', 'Validade', 'Criado em', 'Ações']

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateStr))
}

function isVencida(dataValidade: string | undefined): boolean {
  return !!dataValidade && new Date(dataValidade).getTime() < Date.now()
}

export default function OrcamentoListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const { data, isLoading } = useOrcamentos(page)
  const deleteMutation = useDeleteOrcamento()
  const downloadPdfMutation = useDownloadOrcamentoPdf()

  const orcamentos = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nome: string } | null>(null)

  function handleDeleteConfirm() {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) })
  }

  return (
    <div>
      <PageHeader title="Orçamentos" subtitle="Propostas de compra negociadas com o cliente, antes de virar pedido">
        <button
          onClick={() => navigate('/vendas/orcamentos/novo')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
        >
          <Plus size={16} />
          Novo Orçamento
        </button>
      </PageHeader>

      <PageableTable
        headers={TABLE_HEADERS}
        isLoading={isLoading}
        isEmpty={!isLoading && orcamentos.length === 0}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      >
        {orcamentos.map((o) => (
          <tr
            key={o.id}
            className="hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => navigate(`/vendas/orcamentos/${o.id}/editar`)}
          >
            <td className="px-4 py-3 text-gray-500 text-sm">{o.id}</td>
            <td className="px-4 py-3 text-gray-700 font-medium">{o.clienteNome ?? o.clienteId ?? '—'}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                {o.status ? <Badge status={o.status} /> : '—'}
                {o.status === 'CONVERTIDO' && o.pedidoId && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/vendas/pedidos/${o.pedidoId}/editar`)
                    }}
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    <ArrowRight size={12} /> Pedido #{o.pedidoId}
                  </span>
                )}
              </div>
            </td>
            <td className="px-4 py-3 font-medium text-gray-900">
              {o.valorTotal != null ? `R$ ${Number(o.valorTotal).toFixed(2)}` : '—'}
            </td>
            <td className="px-4 py-3 text-gray-600">
              {o.dataValidade ? (
                <span className={isVencida(o.dataValidade) && o.status === 'ABERTO' ? 'text-red-600 font-medium' : ''}>
                  {formatDate(o.dataValidade)}
                </span>
              ) : (
                '—'
              )}
            </td>
            <td className="px-4 py-3 text-gray-600">{formatDate(o.createdOn)}</td>
            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/vendas/orcamentos/${o.id}/editar`)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Ver / editar"
                >
                  <Eye size={15} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    downloadPdfMutation.mutate(o.id)
                  }}
                  disabled={downloadPdfMutation.isPending}
                  className="p-1.5 rounded-md text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-60"
                  title="Baixar PDF"
                >
                  <Download size={15} />
                </button>
                {o.status !== 'CONVERTIDO' && (
                  <button
                    onClick={() => setDeleteTarget({ id: o.id, nome: `Orçamento #${o.id}` })}
                    className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Remover"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
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

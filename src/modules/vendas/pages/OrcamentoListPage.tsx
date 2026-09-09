import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Eye, Ban, ArrowRight, Download } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import PageableTable from '../../../components/ui/PageableTable'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import Badge from '../../../components/ui/Badge'
import { useOrcamentos, useUpdateOrcamentoStatus, useDownloadOrcamentoPdf } from '../hooks/useOrcamentos'

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
  const statusMutation = useUpdateOrcamentoStatus()
  const downloadPdfMutation = useDownloadOrcamentoPdf()

  const orcamentos = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  const [rejeitarTarget, setRejeitarTarget] = useState<{ id: number; nome: string } | null>(null)

  function handleRejeitarConfirm() {
    if (!rejeitarTarget) return
    statusMutation.mutate(
      { id: rejeitarTarget.id, status: 'REJEITADO' },
      { onSettled: () => setRejeitarTarget(null) },
    )
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
                {o.status === 'ABERTO' && (
                  <button
                    onClick={() => setRejeitarTarget({ id: o.id, nome: `Orçamento #${o.id}` })}
                    className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Rejeitar"
                  >
                    <Ban size={15} />
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </PageableTable>

      <Modal open={!!rejeitarTarget} onClose={() => setRejeitarTarget(null)} title="Rejeitar orçamento">
        <p className="text-sm text-gray-600 mb-5">
          Tem certeza que deseja rejeitar{' '}
          <span className="font-semibold text-gray-900">"{rejeitarTarget?.nome}"</span>? O orçamento fica marcado como{' '}
          <span className="font-semibold text-gray-900">rejeitado</span> e não pode mais ser editado. Não é possível
          desfazer.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setRejeitarTarget(null)}
            disabled={statusMutation.isPending}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-60"
          >
            Voltar
          </button>
          <Button type="button" variant="danger" onClick={handleRejeitarConfirm} isLoading={statusMutation.isPending}>
            Rejeitar orçamento
          </Button>
        </div>
      </Modal>
    </div>
  )
}

import { useState, useEffect, FormEvent } from 'react'
import { Plus, Pencil, Trash2, HandCoins, MessageSquare } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import PageableTable from '../../../components/ui/PageableTable'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import DeleteConfirmModal from '../../../components/ui/DeleteConfirmModal'
import {
  useContasReceber,
  useContaAvulsa,
  useCreateContaAvulsa,
  useUpdateContaAvulsa,
  useDeleteContaAvulsa,
  useRegistrarRecebimentoAvulsa,
} from '../hooks/useFinanceiro'
import { useRegistrarPagamentoPedido, useUpdateMotivoPendenciaPedido } from '../../vendas/hooks/usePedidos'
import { formatCurrency } from '../../../lib/format'
import { ContaReceber } from '../types/contaReceber'

const TABLE_HEADERS = ['Origem', 'Cliente / Descrição', 'Valor', 'Já recebido', 'Saldo', 'Status', 'Motivo', 'Data ref.', 'Ações']

function hoje(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function formatData(dateStr?: string) {
  if (!dateStr) return '—'
  try {
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
      new Date(dateStr),
    )
  } catch {
    return dateStr
  }
}

const inputClass =
  'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent placeholder:text-gray-400'

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

export default function ContaReceberListPage() {
  const [apenasPendentes, setApenasPendentes] = useState(true)
  const { data, isLoading } = useContasReceber(apenasPendentes)
  const deleteMutation = useDeleteContaAvulsa()

  const [recebimentoTarget, setRecebimentoTarget] = useState<ContaReceber | null>(null)
  const [avulsaModal, setAvulsaModal] = useState<{ mode: 'create' } | { mode: 'edit'; id: number } | null>(null)
  const [motivoTarget, setMotivoTarget] = useState<ContaReceber | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; descricao: string } | null>(null)

  const contas = data ?? []

  return (
    <div>
      <PageHeader title="Contas a Receber" subtitle="Recebimentos pendentes de pedidos e contas avulsas">
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={apenasPendentes}
              onChange={(e) => setApenasPendentes(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400"
            />
            Apenas pendentes
          </label>
          <button
            onClick={() => setAvulsaModal({ mode: 'create' })}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
          >
            <Plus size={16} />
            Nova Conta Avulsa
          </button>
        </div>
      </PageHeader>

      <PageableTable
        headers={TABLE_HEADERS}
        isLoading={isLoading}
        isEmpty={!isLoading && contas.length === 0}
        page={0}
        totalPages={1}
        onPageChange={() => undefined}
      >
        {contas.map((c) => (
          <tr key={`${c.origem}-${c.idRef}`} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  c.origem === 'PEDIDO' ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'
                }`}
              >
                {c.origem === 'PEDIDO' ? 'Pedido' : 'Avulsa'}
              </span>
            </td>
            <td className="px-4 py-3 font-medium text-gray-900">
              {c.origem === 'PEDIDO' ? (c.clienteNome ?? `Cliente #${c.pedidoId ?? c.idRef}`) : (c.descricao ?? '—')}
            </td>
            <td className="px-4 py-3 text-gray-900 font-medium">{formatCurrency(c.valor)}</td>
            <td className="px-4 py-3 text-gray-600">{formatCurrency(c.valorRecebido)}</td>
            <td className="px-4 py-3 text-gray-900 font-semibold">{formatCurrency(c.saldo)}</td>
            <td className="px-4 py-3">
              <Badge status={c.status} />
            </td>
            <td className="px-4 py-3 text-gray-600 max-w-[220px] truncate" title={c.motivo ?? ''}>
              {c.motivo ?? '—'}
            </td>
            <td className="px-4 py-3 text-gray-600 text-sm">{formatData(c.dataReferencia)}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                {c.saldo > 0 && (
                  <button
                    onClick={() => setRecebimentoTarget(c)}
                    className="p-1.5 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                    title="Registrar recebimento"
                  >
                    <HandCoins size={15} />
                  </button>
                )}
                {c.origem === 'PEDIDO' && (
                  <button
                    onClick={() => setMotivoTarget(c)}
                    className="p-1.5 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    title="Editar motivo de pendência"
                  >
                    <MessageSquare size={15} />
                  </button>
                )}
                {c.origem === 'AVULSA' && (
                  <>
                    <button
                      onClick={() => setAvulsaModal({ mode: 'edit', id: c.idRef })}
                      className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Editar conta avulsa"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ id: c.idRef, descricao: c.descricao ?? `Conta avulsa #${c.idRef}` })}
                      className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Excluir conta avulsa"
                    >
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
              </div>
            </td>
          </tr>
        ))}
      </PageableTable>

      <RecebimentoModal target={recebimentoTarget} onClose={() => setRecebimentoTarget(null)} />
      <AvulsaModal modal={avulsaModal} onClose={() => setAvulsaModal(null)} />
      <MotivoModal target={motivoTarget} onClose={() => setMotivoTarget(null)} />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return
          deleteMutation.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) })
        }}
        itemName={deleteTarget?.descricao}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}

// --- Modais ---

function RecebimentoModal({ target, onClose }: { target: ContaReceber | null; onClose: () => void }) {
  const registrarPagamentoPedido = useRegistrarPagamentoPedido()
  const registrarRecebimentoAvulsa = useRegistrarRecebimentoAvulsa()

  const [valor, setValor] = useState('')
  const [data, setData] = useState(hoje())
  const [observacao, setObservacao] = useState('')

  useEffect(() => {
    if (target) {
      setValor(target.saldo != null ? String(target.saldo) : '')
      setData(hoje())
      setObservacao('')
    }
  }, [target])

  if (!target) return null

  const conta = target
  const isPagamentoPedido = conta.origem === 'PEDIDO'
  const isPending = registrarPagamentoPedido.isPending || registrarRecebimentoAvulsa.isPending

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (isPagamentoPedido) {
      registrarPagamentoPedido.mutate(
        {
          id: conta.pedidoId ?? conta.idRef,
          data: { valor: Number(valor), dataPagamento: data, observacao: observacao || undefined, createdBy: 'netto' },
        },
        { onSettled: onClose },
      )
    } else {
      registrarRecebimentoAvulsa.mutate(
        { id: conta.idRef, data: { valor: Number(valor), dataRecebimento: data } },
        { onSettled: onClose },
      )
    }
  }

  return (
    <Modal open onClose={onClose} title="Registrar recebimento">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-sm text-gray-600">
          {target.origem === 'PEDIDO'
            ? `Recebimento do pedido de ${target.clienteNome ?? `#${target.pedidoId ?? target.idRef}`}`
            : `Recebimento da conta avulsa "${target.descricao ?? '—'}"`}
        </div>
        <Field label="Valor (R$)" required>
          <input
            type="number"
            step="0.01"
            min="0"
            max={target.saldo}
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            required
            className={inputClass}
            placeholder="0.00"
          />
        </Field>
        <Field label={isPagamentoPedido ? 'Data do pagamento' : 'Data do recebimento'} required>
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} required className={inputClass} />
        </Field>
        {isPagamentoPedido && (
          <Field label="Observação">
            <input
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className={inputClass}
              placeholder="Opcional"
            />
          </Field>
        )}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-60"
          >
            Cancelar
          </button>
          <Button type="submit" isLoading={isPending}>Registrar</Button>
        </div>
      </form>
    </Modal>
  )
}

function AvulsaModal({
  modal,
  onClose,
}: {
  modal: { mode: 'create' } | { mode: 'edit'; id: number } | null
  onClose: () => void
}) {
  const isEditing = modal?.mode === 'edit'
  const editId = isEditing ? (modal as { mode: 'edit'; id: number }).id : 0

  const { data: contaAvulsa } = useContaAvulsa(editId)
  const createMutation = useCreateContaAvulsa()
  const updateMutation = useUpdateContaAvulsa()

  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [motivo, setMotivo] = useState('')
  const [dataVencimento, setDataVencimento] = useState('')

  useEffect(() => {
    if (contaAvulsa) {
      setDescricao(contaAvulsa.descricao ?? '')
      setValor(contaAvulsa.valor != null ? String(contaAvulsa.valor) : '')
      setMotivo(contaAvulsa.motivo ?? '')
      setDataVencimento(formatDataInput(contaAvulsa.dataVencimento))
    }
  }, [contaAvulsa])

  useEffect(() => {
    if (modal?.mode === 'create') {
      setDescricao('')
      setValor('')
      setMotivo('')
      setDataVencimento('')
    }
  }, [modal])

  if (!modal) return null

  const isPending = createMutation.isPending || updateMutation.isPending

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const payload = {
      descricao,
      valor: Number(valor),
      motivo: motivo || undefined,
      dataVencimento: dataVencimento || undefined,
    }
    if (isEditing) {
      updateMutation.mutate({ id: editId, data: { ...payload, updatedBy: 'netto' } }, { onSettled: onClose })
    } else {
      createMutation.mutate({ ...payload, createdBy: 'netto' }, { onSettled: onClose })
    }
  }

  return (
    <Modal open onClose={onClose} title={isEditing ? 'Editar Conta Avulsa' : 'Nova Conta Avulsa'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Descrição" required>
          <input
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            required
            className={inputClass}
            placeholder="Ex: Funcionário quebrou um item..."
          />
        </Field>
        <Field label="Valor (R$)" required>
          <input
            type="number"
            step="0.01"
            min="0"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            required
            className={inputClass}
            placeholder="0.00"
          />
        </Field>
        <Field label="Data de vencimento">
          <input type="date" value={dataVencimento} onChange={(e) => setDataVencimento(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Motivo / Observação">
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={3}
            className={inputClass}
            placeholder="Motivo ou observação da conta"
          />
        </Field>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-60"
          >
            Cancelar
          </button>
          <Button type="submit" isLoading={isPending}>
            {isEditing ? 'Salvar alterações' : 'Cadastrar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function MotivoModal({ target, onClose }: { target: ContaReceber | null; onClose: () => void }) {
  const updateMotivoMutation = useUpdateMotivoPendenciaPedido()
  const [motivo, setMotivo] = useState('')

  useEffect(() => {
    if (target) setMotivo(target.motivo ?? '')
  }, [target])

  if (!target) return null

  const conta = target

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    updateMotivoMutation.mutate(
      { id: conta.pedidoId ?? conta.idRef, motivoPendencia: motivo || undefined },
      { onSettled: onClose },
    )
  }

  return (
    <Modal open onClose={onClose} title="Editar motivo de pendência">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Motivo">
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={3}
            className={inputClass}
            placeholder="Por que esse pedido ainda não foi pago?"
          />
        </Field>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={updateMotivoMutation.isPending}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-60"
          >
            Cancelar
          </button>
          <Button type="submit" isLoading={updateMotivoMutation.isPending}>Salvar motivo</Button>
        </div>
      </form>
    </Modal>
  )
}

function formatDataInput(value?: string) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
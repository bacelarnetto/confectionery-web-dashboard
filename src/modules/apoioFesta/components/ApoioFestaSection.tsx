import { useState } from 'react'
import { Plus, Ban, Clock, Trash2 } from 'lucide-react'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import DeleteConfirmModal from '../../../components/ui/DeleteConfirmModal'
import { useApoiosFesta, useCreateApoioFesta, useCancelarApoioFesta } from '../hooks/useApoiosFesta'
import { ApoioFesta, ApoioFestaInsertForm } from '../types/apoioFesta'
import { formatCurrency } from '../../../lib/format'
import { diaInteiroBrasilia } from '../lib/horarioBrasilia'
import AdicionarApoioModal, { ApoioFormBase, ApoioFormDefaults } from './AdicionarApoioModal'

function formatDateTime(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

export interface ApoioFestaLocal extends ApoioFormBase {
  itemApoioNome: string
  colaboradorNome?: string
  valorTotal: number
}

interface Props {
  pedidoId?: number
  /** O pedido precisa ter pelo menos um item de produto -- Apoio de Festa só existe pra
   * complementar uma venda de doce, o backend recusa (400) se o pedido estiver vazio. */
  podeAdicionar: boolean
  /** Valor cru de form.dataEntrega (datetime-local) -- usado só pelo atalho "Carrinho (dia
   * inteiro)" pra saber que dia pré-preencher. Sem isso o atalho fica desabilitado. */
  dataEntrega?: string
  /** Quando em modo de criação do pedido, a lista de apoios é gerenciada localmente no formulário */
  itensLocais?: ApoioFestaLocal[]
  onAdicionarLocal?: (apoio: ApoioFestaLocal) => void
  onRemoverLocal?: (index: number) => void
}

export default function ApoioFestaSection({
  pedidoId,
  podeAdicionar,
  dataEntrega,
  itensLocais = [],
  onAdicionarLocal,
  onRemoverLocal,
}: Props) {
  const isModoEdicao = pedidoId != null && pedidoId > 0
  const { data, isLoading } = useApoiosFesta(0, 50, { pedidoId: pedidoId! }, isModoEdicao)
  const createMutation = useCreateApoioFesta()
  const cancelarMutation = useCancelarApoioFesta()

  const [showAdicionar, setShowAdicionar] = useState(false)
  const [defaults, setDefaults] = useState<ApoioFormDefaults | undefined>(undefined)
  const [cancelTarget, setCancelTarget] = useState<ApoioFesta | null>(null)
  const [itemLocalToDeleteIndex, setItemLocalToDeleteIndex] = useState<number | null>(null)

  function handleConfirmRemoverLocal() {
    if (itemLocalToDeleteIndex === null) return
    onRemoverLocal?.(itemLocalToDeleteIndex)
    setItemLocalToDeleteIndex(null)
  }

  function abrirModal(comDiaInteiro: boolean) {
    setDefaults(comDiaInteiro && dataEntrega ? diaInteiroBrasilia(dataEntrega) : undefined)
    setShowAdicionar(true)
  }

  const apoios = isModoEdicao ? (data?.content ?? []) : []

  function handleCancelConfirm() {
    if (!cancelTarget) return
    cancelarMutation.mutate(cancelTarget.id, { onSettled: () => setCancelTarget(null) })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Apoio de Festa</h3>
          <p className="text-xs text-gray-500">Locação de carrinho, tacho, decoração ou outro equipamento vinculado a este pedido</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => abrirModal(true)}
            disabled={!podeAdicionar || !dataEntrega}
            title={
              !podeAdicionar
                ? 'Adicione um item de produto no pedido antes de propor um Apoio de Festa'
                : !dataEntrega
                ? 'Defina a Data de Entrega do pedido antes de usar o atalho de dia inteiro'
                : 'Pré-preenche 08h–22h (horário de Brasília) no dia da entrega — os horários continuam editáveis'
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-50"
          >
            <Clock size={16} />
            Carrinho (dia inteiro)
          </button>
          <button
            type="button"
            onClick={() => abrirModal(false)}
            disabled={!podeAdicionar}
            title={podeAdicionar ? undefined : 'Adicione um item de produto no pedido antes de propor um Apoio de Festa'}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-amber-50"
          >
            <Plus size={16} />
            Adicionar Apoio de Festa
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="h-8 bg-gray-100 rounded animate-pulse" />
      ) : (isModoEdicao ? apoios.length === 0 : itensLocais.length === 0) ? (
        <p className="text-sm text-gray-400">Nenhum apoio de festa vinculado a este pedido.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 border-b">
              <th className="text-left pb-1">Item</th>
              <th className="text-left pb-1">Colaborador</th>
              <th className="text-left pb-1">Início</th>
              <th className="text-left pb-1">Fim</th>
              <th className="text-right pb-1">Valor</th>
              <th className="text-left pb-1 pl-4">Status</th>
              <th className="pb-1"></th>
            </tr>
          </thead>
          <tbody>
            {isModoEdicao
              ? apoios.map((a) => (
                  <tr key={a.id} className="border-b last:border-0">
                    <td className="py-1.5 font-medium text-gray-900">
                      {a.itemApoioNome}
                      {a.incluiMaoDeObra && (
                        <span className="ml-1.5 inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          + atendente
                        </span>
                      )}
                    </td>
                    <td className="py-1.5 text-gray-600">{a.colaboradorNome ?? '—'}</td>
                    <td className="py-1.5 text-gray-600">{formatDateTime(a.horaInicio)}</td>
                    <td className="py-1.5 text-gray-600">{formatDateTime(a.horaFim)}</td>
                    <td className="text-right py-1.5 font-medium">{formatCurrency(a.valorTotal)}</td>
                    <td className="py-1.5 pl-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          a.status === 'ATIVO' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {a.status === 'ATIVO' ? 'Ativo' : 'Cancelado'}
                      </span>
                    </td>
                    <td className="py-1.5 text-right">
                      {a.status === 'ATIVO' && (
                        <button
                          type="button"
                          onClick={() => setCancelTarget(a)}
                          className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Cancelar apoio de festa"
                        >
                          <Ban size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              : itensLocais.map((a, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-1.5 font-medium text-gray-900">
                      {a.itemApoioNome}
                      {a.incluiMaoDeObra && (
                        <span className="ml-1.5 inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          + atendente
                        </span>
                      )}
                    </td>
                    <td className="py-1.5 text-gray-600">{a.colaboradorNome ?? '—'}</td>
                    <td className="py-1.5 text-gray-600">{formatDateTime(a.horaInicio)}</td>
                    <td className="py-1.5 text-gray-600">{formatDateTime(a.horaFim)}</td>
                    <td className="text-right py-1.5 font-medium">{formatCurrency(a.valorTotal)}</td>
                    <td className="py-1.5 pl-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        Ao salvar
                      </span>
                    </td>
                    <td className="py-1.5 text-right">
                      <button
                        type="button"
                        onClick={() => setItemLocalToDeleteIndex(idx)}
                        className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Remover apoio"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      )}

      <AdicionarApoioModal<ApoioFestaInsertForm>
        open={showAdicionar}
        onClose={() => setShowAdicionar(false)}
        createMutation={isModoEdicao ? createMutation : undefined}
        buildPayload={isModoEdicao ? (base: ApoioFormBase) => ({ ...base, pedidoId: pedidoId! }) : undefined}
        onConfirmLocal={!isModoEdicao ? (base, info) => onAdicionarLocal?.({ ...base, ...info }) : undefined}
        defaults={defaults}
      />

      <Modal open={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Cancelar apoio de festa">
        <p className="text-sm text-gray-600 mb-5">
          Tem certeza que deseja cancelar o apoio{' '}
          <span className="font-semibold text-gray-900">"{cancelTarget?.itemApoioNome}"</span>? O valor{' '}
          <span className="font-semibold text-gray-900">{formatCurrency(cancelTarget?.valorTotal)}</span> é
          removido do total do pedido automaticamente. Não é possível desfazer.
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setCancelTarget(null)}
            disabled={cancelarMutation.isPending}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-60"
          >
            Voltar
          </button>
          <Button type="button" variant="danger" onClick={handleCancelConfirm} isLoading={cancelarMutation.isPending}>
            Cancelar apoio
          </Button>
        </div>
      </Modal>

      <DeleteConfirmModal
        isOpen={itemLocalToDeleteIndex !== null}
        onClose={() => setItemLocalToDeleteIndex(null)}
        onConfirm={handleConfirmRemoverLocal}
        itemName={
          itemLocalToDeleteIndex !== null && itensLocais[itemLocalToDeleteIndex]
            ? `o apoio "${itensLocais[itemLocalToDeleteIndex].itemApoioNome}"`
            : 'este apoio'
        }
      />
    </div>
  )
}

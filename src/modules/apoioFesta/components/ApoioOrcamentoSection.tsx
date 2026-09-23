import { useState } from 'react'
import { Plus, Trash2, Clock } from 'lucide-react'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import DeleteConfirmModal from '../../../components/ui/DeleteConfirmModal'
import { useApoiosOrcamento, useCreateApoioOrcamento, useRemoverApoioOrcamento } from '../hooks/useApoiosOrcamento'
import { ApoioOrcamento, ApoioOrcamentoInsertForm } from '../types/apoioOrcamento'
import { formatCurrency } from '../../../lib/format'
import { diaInteiroBrasilia } from '../lib/horarioBrasilia'
import AdicionarApoioModal, { ApoioFormBase, ApoioFormDefaults } from './AdicionarApoioModal'

function formatDateTime(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

export interface ApoioOrcamentoLocal extends ApoioFormBase {
  itemApoioNome: string
  colaboradorNome?: string
  valorTotal: number
}

interface Props {
  orcamentoId?: number
  /** O orçamento precisa ter pelo menos um item de produto -- mesma regra de negócio de
   * ApoioFesta ("não somos uma locadora, apoio só existe pra complementar o doce"). */
  podeAdicionar: boolean
  /** Orçamento decidido (Convertido/Rejeitado) não edita mais nada -- some o botão de adicionar
   * e o de remover, a lista fica só de leitura (histórico). */
  readOnly?: boolean
  /** Valor cru de form.dataEvento (datetime-local) -- usado só pelo atalho "Carrinho (dia
   * inteiro)". Sem isso o atalho fica desabilitado. */
  dataEvento?: string
  /** Quando em modo de criação de orçamento, a lista de apoios propostos é gerenciada localmente */
  itensLocais?: ApoioOrcamentoLocal[]
  onAdicionarLocal?: (apoio: ApoioOrcamentoLocal) => void
  onRemoverLocal?: (index: number) => void
}

export default function ApoioOrcamentoSection({
  orcamentoId,
  podeAdicionar,
  readOnly,
  dataEvento,
  itensLocais = [],
  onAdicionarLocal,
  onRemoverLocal,
}: Props) {
  const isModoEdicao = orcamentoId != null && orcamentoId > 0
  const { data: apoios, isLoading } = useApoiosOrcamento(orcamentoId ?? 0)
  const createMutation = useCreateApoioOrcamento()
  const removerMutation = useRemoverApoioOrcamento()

  const [showAdicionar, setShowAdicionar] = useState(false)
  const [defaults, setDefaults] = useState<ApoioFormDefaults | undefined>(undefined)
  const [removeTarget, setRemoveTarget] = useState<ApoioOrcamento | null>(null)
  const [itemLocalToDeleteIndex, setItemLocalToDeleteIndex] = useState<number | null>(null)

  function handleConfirmRemoverLocal() {
    if (itemLocalToDeleteIndex === null) return
    onRemoverLocal?.(itemLocalToDeleteIndex)
    setItemLocalToDeleteIndex(null)
  }

  const lista = isModoEdicao ? (apoios ?? []) : []

  function abrirModal(comDiaInteiro: boolean) {
    setDefaults(comDiaInteiro && dataEvento ? diaInteiroBrasilia(dataEvento) : undefined)
    setShowAdicionar(true)
  }

  function handleRemoveConfirm() {
    if (!removeTarget) return
    removerMutation.mutate(removeTarget.id, { onSettled: () => setRemoveTarget(null) })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Apoio de Festa (proposta)</h3>
          <p className="text-xs text-gray-500">
            Locação de carrinho, tacho, decoração ou outro equipamento — só vira reserva de verdade se o orçamento for
            aprovado
          </p>
        </div>
        {!readOnly && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => abrirModal(true)}
              disabled={!podeAdicionar || !dataEvento}
              title={
                !podeAdicionar
                  ? 'Adicione um item de produto no orçamento antes de propor um Apoio de Festa'
                  : !dataEvento
                  ? 'Defina a Data do Evento do orçamento antes de usar o atalho de dia inteiro'
                  : 'Pré-preenche 08h–22h (horário de Brasília) no dia do evento — os horários continuam editáveis'
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
              title={podeAdicionar ? undefined : 'Adicione um item de produto no orçamento antes de propor um Apoio de Festa'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-amber-50"
            >
              <Plus size={16} />
              Propor Apoio de Festa
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="h-8 bg-gray-100 rounded animate-pulse" />
      ) : (isModoEdicao ? lista.length === 0 : itensLocais.length === 0) ? (
        <p className="text-sm text-gray-400">Nenhum apoio de festa proposto neste orçamento.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 border-b">
              <th className="text-left pb-1">Item</th>
              <th className="text-left pb-1">Colaborador</th>
              <th className="text-left pb-1">Início</th>
              <th className="text-left pb-1">Fim</th>
              <th className="text-right pb-1">Valor</th>
              {!readOnly && <th className="pb-1"></th>}
            </tr>
          </thead>
          <tbody>
            {isModoEdicao
              ? lista.map((a) => (
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
                    {!readOnly && (
                      <td className="py-1.5 text-right">
                        <button
                          type="button"
                          onClick={() => setRemoveTarget(a)}
                          className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Remover da proposta"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    )}
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
                    {!readOnly && (
                      <td className="py-1.5 text-right">
                        <button
                          type="button"
                          onClick={() => setItemLocalToDeleteIndex(idx)}
                          className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Remover da proposta"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
          </tbody>
        </table>
      )}

      {!readOnly && (
        <>
          <AdicionarApoioModal<ApoioOrcamentoInsertForm>
            open={showAdicionar}
            onClose={() => setShowAdicionar(false)}
            title="Propor Apoio de Festa"
            createMutation={isModoEdicao ? createMutation : undefined}
            buildPayload={isModoEdicao ? (base: ApoioFormBase) => ({ ...base, orcamentoId: orcamentoId! }) : undefined}
            onConfirmLocal={!isModoEdicao ? (base, info) => onAdicionarLocal?.({ ...base, ...info }) : undefined}
            defaults={defaults}
          />

          <Modal open={!!removeTarget} onClose={() => setRemoveTarget(null)} title="Remover apoio da proposta">
            <p className="text-sm text-gray-600 mb-5">
              Tem certeza que deseja remover o apoio{' '}
              <span className="font-semibold text-gray-900">"{removeTarget?.itemApoioNome}"</span> da proposta? O valor
              desse apoio será subtraído do total do orçamento.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRemoveTarget(null)}
                disabled={removerMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-60"
              >
                Voltar
              </button>
              <Button type="button" variant="danger" onClick={handleRemoveConfirm} isLoading={removerMutation.isPending}>
                Remover
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
        </>
      )}
    </div>
  )
}

import { useState, useEffect, FormEvent } from 'react'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import { useItensApoio } from '../hooks/useItensApoio'
import { useColaboradores } from '../hooks/useColaboradores'
import { useApoiosFesta } from '../hooks/useApoiosFesta'
import { mesmoDiaBrasilia } from '../lib/horarioBrasilia'
import { parseApiError } from '../../../lib/apiError'

const inputClass =
  'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent placeholder:text-gray-400'

export interface ApoioFormDefaults {
  horaInicio: string
  horaFim: string
}

export interface ApoioFormBase {
  itemApoioId: number
  horaInicio: string
  horaFim: string
  incluiMaoDeObra: boolean
  colaboradorId?: number
  createdBy: string
}

interface MutationLike<TInsert> {
  mutate: (data: TInsert, options: { onSuccess: () => void; onError: (err: unknown) => void }) => void
  isPending: boolean
}

interface Props<TInsert> {
  open: boolean
  onClose: () => void
  title?: string
  createMutation: MutationLike<TInsert>
  buildPayload: (base: ApoioFormBase) => TInsert
  /** Pré-preenche hora início/fim ao abrir (atalho "Carrinho (dia inteiro)") -- continuam
   * editáveis depois, é só o valor inicial. */
  defaults?: ApoioFormDefaults
}

/**
 * Compartilhado entre PedidoFormPage (via ApoioFestaSection) e OrcamentoFormPage (via
 * ApoioOrcamentoSection) -- os dois fluxos usam exatamente os mesmos campos (item, horário,
 * mão de obra, colaborador) e a mesma checagem de disponibilidade contra reservas reais
 * (ApoioFesta), mesmo quando é só uma proposta de orçamento ainda não vinculante.
 *
 * Os `defaults` pré-preenchem hora início/fim ao abrir -- usados pelo quick-add "Carrinho
 * (dia inteiro)" (proposta de 08:00-22:00 a partir da data de entrega/validade). Ainda são
 * editáveis no formulário, são só um atalho pro caso mais comum.
 */
export default function AdicionarApoioModal<TInsert>({
  open,
  onClose,
  title = 'Adicionar Apoio de Festa',
  createMutation,
  buildPayload,
  defaults,
}: Props<TInsert>) {
  const { data: itensData } = useItensApoio(0, 100)
  const itensApoio = itensData?.content ?? []
  const { data: colaboradoresData } = useColaboradores(0, 100)
  const colaboradores = colaboradoresData?.content ?? []

  const [itemApoioId, setItemApoioId] = useState('')
  const [horaInicio, setHoraInicio] = useState('')
  const [horaFim, setHoraFim] = useState('')
  const [incluiMaoDeObra, setIncluiMaoDeObra] = useState(false)
  const [colaboradorId, setColaboradorId] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setItemApoioId('')
      setHoraInicio(defaults?.horaInicio ?? '')
      setHoraFim(defaults?.horaFim ?? '')
      setIncluiMaoDeObra(false)
      setColaboradorId('')
      setErro(null)
    }
  }, [open, defaults?.horaInicio, defaults?.horaFim])

  const itemSelecionado = itensApoio.find((i) => i.id === Number(itemApoioId))
  const ofereceMaoDeObra = itemSelecionado?.valorHoraMaoDeObra != null

  // Item sem mão de obra ganha essa desmarcação sozinha ao trocar a seleção -- evita mandar
  // incluiMaoDeObra=true pra um item que não oferece o serviço (o backend recusaria com 400).
  useEffect(() => {
    if (!ofereceMaoDeObra) setIncluiMaoDeObra(false)
  }, [ofereceMaoDeObra])

  // Checa quantas unidades ATIVO já existem pro item/dia escolhidos -- mesma regra que o backend
  // usa pra recusar (dia inteiro, não por horário), só que consultada antes do usuário tentar
  // salvar, em vez de só descobrir no erro do submit. Vale tanto pra Apoio de Festa real quanto
  // pra proposta de Orçamento -- as duas checam contra as mesmas reservas reais (ApoioFesta).
  const podeChecarOcupacao = !!itemApoioId && !!horaInicio
  const { data: ocupacaoData } = useApoiosFesta(
    0,
    100,
    podeChecarOcupacao
      ? { itemApoioId: Number(itemApoioId), status: 'ATIVO', dia: new Date(horaInicio).toISOString() }
      : undefined,
    podeChecarOcupacao,
  )
  const ocupadas = ocupacaoData?.totalElements ?? 0
  const disponiveis = itemSelecionado ? itemSelecionado.quantidade - ocupadas : undefined

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    const horaInicioIso = new Date(horaInicio).toISOString()
    const horaFimIso = new Date(horaFim).toISOString()
    if (!mesmoDiaBrasilia(horaInicioIso, horaFimIso)) {
      setErro('Hora de início e hora de fim precisam ser no mesmo dia (horário de Brasília) — locação de Apoio de Festa não passa de um dia.')
      return
    }
    createMutation.mutate(
      buildPayload({
        itemApoioId: Number(itemApoioId),
        horaInicio: horaInicioIso,
        horaFim: horaFimIso,
        incluiMaoDeObra,
        colaboradorId: colaboradorId ? Number(colaboradorId) : undefined,
        createdBy: '',
      }),
      {
        onSuccess: onClose,
        onError: (err) => setErro(parseApiError(err).mensagem),
      },
    )
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {erro && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{erro}</p>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Item de Apoio <span className="text-red-500 ml-0.5">*</span>
          </label>
          <select
            value={itemApoioId}
            onChange={(e) => setItemApoioId(e.target.value)}
            required
            className={inputClass}
          >
            <option value="">Selecione...</option>
            {itensApoio.map((i) => (
              <option key={i.id} value={i.id}>{i.nome}</option>
            ))}
          </select>
        </div>

        {itemApoioId && (
          <div className="flex items-center gap-2">
            <input
              id="incluiMaoDeObra"
              type="checkbox"
              checked={incluiMaoDeObra}
              onChange={(e) => setIncluiMaoDeObra(e.target.checked)}
              disabled={!ofereceMaoDeObra}
              className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400 disabled:opacity-50"
            />
            <label htmlFor="incluiMaoDeObra" className={`text-sm font-medium ${ofereceMaoDeObra ? 'text-gray-700' : 'text-gray-400'}`}>
              Incluir atendente (mão de obra)
              {ofereceMaoDeObra
                ? ` — +${itemSelecionado!.valorHoraMaoDeObra!.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/h`
                : ' — este item não oferece esse serviço'}
            </label>
          </div>
        )}

        {itemApoioId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Colaborador</label>
            <select
              value={colaboradorId}
              onChange={(e) => setColaboradorId(e.target.value)}
              className={inputClass}
            >
              <option value="">Sem colaborador designado</option>
              {colaboradores.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Opcional, e independente do "Incluir atendente" acima — dá pra designar um colaborador mesmo sem mão de
              obra cobrada, ou incluir mão de obra sem designar ninguém ainda.
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hora Início <span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="datetime-local"
            value={horaInicio}
            onChange={(e) => setHoraInicio(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hora Fim <span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="datetime-local"
            value={horaFim}
            onChange={(e) => setHoraFim(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        {podeChecarOcupacao && itemSelecionado && disponiveis != null && (
          <p className={`text-xs font-medium rounded-lg px-3 py-2 ${disponiveis > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {disponiveis > 0
              ? `${disponiveis} de ${itemSelecionado.quantidade} unidade(s) disponível(is) nesse dia.`
              : `Nenhuma unidade disponível de "${itemSelecionado.nome}" nesse dia (${ocupadas} de ${itemSelecionado.quantidade} já ocupada(s)).`}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={createMutation.isPending}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-60"
          >
            Cancelar
          </button>
          <Button type="submit" isLoading={createMutation.isPending}>
            Adicionar
          </Button>
        </div>
      </form>
    </Modal>
  )
}

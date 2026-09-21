import { useState, useMemo } from 'react'
import { Link } from 'react-router'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Boxes,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Clock,
  HardHat,
  CalendarDays,
} from 'lucide-react'
import { useItensApoio } from '../hooks/useItensApoio'
import { useDisponibilidadeApoio } from '../hooks/useDisponibilidadeApoio'
import { useApoiosFesta } from '../hooks/useApoiosFesta'
import { DisponibilidadeDia } from '../types/itemApoio'
import Modal from '../../../components/ui/Modal'
import { formatCurrency } from '../../../lib/format'

function formatHora(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

const DIAS_DA_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

export default function DisponibilidadeApoioPage() {
  // Mês selecionado no formato YYYY-MM (inicia no mês atual)
  const [mesAtual, setMesAtual] = useState(() => {
    const hoje = new Date()
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`
  })

  // Itens de apoio disponíveis
  const { data: itensData, isLoading: isLoadingItens } = useItensApoio(0, 100)
  const itensApoio = itensData?.content ?? []

  // Item selecionado (padrão: primeiro item cadastrado)
  const [selectedItemId, setSelectedItemId] = useState<string>('')
  const activeItemId = selectedItemId ? Number(selectedItemId) : (itensApoio[0]?.id ?? undefined)
  const selectedItem = itensApoio.find((i) => i.id === activeItemId)

  // Consulta de disponibilidade
  const { data: diasDisponibilidade = [], isLoading: isLoadingDisp } = useDisponibilidadeApoio(
    activeItemId,
    selectedItem,
    mesAtual,
  )

  // Estado para o Modal de Detalhe do Dia
  const [diaSelecionado, setDiaSelecionado] = useState<DisponibilidadeDia | null>(null)

  // Navegação de mês
  function mudarMes(delta: number) {
    const [anoStr, mesStr] = mesAtual.split('-')
    const data = new Date(Number(anoStr), Number(mesStr) - 1 + delta, 1)
    setMesAtual(`${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`)
  }

  function irParaMesAtual() {
    const hoje = new Date()
    setMesAtual(`${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`)
  }

  // Nome do mês em português (ex: "Setembro de 2026")
  const nomeMesExtenso = useMemo(() => {
    const [anoStr, mesStr] = mesAtual.split('-')
    const data = new Date(Number(anoStr), Number(mesStr) - 1, 1)
    const formatador = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })
    const formatado = formatador.format(data)
    return formatado.charAt(0).toUpperCase() + formatado.slice(1)
  }, [mesAtual])

  // Identificação do dia de hoje (YYYY-MM-DD)
  const hojeStr = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }, [])

  // Estatísticas do mês
  const stats = useMemo(() => {
    let diasLivres = 0
    let diasParciais = 0
    let diasEsgotados = 0
    let totalLocacoes = 0

    for (const d of diasDisponibilidade) {
      totalLocacoes += d.quantidadeOcupada
      if (d.quantidadeLivre === 0) {
        diasEsgotados++
      } else if (d.quantidadeOcupada > 0) {
        diasParciais++
      } else {
        diasLivres++
      }
    }

    return { diasLivres, diasParciais, diasEsgotados, totalLocacoes }
  }, [diasDisponibilidade])

  // Montagem da grade do calendário (células vazias antes do dia 1)
  const celulasCalendario = useMemo(() => {
    const [anoStr, mesStr] = mesAtual.split('-')
    const primeiroDia = new Date(Number(anoStr), Number(mesStr) - 1, 1)
    // getDay() devolve 0 para Domingo, 1 para Segunda...
    // Queremos Segunda como coluna 0
    const offsetInicio = (primeiroDia.getDay() + 6) % 7

    const mapaDias = new Map<string, DisponibilidadeDia>()
    for (const d of diasDisponibilidade) {
      mapaDias.set(d.dia, d)
    }

    const celulas: Array<{ tipo: 'vazio'; key: string } | { tipo: 'dia'; dia: DisponibilidadeDia; numDia: number; ehHoje: boolean }> = []

    for (let i = 0; i < offsetInicio; i++) {
      celulas.push({ tipo: 'vazio', key: `vazio-${i}` })
    }

    for (const d of diasDisponibilidade) {
      const numDia = Number(d.dia.split('-')[2])
      celulas.push({
        tipo: 'dia',
        dia: d,
        numDia,
        ehHoje: d.dia === hojeStr,
      })
    }

    return celulas
  }, [mesAtual, diasDisponibilidade, hojeStr])

  // Consulta das locações do dia selecionado para o Modal
  const podeBuscarLocacoesDia = !!diaSelecionado && !!activeItemId
  const { data: reservasDiaData, isLoading: isLoadingReservas } = useApoiosFesta(
    0,
    50,
    podeBuscarLocacoesDia
      ? {
          itemApoioId: activeItemId,
          dia: new Date(`${diaSelecionado!.dia}T12:00:00Z`).toISOString(),
          status: 'ATIVO',
        }
      : undefined,
    podeBuscarLocacoesDia,
  )
  const reservasDia = reservasDiaData?.content ?? []

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
              <CalendarDays size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Calendário de Disponibilidade</h1>
              <p className="text-sm text-gray-500">
                Consulte a disponibilidade de itens de apoio por dia antes de fechar pedidos e orçamentos.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/vendas/apoios-festa"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-2xs"
          >
            <Clock size={16} className="text-gray-500" />
            Lista de Apoios
          </Link>
          <Link
            to="/vendas/itens-apoio"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors shadow-2xs"
          >
            <Boxes size={16} />
            Catálogo de Itens
          </Link>
        </div>
      </div>

      {/* Barra de Filtros e Navegação */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Seletor de Item de Apoio */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="w-full sm:w-72">
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                Item de Apoio
              </label>
              <select
                value={activeItemId ?? ''}
                onChange={(e) => setSelectedItemId(e.target.value)}
                disabled={isLoadingItens || itensApoio.length === 0}
                className="w-full px-3 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent cursor-pointer shadow-2xs disabled:bg-gray-100"
              >
                {itensApoio.length === 0 && <option value="">Nenhum item cadastrado</option>}
                {itensApoio.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nome} ({item.quantidade} un. na frota)
                  </option>
                ))}
              </select>
            </div>

            {selectedItem && (
              <div className="self-end sm:self-auto pt-1 sm:pt-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                  <Boxes size={14} className="text-gray-500" />
                  Frota Total: <strong className="text-gray-900">{selectedItem.quantidade} un.</strong>
                  <span className="text-gray-400 mx-1">·</span>
                  Tarifa: <strong className="text-gray-900">{formatCurrency(selectedItem.valorHora)}/h</strong>
                </span>
              </div>
            )}
          </div>

          {/* Navegador de Mês */}
          <div className="flex items-center justify-between sm:justify-end gap-2 border-t lg:border-t-0 pt-3 lg:pt-0">
            <button
              type="button"
              onClick={() => mudarMes(-1)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors cursor-pointer"
              title="Mês anterior"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="text-sm sm:text-base font-bold text-gray-800 min-w-44 text-center">
              {nomeMesExtenso}
            </span>

            <button
              type="button"
              onClick={() => mudarMes(1)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors cursor-pointer"
              title="Próximo mês"
            >
              <ChevronRight size={18} />
            </button>

            <button
              type="button"
              onClick={irParaMesAtual}
              className="ml-2 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors cursor-pointer"
            >
              Hoje
            </button>
          </div>
        </div>

        {/* Cards de Resumo Mensal */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
            <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 size={14} /> Totalmente Livres
            </div>
            <p className="text-xl font-bold text-emerald-900 mt-1">{stats.diasLivres} dias</p>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-1.5 text-amber-800 text-xs font-semibold">
              <AlertTriangle size={14} /> Ocupação Parcial
            </div>
            <p className="text-xl font-bold text-amber-900 mt-1">{stats.diasParciais} dias</p>
          </div>

          <div className="p-3 bg-red-50/70 border border-red-200 rounded-lg">
            <div className="flex items-center gap-1.5 text-red-800 text-xs font-semibold">
              <XCircle size={14} /> Esgotados
            </div>
            <p className="text-xl font-bold text-red-900 mt-1">{stats.diasEsgotados} dias</p>
          </div>

          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-1.5 text-gray-700 text-xs font-semibold">
              <Calendar size={14} /> Locações no Mês
            </div>
            <p className="text-xl font-bold text-gray-900 mt-1">{stats.totalLocacoes} un. alocadas</p>
          </div>
        </div>
      </div>

      {/* Grade do Calendário */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        {isLoadingDisp ? (
          <div className="h-96 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Carregando disponibilidade...</span>
            </div>
          </div>
        ) : !selectedItem ? (
          <div className="py-16 text-center text-gray-400">
            <Boxes size={40} className="mx-auto mb-2 text-gray-300" />
            <p className="text-base font-medium text-gray-600">Nenhum item de apoio selecionado</p>
            <p className="text-sm text-gray-400 mt-1">Cadastre ou selecione um item no seletor acima.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Cabeçalho dos dias da semana */}
            <div className="grid grid-cols-7 gap-2 text-center pb-2 border-b border-gray-100">
              {DIAS_DA_SEMANA.map((dia, idx) => (
                <div
                  key={dia}
                  className={`text-xs font-bold uppercase tracking-wider ${
                    idx >= 5 ? 'text-amber-700' : 'text-gray-500'
                  }`}
                >
                  {dia}
                </div>
              ))}
            </div>

            {/* Células dos dias */}
            <div className="grid grid-cols-7 gap-2 pt-1">
              {celulasCalendario.map((celula, idx) => {
                if (celula.tipo === 'vazio') {
                  return (
                    <div
                      key={celula.key || idx}
                      className="min-h-24 sm:min-h-28 rounded-lg bg-gray-50/50 border border-dashed border-gray-200/60"
                    />
                  )
                }

                const { dia, numDia, ehHoje } = celula
                const esgotado = dia.quantidadeLivre === 0
                const parcial = dia.quantidadeOcupada > 0 && dia.quantidadeLivre > 0

                // Classes de estilo por status
                let containerClass = 'border-emerald-200 bg-emerald-50/30 hover:border-emerald-400 hover:bg-emerald-50/60'
                let badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200'
                let labelStatus = `${dia.quantidadeLivre} livre${dia.quantidadeLivre > 1 ? 's' : ''}`

                if (esgotado) {
                  containerClass = 'border-red-300 bg-red-50/50 hover:border-red-400 hover:bg-red-50/80'
                  badgeClass = 'bg-red-100 text-red-800 border-red-200'
                  labelStatus = 'Esgotado'
                } else if (parcial) {
                  containerClass = 'border-amber-300 bg-amber-50/40 hover:border-amber-400 hover:bg-amber-50/70'
                  badgeClass = 'bg-amber-100 text-amber-800 border-amber-200'
                  labelStatus = `${dia.quantidadeLivre} de ${dia.quantidadeTotal} livre${dia.quantidadeLivre > 1 ? 's' : ''}`
                }

                return (
                  <button
                    key={dia.dia}
                    type="button"
                    onClick={() => setDiaSelecionado(dia)}
                    className={`min-h-24 sm:min-h-28 p-2 sm:p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all duration-150 cursor-pointer shadow-2xs group relative ${containerClass} ${
                      ehHoje ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between w-full">
                      <span
                        className={`text-sm sm:text-base font-bold ${
                          ehHoje
                            ? 'w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs'
                            : 'text-gray-800'
                        }`}
                      >
                        {numDia}
                      </span>

                      {ehHoje && (
                        <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          Hoje
                        </span>
                      )}
                    </div>

                    <div className="mt-2">
                      <span
                        className={`inline-block w-full text-center text-[11px] sm:text-xs font-semibold px-1.5 py-0.5 rounded-md border ${badgeClass}`}
                      >
                        {labelStatus}
                      </span>

                      {dia.quantidadeOcupada > 0 && (
                        <p className="text-[10px] text-gray-500 text-center mt-1 hidden sm:block">
                          {dia.quantidadeOcupada} ocupada{dia.quantidadeOcupada > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalhes do Dia Clicado */}
      <Modal
        open={!!diaSelecionado}
        onClose={() => setDiaSelecionado(null)}
        title={
          diaSelecionado
            ? `Disponibilidade em ${new Date(`${diaSelecionado.dia}T12:00:00`).toLocaleDateString('pt-BR', {
                dateStyle: 'full',
              })}`
            : 'Detalhes do Dia'
        }
      >
        {diaSelecionado && selectedItem && (
          <div className="space-y-4">
            {/* Resumo do Item no Dia */}
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900">{selectedItem.nome}</p>
                <p className="text-xs text-gray-500">
                  Capacidade total cadastrada: {diaSelecionado.quantidadeTotal} unidade(s)
                </p>
              </div>

              <div className="text-right">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                    diaSelecionado.quantidadeLivre === 0
                      ? 'bg-red-100 text-red-800'
                      : diaSelecionado.quantidadeOcupada > 0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {diaSelecionado.quantidadeLivre === 0
                    ? '🔴 Esgotado'
                    : `🟢 ${diaSelecionado.quantidadeLivre} unidade(s) livre(s)`}
                </span>
              </div>
            </div>

            {/* Listagem de Reservas do Dia */}
            <div>
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Locações Ativas Agendadas ({reservasDia.length})
              </h4>

              {isLoadingReservas ? (
                <div className="py-6 text-center text-sm text-gray-400">Carregando detalhes das reservas...</div>
              ) : reservasDia.length === 0 ? (
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg text-emerald-800 text-sm flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Nenhuma locação para este dia!</p>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Todas as {diaSelecionado.quantidadeTotal} unidade(s) de "{selectedItem.nome}" estão totalmente
                      livres para novos pedidos.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto">
                  {reservasDia.map((reserva) => (
                    <div
                      key={reserva.id}
                      className="p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          Pedido #{reserva.pedidoId}
                        </span>
                        <span className="text-xs font-bold text-gray-900">{formatCurrency(reserva.valorTotal)}</span>
                      </div>

                      <div className="mt-2 space-y-1 text-xs text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} className="text-gray-400" />
                          <span>
                            {formatHora(reserva.horaInicio)} às {formatHora(reserva.horaFim)}
                          </span>
                        </div>

                        {reserva.incluiMaoDeObra && (
                          <div className="flex items-center gap-1.5">
                            <HardHat size={13} className="text-blue-500" />
                            <span className="text-blue-800 font-medium">
                              Com atendente {reserva.colaboradorNome ? `(${reserva.colaboradorNome})` : ''}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-2 pt-2 border-t border-gray-100 flex justify-end">
                        <Link
                          to={`/vendas/pedidos/${reserva.pedidoId}/editar`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <span>Abrir pedido</span>
                          <ExternalLink size={12} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setDiaSelecionado(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}


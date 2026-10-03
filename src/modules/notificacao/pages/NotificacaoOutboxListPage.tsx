import { useState } from 'react'
import PageHeader from '../../../components/ui/PageHeader'
import PageableTable from '../../../components/ui/PageableTable'
import Badge from '../../../components/ui/Badge'
import { formatDateTimeBR } from '../../../lib/format'
import { useNotificacaoOutbox } from '../hooks/useNotificacaoOutbox'
import { NotificacaoOutbox, NotificacaoOutboxStatus } from '../types/notificacaoOutbox'

const TABLE_HEADERS = ['Criada em', 'Título', 'Canal', 'Destinatário', 'Status', 'Tentativas', 'Último erro', 'Enviada em']

const STATUS_OPCOES: { value: NotificacaoOutboxStatus | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'FALHOU', label: 'Falhou' },
  { value: 'PENDENTE', label: 'Pendente' },
  { value: 'EM_ENVIO', label: 'Em envio' },
  { value: 'ENVIADO', label: 'Enviado' },
]

const EMPTY_MESSAGES: Record<NotificacaoOutboxStatus | '', string> = {
  FALHOU: 'Nenhuma notificação com falha',
  PENDENTE: 'Nenhuma notificação pendente',
  EM_ENVIO: 'Nenhuma notificação em envio',
  ENVIADO: 'Nenhuma notificação enviada',
  '': 'Nenhuma notificação registrada',
}

// F5 (reteste 2026-09-28): ENVIADO + SIMULADO não pode parecer entrega real -- selo âmbar com a
// explicação no tooltip. REAL não ganha selo (é o caso normal); modo desconhecido só aparece como
// "—" discreto quando o status já é ENVIADO, pra não sugerir entrega confirmada.
function ModoEnvioSelo({ modo, status }: { modo: NotificacaoOutbox['modoEnvio']; status: NotificacaoOutboxStatus }) {
  if (modo === 'SIMULADO') {
    return (
      <span
        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200 cursor-help"
        title="O canal está em modo de teste: nada foi entregue de verdade"
      >
        Simulado
      </span>
    )
  }
  if (modo == null && status === 'ENVIADO') {
    return <span className="text-xs text-gray-400" title="Modo de envio desconhecido">—</span>
  }
  return null
}

export default function NotificacaoOutboxListPage() {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  // Padrão Todos (''): decisão do dono em 2026-09-29 -- a tela abre com o histórico completo.
  // Antes abria em FALHOU e, como quase nada falha, parecia vazia até mexer no filtro.
  const [status, setStatus] = useState<NotificacaoOutboxStatus | ''>('')
  const { data, isLoading } = useNotificacaoOutbox(page, pageSize, status || undefined)

  const notificacoes = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <div>
      <PageHeader title="Notificações enviadas" subtitle="Acompanhe os avisos que o sistema mandou (ou tentou mandar)" />

      <div className="mb-4 flex items-center gap-2">
        <label htmlFor="filtro-status" className="text-sm font-medium text-gray-700">Status</label>
        <select
          id="filtro-status"
          value={status}
          onChange={(e) => { setStatus(e.target.value as NotificacaoOutboxStatus | ''); setPage(0) }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          {STATUS_OPCOES.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <PageableTable
        headers={TABLE_HEADERS}
        isLoading={isLoading}
        isEmpty={!isLoading && notificacoes.length === 0}
        emptyMessage={EMPTY_MESSAGES[status]}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalElements={data?.totalElements}
        pageSize={pageSize}
        onPageSizeChange={(size) => { setPageSize(size); setPage(0) }}
      >
        {notificacoes.map((n) => (
          <tr key={n.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDateTimeBR(n.createdOn)}</td>
            <td className="px-4 py-3 font-medium text-gray-900 max-w-[16rem] truncate" title={n.texto}>{n.titulo}</td>
            <td className="px-4 py-3 text-gray-600">{n.canal}</td>
            <td className="px-4 py-3 text-gray-600">{n.destinatario}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <Badge status={n.status} />
                <ModoEnvioSelo modo={n.modoEnvio} status={n.status} />
              </div>
            </td>
            <td className="px-4 py-3 text-gray-600 text-center">{n.tentativas}</td>
            <td className="px-4 py-3 text-gray-600 max-w-[18rem] truncate" title={n.ultimoErro ?? undefined}>
              {n.ultimoErro ?? '—'}
            </td>
            <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDateTimeBR(n.enviadoEm)}</td>
          </tr>
        ))}
      </PageableTable>
    </div>
  )
}

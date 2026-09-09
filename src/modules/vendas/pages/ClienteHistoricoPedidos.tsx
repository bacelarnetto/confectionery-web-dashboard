import { useState } from 'react'
import { useNavigate } from 'react-router'
import PageableTable from '../../../components/ui/PageableTable'
import { useClientePedidos, useClienteTotalGasto } from '../hooks/useClientes'

const TABLE_HEADERS = ['ID', 'Status', 'Entrega', 'Valor Total', 'Criado em']

const STATUS_COLORS: Record<string, string> = {
  RASCUNHO: 'bg-gray-100 text-gray-600',
  CONFIRMADO: 'bg-blue-100 text-blue-800',
  EM_PRODUCAO: 'bg-purple-100 text-purple-800',
  PRONTO: 'bg-green-100 text-green-800',
  ENTREGUE: 'bg-gray-100 text-gray-700',
  CANCELADO: 'bg-red-100 text-red-800',
}

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(iso?: string) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso))
}

export default function ClienteHistoricoPedidos({ clienteId }: { clienteId: number }) {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const { data, isLoading } = useClientePedidos(clienteId, page, 10)
  const { data: totalGasto } = useClienteTotalGasto(clienteId)

  const pedidos = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Histórico de Pedidos</h3>
          <p className="text-xs text-gray-500 mt-1">Pedidos anteriores deste cliente, do mais recente pro mais antigo.</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Total gasto</p>
          <p className="text-lg font-semibold text-gray-900">
            {totalGasto ? formatCurrency(totalGasto.totalGasto) : '—'}
          </p>
        </div>
      </div>

      <PageableTable
        headers={TABLE_HEADERS}
        isLoading={isLoading}
        isEmpty={!isLoading && pedidos.length === 0}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      >
        {pedidos.map((p) => (
          <tr
            key={p.id}
            className="hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => navigate(`/vendas/pedidos/${p.id}/editar`)}
          >
            <td className="px-4 py-3 text-gray-500 font-mono text-xs">#{p.id}</td>
            <td className="px-4 py-3">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[p.status] ?? 'bg-gray-100 text-gray-700'}`}>
                {p.status.replace('_', ' ')}
              </span>
            </td>
            <td className="px-4 py-3 text-gray-600">{formatDate(p.dataEntrega)}</td>
            <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(p.valorTotal)}</td>
            <td className="px-4 py-3 text-gray-600">{formatDate(p.createdOn)}</td>
          </tr>
        ))}
      </PageableTable>
    </div>
  )
}

import { useState } from 'react'
import { FileText, FileSpreadsheet, TrendingUp, BarChart3, Award, ShoppingBag } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import PageHeader from '../../../components/ui/PageHeader'
import Table from '../../../components/ui/Table'
import Button from '../../../components/ui/Button'
import {
  useRelatorioFaturamentoMensal,
  useBaixarFaturamentoMensalCsv,
  useBaixarFaturamentoMensalPdf,
} from '../hooks/useRelatorios'

const TABLE_HEADERS = ['Mês', 'Pedidos', 'Faturamento', 'Ticket Médio']

const formatCurrency = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function formatMes(mes: string) {
  const [ano, m] = mes.split('-')
  const nomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const idx = Number(m) - 1
  return `${nomes[idx] ?? m}/${ano.slice(2)}`
}

export default function FaturamentoMensalPage() {
  const [meses, setMeses] = useState(6)
  const { data, isLoading } = useRelatorioFaturamentoMensal(meses)
  const csvMutation = useBaixarFaturamentoMensalCsv()
  const pdfMutation = useBaixarFaturamentoMensalPdf()

  const relatorio = data ?? []
  const chartData = relatorio.map((r) => ({ ...r, mesLabel: formatMes(r.mes) }))

  const totalFaturado = relatorio.reduce((acc, r) => acc + r.faturamento, 0)
  const mediaFaturamento = relatorio.length > 0 ? totalFaturado / relatorio.length : 0
  const totalPedidos = relatorio.reduce((acc, r) => acc + r.quantidadePedidos, 0)
  const ticketMedioGeral = totalPedidos > 0 ? totalFaturado / totalPedidos : 0

  const melhorMesObj = relatorio.reduce<typeof relatorio[0] | null>((best, cur) => {
    if (!best || cur.faturamento > best.faturamento) return cur
    return best
  }, null)

  return (
    <div>
      <PageHeader title="Faturamento Mensal" subtitle="Receita, quantidade de pedidos e ticket médio por mês">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => csvMutation.mutate(meses)}
            isLoading={csvMutation.isPending}
          >
            <FileSpreadsheet size={16} />
            CSV
          </Button>
          <Button
            variant="secondary"
            onClick={() => pdfMutation.mutate(meses)}
            isLoading={pdfMutation.isPending}
          >
            <FileText size={16} />
            PDF
          </Button>
        </div>
      </PageHeader>

      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Período</label>
        <select
          value={meses}
          onChange={(e) => setMeses(Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
        >
          <option value={3}>Últimos 3 meses</option>
          <option value={6}>Últimos 6 meses</option>
          <option value={12}>Últimos 12 meses</option>
        </select>
      </div>

      {/* Cards de Resumo Executivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-3.5">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <TrendingUp size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-500">Total Faturado</p>
            <p className="text-lg font-bold text-gray-900 truncate">{formatCurrency(totalFaturado)}</p>
            <p className="text-[11px] text-gray-400">Últimos {meses} meses</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-3.5">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <BarChart3 size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-500">Média Mensal</p>
            <p className="text-lg font-bold text-gray-900 truncate">{formatCurrency(mediaFaturamento)}</p>
            <p className="text-[11px] text-gray-400">Receita média / mês</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-3.5">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
            <Award size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-500">Melhor Mês</p>
            <p className="text-lg font-bold text-gray-900 truncate">
              {melhorMesObj ? formatMes(melhorMesObj.mes) : '—'}
            </p>
            <p className="text-[11px] text-amber-700 font-medium truncate">
              {melhorMesObj ? formatCurrency(melhorMesObj.faturamento) : '—'}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-3.5">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl shrink-0">
            <ShoppingBag size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-500">Volume de Pedidos</p>
            <p className="text-lg font-bold text-gray-900 truncate">{totalPedidos} pedidos</p>
            <p className="text-[11px] text-gray-400 truncate">Ticket médio: {formatCurrency(ticketMedioGeral)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-6">
        {isLoading ? (
          <div className="h-72 bg-gray-100 rounded-lg animate-pulse" />
        ) : chartData.length === 0 ? (
          <div className="h-72 flex items-center justify-center text-sm text-gray-400">Sem dados no período</div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="5 5" vertical={false} />
                <XAxis dataKey="mesLabel" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `R$ ${v}`}
                />
                <RechartsTooltip formatter={(v: any) => [formatCurrency(v), 'Faturamento']} />
                <Bar dataKey="faturamento" name="Faturamento" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <Table headers={TABLE_HEADERS} isEmpty={!isLoading && relatorio.length === 0}>
        {relatorio.map((r) => (
          <tr key={r.mes} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3 font-medium text-gray-900">{formatMes(r.mes)}</td>
            <td className="px-4 py-3 text-gray-600">{r.quantidadePedidos}</td>
            <td className="px-4 py-3 text-gray-900 font-medium">{formatCurrency(r.faturamento)}</td>
            <td className="px-4 py-3 text-gray-600">{formatCurrency(r.ticketMedio)}</td>
          </tr>
        ))}
      </Table>
    </div>
  )
}

import { useState } from 'react'
import { FileText, FileSpreadsheet, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import Table from '../../../components/ui/Table'
import Button from '../../../components/ui/Button'
import { useDebounce } from '../../../hooks/useDebounce'
import {
  useRelatorioMovimentacaoEstoque,
  useBaixarMovimentacaoEstoqueCsv,
  useBaixarMovimentacaoEstoquePdf,
} from '../hooks/useRelatorios'
import { TipoMovimentacao } from '../types/relatorio'

const TABLE_HEADERS = ['Data', 'Tipo', 'Insumo', 'Quantidade']

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

function toInstant(dateStr: string, endOfDay: boolean): string | undefined {
  if (!dateStr) return undefined
  return new Date(`${dateStr}T${endOfDay ? '23:59:59' : '00:00:00'}`).toISOString()
}

export default function MovimentacaoEstoquePage() {
  const [dataInicial, setDataInicial] = useState('')
  const [dataFinal, setDataFinal] = useState('')
  const [tipo, setTipo] = useState<TipoMovimentacao | ''>('')

  const debouncedDatas = useDebounce({ dataInicial, dataFinal })

  const filtros = {
    dataInicial: toInstant(debouncedDatas.dataInicial, false),
    dataFinal: toInstant(debouncedDatas.dataFinal, true),
    tipo: tipo || undefined,
  }

  const { data, isLoading } = useRelatorioMovimentacaoEstoque(filtros)
  const csvMutation = useBaixarMovimentacaoEstoqueCsv()
  const pdfMutation = useBaixarMovimentacaoEstoquePdf()

  const relatorio = data ?? []

  return (
    <div>
      <PageHeader title="Movimentação de Estoque" subtitle="Entradas e saídas de insumos por período">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => csvMutation.mutate(filtros)}
            isLoading={csvMutation.isPending}
          >
            <FileSpreadsheet size={16} />
            CSV
          </Button>
          <Button
            variant="secondary"
            onClick={() => pdfMutation.mutate(filtros)}
            isLoading={pdfMutation.isPending}
          >
            <FileText size={16} />
            PDF
          </Button>
        </div>
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">De</label>
          <input
            type="date"
            value={dataInicial}
            onChange={(e) => setDataInicial(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Até</label>
          <input
            type="date"
            value={dataFinal}
            onChange={(e) => setDataFinal(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Tipo</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoMovimentacao | '')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          >
            <option value="">Todos</option>
            <option value="ENTRADA">Entrada</option>
            <option value="SAIDA">Saída</option>
          </select>
        </div>
      </div>

      <Table headers={TABLE_HEADERS} isEmpty={!isLoading && relatorio.length === 0}>
        {relatorio.map((r, i) => (
          <tr key={i} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3 text-gray-600">{formatDate(r.data)}</td>
            <td className="px-4 py-3">
              {r.tipo === 'ENTRADA' ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                  <ArrowDownToLine size={12} /> Entrada
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-700">
                  <ArrowUpFromLine size={12} /> Saída
                </span>
              )}
            </td>
            <td className="px-4 py-3 font-medium text-gray-900">{r.insumoNome}</td>
            <td className="px-4 py-3 text-gray-600">{r.quantidade}</td>
          </tr>
        ))}
      </Table>
    </div>
  )
}

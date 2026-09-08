import { useState } from 'react'
import { FileText, FileSpreadsheet } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import Table from '../../../components/ui/Table'
import Button from '../../../components/ui/Button'
import { useCategoriasProduto } from '../../estoqueProdutos/hooks/useCategoriasProduto'
import {
  useRelatorioCustoProducao,
  useBaixarCustoProducaoCsv,
  useBaixarCustoProducaoPdf,
} from '../hooks/useRelatorios'

const TABLE_HEADERS = ['Produto', 'Custo Ingrediente', 'Custo Fixo', 'Margem', 'Preço de Venda', 'Lucro Bruto']

const formatCurrency = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function CustoProducaoPage() {
  const [categoriaProdutoId, setCategoriaProdutoId] = useState('')
  const { data: categoriasData } = useCategoriasProduto(0, 100)
  const categorias = categoriasData?.content ?? []

  const filtro = categoriaProdutoId ? Number(categoriaProdutoId) : undefined
  const { data, isLoading } = useRelatorioCustoProducao(filtro)
  const csvMutation = useBaixarCustoProducaoCsv()
  const pdfMutation = useBaixarCustoProducaoPdf()

  const relatorio = data ?? []

  return (
    <div>
      <PageHeader title="Custo de Produção" subtitle="Custo, margem e lucro bruto por produto, com base na precificação vigente">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => csvMutation.mutate(filtro)}
            isLoading={csvMutation.isPending}
          >
            <FileSpreadsheet size={16} />
            CSV
          </Button>
          <Button
            variant="secondary"
            onClick={() => pdfMutation.mutate(filtro)}
            isLoading={pdfMutation.isPending}
          >
            <FileText size={16} />
            PDF
          </Button>
        </div>
      </PageHeader>

      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Categoria</label>
        <select
          value={categoriaProdutoId}
          onChange={(e) => setCategoriaProdutoId(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white min-w-[200px]"
        >
          <option value="">Todas as categorias</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
      </div>

      <Table headers={TABLE_HEADERS} isEmpty={!isLoading && relatorio.length === 0}>
        {relatorio.map((r) => (
          <tr key={r.produtoId} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3 font-medium text-gray-900">{r.produtoNome}</td>
            <td className="px-4 py-3 text-gray-600">{formatCurrency(r.valorCustoIngrediente)}</td>
            <td className="px-4 py-3 text-gray-600">{formatCurrency(r.valorCustoFixo)}</td>
            <td className="px-4 py-3 text-gray-600">{r.margemLucro}%</td>
            <td className="px-4 py-3 text-gray-900 font-medium">{formatCurrency(r.valorVenda)}</td>
            <td className="px-4 py-3 text-emerald-600 font-medium">{formatCurrency(r.lucroBruto)}</td>
          </tr>
        ))}
      </Table>
    </div>
  )
}

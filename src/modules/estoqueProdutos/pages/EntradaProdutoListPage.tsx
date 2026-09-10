import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import PageableTable from '../../../components/ui/PageableTable'
import { useEntradasProduto } from '../hooks/useEntradasProduto'

const TABLE_HEADERS = ['ID', 'Fornecedor ID', 'Itens', 'Valor Total', 'Recebido em', 'Criado por', 'Criado em']

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateStr))
}

export default function EntradaProdutoListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)

  const { data, isLoading } = useEntradasProduto(page, 20)

  const entradas = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <div>
      <PageHeader
        title="Entradas de Produto"
        subtitle="Produto que entra no estoque sem passar pela Fabricação — terceirizado ou comprado pronto"
      >
        <button
          onClick={() => navigate('/estoque-produtos/entradas/nova')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
        >
          <Plus size={16} />
          Nova Entrada
        </button>
      </PageHeader>

      <PageableTable
        headers={TABLE_HEADERS}
        isLoading={isLoading}
        isEmpty={!isLoading && entradas.length === 0}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      >
        {entradas.map((e) => {
          const valorTotal = e.itens.reduce((acc, it) => acc + (it.valorCustoTotal ?? it.valorCustoUnitario * it.quantidade), 0)
          return (
            <tr key={e.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-gray-500 text-sm">{e.id}</td>
              <td className="px-4 py-3 text-gray-600">{e.fornecedorId ?? '—'}</td>
              <td className="px-4 py-3 text-gray-600">{e.itens.length} {e.itens.length === 1 ? 'item' : 'itens'}</td>
              <td className="px-4 py-3 font-medium text-gray-900">R$ {valorTotal.toFixed(2)}</td>
              <td className="px-4 py-3 text-gray-600">{formatDate(e.dataRecebimento)}</td>
              <td className="px-4 py-3 text-gray-600">{e.createdBy}</td>
              <td className="px-4 py-3 text-gray-600">{formatDate(e.createdOn)}</td>
            </tr>
          )
        })}
      </PageableTable>
    </div>
  )
}

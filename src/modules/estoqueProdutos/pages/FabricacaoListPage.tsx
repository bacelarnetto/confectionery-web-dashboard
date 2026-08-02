import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import PageableTable from '../../../components/ui/PageableTable'
import { useFabricacoes } from '../hooks/useFabricacoes'

const TABLE_HEADERS = ['ID', 'Receita ID', 'Quantidade', 'Observação', 'Criado por', 'Criado em']

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

export default function FabricacaoListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)

  const { data, isLoading } = useFabricacoes(page, 20)

  const fabricacoes = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <div>
      <PageHeader title="Fabricações" subtitle="Registro de fabricações de produtos">
        <button
          onClick={() => navigate('/estoque-produtos/fabricacoes/nova')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
        >
          <Plus size={16} />
          Nova Fabricação
        </button>
      </PageHeader>

      <PageableTable
        headers={TABLE_HEADERS}
        isLoading={isLoading}
        isEmpty={!isLoading && fabricacoes.length === 0}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      >
        {fabricacoes.map((f) => (
          <tr key={f.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3 text-gray-500 text-sm">{f.id}</td>
            <td className="px-4 py-3 text-gray-600">{f.receitaId}</td>
            <td className="px-4 py-3 font-medium text-gray-900">{f.quantidade}</td>
            <td className="px-4 py-3 text-gray-600">{f.observacao ?? '—'}</td>
            <td className="px-4 py-3 text-gray-600">{f.createdBy}</td>
            <td className="px-4 py-3 text-gray-600">{formatDate(f.createdOn)}</td>
          </tr>
        ))}
      </PageableTable>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Pencil, Trash2, Repeat, Search, X } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import PageableTable from '../../../components/ui/PageableTable'
import DeleteConfirmModal from '../../../components/ui/DeleteConfirmModal'
import AlertModal from '../../../components/ui/AlertModal'
import { useGastos, useDeleteGasto, useRepetirGasto, useTiposGasto } from '../hooks/useFinanceiro'
import { formatCurrency } from '../../../lib/format'

const TABLE_HEADERS = ['ID', 'Tipo', 'Descrição', 'Valor', 'Data Pagamento', 'Recorrente', 'Documento', 'Ações']

function mesAtual(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function formatData(dateStr?: string) {
  if (!dateStr) return '—'
  try {
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
      new Date(dateStr),
    )
  } catch {
    return dateStr
  }
}

export default function GastoListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [mes, setMes] = useState(mesAtual())
  const [tipoGastoId, setTipoGastoId] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [repetirTarget, setRepetirTarget] = useState<{ id: number; descricao: string } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; descricao: string } | null>(null)

  const { data: tiposData } = useTiposGasto(0, 1000)
  const tipos = tiposData?.content ?? []

  const hasFilters = !!mes || !!tipoGastoId
  const filterParams =
    hasFilters
      ? {
          ...(mes ? { mes } : {}),
          ...(tipoGastoId ? { tipoGastoId: Number(tipoGastoId) } : {}),
        }
      : undefined

  const { data, isLoading } = useGastos(page, 20, filterParams)
  const deleteMutation = useDeleteGasto()
  const repetirMutation = useRepetirGasto()

  const gastos = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  function handleFilterChange(key: 'mes' | 'tipoGastoId', value: string) {
    if (key === 'mes') setMes(value)
    else setTipoGastoId(value)
    setPage(0)
  }

  function clearFilters() {
    setMes('')
    setTipoGastoId('')
    setPage(0)
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, {
      onSettled: () => setDeleteTarget(null),
    })
  }

  function handleRepetirConfirm() {
    if (!repetirTarget) return
    repetirMutation.mutate(repetirTarget.id, {
      onSettled: () => setRepetirTarget(null),
    })
  }

  return (
    <div>
      <PageHeader title="Gastos" subtitle="Controle os gastos do mês (regime caixa)">
        <button
          onClick={() => navigate('/financeiro/gastos/novo')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
        >
          <Plus size={16} />
          Novo Gasto
        </button>
      </PageHeader>

      <div className="mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
            showFilters || hasFilters
              ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Search size={15} />
          Filtros
          {hasFilters && (
            <span className="px-1.5 py-0.5 text-xs bg-amber-500 text-white rounded-full leading-none">
              {(mes ? 1 : 0) + (tipoGastoId ? 1 : 0)}
            </span>
          )}
        </button>

        {showFilters && (
          <div className="mt-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mês (pagamento)</label>
                <input
                  type="month"
                  value={mes}
                  onChange={(e) => handleFilterChange('mes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de gasto</label>
                <select
                  value={tipoGastoId}
                  onChange={(e) => handleFilterChange('tipoGastoId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  {tipos.map((t) => (
                    <option key={t.id} value={t.id}>{t.nome}</option>
                  ))}
                </select>
              </div>
            </div>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
              >
                <X size={14} />
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>

      <PageableTable
        headers={TABLE_HEADERS}
        isLoading={isLoading}
        isEmpty={!isLoading && gastos.length === 0}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      >
        {gastos.map((g) => (
          <tr key={g.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3 text-gray-500 text-sm">{g.id}</td>
            <td className="px-4 py-3 font-medium text-gray-900">{g.tipoGastoNome ?? `Tipo #${g.tipoGastoId}`}</td>
            <td className="px-4 py-3 text-gray-600">{g.descricao ?? '—'}</td>
            <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(g.valor)}</td>
            <td className="px-4 py-3 text-gray-600 text-sm">{formatData(g.dataPagamento)}</td>
            <td className="px-4 py-3">
              {g.recorrente ? (
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Sim</span>
              ) : (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Não</span>
              )}
            </td>
            <td className="px-4 py-3 text-gray-600">{g.documento ?? '—'}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRepetirTarget({ id: g.id, descricao: g.descricao ?? `Gasto #${g.id}` })}
                  className="p-1.5 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  title="Repetir próximo mês"
                >
                  <Repeat size={15} />
                </button>
                <button
                  onClick={() => navigate(`/financeiro/gastos/${g.id}/editar`)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Editar"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => setDeleteTarget({ id: g.id, descricao: g.descricao ?? `Gasto #${g.id}` })}
                  className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Remover"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </PageableTable>

      <AlertModal
        isOpen={!!repetirTarget}
        onClose={() => setRepetirTarget(null)}
        variant="info"
        title="Repetir gasto no próximo mês"
        message={
          repetirTarget
            ? `Uma cópia de "${repetirTarget.descricao}" será criada com a data de pagamento no mês seguinte, com o mesmo valor, tipo e descrição.`
            : ''
        }
        confirmLabel="Repetir gasto"
        isPending={repetirMutation.isPending}
        onConfirm={handleRepetirConfirm}
        cancelLabel="Cancelar"
      />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        itemName={deleteTarget?.descricao}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
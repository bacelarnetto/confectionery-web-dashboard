import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Pencil, Trash2, Repeat, Search, X, ChevronLeft, ChevronRight, Calendar, FileSpreadsheet } from 'lucide-react'
import toast from 'react-hot-toast'
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

function navegarMes(mesStr: string, offset: number): string {
  const [ano, m] = mesStr ? mesStr.split('-').map(Number) : [new Date().getFullYear(), new Date().getMonth() + 1]
  const d = new Date(ano, m - 1 + offset, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function formatMesExtenso(mesStr: string): string {
  if (!mesStr) return 'Todos os meses'
  const [ano, m] = mesStr.split('-').map(Number)
  const d = new Date(ano, m - 1, 1)
  const nome = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(d)
  return nome.charAt(0).toUpperCase() + nome.slice(1)
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
  const [pageSize, setPageSize] = useState(20)
  const [mes, setMes] = useState(mesAtual())
  const [tipoGastoId, setTipoGastoId] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [repetirTarget, setRepetirTarget] = useState<{ id: number; descricao: string } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; descricao: string } | null>(null)

  const { data: tiposData } = useTiposGasto(0, 100)
  const tipos = tiposData?.content ?? []

  const hasFilters = !!mes || !!tipoGastoId
  const filterParams =
    hasFilters
      ? {
          ...(mes ? { mes } : {}),
          ...(tipoGastoId ? { tipoGastoId: Number(tipoGastoId) } : {}),
        }
      : undefined

  const { data, isLoading } = useGastos(page, pageSize, filterParams)
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

  function exportarCsv() {
    if (gastos.length === 0) {
      toast.error('Nenhum gasto para exportar no período.')
      return
    }
    const headers = ['ID', 'Tipo', 'Descrição', 'Valor', 'Data Pagamento', 'Recorrente', 'Documento']
    const rows = gastos.map((g) => [
      g.id,
      `"${(g.tipoGastoNome ?? '').replace(/"/g, '""')}"`,
      `"${(g.descricao ?? '').replace(/"/g, '""')}"`,
      g.valor.toFixed(2),
      g.dataPagamento ? g.dataPagamento.split('T')[0] : '',
      g.recorrente ? 'Sim' : 'Não',
      `"${(g.documento ?? '').replace(/"/g, '""')}"`,
    ])

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `gastos_${mes || 'todos'}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success('Gastos exportados com sucesso!')
  }

  const totalGastoExibido = gastos.reduce((acc, g) => acc + g.valor, 0)

  return (
    <div>
      <PageHeader title="Gastos" subtitle="Controle os gastos do mês (regime caixa)">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportarCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
            title="Exportar dados para planilha Excel / CSV"
          >
            <FileSpreadsheet size={16} className="text-emerald-600" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={() => navigate('/financeiro/gastos/novo')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors cursor-pointer"
          >
            <Plus size={16} />
            Novo Gasto
          </button>
        </div>
      </PageHeader>

      {/* Barra de Navegação Rápida entre Meses */}
      <div className="mb-4 bg-white rounded-xl border border-gray-200 shadow-2xs p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <Calendar size={18} />
          </div>
          <div>
            <span className="text-xs font-medium text-gray-400 block">Mês em visualização</span>
            <span className="text-base font-semibold text-gray-900">
              {formatMesExtenso(mes)}
            </span>
          </div>
          {gastos.length > 0 && (
            <div className="hidden sm:block ml-4 pl-4 border-l border-gray-200">
              <span className="text-xs font-medium text-gray-400 block">Total do Mês</span>
              <span className="text-sm font-semibold text-emerald-700">
                {formatCurrency(totalGastoExibido)}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => { setMes(navegarMes(mes, -1)); setPage(0) }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            title="Mês anterior"
          >
            <ChevronLeft size={14} />
            Anterior
          </button>
          <button
            type="button"
            onClick={() => { setMes(mesAtual()); setPage(0) }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              mes === mesAtual()
                ? 'bg-amber-500 text-white font-semibold'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Mês Atual
          </button>
          <button
            type="button"
            onClick={() => { setMes(navegarMes(mes, 1)); setPage(0) }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            title="Próximo mês"
          >
            Próximo
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

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
        totalElements={data?.totalElements}
        pageSize={pageSize}
        onPageSizeChange={(size) => { setPageSize(size); setPage(0) }}
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
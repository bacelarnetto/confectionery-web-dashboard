import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Pencil, Trash2, FileText, CheckCircle, Search, X } from 'lucide-react'
import { useDebounce } from '../../../hooks/useDebounce'
import PageHeader from '../../../components/ui/PageHeader'
import PageableTable from '../../../components/ui/PageableTable'
import DeleteConfirmModal from '../../../components/ui/DeleteConfirmModal'
import AlertModal from '../../../components/ui/AlertModal'
import Badge from '../../../components/ui/Badge'
import {
  useCompras,
  useDeleteCompra,
  useDownloadPdfCompra,
  useGerarEntradaInsumoCompra,
  useUpdateCompraStatus,
} from '../hooks/useCompras'
import { EntradaInsumoInsertForm } from '../../estoqueInsumos/types/entradaInsumo'
import { useInsumos } from '../../estoqueInsumos/hooks/useInsumos'

const TABLE_HEADERS = ['ID', 'Fornecedor', 'Status', 'Itens', 'Data', 'Ações']

type DialogState =
  | null
  | { type: 'sem-itens' }
  | { type: 'perecivel'; nomes: string; compraId: number }
  | { type: 'confirmar'; compra: { id: number; itens: any[] } }

function formatDate(dateStr: string) {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

export default function CompraListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState({
    fornecedorId: '',
    status: '',
    dataInicial: '',
    dataFinal: '',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [dialog, setDialog] = useState<DialogState>(null)

  const debouncedFilters = useDebounce(filters)
  const filterParams = {
    ...(debouncedFilters.fornecedorId ? { fornecedorId: Number(debouncedFilters.fornecedorId) } : {}),
    ...(debouncedFilters.status ? { status: debouncedFilters.status } : {}),
    ...(debouncedFilters.dataInicial ? { dataInicial: debouncedFilters.dataInicial } : {}),
    ...(debouncedFilters.dataFinal ? { dataFinal: debouncedFilters.dataFinal } : {}),
  }

  const { data, isLoading } = useCompras(page, 20, Object.keys(filterParams).length > 0 ? filterParams : undefined)
  const { data: insumosData } = useInsumos(0, 1000)
  const deleteMutation = useDeleteCompra()
  const pdfMutation = useDownloadPdfCompra()
  const entradaMutation = useGerarEntradaInsumoCompra()
  const statusMutation = useUpdateCompraStatus()
  const insumos = insumosData?.content ?? []

  const compras = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  const [deleteTarget, setDeleteTarget] = useState<{ id: number } | null>(null)

  function handleFilterChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(0)
  }

  function clearFilters() {
    setFilters({ fornecedorId: '', status: '', dataInicial: '', dataFinal: '' })
    setPage(0)
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, {
      onSettled: () => setDeleteTarget(null),
    })
  }

  function handleDownloadPdf(id: number) {
    pdfMutation.mutate(id)
  }

  function handleConfirmarRecebimento(compraSelecionada: typeof compras[0]) {
    const itensComprados = compraSelecionada.itens.filter((i) => i.comprado === true)

    if (itensComprados.length === 0) {
      setDialog({ type: 'sem-itens' })
      return
    }

    const itensPerecíveis = itensComprados.filter((i) =>
      insumos.find((ins) => ins.id === i.insumoId)?.perecivel === true
    )

    if (itensPerecíveis.length > 0) {
      const nomes = itensPerecíveis
        .map((i) => insumos.find((ins) => ins.id === i.insumoId)?.nome ?? `Insumo #${i.insumoId}`)
        .join(', ')
      setDialog({ type: 'perecivel', nomes, compraId: compraSelecionada.id })
      return
    }

    setDialog({ type: 'confirmar', compra: compraSelecionada })
  }

  function executarRecebimento(compra: { id: number; itens: any[] }) {
    const itensComprados = compra.itens.filter((i) => i.comprado === true)
    const valorTotalItens = itensComprados.reduce((acc: number, i: any) => acc + (i.valorCustoTotal ?? 0), 0)

    const payload: EntradaInsumoInsertForm = {
      compraId: compra.id,
      usuarioId: 1,
      valorTotal: valorTotalItens,
      createdBy: 'netto',
      itens: itensComprados.map((i: any) => ({
        insumoId: i.insumoId,
        quantidade: i.quantidade,
        valorCustoUnitario: i.valorCustoUnitario,
        valorCustoTotal: i.valorCustoTotal ?? (i.valorCustoUnitario * i.quantidade),
      })),
    }

    setDialog(null)
    entradaMutation.mutate({ compraId: compra.id, payload }, {
      onSuccess: () => {
        statusMutation.mutate({ id: compra.id, status: 'CONFIRMADA' })
      },
    })
  }

  return (
    <div>
      <PageHeader
        title="Compras"
        subtitle="Gerencie as ordens de compra de insumos"
      >
        <button
          onClick={() => navigate('/compras/compras/nova')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
        >
          <Plus size={16} />
          Nova Compra
        </button>
      </PageHeader>

      <div className="mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
            showFilters || Object.values(filters).some(v => v)
              ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Search size={15} />
          Filtros
          {Object.values(filters).filter(Boolean).length > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-amber-500 text-white rounded-full leading-none">
              {Object.values(filters).filter(Boolean).length}
            </span>
          )}
        </button>

        {showFilters && (
          <div className="mt-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor ID</label>
                <input
                  type="number"
                  value={filters.fornecedorId}
                  onChange={(e) => handleFilterChange('fornecedorId', e.target.value)}
                  placeholder="ID do fornecedor..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="PENDENTE">PENDENTE</option>
                  <option value="EM_ANDAMENTO">EM_ANDAMENTO</option>
                  <option value="CONFIRMADA">CONFIRMADA</option>
                  <option value="CANCELADA">CANCELADA</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Inicial</label>
                <input
                  type="date"
                  value={filters.dataInicial}
                  onChange={(e) => handleFilterChange('dataInicial', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Final</label>
                <input
                  type="date"
                  value={filters.dataFinal}
                  onChange={(e) => handleFilterChange('dataFinal', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
            {Object.values(filters).some(v => v) && (
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
        isEmpty={!isLoading && compras.length === 0}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      >
        {compras.map((c) => (
          <tr key={c.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3 text-gray-500 font-mono text-xs">#{c.id}</td>
            <td className="px-4 py-3 font-medium text-gray-900">
              {c.fornecedorId != null
                ? <span className="text-gray-700">Fornecedor #{c.fornecedorId}</span>
                : <span className="text-gray-400 italic">Sem fornecedor</span>}
            </td>
            <td className="px-4 py-3">
              <Badge status={c.status} />
            </td>
            <td className="px-4 py-3 text-gray-600">
              {c.itens?.length ?? 0} {(c.itens?.length ?? 0) === 1 ? 'item' : 'itens'}
            </td>
            <td className="px-4 py-3 text-gray-600 text-sm">{formatDate(c.createdOn)}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadPdf(c.id)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                  title="Baixar PDF"
                >
                  <FileText size={15} />
                </button>

                {(c.status === 'PENDENTE' || c.status === 'EM_ANDAMENTO') && (
                  <button
                    onClick={() => handleConfirmarRecebimento(c)}
                    className="p-1.5 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                    title="Confirmar Recebimento / Gerar Estoque"
                  >
                    <CheckCircle size={15} />
                  </button>
                )}

                <button
                  onClick={() => navigate(`/compras/compras/${c.id}/editar`)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Editar"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => setDeleteTarget({ id: c.id })}
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

      {/* Modais de validação */}
      <AlertModal
        isOpen={dialog?.type === 'sem-itens'}
        onClose={() => setDialog(null)}
        variant="warning"
        title="Nenhum item comprado"
        message="Esta ordem não possui itens marcados como comprados. Edite a compra e marque os itens que foram efetivamente recebidos antes de confirmar o recebimento."
        cancelLabel="Entendi"
      />

      <AlertModal
        isOpen={dialog?.type === 'perecivel'}
        onClose={() => setDialog(null)}
        variant="warning"
        title="Insumos perecíveis detectados"
        message={
          dialog?.type === 'perecivel' ? (
            <div>
              <p className="mb-3">
                Os seguintes insumos são perecíveis e exigem <strong>lote</strong> e <strong>data de validade</strong>:
              </p>
              <ul className="list-disc list-inside space-y-1 mb-3">
                {dialog.nomes.split(', ').map((nome) => (
                  <li key={nome} className="text-amber-700 font-medium">{nome}</li>
                ))}
              </ul>
              <p>
                Você será redirecionado para a tela de <strong>Nova Entrada</strong> com o Compra ID já preenchido.
              </p>
            </div>
          ) : ''
        }
        confirmLabel="Ir para Nova Entrada"
        onConfirm={() => {
          if (dialog?.type === 'perecivel') {
            navigate('/estoque-insumos/entradas/nova', { state: { compraId: dialog.compraId } })
            setDialog(null)
          }
        }}
        cancelLabel="Cancelar"
      />

      <AlertModal
        isOpen={dialog?.type === 'confirmar'}
        onClose={() => setDialog(null)}
        variant="success"
        title="Confirmar recebimento"
        message={
          dialog?.type === 'confirmar' ? (
            <span>
              Confirma o recebimento da <strong>Compra #{dialog.compra.id}</strong>?{' '}
              <strong>{dialog.compra.itens.filter((i: any) => i.comprado).length} item(ns)</strong> marcados como
              comprados serão lançados no estoque.
            </span>
          ) : ''
        }
        confirmLabel="Confirmar recebimento"
        isPending={entradaMutation.isPending || statusMutation.isPending}
        onConfirm={() => {
          if (dialog?.type === 'confirmar') executarRecebimento(dialog.compra)
        }}
        cancelLabel="Cancelar"
      />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        itemName={`Compra #${deleteTarget?.id}`}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}

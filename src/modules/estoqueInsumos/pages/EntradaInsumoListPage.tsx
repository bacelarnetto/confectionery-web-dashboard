import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Pencil, Trash2, Search, X, ShoppingCart, FileText, AlertCircle, CheckCircle2, Info } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import PageableTable from '../../../components/ui/PageableTable'
import DeleteConfirmModal from '../../../components/ui/DeleteConfirmModal'
import { useEntradasInsumo, useDeleteEntradaInsumo } from '../hooks/useEntradasInsumo'
import { useDebounce } from '../../../hooks/useDebounce'
import { formatCurrency } from '../../../lib/format'

const TABLE_HEADERS = ['ID', 'Tipo / Origem', 'Insumos', 'Valor Total', 'NF', 'Criado por', 'Ações']

export default function EntradaInsumoListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [filters, setFilters] = useState({
    compraId: '',
    dataInicial: '',
    dataFinal: '',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  const debouncedFilters = useDebounce(filters)
  const filterParams = {
    ...(debouncedFilters.compraId ? { compraId: Number(debouncedFilters.compraId) } : {}),
    ...(debouncedFilters.dataInicial ? { dataInicial: debouncedFilters.dataInicial } : {}),
    ...(debouncedFilters.dataFinal ? { dataFinal: debouncedFilters.dataFinal } : {}),
  }

  const { data, isLoading } = useEntradasInsumo(page, pageSize, Object.keys(filterParams).length > 0 ? filterParams : undefined)
  const deleteMutation = useDeleteEntradaInsumo()

  const entradas = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  const comprasComPendencias = entradas.filter(
    (e) => e.compraId && e.itens.some((it) => !it.lote || !it.dataFabricacao || !it.dataValidade)
  )

  const [deleteTarget, setDeleteTarget] = useState<{ id: number } | null>(null)

  function handleFilterChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(0)
  }

  function clearFilters() {
    setFilters({ compraId: '', dataInicial: '', dataFinal: '' })
    setPage(0)
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, {
      onSettled: () => setDeleteTarget(null),
    })
  }

  return (
    <div>
      <PageHeader
        title="Entradas de Insumo"
        subtitle="Gerencie as entradas de insumos no estoque"
      >
        <div className="flex items-center gap-2">
          {/* Tooltip informativo sobre Entradas e Compras */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => setShowInfo((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-all cursor-pointer shadow-xs ${
                showInfo
                  ? 'bg-blue-600 text-white border-blue-600'
                  : comprasComPendencias.length > 0
                  ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                  : 'text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200'
              }`}
              title="Clique ou passe o mouse para ver orientações sobre entradas manuais e via compra"
            >
              <Info size={14} />
              <span>Orientações / Entradas</span>
              {comprasComPendencias.length > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] bg-amber-500 text-white rounded-full font-bold leading-none">
                  {comprasComPendencias.length}
                </span>
              )}
            </button>

            <div
              className={`absolute right-0 top-full pt-2 w-96 max-w-[90vw] z-50 transition-all duration-150 ${
                showInfo
                  ? 'opacity-100 visible pointer-events-auto'
                  : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible pointer-events-none group-hover:pointer-events-auto'
              }`}
            >
              <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-2xl text-gray-800">
                <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Info size={16} className="text-blue-600 shrink-0" />
                    <h4 className="font-semibold text-gray-900 text-xs">
                      Orientações sobre Tipos de Entrada
                    </h4>
                  </div>
                  {showInfo && (
                    <button
                      type="button"
                      onClick={() => setShowInfo(false)}
                      className="text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
                      title="Fechar"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="bg-blue-50/80 p-2.5 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-1.5 font-semibold text-blue-950 mb-1">
                      <ShoppingCart size={13} className="text-blue-600" />
                      <span>Entradas via Compra:</span>
                    </div>
                    <p className="text-blue-900 leading-relaxed">
                      Geradas automaticamente a partir de pedidos de compra. Exigem conferência física na entrega para preencher os dados dos itens:
                    </p>
                    <ul className="list-disc list-inside mt-1 text-blue-950 space-y-0.5">
                      <li><strong>Lote</strong> do insumo recebido;</li>
                      <li><strong>Data de Fabricação</strong>;</li>
                      <li><strong>Data de Validade / Vencimento</strong> (obrigatória para perecíveis 🌡).</li>
                    </ul>
                    <p className="text-blue-800 text-[11px] mt-1.5">
                      Itens com campos pendentes são sinalizados com a etiqueta <span className="font-medium text-amber-700">Preenchimento pendente</span>. Clique em <strong>Editar (✏️)</strong> para completá-los.
                    </p>
                  </div>

                  <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-1.5 font-semibold text-gray-900 mb-1">
                      <FileText size={13} className="text-gray-500" />
                      <span>Entradas Manuais:</span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Lançadas diretamente pelo operador através do botão <strong>Nova Entrada</strong>, com todos os dados preenchidos no ato do cadastro.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/estoque-insumos/entradas/nova')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors cursor-pointer"
          >
            <Plus size={16} />
            Nova Entrada
          </button>
        </div>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Compra ID</label>
                <input
                  type="number"
                  value={filters.compraId}
                  onChange={(e) => handleFilterChange('compraId', e.target.value)}
                  placeholder="ID da compra..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
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
        isEmpty={!isLoading && entradas.length === 0}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalElements={data?.totalElements}
        pageSize={pageSize}
        onPageSizeChange={(size) => { setPageSize(size); setPage(0) }}
      >
        {entradas.map((e) => {
          const isCompra = e.compraId != null && Number(e.compraId) > 0
          const itensComCamposPendentes = e.itens.filter(
            (it) => !it.lote || !it.dataFabricacao || !it.dataValidade
          )
          const temPendencias = isCompra && itensComCamposPendentes.length > 0

          return (
            <tr key={e.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">#{e.id}</td>
              <td className="px-4 py-3">
                {isCompra ? (
                  <div className="flex flex-col items-start gap-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-md bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
                      <ShoppingCart size={12} />
                      Compra #{e.compraId}
                    </span>

                    {temPendencias ? (
                      <div className="relative group inline-flex items-center">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-300 rounded cursor-help">
                          <AlertCircle size={12} className="text-amber-600 shrink-0" />
                          Preenchimento pendente
                        </span>
                        <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover:block z-30 w-72 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-2xl pointer-events-none">
                          <div className="flex items-center gap-1.5 font-semibold text-amber-300 mb-1">
                            <Info size={13} />
                            <span>Entrada gerada via Compra #{e.compraId}</span>
                          </div>
                          <p className="text-gray-200 leading-relaxed text-[11px]">
                            Esta entrada originou-se de uma compra e possui campos que precisam ser completados:
                          </p>
                          <ul className="list-disc list-inside mt-1.5 text-gray-300 space-y-0.5 text-[11px]">
                            {itensComCamposPendentes.some((i) => !i.lote) && (
                              <li><strong>Lote</strong> do insumo</li>
                            )}
                            {itensComCamposPendentes.some((i) => !i.dataFabricacao) && (
                              <li><strong>Data de fabricação</strong></li>
                            )}
                            {itensComCamposPendentes.some((i) => !i.dataValidade) && (
                              <li><strong>Data de vencimento / validade</strong></li>
                            )}
                          </ul>
                          <div className="mt-2 pt-1.5 border-t border-gray-700 text-amber-200 text-[10px]">
                            💡 Clique em Editar (✏️) para preencher esses dados.
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                        <CheckCircle2 size={11} className="text-emerald-600" />
                        Dados completos
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md bg-gray-100 text-gray-700 border border-gray-200">
                    <FileText size={12} className="text-gray-500" />
                    Manual
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {e.itens.map((item) => item.insumoNome ?? `#${item.insumoId}`).join(', ') || '—'}
              </td>
              <td className="px-4 py-3 text-gray-600">{formatCurrency(e.valorTotal)}</td>
              <td className="px-4 py-3 text-gray-600">{e.numeroNotaFiscal ?? '—'}</td>
              <td className="px-4 py-3 text-gray-600">{e.createdBy}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/estoque-insumos/entradas/${e.id}/editar`)}
                    className={`p-1.5 rounded-md transition-colors ${
                      temPendencias
                        ? 'text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 ring-1 ring-amber-300'
                        : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    title={temPendencias ? 'Completar dados dos insumos (lote, validade, fabricação)' : 'Editar'}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget({ id: e.id })}
                    className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Remover"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          )
        })}
      </PageableTable>

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        itemName={`Entrada #${deleteTarget?.id}`}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}

import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Plus, X } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import Button from '../../../components/ui/Button'
import { useCompra, useCreateCompra, useUpdateCompra } from '../hooks/useCompras'
import { useFornecedores } from '../hooks/useFornecedores'
import { useInsumos } from '../../estoqueInsumos/hooks/useInsumos'
import { ItemCompra } from '../types/compra'

const STATUS_OPTIONS = ['RASCUNHO', 'EM_ANDAMENTO', 'CONFIRMADA', 'CANCELADA']

const inputClass =
  'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent placeholder:text-gray-400'

const selectClass =
  'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white'

interface ItemFormRow {
  insumoId: string
  quantidade: string
  valorCustoUnitario: string
  comprado: boolean
}

const emptyItem = (): ItemFormRow => ({
  insumoId: '',
  quantidade: '',
  valorCustoUnitario: '',
  comprado: false,
})

export default function CompraFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const numericId = Number(id ?? 0)

  const { data: compra, isLoading: loadingCompra } = useCompra(numericId)
  const { data: fornecedoresPage } = useFornecedores(0, 100)
  const fornecedores = fornecedoresPage?.content ?? []

  // Busca lista de insumos
  const { data: insumosPage } = useInsumos(0, 500)
  const insumos = insumosPage?.content ?? []

  const createMutation = useCreateCompra()
  const updateMutation = useUpdateCompra()

  const [fornecedorId, setFornecedorId] = useState('')
  const [status, setStatus] = useState('PENDENTE')
  const [itens, setItens] = useState<ItemFormRow[]>([emptyItem()])

  useEffect(() => {
    if (compra) {
      setFornecedorId(compra.fornecedorId != null ? String(compra.fornecedorId) : '')
      setStatus(compra.status)
      setItens(
        compra.itens.length > 0
          ? compra.itens.map((item) => ({
              insumoId: String(item.insumoId),
              quantidade: String(item.quantidade),
              valorCustoUnitario: String(item.valorCustoUnitario),
              comprado: item.comprado ?? false,
            }))
          : [emptyItem()],
      )
    }
  }, [compra])

  function handleItemChange(index: number, field: keyof ItemFormRow, value: string | boolean) {
    setItens((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  function addItem() {
    setItens((prev) => [...prev, emptyItem()])
  }

  function removeItem(index: number) {
    setItens((prev) => prev.filter((_, i) => i !== index))
  }

  function buildItens(): ItemCompra[] {
    return itens
      .filter((item) => item.insumoId && item.quantidade && item.valorCustoUnitario)
      .map((item) => ({
        insumoId: Number(item.insumoId),
        quantidade: Number(item.quantidade),
        valorCustoUnitario: Number(item.valorCustoUnitario),
        comprado: item.comprado,
      }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const parsedItens = buildItens()

    if (isEditing) {
      updateMutation.mutate(
        {
          id: numericId,
          data: {
            fornecedorId: fornecedorId ? Number(fornecedorId) : undefined,
            status,
            itens: parsedItens,
            updatedBy: 'netto',
          },
        },
        { onSuccess: () => navigate('/compras/compras') },
      )
    } else {
      createMutation.mutate(
        {
          fornecedorId: fornecedorId ? Number(fornecedorId) : undefined,
          status,
          itens: parsedItens,
          createdBy: 'netto',
        },
        { onSuccess: () => navigate('/compras/compras') },
      )
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  if (isEditing && loadingCompra) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Carregando...
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={isEditing ? 'Editar Compra' : 'Nova Compra'}
        subtitle={isEditing ? 'Atualize os dados da ordem de compra' : 'Registre uma nova ordem de compra'}
        backTo="/compras/compras"
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Main fields */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Dados gerais</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor</label>
              <select
                value={fornecedorId}
                onChange={(e) => setFornecedorId(e.target.value)}
                className={selectClass}
              >
                <option value="">Selecione um fornecedor</option>
                {fornecedores?.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
                className={selectClass}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Itens */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Itens da compra</h2>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              <Plus size={15} />
              Adicionar item
            </button>
          </div>

          <div className="space-y-3">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-2 px-1">
              <span className="col-span-1 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center" title="Marcar como comprado">
                OK
              </span>
              <span className="col-span-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Nome do Insumo
              </span>
              <span className="col-span-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Quantidade
              </span>
              <span className="col-span-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                V. Unit. (R$)
              </span>
              <span className="col-span-1" />
            </div>

            {itens.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-1 flex justify-center">
                  <input
                    type="checkbox"
                    checked={item.comprado}
                    onChange={(e) => handleItemChange(index, 'comprado', e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded border-gray-300 focus:ring-amber-500 cursor-pointer"
                    title="Marcar como item comprado"
                  />
                </div>
                <div className="col-span-3">
                  <select
                    value={item.insumoId}
                    onChange={(e) => handleItemChange(index, 'insumoId', e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Selecione...</option>
                    {insumos.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    value={item.quantidade}
                    onChange={(e) => handleItemChange(index, 'quantidade', e.target.value)}
                    className={inputClass}
                    placeholder="0"
                    min={0}
                    step="0.01"
                  />
                </div>
                <div className="col-span-4">
                  <input
                    type="number"
                    value={item.valorCustoUnitario}
                    onChange={(e) => handleItemChange(index, 'valorCustoUnitario', e.target.value)}
                    className={inputClass}
                    placeholder="0,00"
                    min={0}
                    step="0.01"
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={itens.length === 1}
                    className="p-1 rounded text-gray-300 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
                    title="Remover item"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}

            {itens.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                Nenhum item adicionado.
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/compras/compras')}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            Cancelar
          </button>
          <Button type="submit" isLoading={isPending}>
            {isEditing ? 'Salvar alterações' : 'Registrar compra'}
          </Button>
        </div>
      </form>
    </div>
  )
}

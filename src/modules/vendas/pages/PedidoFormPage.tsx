import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Plus, Trash2 } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import Button from '../../../components/ui/Button'
import { usePedido, useCreatePedido, useUpdatePedido } from '../hooks/usePedidos'
import { useClientes } from '../hooks/useClientes'
import { useProdutos } from '../../estoqueProdutos/hooks/useProdutos'
import precificacaoProdutoService from '../../estoqueProdutos/services/precificacaoProdutoService'

interface ItemForm {
  produtoId: string
  quantidade: string
  valorUnitario: string
  desconto: string
  ignorarComplementoPadrao: boolean
  complementoIds: string
}

interface FormState {
  clienteId: string
  enderecoId: string
  retirar: boolean
  dataEntrega: string
  valorFrete: string
}

const emptyForm: FormState = { clienteId: '', enderecoId: '', retirar: false, dataEntrega: '', valorFrete: '' }
const emptyItem: ItemForm = { produtoId: '', quantidade: '1', valorUnitario: '', desconto: '', ignorarComplementoPadrao: false, complementoIds: '' }

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputClass =
  'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent placeholder:text-gray-400'

export default function PedidoFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const numericId = Number(id ?? 0)

  const { data: pedido, isLoading } = usePedido(numericId)
  const { data: clientesData } = useClientes(0, 100)
  const { data: produtosData } = useProdutos(0, 200)
  const createMutation = useCreatePedido()
  const updateMutation = useUpdatePedido()

  const [form, setForm] = useState<FormState>(emptyForm)
  const [itens, setItens] = useState<ItemForm[]>([{ ...emptyItem }])

  const clientes = clientesData?.content ?? []
  const produtos = produtosData?.content ?? []
  const selectedCliente = clientes.find((c) => c.id === Number(form.clienteId))

  async function handleProdutoChange(index: number, produtoId: string) {
    handleItemChange(index, 'produtoId', produtoId)
    if (produtoId) {
      const preco = await precificacaoProdutoService.getVigenteByProdutoId(Number(produtoId))
      if (preco?.valorVenda != null) {
        handleItemChange(index, 'valorUnitario', String(preco.valorVenda))
      }
    }
  }

  useEffect(() => {
    if (pedido) {
      setForm({
        clienteId: String(pedido.clienteId ?? ''),
        enderecoId: String(pedido.enderecoId ?? ''),
        retirar: pedido.retirar,
        dataEntrega: pedido.dataEntrega ? new Date(pedido.dataEntrega).toISOString().slice(0, 16) : '',
        valorFrete: String(pedido.valorFrete ?? ''),
      })
      if (pedido.itens?.length) {
        setItens(
          pedido.itens.map((it) => ({
            produtoId: String(it.produtoId),
            quantidade: String(it.quantidade),
            valorUnitario: String(it.valorUnitario),
            desconto: String(it.desconto ?? ''),
            ignorarComplementoPadrao: it.ignorarComplementoPadrao ?? false,
            complementoIds: it.complementoIds?.join(', ') ?? '',
          })),
        )
      }
    }
  }, [pedido])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setForm((prev) => ({ ...prev, [e.target.name]: value }))
  }

  function handleItemChange(index: number, field: keyof ItemForm, value: string | boolean) {
    setItens((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  function addItem() {
    setItens((prev) => [...prev, { ...emptyItem }])
  }

  function removeItem(index: number) {
    setItens((prev) => prev.filter((_, i) => i !== index))
  }

  function buildItens() {
    return itens
      .filter((it) => it.produtoId && it.quantidade && it.valorUnitario)
      .map((it) => ({
        produtoId: Number(it.produtoId),
        quantidade: Number(it.quantidade),
        valorUnitario: Number(it.valorUnitario),
        desconto: it.desconto ? Number(it.desconto) : undefined,
        ignorarComplementoPadrao: it.ignorarComplementoPadrao,
        complementoIds: it.complementoIds
          ? it.complementoIds.split(',').map((s) => Number(s.trim())).filter((n) => !isNaN(n) && n > 0)
          : [],
      }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const base = {
      retirar: form.retirar,
      dataEntrega: form.dataEntrega ? new Date(form.dataEntrega).toISOString() : undefined,
      valorFrete: form.valorFrete ? Number(form.valorFrete) : undefined,
      itens: buildItens(),
    }
    if (isEditing) {
      updateMutation.mutate(
        { id: numericId, data: { ...base, enderecoId: form.enderecoId ? Number(form.enderecoId) : undefined, updatedBy: 'netto' } },
        { onSuccess: () => navigate('/vendas/pedidos') },
      )
    } else {
      createMutation.mutate(
        { clienteId: Number(form.clienteId), enderecoId: form.enderecoId ? Number(form.enderecoId) : undefined, ...base, createdBy: 'netto' },
        { onSuccess: () => navigate('/vendas/pedidos') },
      )
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  if (isEditing && isLoading) {
    return <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Carregando...</div>
  }

  return (
    <div className="max-w-4xl">
      <PageHeader
        title={isEditing ? 'Editar Pedido' : 'Novo Pedido'}
        subtitle={isEditing ? 'Atualize os dados do pedido' : 'Registre um novo pedido'}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Dados do Pedido</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Cliente" required>
              <select
                name="clienteId"
                value={form.clienteId}
                onChange={handleChange}
                required={!isEditing}
                disabled={isEditing}
                className={inputClass + (isEditing ? ' bg-gray-50 text-gray-500' : '')}
              >
                <option value="">Selecione um cliente...</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </Field>

            {selectedCliente?.enderecos?.length ? (
              <Field label="Endereço de Entrega">
                <select name="enderecoId" value={form.enderecoId} onChange={handleChange} className={inputClass}>
                  <option value="">— sem endereço —</option>
                  {selectedCliente.enderecos.map((end, i) => (
                    <option key={end.id ?? i} value={end.id ?? ''}>
                      {end.descricao || `${end.logradouro}, ${end.numero}`}
                    </option>
                  ))}
                </select>
              </Field>
            ) : (
              <Field label="Endereço ID">
                <input
                  name="enderecoId"
                  type="number"
                  value={form.enderecoId}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="ID do endereço (opcional)"
                />
              </Field>
            )}

            <Field label="Data de Entrega">
              <input
                name="dataEntrega"
                type="datetime-local"
                value={form.dataEntrega}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>

            <Field label="Valor de Frete (R$)">
              <input
                name="valorFrete"
                type="number"
                step="0.01"
                min="0"
                value={form.valorFrete}
                onChange={handleChange}
                className={inputClass}
                placeholder="0.00"
              />
            </Field>

            <div className="flex items-center gap-3 pt-5">
              <input
                id="retirar"
                name="retirar"
                type="checkbox"
                checked={form.retirar}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400"
              />
              <label htmlFor="retirar" className="text-sm font-medium text-gray-700">
                Cliente retira no local
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Itens do Pedido</h3>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
            >
              <Plus size={14} />
              Adicionar item
            </button>
          </div>

          <div className="space-y-4">
            {itens.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-600">Item {index + 1}</span>
                  {itens.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="col-span-2 md:col-span-1">
                    <Field label="Produto" required>
                      <select
                        value={item.produtoId}
                        onChange={(e) => handleProdutoChange(index, e.target.value)}
                        required
                        className={inputClass}
                      >
                        <option value="">Selecione...</option>
                        {produtos.map((p) => (
                          <option key={p.id} value={p.id}>{p.nome}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <Field label="Quantidade" required>
                    <input
                      type="number"
                      min="1"
                      value={item.quantidade}
                      onChange={(e) => handleItemChange(index, 'quantidade', e.target.value)}
                      className={inputClass}
                      placeholder="1"
                    />
                  </Field>
                  <Field label="Valor Unit. (R$)" required>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.valorUnitario}
                      onChange={(e) => handleItemChange(index, 'valorUnitario', e.target.value)}
                      className={inputClass}
                      placeholder="0.00"
                    />
                  </Field>
                  <Field label="Desconto (R$)">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.desconto}
                      onChange={(e) => handleItemChange(index, 'desconto', e.target.value)}
                      className={inputClass}
                      placeholder="0.00"
                    />
                  </Field>
                  <div className="col-span-2">
                    <Field label="Complemento IDs (separados por vírgula)">
                      <input
                        type="text"
                        value={item.complementoIds}
                        onChange={(e) => handleItemChange(index, 'complementoIds', e.target.value)}
                        className={inputClass}
                        placeholder="Ex: 1, 3, 7"
                      />
                    </Field>
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <input
                      id={`ignorar-${index}`}
                      type="checkbox"
                      checked={item.ignorarComplementoPadrao}
                      onChange={(e) => handleItemChange(index, 'ignorarComplementoPadrao', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400"
                    />
                    <label htmlFor={`ignorar-${index}`} className="text-xs text-gray-600">
                      Ignorar complemento padrão
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/vendas/pedidos')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <Button type="submit" isLoading={isPending}>
            {isEditing ? 'Salvar alterações' : 'Registrar pedido'}
          </Button>
        </div>
      </form>
    </div>
  )
}

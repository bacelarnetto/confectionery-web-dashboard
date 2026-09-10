import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Plus, Trash2, AlertCircle } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import Button from '../../../components/ui/Button'
import { usePedido, useCreatePedido, useUpdatePedido } from '../hooks/usePedidos'
import { useClientes } from '../hooks/useClientes'
import EnderecoClienteField from '../components/EnderecoClienteField'
import ComplementoPicker, { ComplementoResolvido } from '../components/ComplementoPicker'
import ResumoValoresCard from '../components/ResumoValoresCard'
import { calcularResumo } from '../lib/resumoValores'
import { useProdutos } from '../../estoqueProdutos/hooks/useProdutos'
import precificacaoProdutoService from '../../estoqueProdutos/services/precificacaoProdutoService'
import complementoService from '../services/complementoService'
import { parseApiError } from '../../../lib/apiError'

/**
 * O backend não estrutura erro por campo. O único padrão confiável e reconhecível na base
 * inteira é o `NoSuchElementException` de referência inválida: "<Entidade> não encontrado(a)
 * com o ID <id>". Usamos isso só pra apontar qual item do pedido referencia um produto que já
 * não existe mais (ex: cache desatualizado) — qualquer outra mensagem cai no banner genérico.
 */
function extrairProdutoIdInvalido(mensagem: string): number | null {
  const match = mensagem.match(/Produto[a-zA-Zçã]* não encontrad[oa] com o ID (\d+)/)
  return match ? Number(match[1]) : null
}

interface ItemForm {
  produtoId: string
  quantidade: string
  valorUnitario: string
  desconto: string
  complementoIds: number[]
  complementosResolvidos: ComplementoResolvido[]
}

interface FormState {
  clienteId: string
  enderecoId: string
  retirar: boolean
  dataEntrega: string
  valorFrete: string
  observacao: string
}

const emptyForm: FormState = { clienteId: '', enderecoId: '', retirar: false, dataEntrega: '', valorFrete: '', observacao: '' }
const emptyItem: ItemForm = { produtoId: '', quantidade: '1', valorUnitario: '', desconto: '', complementoIds: [], complementosResolvidos: [] }

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
  'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500'

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
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [itemErroIndex, setItemErroIndex] = useState<number | null>(null)

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
        observacao: pedido.observacao ?? '',
      })
      if (pedido.itens?.length) {
        Promise.all(
          pedido.itens.map(async (it) => {
            let extras: number[] = []
            let padraoIds = new Set<number>()
            try {
              const padrao = await complementoService.getByProdutoId(it.produtoId)
              padraoIds = new Set(padrao.map((c) => c.id))
              if (it.complementos?.length) {
                extras = it.complementos
                  .filter((c) => c.complementoId != null && !padraoIds.has(c.complementoId))
                  .map((c) => c.complementoId!)
              } else if (it.complementoIds?.length) {
                extras = it.complementoIds.filter((id) => !padraoIds.has(id))
              }
            } catch {
              extras = it.complementoIds ?? (it.complementos ?? [])
                .filter((c) => c.complementoId != null)
                .map((c) => c.complementoId!)
            }
            // Usa o snapshot (nome/valorVenda) já devolvido pelo backend (B29) pra montar o resumo
            // sem depender do ComplementoPicker terminar de resolver -- funciona até se o
            // complemento original já tiver sido excluído.
            const complementosResolvidos: ComplementoResolvido[] = (it.complementos ?? [])
              .filter((c) => c.complementoNome)
              .map((c) => ({
                id: c.complementoId ?? -1,
                nome: c.complementoNome!,
                valorVenda: c.valorVenda ?? 0,
                padrao: c.complementoId != null && padraoIds.has(c.complementoId),
              }))
            return {
              produtoId: String(it.produtoId),
              quantidade: String(it.quantidade),
              valorUnitario: String(it.valorUnitario),
              desconto: String(it.desconto ?? ''),
              complementoIds: extras,
              complementosResolvidos,
            }
          }),
        ).then(setItens)
      }
    }
  }, [pedido])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setForm((prev) => ({ ...prev, [e.target.name]: value }))
  }

  function handleRetirarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const retirar = e.target.checked
    // Cliente retira no local -> não tem frete; limpa pra não deixar um valor esquecido no submit.
    setForm((prev) => ({ ...prev, retirar, valorFrete: retirar ? '' : prev.valorFrete }))
  }

  function handleItemChange(index: number, field: keyof ItemForm, value: string | number[] | ComplementoResolvido[]) {
    setItens((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
    if (itemErroIndex === index) setItemErroIndex(null)
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
        complementoIds: it.complementoIds,
      }))
  }

  function tratarErro(err: unknown) {
    const { status, mensagem } = parseApiError(err)
    if (status && status >= 500) return // 5xx/rede: toast genérico já cobre

    const produtoIdInvalido = extrairProdutoIdInvalido(mensagem)
    if (produtoIdInvalido != null) {
      const index = itens.findIndex((it) => Number(it.produtoId) === produtoIdInvalido)
      if (index >= 0) {
        setItemErroIndex(index)
        setErroGeral(mensagem)
        return
      }
    }
    setErroGeral(mensagem)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErroGeral(null)
    setItemErroIndex(null)
    const base = {
      retirar: form.retirar,
      dataEntrega: form.dataEntrega ? new Date(form.dataEntrega).toISOString() : undefined,
      valorFrete: form.valorFrete ? Number(form.valorFrete) : undefined,
      observacao: form.observacao || undefined,
      itens: buildItens(),
    }
    if (isEditing) {
      updateMutation.mutate(
        { id: numericId, data: { ...base, enderecoId: form.enderecoId ? Number(form.enderecoId) : undefined, updatedBy: 'netto' } },
        { onSuccess: () => navigate('/vendas/pedidos'), onError: tratarErro },
      )
    } else {
      createMutation.mutate(
        { clienteId: Number(form.clienteId), enderecoId: form.enderecoId ? Number(form.enderecoId) : undefined, ...base, createdBy: 'netto' },
        { onSuccess: () => navigate('/vendas/pedidos'), onError: tratarErro },
      )
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending
  const resumo = calcularResumo(itens, form.retirar ? 0 : Number(form.valorFrete) || 0)

  if (isEditing && isLoading) {
    return <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Carregando...</div>
  }

  return (
    <div className="max-w-4xl">
      <PageHeader
        title={isEditing ? 'Editar Pedido' : 'Novo Pedido'}
        subtitle={isEditing ? 'Atualize os dados do pedido' : 'Registre um novo pedido'}
      />

      {erroGeral && (
        <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <p>{erroGeral}</p>
        </div>
      )}

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

            <Field label="Endereço de Entrega">
              <EnderecoClienteField
                cliente={selectedCliente}
                value={form.enderecoId}
                onChange={(value) => setForm((prev) => ({ ...prev, enderecoId: value }))}
              />
            </Field>

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
                disabled={form.retirar}
                className={inputClass}
                placeholder={form.retirar ? 'Sem frete (retirada no local)' : '0.00'}
              />
            </Field>

            <div className="flex items-center gap-3 pt-5">
              <input
                id="retirar"
                name="retirar"
                type="checkbox"
                checked={form.retirar}
                onChange={handleRetirarChange}
                className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400"
              />
              <label htmlFor="retirar" className="text-sm font-medium text-gray-700">
                Cliente retira no local
              </label>
            </div>

            <div className="md:col-span-2">
              <Field label="Observação">
                <textarea
                  name="observacao"
                  rows={3}
                  value={form.observacao}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Ex: entregar depois das 18h, embalar separado por sabor..."
                />
              </Field>
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
              <div
                key={index}
                className={`border rounded-lg p-4 ${itemErroIndex === index ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
              >
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
                    <ComplementoPicker
                      produtoId={Number(item.produtoId) || undefined}
                      value={item.complementoIds}
                      onChange={(ids) => handleItemChange(index, 'complementoIds', ids)}
                      onResolvedChange={(resolvidos) => handleItemChange(index, 'complementosResolvidos', resolvidos)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <ResumoValoresCard resumo={resumo} />

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

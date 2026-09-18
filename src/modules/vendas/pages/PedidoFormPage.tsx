import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router'
import { Plus, Trash2, AlertCircle } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import Button from '../../../components/ui/Button'
import { usePedido, useCreatePedido, useUpdatePedido, useUpdatePedidoStatus } from '../hooks/usePedidos'
import { useClientes } from '../hooks/useClientes'
import EnderecoClienteField from '../components/EnderecoClienteField'
import ComplementoPicker, { ComplementoResolvido } from '../components/ComplementoPicker'
import ResumoValoresCard from '../components/ResumoValoresCard'
import PedidoPagamentoCard from '../components/PedidoPagamentoCard'
import RegistrarPagamentoModal from '../components/RegistrarPagamentoModal'
import ApoioFestaSection from '../../apoioFesta/components/ApoioFestaSection'
import { calcularResumo } from '../lib/resumoValores'
import { formatEndereco } from '../lib/endereco'
import { STATUS_COLORS, STATUS_QUE_SUGEREM_PAGAMENTO } from '../lib/pedidoStatus'
import { PEDIDO_STATUS } from '../types/pedido'
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

/**
 * A validação de estoque (só acontece ao avançar pra EM_PRODUCAO) cita o nome de cada produto sem
 * saldo suficiente, ex: "Estoque insuficiente para o(s) produto(s): Bolo de Chocolate (necessário
 * 1.000, disponível 0.000), Torta Salgada (necessário 2.000, disponível 1.000)". Extrai os nomes
 * pra destacar a(s) linha(s) do item correspondente no formulário.
 */
function extrairNomesProdutosSemEstoque(mensagem: string): string[] {
  if (!mensagem.includes('Estoque insuficiente')) return []
  return Array.from(mensagem.matchAll(/([^,():]+?)\s*\(necessário/gi), (m) => m[1].trim())
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
  const location = useLocation()
  const returnTo = (location.state as { from?: string } | null)?.from || '/vendas/pedidos'
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const numericId = Number(id ?? 0)

  const { data: pedido, isLoading } = usePedido(numericId)
  const { data: clientesData } = useClientes(0, 100)
  const { data: produtosData } = useProdutos(0, 100)
  const createMutation = useCreatePedido()
  const updateMutation = useUpdatePedido()
  const statusMutation = useUpdatePedidoStatus()

  const [form, setForm] = useState<FormState>(emptyForm)
  const [itens, setItens] = useState<ItemForm[]>([{ ...emptyItem }])
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [itemErroIndices, setItemErroIndices] = useState<Set<number>>(new Set())
  const [percentualSugerido, setPercentualSugerido] = useState<number | undefined>()
  const [showPagamentoPrompt, setShowPagamentoPrompt] = useState(false)

  function handleStatusChange(status: string) {
    statusMutation.mutate(
      { id: numericId, status },
      {
        onSuccess: () => {
          setItemErroIndices(new Set())
          if (status in STATUS_QUE_SUGEREM_PAGAMENTO) {
            setPercentualSugerido(STATUS_QUE_SUGEREM_PAGAMENTO[status])
            setShowPagamentoPrompt(true)
          }
        },
        onError: (err) => {
          const { mensagem } = parseApiError(err)
          const nomesSemEstoque = extrairNomesProdutosSemEstoque(mensagem)
          if (nomesSemEstoque.length === 0) return
          const indices = itens
            .map((it, i) => ({ i, nome: produtos.find((p) => p.id === Number(it.produtoId))?.nome }))
            .filter(({ nome }) => nome && nomesSemEstoque.some((n) => n.toLowerCase() === nome.toLowerCase()))
            .map(({ i }) => i)
          setItemErroIndices(new Set(indices))
        },
      },
    )
  }

  const clientes = clientesData?.content ?? []
  const produtos = produtosData?.content ?? []
  const selectedCliente = clientes.find((c) => c.id === Number(form.clienteId))
  const enderecoSelecionado = selectedCliente?.enderecos?.find((e) => e.id === Number(form.enderecoId))

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
    // Cliente retira no local -> não tem frete nem endereço; limpa os dois pra não deixar um
    // valor esquecido no submit (o campo de endereço nem aparece mais na tela nesse caso).
    setForm((prev) => ({ ...prev, retirar, valorFrete: retirar ? '' : prev.valorFrete, enderecoId: retirar ? '' : prev.enderecoId }))
  }

  function handleItemChange(index: number, field: keyof ItemForm, value: string | number[] | ComplementoResolvido[]) {
    setItens((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
    if (itemErroIndices.has(index)) {
      setItemErroIndices((prev) => {
        const next = new Set(prev)
        next.delete(index)
        return next
      })
    }
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
        setItemErroIndices(new Set([index]))
        setErroGeral(mensagem)
        return
      }
    }
    setErroGeral(mensagem)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErroGeral(null)
    setItemErroIndices(new Set())
    const base = {
      retirar: form.retirar,
      dataEntrega: form.dataEntrega ? new Date(form.dataEntrega).toISOString() : undefined,
      valorFrete: form.valorFrete ? Number(form.valorFrete) : undefined,
      observacao: form.observacao || undefined,
      itens: buildItens(),
    }
    if (isEditing) {
      updateMutation.mutate(
        { id: numericId, data: { ...base, enderecoId: form.enderecoId ? Number(form.enderecoId) : undefined, updatedBy: '' } },
        { onSuccess: () => navigate(returnTo), onError: tratarErro },
      )
    } else {
      createMutation.mutate(
        { clienteId: Number(form.clienteId), enderecoId: form.enderecoId ? Number(form.enderecoId) : undefined, ...base, createdBy: '' },
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
        backTo={returnTo}
      />

      {erroGeral && (
        <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <p>{erroGeral}</p>
        </div>
      )}

      {isEditing && pedido?.status && (
        <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Status do Pedido</h3>
          <div className="flex flex-wrap gap-2">
            {PEDIDO_STATUS.map((s) => {
              const isAtual = s === pedido.status
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => !isAtual && handleStatusChange(s)}
                  disabled={isAtual || statusMutation.isPending}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors disabled:cursor-default ${
                    isAtual
                      ? `${STATUS_COLORS[s] ?? 'bg-gray-100 text-gray-700'} border-transparent ring-2 ring-offset-1 ring-gray-300`
                      : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50 cursor-pointer disabled:opacity-50'
                  }`}
                >
                  {s.replace('_', ' ')}
                </button>
              )
            })}
          </div>
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

            {!form.retirar && (
              <Field label="Endereço de Entrega">
                <EnderecoClienteField
                  cliente={selectedCliente}
                  value={form.enderecoId}
                  onChange={(value) => setForm((prev) => ({ ...prev, enderecoId: value }))}
                />
                {enderecoSelecionado && (
                  <p className="text-xs text-gray-500 mt-1.5">{formatEndereco(enderecoSelecionado)}</p>
                )}
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
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Itens do Pedido</h3>
              <p className="text-xs text-gray-500">Produtos e complementos incluídos no pedido</p>
            </div>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
            >
              <Plus size={16} />
              Adicionar item
            </button>
          </div>

          {itens.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
              Nenhum item adicionado. Clique em "Adicionar item" acima para começar.
            </p>
          ) : (
            <div className="space-y-4">
              {itens.map((item, index) => {
                const produto = produtos.find((p) => p.id === Number(item.produtoId))
                const qtd = Number(item.quantidade) || 0
                const unit = Number(item.valorUnitario) || 0
                const desc = Number(item.desconto) || 0
                const extrasValor = (item.complementosResolvidos || [])
                  .filter((c) => !c.padrao)
                  .reduce((acc, c) => acc + (c.valorVenda || 0), 0)
                const subtotalItem = Math.max(0, qtd * unit - desc + extrasValor * qtd)
                const hasErro = itemErroIndices.has(index)

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border transition-all ${
                      hasErro
                        ? 'bg-red-50/30 border-red-300'
                        : 'bg-gray-50/60 border-gray-200'
                    }`}
                  >
                    {/* Cabeçalho do Card do Item */}
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200/80">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-700 shadow-2xs">
                          Item {index + 1}
                        </span>
                        {produto && (
                          <span className="text-sm font-semibold text-gray-800">
                            {produto.nome}
                          </span>
                        )}
                        {hasErro && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-red-800 bg-red-100/90 border border-red-200 rounded-md">
                            <span>⚠️</span> Estoque insuficiente
                          </span>
                        )}
                      </div>

                      {itens.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Remover este item"
                        >
                          <Trash2 size={14} />
                          <span>Remover</span>
                        </button>
                      )}
                    </div>

                    {/* Grid de Campos em 2 Linhas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 items-start">
                      {/* Linha 1: Produto (Ocupa 2 colunas) */}
                      <div className="sm:col-span-2 md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Produto <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={item.produtoId}
                          onChange={(e) => handleProdutoChange(index, e.target.value)}
                          required
                          className={`${inputClass} ${hasErro ? 'border-red-400 bg-red-50/50' : ''}`}
                        >
                          <option value="">Selecione um produto...</option>
                          {produtos.map((p) => (
                            <option key={p.id} value={p.id}>{p.nome}</option>
                          ))}
                        </select>
                      </div>

                      {/* Linha 1: Quantidade */}
                      <div className="sm:col-span-1 md:col-span-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Quantidade <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantidade}
                          onChange={(e) => handleItemChange(index, 'quantidade', e.target.value)}
                          className={inputClass}
                          placeholder="1"
                          required
                        />
                      </div>

                      {/* Linha 1: Valor Unit. (R$) */}
                      <div className="sm:col-span-1 md:col-span-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Valor Unit. (R$) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.valorUnitario}
                          onChange={(e) => handleItemChange(index, 'valorUnitario', e.target.value)}
                          className={inputClass}
                          placeholder="0,00"
                          required
                        />
                      </div>

                      {/* Linha 2: Desconto (R$) */}
                      <div className="sm:col-span-1 md:col-span-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Desconto (R$)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.desconto}
                          onChange={(e) => handleItemChange(index, 'desconto', e.target.value)}
                          className={inputClass}
                          placeholder="0,00"
                        />
                      </div>

                      {/* Linha 2: Subtotal Item (R$) */}
                      <div className="sm:col-span-1 md:col-span-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Subtotal Item (R$)
                        </label>
                        <input
                          type="text"
                          value={subtotalItem.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          readOnly
                          className={`${inputClass} bg-gray-100/80 font-medium text-gray-600 cursor-not-allowed`}
                          title="Calculado automaticamente: (Qtd × Valor Unit.) − Desconto + Complementos"
                        />
                      </div>

                      {/* Linha 2: Complementos (Ocupa 2 colunas) */}
                      <div className="sm:col-span-2 md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Complementos / Adicionais
                        </label>
                        <ComplementoPicker
                          produtoId={Number(item.produtoId) || undefined}
                          value={item.complementoIds}
                          onChange={(ids) => handleItemChange(index, 'complementoIds', ids)}
                          onResolvedChange={(resolvidos) => handleItemChange(index, 'complementosResolvidos', resolvidos)}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <ResumoValoresCard resumo={resumo} />

        {isEditing && pedido && (
          <ApoioFestaSection pedidoId={numericId} podeAdicionar={buildItens().length > 0} dataEntrega={form.dataEntrega} />
        )}

        {isEditing && pedido && (
          <PedidoPagamentoCard pedidoId={numericId} pedido={pedido} />
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/vendas/pedidos')}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            Cancelar
          </button>
          <Button type="submit" isLoading={isPending}>
            {isEditing ? 'Salvar alterações' : 'Registrar pedido'}
          </Button>
        </div>
      </form>

      {isEditing && (
        <RegistrarPagamentoModal
          pedidoId={numericId}
          open={showPagamentoPrompt}
          onClose={() => setShowPagamentoPrompt(false)}
          percentualSugerido={percentualSugerido}
          title={percentualSugerido != null ? 'Registrar adiantamento' : 'Registrar pagamento'}
        />
      )}
    </div>
  )
}

import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Plus, Trash2, AlertCircle, ArrowRight, Check, X } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Modal from '../../../components/ui/Modal'
import { useOrcamento, useCreateOrcamento, useUpdateOrcamento, useUpdateOrcamentoStatus } from '../hooks/useOrcamentos'
import { useClientes } from '../hooks/useClientes'
import EnderecoClienteField from '../components/EnderecoClienteField'
import { useProdutos } from '../../estoqueProdutos/hooks/useProdutos'
import precificacaoProdutoService from '../../estoqueProdutos/services/precificacaoProdutoService'
import { parseApiError } from '../../../lib/apiError'

/** Mesmo padrão do PedidoFormPage: único ponto do backend que devolve erro reconhecível por campo. */
function extrairProdutoIdInvalido(mensagem: string): number | null {
  const match = mensagem.match(/Produto[a-zA-Zçã]* não encontrad[oa] com o ID (\d+)/)
  return match ? Number(match[1]) : null
}

interface ItemForm {
  produtoId: string
  quantidade: string
  valorUnitario: string
  desconto: string
}

interface FormState {
  clienteId: string
  enderecoId: string
  dataValidade: string
  observacao: string
}

const emptyForm: FormState = { clienteId: '', enderecoId: '', dataValidade: '', observacao: '' }
const emptyItem: ItemForm = { produtoId: '', quantidade: '1', valorUnitario: '', desconto: '' }

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

export default function OrcamentoFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const numericId = Number(id ?? 0)

  const { data: orcamento, isLoading } = useOrcamento(numericId)
  const { data: clientesData } = useClientes(0, 100)
  const { data: produtosData } = useProdutos(0, 200)
  const createMutation = useCreateOrcamento()
  const updateMutation = useUpdateOrcamento()
  const statusMutation = useUpdateOrcamentoStatus()

  const [form, setForm] = useState<FormState>(emptyForm)
  const [itens, setItens] = useState<ItemForm[]>([{ ...emptyItem }])
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [itemErroIndex, setItemErroIndex] = useState<number | null>(null)
  const [confirmAcao, setConfirmAcao] = useState<'CONVERTIDO' | 'REJEITADO' | null>(null)

  const clientes = clientesData?.content ?? []
  const produtos = produtosData?.content ?? []
  const selectedCliente = clientes.find((c) => c.id === Number(form.clienteId))

  const status = orcamento?.status
  const isReadOnly = isEditing && !!status && status !== 'ABERTO'

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
    if (orcamento) {
      setForm({
        clienteId: String(orcamento.clienteId ?? ''),
        enderecoId: String(orcamento.enderecoId ?? ''),
        dataValidade: orcamento.dataValidade ? orcamento.dataValidade.slice(0, 10) : '',
        observacao: orcamento.observacao ?? '',
      })
      if (orcamento.itens?.length) {
        setItens(
          orcamento.itens.map((it) => ({
            produtoId: String(it.produtoId),
            quantidade: String(it.quantidade),
            valorUnitario: String(it.valorUnitario),
            desconto: String(it.desconto ?? ''),
          })),
        )
      }
    }
  }, [orcamento])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleItemChange(index: number, field: keyof ItemForm, value: string) {
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
      }))
  }

  function tratarErro(err: unknown) {
    const { status: httpStatus, mensagem } = parseApiError(err)
    if (httpStatus && httpStatus >= 500) return

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
    const dataValidadeIso = form.dataValidade ? new Date(`${form.dataValidade}T23:59:59`).toISOString() : undefined

    if (isEditing) {
      updateMutation.mutate(
        {
          id: numericId,
          data: {
            enderecoId: form.enderecoId ? Number(form.enderecoId) : undefined,
            dataValidade: dataValidadeIso,
            observacao: form.observacao || undefined,
            itens: buildItens(),
            updatedBy: 'netto',
          },
        },
        { onError: tratarErro },
      )
    } else {
      createMutation.mutate(
        {
          clienteId: Number(form.clienteId),
          enderecoId: form.enderecoId ? Number(form.enderecoId) : undefined,
          dataValidade: dataValidadeIso,
          observacao: form.observacao || undefined,
          itens: buildItens(),
          createdBy: 'netto',
        },
        { onSuccess: () => navigate('/vendas/orcamentos'), onError: tratarErro },
      )
    }
  }

  function confirmarAcao() {
    if (!confirmAcao) return
    setErroGeral(null)
    statusMutation.mutate(
      { id: numericId, status: confirmAcao },
      {
        onSuccess: (atualizado) => {
          setConfirmAcao(null)
          if (atualizado.status === 'CONVERTIDO' && atualizado.pedidoId) {
            navigate(`/vendas/pedidos/${atualizado.pedidoId}/editar`)
          }
        },
        onError: (err) => {
          setConfirmAcao(null)
          const { mensagem } = parseApiError(err)
          setErroGeral(mensagem)
        },
      },
    )
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  if (isEditing && isLoading) {
    return <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Carregando...</div>
  }

  return (
    <div className="max-w-4xl">
      <PageHeader
        title={isEditing ? `Orçamento #${numericId}` : 'Novo Orçamento'}
        subtitle={
          isEditing
            ? isReadOnly
              ? 'Este orçamento já teve uma decisão registrada — só leitura'
              : 'Negocie os itens com o cliente e registre a decisão quando ele responder'
            : 'Monte uma proposta de compra para o cliente'
        }
      >
        {status && <Badge status={status} />}
      </PageHeader>

      {erroGeral && (
        <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <p>{erroGeral}</p>
        </div>
      )}

      {isEditing && orcamento?.status === 'CONVERTIDO' && orcamento.pedidoId && (
        <div className="mb-4 flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          <span>Este orçamento foi aprovado e virou o Pedido #{orcamento.pedidoId}.</span>
          <button
            onClick={() => navigate(`/vendas/pedidos/${orcamento.pedidoId}/editar`)}
            className="inline-flex items-center gap-1 font-medium hover:underline"
          >
            Ver pedido <ArrowRight size={14} />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Dados do Orçamento</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Cliente" required>
              <select
                name="clienteId"
                value={form.clienteId}
                onChange={handleChange}
                required={!isEditing}
                disabled={isEditing}
                className={inputClass}
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
                disabled={isReadOnly}
              />
            </Field>

            <Field label="Válido até">
              <input
                name="dataValidade"
                type="date"
                value={form.dataValidade}
                onChange={handleChange}
                disabled={isReadOnly}
                className={inputClass}
              />
            </Field>

            <div className="md:col-span-2">
              <Field label="Observação">
                <textarea
                  name="observacao"
                  rows={3}
                  value={form.observacao}
                  onChange={handleChange}
                  disabled={isReadOnly}
                  className={inputClass}
                  placeholder="Ex: cliente pediu para revisar o valor do frete"
                />
              </Field>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Itens do Orçamento</h3>
            {!isReadOnly && (
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <Plus size={14} />
                Adicionar item
              </button>
            )}
          </div>

          <div className="space-y-4">
            {itens.map((item, index) => {
              const produto = produtos.find((p) => p.id === Number(item.produtoId))
              return (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${itemErroIndex === index ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600">Item {index + 1}</span>
                    {!isReadOnly && itens.length > 1 && (
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
                        {isReadOnly ? (
                          <p className="px-3 py-2 text-sm text-gray-700">{produto?.nome ?? `Produto #${item.produtoId}`}</p>
                        ) : (
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
                        )}
                      </Field>
                    </div>
                    <Field label="Quantidade" required>
                      <input
                        type="number"
                        min="1"
                        value={item.quantidade}
                        onChange={(e) => handleItemChange(index, 'quantidade', e.target.value)}
                        disabled={isReadOnly}
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
                        disabled={isReadOnly}
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
                        disabled={isReadOnly}
                        className={inputClass}
                        placeholder="0.00"
                      />
                    </Field>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/vendas/orcamentos')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {isReadOnly ? 'Voltar' : 'Cancelar'}
          </button>

          {!isReadOnly && (
            <Button type="submit" isLoading={isPending}>
              {isEditing ? 'Salvar alterações' : 'Criar orçamento'}
            </Button>
          )}

          {isEditing && status === 'ABERTO' && (
            <>
              <Button
                type="button"
                variant="danger"
                onClick={() => setConfirmAcao('REJEITADO')}
                isLoading={statusMutation.isPending && confirmAcao === 'REJEITADO'}
              >
                <X size={16} />
                Rejeitar
              </Button>
              <Button
                type="button"
                onClick={() => setConfirmAcao('CONVERTIDO')}
                isLoading={statusMutation.isPending && confirmAcao === 'CONVERTIDO'}
              >
                <Check size={16} />
                Aprovar
              </Button>
            </>
          )}
        </div>
      </form>

      <Modal
        open={!!confirmAcao}
        onClose={() => setConfirmAcao(null)}
        title={confirmAcao === 'CONVERTIDO' ? 'Aprovar orçamento' : 'Rejeitar orçamento'}
      >
        <p className="text-sm text-gray-600 mb-5">
          {confirmAcao === 'CONVERTIDO' ? (
            <>
              Isso vai gerar um <span className="font-semibold text-gray-900">Pedido de verdade</span> com os itens que
              estão na lista agora. Não é possível desfazer.
            </>
          ) : (
            <>
              O orçamento fica marcado como <span className="font-semibold text-gray-900">rejeitado</span> e não pode mais
              ser editado. Não é possível desfazer.
            </>
          )}
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setConfirmAcao(null)}
            disabled={statusMutation.isPending}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-60"
          >
            Cancelar
          </button>
          <Button
            type="button"
            variant={confirmAcao === 'REJEITADO' ? 'danger' : 'primary'}
            onClick={confirmarAcao}
            isLoading={statusMutation.isPending}
          >
            Confirmar
          </Button>
        </div>
      </Modal>
    </div>
  )
}

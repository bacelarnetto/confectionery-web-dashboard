import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Trash2, AlertCircle } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import Button from '../../../components/ui/Button'
import { useCreateEntradaProduto } from '../hooks/useEntradasProduto'
import { useProdutos } from '../hooks/useProdutos'
import { useFornecedores } from '../../compras/hooks/useFornecedores'
import { parseApiError } from '../../../lib/apiError'
import { formatCurrency } from '../../../lib/format'

/**
 * O backend não estrutura erro por campo — só embute "(produtoId=X)" na frase (ver
 * EntradaProdutoService.kt) pra quantidade inválida, ou o padrão já conhecido de
 * NoSuchElementException pra produto inexistente. Mesmo critério já usado em
 * PedidoFormPage/EntradaInsumoFormPage: só mapeia os textos exatos que o backend usa hoje.
 */
function extrairProdutoIdDoErro(mensagem: string): number | null {
  const porQuantidade = mensagem.match(/produtoId=(\d+)/)
  if (porQuantidade) return Number(porQuantidade[1])
  const porNaoEncontrado = mensagem.match(/Produto[a-zA-Zçã]* não encontrad[oa] com o ID (\d+)/)
  return porNaoEncontrado ? Number(porNaoEncontrado[1]) : null
}

interface ItemForm {
  produtoId: string
  quantidade: string
  valorCustoUnitario: string
  dataValidade: string
  dataFabricacao: string
}

interface FormState {
  fornecedorId: string
  dataRecebimento: string
  observacao: string
}

const emptyForm: FormState = { fornecedorId: '', dataRecebimento: '', observacao: '' }
const emptyItem: ItemForm = { produtoId: '', quantidade: '1', valorCustoUnitario: '', dataValidade: '', dataFabricacao: '' }

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

export default function EntradaProdutoFormPage() {
  const navigate = useNavigate()
  const { data: produtosData } = useProdutos(0, 200)
  const { data: fornecedoresData } = useFornecedores(0, 100)
  const createMutation = useCreateEntradaProduto()

  const [form, setForm] = useState<FormState>(emptyForm)
  const [itens, setItens] = useState<ItemForm[]>([{ ...emptyItem }])
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [itemErroIndex, setItemErroIndex] = useState<number | null>(null)

  const produtos = produtosData?.content ?? []
  const fornecedores = fornecedoresData?.content ?? []

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
      .filter((it) => it.produtoId && it.quantidade && it.valorCustoUnitario)
      .map((it) => ({
        produtoId: Number(it.produtoId),
        quantidade: Number(it.quantidade),
        valorCustoUnitario: Number(it.valorCustoUnitario),
        dataValidade: it.dataValidade ? new Date(`${it.dataValidade}T00:00:00`).toISOString() : undefined,
        dataFabricacao: it.dataFabricacao ? new Date(`${it.dataFabricacao}T00:00:00`).toISOString() : undefined,
      }))
  }

  function tratarErro(err: unknown) {
    const { status, mensagem } = parseApiError(err)
    if (status && status >= 500) return // 5xx/rede: toast genérico já cobre

    const produtoIdInvalido = extrairProdutoIdDoErro(mensagem)
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
    createMutation.mutate(
      {
        fornecedorId: form.fornecedorId ? Number(form.fornecedorId) : undefined,
        dataRecebimento: form.dataRecebimento ? new Date(`${form.dataRecebimento}T00:00:00`).toISOString() : undefined,
        observacao: form.observacao || undefined,
        itens: buildItens(),
        createdBy: 'netto',
      },
      { onSuccess: () => navigate('/estoque-produtos/entradas'), onError: tratarErro },
    )
  }

  const isPending = createMutation.isPending

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Nova Entrada de Produto"
        subtitle="Produto terceirizado ou comprado pronto — entra direto no estoque, sem passar pela Fabricação"
      />

      {erroGeral && (
        <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <p>{erroGeral}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Dados da Entrada</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Fornecedor">
              <select name="fornecedorId" value={form.fornecedorId} onChange={handleChange} className={inputClass}>
                <option value="">— sem fornecedor —</option>
                {fornecedores.map((f) => (
                  <option key={f.id} value={f.id}>{f.nome}</option>
                ))}
              </select>
            </Field>

            <Field label="Data de Recebimento">
              <input
                name="dataRecebimento"
                type="date"
                value={form.dataRecebimento}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>

            <div className="md:col-span-2">
              <Field label="Observação">
                <textarea
                  name="observacao"
                  rows={2}
                  value={form.observacao}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Ex: comprado pronto do fornecedor X, entregue direto na loja"
                />
              </Field>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Itens da Entrada</h3>
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
            {itens.map((item, index) => {
              const total = (Number(item.quantidade) || 0) * (Number(item.valorCustoUnitario) || 0)
              return (
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
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="col-span-2 md:col-span-1">
                      <Field label="Produto" required>
                        <select
                          value={item.produtoId}
                          onChange={(e) => handleItemChange(index, 'produtoId', e.target.value)}
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
                        step="0.01"
                        min="0.01"
                        value={item.quantidade}
                        onChange={(e) => handleItemChange(index, 'quantidade', e.target.value)}
                        required
                        className={inputClass}
                        placeholder="1"
                      />
                    </Field>
                    <Field label="Custo Unit. (R$)" required>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.valorCustoUnitario}
                        onChange={(e) => handleItemChange(index, 'valorCustoUnitario', e.target.value)}
                        required
                        className={inputClass}
                        placeholder="0.00"
                      />
                    </Field>
                    <Field label="Data de Fabricação">
                      <input
                        type="date"
                        value={item.dataFabricacao}
                        onChange={(e) => handleItemChange(index, 'dataFabricacao', e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Data de Validade">
                      <input
                        type="date"
                        value={item.dataValidade}
                        onChange={(e) => handleItemChange(index, 'dataValidade', e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Custo Total">
                      <input
                        type="text"
                        readOnly
                        value={formatCurrency(total)}
                        className={inputClass + ' bg-gray-50 text-gray-500'}
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
            onClick={() => navigate('/estoque-produtos/entradas')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <Button type="submit" isLoading={isPending}>
            Registrar entrada
          </Button>
        </div>
      </form>
    </div>
  )
}

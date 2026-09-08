import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router'
import { Plus, Trash2, AlertCircle } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import Button from '../../../components/ui/Button'
import { useEntradaInsumo, useCreateEntradaInsumo, useUpdateEntradaInsumo } from '../hooks/useEntradasInsumo'
import { useInsumos } from '../hooks/useInsumos'
import { ItemEntradaInsumo } from '../types/entradaInsumo'
import { Insumo } from '../types/insumo'
import { parseApiError } from '../../../lib/apiError'

type CampoItem = 'quantidade' | 'dataValidade' | 'lote'

/**
 * O backend não devolve erro estruturado por campo — só uma frase livre com "(insumoId=X)"
 * embutido (ver EntradaInsumoService.kt). Mapeamos essa frase pro item/campo certo com base
 * nos 3 textos exatos que o backend usa hoje; qualquer mensagem fora desse padrão vira o
 * banner genérico em vez de arriscar um mapeamento errado.
 */
function mapearErroParaItem(mensagem: string): { insumoId: number; campo: CampoItem } | null {
  const match = mensagem.match(/insumoId=(\d+)/)
  if (!match) return null
  const insumoId = Number(match[1])
  if (mensagem.includes('Quantidade')) return { insumoId, campo: 'quantidade' }
  if (mensagem.includes('Data de validade')) return { insumoId, campo: 'dataValidade' }
  if (mensagem.includes('Lote')) return { insumoId, campo: 'lote' }
  return null
}

interface FormState {
  compraId: string
  usuarioId: string
  valorTotal: string
  valorFrete: string
  numeroNotaFiscal: string
  valorImposto: string
}

const emptyForm: FormState = {
  compraId: '',
  usuarioId: '1',
  valorTotal: '',
  valorFrete: '',
  numeroNotaFiscal: '',
  valorImposto: '',
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
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

export default function EntradaInsumoFormPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const numericId = Number(id ?? 0)
  const prefilledCompraId = (location.state as { compraId?: number } | null)?.compraId

  const { data: entrada, isLoading } = useEntradaInsumo(numericId)
  const { data: insumosData } = useInsumos(0, 100)
  const createMutation = useCreateEntradaInsumo()
  const updateMutation = useUpdateEntradaInsumo()

  const [form, setForm] = useState<FormState>({
    ...emptyForm,
    compraId: prefilledCompraId ? String(prefilledCompraId) : '',
  })
  const [itens, setItens] = useState<Omit<ItemEntradaInsumo, 'id' | 'createdBy' | 'updatedBy'>[]>([])
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [itemErros, setItemErros] = useState<Record<number, { campo: CampoItem; mensagem: string }>>({})

  useEffect(() => {
    if (entrada) {
      setForm({
        compraId: entrada.compraId != null ? String(entrada.compraId) : '',
        usuarioId: entrada.usuarioId != null ? String(entrada.usuarioId) : '1',
        valorTotal: entrada.valorTotal != null ? String(entrada.valorTotal) : '',
        valorFrete: entrada.valorFrete != null ? String(entrada.valorFrete) : '',
        numeroNotaFiscal: entrada.numeroNotaFiscal != null ? String(entrada.numeroNotaFiscal) : '',
        valorImposto: entrada.valorImposto != null ? String(entrada.valorImposto) : '',
      })
      setItens(
        entrada.itens.map((i) => ({
          insumoId: i.insumoId,
          quantidade: i.quantidade,
          lote: i.lote,
          dataValidade: i.dataValidade,
          dataFabricacao: i.dataFabricacao,
          valorCustoUnitario: i.valorCustoUnitario,
          valorCustoTotal: i.valorCustoTotal,
        }))
      )
    }
  }, [entrada])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function addItem() {
    setItens((prev) => [
      ...prev,
      {
        insumoId: 0,
        quantidade: 0,
        lote: '',
        dataValidade: '',
        dataFabricacao: '',
        valorCustoUnitario: 0,
        valorCustoTotal: 0,
      },
    ])
  }

  function removeItem(index: number) {
    setItens((prev) => prev.filter((_, i) => i !== index))
  }

  function updateItem(index: number, field: string, value: string | number) {
    setItens((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      if (field === 'quantidade' || field === 'valorCustoUnitario') {
        const qtd = field === 'quantidade' ? Number(value) : updated[index].quantidade
        const val = field === 'valorCustoUnitario' ? Number(value) : updated[index].valorCustoUnitario
        updated[index].valorCustoTotal = qtd * val
      }
      return updated
    })
    setItemErros((prev) => {
      if (!(index in prev)) return prev
      const { [index]: _removed, ...rest } = prev
      return rest
    })
  }

  function tratarErro(err: unknown) {
    const { status, mensagem } = parseApiError(err)
    if (status && status >= 500) {
      // 5xx/rede: nada pra "explicar" no formulário, mantém o alerta genérico
      return
    }
    const mapeado = mapearErroParaItem(mensagem)
    if (mapeado) {
      const index = itens.findIndex((it) => it.insumoId === mapeado.insumoId)
      if (index >= 0) {
        setItemErros((prev) => ({ ...prev, [index]: { campo: mapeado.campo, mensagem } }))
        return
      }
    }
    setErroGeral(mensagem)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErroGeral(null)
    setItemErros({})

    const optional = {
      compraId: form.compraId ? Number(form.compraId) : undefined,
      valorFrete: form.valorFrete ? Number(form.valorFrete) : undefined,
      numeroNotaFiscal: form.numeroNotaFiscal ? Number(form.numeroNotaFiscal) : undefined,
      valorImposto: form.valorImposto ? Number(form.valorImposto) : undefined,
    }

    if (isEditing) {
      updateMutation.mutate(
        {
          id: numericId,
          data: {
            usuarioId: Number(form.usuarioId),
            valorTotal: Number(form.valorTotal),
            ...optional,
            updatedBy: 'netto',
            itens: entrada?.itens.map((item, index) => ({
              ...item,
              ...itens[index],
            })) ?? itens,
          },
        },
        { onSuccess: () => navigate('/estoque-insumos/entradas'), onError: tratarErro },
      )
    } else {
      createMutation.mutate(
        {
          usuarioId: Number(form.usuarioId),
          valorTotal: Number(form.valorTotal),
          ...optional,
          createdBy: 'netto',
          itens,
        },
        { onSuccess: () => navigate('/estoque-insumos/entradas'), onError: tratarErro },
      )
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending
  const insumos = insumosData?.content ?? []

  function getInsumo(insumoId: number): Insumo | undefined {
    return insumos.find((i) => i.id === insumoId)
  }

  if (isEditing && isLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Carregando...
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <PageHeader
        title={isEditing ? 'Editar Entrada' : 'Nova Entrada'}
        subtitle={isEditing ? 'Atualize os dados da entrada' : 'Cadastre uma nova entrada de insumo'}
      />

      {erroGeral && (
        <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <p>{erroGeral}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Field label="Compra ID">
              <input
                name="compraId"
                type="number"
                value={form.compraId}
                onChange={handleChange}
                className={inputClass}
                placeholder="ID da compra"
              />
            </Field>

            <Field label="Usuário ID" required>
              <input
                name="usuarioId"
                type="number"
                value={form.usuarioId}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </Field>

            <Field label="Valor Total" required>
              <input
                name="valorTotal"
                type="number"
                step="0.01"
                value={form.valorTotal}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="0,00"
              />
            </Field>

            <Field label="Valor Frete">
              <input
                name="valorFrete"
                type="number"
                step="0.01"
                value={form.valorFrete}
                onChange={handleChange}
                className={inputClass}
                placeholder="0,00"
              />
            </Field>

            <Field label="NF">
              <input
                name="numeroNotaFiscal"
                type="number"
                value={form.numeroNotaFiscal}
                onChange={handleChange}
                className={inputClass}
                placeholder="Número da NF"
              />
            </Field>

            <Field label="Valor Imposto">
              <input
                name="valorImposto"
                type="number"
                step="0.01"
                value={form.valorImposto}
                onChange={handleChange}
                className={inputClass}
                placeholder="0,00"
              />
            </Field>
          </div>

          <div className="border-t border-gray-200 pt-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900">Itens</h3>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-amber-600 hover:text-amber-700"
              >
                <Plus size={16} />
                Adicionar item
              </button>
            </div>

            {itens.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                Nenhum item adicionado. Clique em "Adicionar item".
              </p>
            ) : (
              <div className="space-y-3">
                {itens.map((item, index) => {
                  const insumo = getInsumo(item.insumoId)
                  const perecivel = insumo?.perecivel ?? false
                  const itemErro = itemErros[index]
                  return (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-lg ${perecivel ? 'bg-amber-50 border border-amber-100' : 'bg-gray-50'}`}
                  >
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-6 gap-3">
                      <select
                        value={item.insumoId}
                        onChange={(e) => updateItem(index, 'insumoId', Number(e.target.value))}
                        className={inputClass}
                      >
                        <option value={0}>Selecione</option>
                        {insumos.map((ins) => (
                          <option key={ins.id} value={ins.id}>
                            {ins.nome}{ins.perecivel ? ' 🌡' : ''}
                          </option>
                        ))}
                      </select>
                      <div>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="Qtd *"
                          value={item.quantidade || ''}
                          onChange={(e) => updateItem(index, 'quantidade', Number(e.target.value))}
                          required
                          className={`${inputClass} ${itemErro?.campo === 'quantidade' ? 'border-red-400' : ''}`}
                        />
                        {itemErro?.campo === 'quantidade' && (
                          <p className="text-xs text-red-600 mt-1">{itemErro.mensagem}</p>
                        )}
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder={perecivel ? 'Lote *' : 'Lote'}
                          value={item.lote ?? ''}
                          onChange={(e) => updateItem(index, 'lote', e.target.value)}
                          required={perecivel}
                          className={`${inputClass} ${(perecivel && !item.lote) || itemErro?.campo === 'lote' ? 'border-red-400' : ''}`}
                        />
                        {itemErro?.campo === 'lote' && (
                          <p className="text-xs text-red-600 mt-1">{itemErro.mensagem}</p>
                        )}
                      </div>
                      <div>
                        <input
                          type="date"
                          value={item.dataValidade?.split('T')[0] || ''}
                          onChange={(e) => updateItem(index, 'dataValidade', e.target.value)}
                          required={perecivel}
                          className={`${inputClass} ${(perecivel && !item.dataValidade) || itemErro?.campo === 'dataValidade' ? 'border-red-400' : ''}`}
                          title={perecivel ? 'Data de validade obrigatória para insumos perecíveis' : undefined}
                        />
                        {itemErro?.campo === 'dataValidade' && (
                          <p className="text-xs text-red-600 mt-1">{itemErro.mensagem}</p>
                        )}
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="R$ Unit."
                        value={item.valorCustoUnitario || ''}
                        onChange={(e) => updateItem(index, 'valorCustoUnitario', Number(e.target.value))}
                        className={inputClass}
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="R$ Total"
                        value={item.valorCustoTotal || ''}
                        readOnly
                        className={`${inputClass} bg-gray-100`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-1.5 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  )
                })}
              </div>
            )}
            {itens.some((item) => getInsumo(item.insumoId)?.perecivel) && (
              <p className="text-xs text-amber-600 mt-2">
                🌡 Insumos perecíveis exigem lote e data de validade.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-5">
          <button
            type="button"
            onClick={() => navigate('/estoque-insumos/entradas')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <Button type="submit" isLoading={isPending}>
            {isEditing ? 'Salvar alterações' : 'Cadastrar entrada'}
          </Button>
        </div>
      </form>
    </div>
  )
}

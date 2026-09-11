import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Trash2 } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import Button from '../../../components/ui/Button'
import { useCreateSaidaInsumo } from '../hooks/useSaidasInsumo'
import { useInsumos } from '../hooks/useInsumos'
import { ItemSaidaInsumo } from '../types/saidaInsumo'

interface FormState {
  usuarioId: string
  tipoId: string
  produtoId: string
  valorTotal: string
}

const emptyForm: FormState = {
  usuarioId: '1',
  tipoId: '1',
  produtoId: '',
  valorTotal: '',
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

export default function SaidaInsumoFormPage() {
  const navigate = useNavigate()
  const { data: insumosData } = useInsumos(0, 100)
  const createMutation = useCreateSaidaInsumo()

  const [form, setForm] = useState<FormState>(emptyForm)
  const [itens, setItens] = useState<Omit<ItemSaidaInsumo, 'id'>[]>([])

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
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const optional = {
      produtoId: form.produtoId ? Number(form.produtoId) : undefined,
    }

    createMutation.mutate(
      {
        usuarioId: Number(form.usuarioId),
        tipoId: Number(form.tipoId),
        valorTotal: Number(form.valorTotal),
        ...optional,
        createdBy: 'netto',
        itens,
      },
      { onSuccess: () => navigate('/estoque-insumos/saidas') },
    )
  }

  const isPending = createMutation.isPending
  const insumos = insumosData?.content ?? []

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Nova Saída"
        subtitle="Cadastre uma nova saída de insumo"
        backTo="/estoque-insumos/saidas"
      />

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
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

            <Field label="Tipo ID" required>
              <input
                name="tipoId"
                type="number"
                value={form.tipoId}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="1 = produção"
              />
            </Field>

            <Field label="Produto ID">
              <input
                name="produtoId"
                type="number"
                value={form.produtoId}
                onChange={handleChange}
                className={inputClass}
                placeholder="ID do produto"
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
                {itens.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
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
                            {ins.nome}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Qtd"
                        value={item.quantidade || ''}
                        onChange={(e) => updateItem(index, 'quantidade', Number(e.target.value))}
                        className={inputClass}
                      />
                      <input
                        type="text"
                        placeholder="Lote"
                        value={item.lote || ''}
                        onChange={(e) => updateItem(index, 'lote', e.target.value)}
                        className={inputClass}
                      />
                      <input
                        type="date"
                        value={item.dataValidade?.split('T')[0] || ''}
                        onChange={(e) => updateItem(index, 'dataValidade', e.target.value)}
                        className={inputClass}
                      />
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
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-5">
          <button
            type="button"
            onClick={() => navigate('/estoque-insumos/saidas')}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            Cancelar
          </button>
          <Button type="submit" isLoading={isPending}>
            Cadastrar saída
          </Button>
        </div>
      </form>
    </div>
  )
}

import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import PageHeader from '../../../components/ui/PageHeader'
import Button from '../../../components/ui/Button'
import { useGasto, useCreateGasto, useUpdateGasto, useTiposGasto } from '../hooks/useFinanceiro'

interface FormState {
  tipoGastoId: string
  descricao: string
  valor: string
  dataCompetencia: string
  dataPagamento: string
  recorrente: boolean
  documento: string
}

const emptyForm: FormState = {
  tipoGastoId: '',
  descricao: '',
  valor: '',
  dataCompetencia: '',
  dataPagamento: '',
  recorrente: false,
  documento: '',
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
  'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500'

function dateInput(value?: string) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function GastoFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const numericId = Number(id ?? 0)

  const { data: gasto, isLoading } = useGasto(numericId)
  const { data: tiposData } = useTiposGasto(0, 1000)
  const createMutation = useCreateGasto()
  const updateMutation = useUpdateGasto()

  const tipos = tiposData?.content ?? []
  const [form, setForm] = useState<FormState>(emptyForm)

  useEffect(() => {
    if (gasto) {
      setForm({
        tipoGastoId: String(gasto.tipoGastoId ?? ''),
        descricao: gasto.descricao ?? '',
        valor: gasto.valor != null ? String(gasto.valor) : '',
        dataCompetencia: dateInput(gasto.dataCompetencia),
        dataPagamento: dateInput(gasto.dataPagamento),
        recorrente: gasto.recorrente,
        documento: gasto.documento ?? '',
      })
    }
  }, [gasto])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setForm((prev) => ({ ...prev, [e.target.name]: value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const base = {
      tipoGastoId: Number(form.tipoGastoId),
      descricao: form.descricao || undefined,
      valor: Number(form.valor),
      dataCompetencia: form.dataCompetencia || undefined,
      dataPagamento: form.dataPagamento || undefined,
      recorrente: form.recorrente,
      documento: form.documento || undefined,
    }

    if (isEditing) {
      updateMutation.mutate(
        { id: numericId, data: { ...base, updatedBy: 'netto' } },
        { onSuccess: () => navigate('/financeiro/gastos') },
      )
    } else {
      createMutation.mutate(
        { ...base, createdBy: 'netto' },
        { onSuccess: () => navigate('/financeiro/gastos') },
      )
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  if (isEditing && isLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Carregando...
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={isEditing ? 'Editar Gasto' : 'Novo Gasto'}
        subtitle={isEditing ? 'Atualize os dados do gasto' : 'Registre um novo gasto'}
      />

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Tipo de gasto" required>
              <select
                name="tipoGastoId"
                value={form.tipoGastoId}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Selecione...</option>
                {tipos.map((t) => (
                  <option key={t.id} value={t.id}>{t.nome}</option>
                ))}
              </select>
            </Field>

            <Field label="Valor (R$)" required>
              <input
                name="valor"
                type="number"
                step="0.01"
                min="0"
                value={form.valor}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="0.00"
              />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Descrição">
                <input
                  name="descricao"
                  value={form.descricao}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Ex: Aluguel do espaço, salário da auxiliar..."
                />
              </Field>
              <p className="text-xs text-gray-500 mt-1.5">
                Produto terceirizado (ex.: bolo feito por outra pessoa) e frete/Uber de busca também entram aqui como Gasto.
              </p>
            </div>

            <Field label="Data de pagamento">
              <input
                name="dataPagamento"
                type="date"
                value={form.dataPagamento}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>

            <Field label="Data de competência (opcional)">
              <input
                name="dataCompetencia"
                type="date"
                value={form.dataCompetencia}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>

            <Field label="Documento (opcional)">
              <input
                name="documento"
                value={form.documento}
                onChange={handleChange}
                className={inputClass}
                placeholder="Ex: NF 1234, recibo, boleto..."
              />
            </Field>

            <div className="flex items-center gap-3 pt-5">
              <input
                id="recorrente"
                name="recorrente"
                type="checkbox"
                checked={form.recorrente}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400"
              />
              <label htmlFor="recorrente" className="text-sm font-medium text-gray-700">
                Gasto recorrente (repete todos os meses)
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-5">
          <button
            type="button"
            onClick={() => navigate('/financeiro/gastos')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <Button type="submit" isLoading={isPending}>
            {isEditing ? 'Salvar alterações' : 'Registrar gasto'}
          </Button>
        </div>
      </form>
    </div>
  )
}
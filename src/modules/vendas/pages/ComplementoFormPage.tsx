import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import PageHeader from '../../../components/ui/PageHeader'
import Button from '../../../components/ui/Button'
import { useComplemento, useCreateComplemento, useUpdateComplemento } from '../hooks/useComplementos'

interface FormState {
  categoria: string
  nome: string
  insumoId: string
  valorCusto: string
  valorVenda: string
  descricao: string
}

const emptyForm: FormState = {
  categoria: '',
  nome: '',
  insumoId: '',
  valorCusto: '',
  valorVenda: '',
  descricao: '',
}

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

export default function ComplementoFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const numericId = Number(id ?? 0)

  const { data: complemento, isLoading } = useComplemento(numericId)
  const createMutation = useCreateComplemento()
  const updateMutation = useUpdateComplemento()

  const [form, setForm] = useState<FormState>(emptyForm)

  useEffect(() => {
    if (complemento) {
      setForm({
        categoria: complemento.categoria ?? '',
        nome: complemento.nome ?? '',
        insumoId: String(complemento.insumoId ?? ''),
        valorCusto: String(complemento.valorCusto ?? ''),
        valorVenda: String(complemento.valorVenda ?? ''),
        descricao: complemento.descricao ?? '',
      })
    }
  }, [complemento])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const payload = {
      categoria: form.categoria,
      nome: form.nome,
      insumoId: Number(form.insumoId),
      valorCusto: Number(form.valorCusto),
      valorVenda: Number(form.valorVenda),
      descricao: form.descricao || undefined,
    }
    if (isEditing) {
      updateMutation.mutate(
        { id: numericId, data: payload },
        { onSuccess: () => navigate('/vendas/complementos') },
      )
    } else {
      createMutation.mutate(payload, { onSuccess: () => navigate('/vendas/complementos') })
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  if (isEditing && isLoading) {
    return <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Carregando...</div>
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={isEditing ? 'Editar Complemento' : 'Novo Complemento'}
        subtitle={isEditing ? 'Atualize os dados do complemento' : 'Cadastre um novo complemento'}
      />

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Categoria" required>
              <input
                name="categoria"
                value={form.categoria}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="Ex: Cobertura, Recheio, Decoração..."
              />
            </Field>

            <Field label="Nome" required>
              <input
                name="nome"
                value={form.nome}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="Nome do complemento"
              />
            </Field>

            <Field label="Insumo ID" required>
              <input
                name="insumoId"
                type="number"
                min="1"
                value={form.insumoId}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="ID do insumo associado"
              />
            </Field>

            <div />

            <Field label="Valor de Custo (R$)" required>
              <input
                name="valorCusto"
                type="number"
                step="0.01"
                min="0"
                value={form.valorCusto}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="0.00"
              />
            </Field>

            <Field label="Valor de Venda (R$)" required>
              <input
                name="valorVenda"
                type="number"
                step="0.01"
                min="0"
                value={form.valorVenda}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="0.00"
              />
            </Field>
          </div>

          <Field label="Descrição">
            <textarea
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              className={inputClass + ' min-h-[80px] resize-y'}
              placeholder="Descrição do complemento..."
            />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-3 mt-5">
          <button
            type="button"
            onClick={() => navigate('/vendas/complementos')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <Button type="submit" isLoading={isPending}>
            {isEditing ? 'Salvar alterações' : 'Cadastrar complemento'}
          </Button>
        </div>
      </form>
    </div>
  )
}

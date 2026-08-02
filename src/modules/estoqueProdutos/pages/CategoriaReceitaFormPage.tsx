import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import PageHeader from '../../../components/ui/PageHeader'
import Button from '../../../components/ui/Button'
import { useCategoriaReceita, useCreateCategoriaReceita, useUpdateCategoriaReceita } from '../hooks/useCategoriasReceita'

interface FormState {
  nome: string
  descricao: string
}

const emptyForm: FormState = { nome: '', descricao: '' }

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

export default function CategoriaReceitaFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const numericId = Number(id ?? 0)

  const { data: categoria, isLoading } = useCategoriaReceita(numericId)
  const createMutation = useCreateCategoriaReceita()
  const updateMutation = useUpdateCategoriaReceita()

  const [form, setForm] = useState<FormState>(emptyForm)

  useEffect(() => {
    if (categoria) {
      setForm({ nome: categoria.nome ?? '', descricao: categoria.descricao ?? '' })
    }
  }, [categoria])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const optional = { descricao: form.descricao || undefined }
    if (isEditing) {
      updateMutation.mutate(
        { id: numericId, data: { nome: form.nome, ...optional } },
        { onSuccess: () => navigate('/estoque-produtos/categorias') },
      )
    } else {
      createMutation.mutate(
        { nome: form.nome, ...optional },
        { onSuccess: () => navigate('/estoque-produtos/categorias') },
      )
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  if (isEditing && isLoading) {
    return <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Carregando...</div>
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={isEditing ? 'Editar Categoria de Receita' : 'Nova Categoria de Receita'}
        subtitle={isEditing ? 'Atualize os dados da categoria' : 'Cadastre uma nova categoria de receita'}
      />

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <Field label="Nome" required>
            <input
              name="nome"
              value={form.nome}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="Nome da categoria"
            />
          </Field>

          <Field label="Descrição">
            <textarea
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              className={inputClass + ' min-h-[100px] resize-y'}
              placeholder="Descrição da categoria"
            />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-3 mt-5">
          <button
            type="button"
            onClick={() => navigate('/estoque-produtos/categorias')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <Button type="submit" isLoading={isPending}>
            {isEditing ? 'Salvar alterações' : 'Cadastrar categoria'}
          </Button>
        </div>
      </form>
    </div>
  )
}

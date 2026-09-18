import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import PageHeader from '../../../components/ui/PageHeader'
import Button from '../../../components/ui/Button'
import { useColaborador, useCreateColaborador, useUpdateColaborador } from '../hooks/useColaboradores'
import { maskPhone } from '../../../lib/format'

interface FormState {
  nome: string
  telefoneCelular: string
  endereco: string
  email: string
}

const emptyForm: FormState = {
  nome: '',
  telefoneCelular: '',
  endereco: '',
  email: '',
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

export default function ColaboradorFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const numericId = Number(id ?? 0)

  const { data: colaborador, isLoading } = useColaborador(numericId)
  const createMutation = useCreateColaborador()
  const updateMutation = useUpdateColaborador()

  const [form, setForm] = useState<FormState>(emptyForm)

  useEffect(() => {
    if (colaborador) {
      setForm({
        nome: colaborador.nome ?? '',
        telefoneCelular: colaborador.telefoneCelular ?? '',
        endereco: colaborador.endereco ?? '',
        email: colaborador.email ?? '',
      })
    }
  }, [colaborador])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleTelefoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, telefoneCelular: maskPhone(e.target.value) }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const base = {
      nome: form.nome,
      telefoneCelular: form.telefoneCelular,
      endereco: form.endereco || undefined,
      email: form.email || undefined,
    }

    if (isEditing) {
      updateMutation.mutate(
        { id: numericId, data: { ...base, updatedBy: '' } },
        { onSuccess: () => navigate('/vendas/colaboradores') },
      )
    } else {
      createMutation.mutate(
        { ...base, createdBy: '' },
        { onSuccess: () => navigate('/vendas/colaboradores') },
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
        title={isEditing ? 'Editar Colaborador' : 'Novo Colaborador'}
        subtitle={isEditing ? 'Atualize os dados do colaborador' : 'Cadastre um novo colaborador (atendente de eventos)'}
        backTo="/vendas/colaboradores"
      />

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <Field label="Nome" required>
                <input
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="Nome do colaborador"
                />
              </Field>
            </div>

            <Field label="Telefone Celular" required>
              <input
                name="telefoneCelular"
                value={form.telefoneCelular}
                onChange={handleTelefoneChange}
                required
                maxLength={15}
                className={inputClass}
                placeholder="(00) 00000-0000"
              />
            </Field>

            <Field label="E-mail">
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className={inputClass}
                placeholder="colaborador@exemplo.com"
              />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Endereço">
                <input
                  name="endereco"
                  value={form.endereco}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Rua, número, bairro..."
                />
              </Field>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-5">
          <button
            type="button"
            onClick={() => navigate('/vendas/colaboradores')}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            Cancelar
          </button>
          <Button type="submit" isLoading={isPending}>
            {isEditing ? 'Salvar alterações' : 'Cadastrar colaborador'}
          </Button>
        </div>
      </form>
    </div>
  )
}

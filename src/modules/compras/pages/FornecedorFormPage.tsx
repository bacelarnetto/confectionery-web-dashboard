import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import PageHeader from '../../../components/ui/PageHeader'
import Button from '../../../components/ui/Button'
import { useFornecedor, useCreateFornecedor, useUpdateFornecedor } from '../hooks/useFornecedores'

interface FormState {
  nome: string
  endereco: string
  numero: string
  bairro: string
  cep: string
  email: string
  inscricaoEstadual: string
  telefone: string
  cnpj: string
  site: string
}

const emptyForm: FormState = {
  nome: '',
  endereco: '',
  numero: '',
  bairro: '',
  cep: '',
  email: '',
  inscricaoEstadual: '',
  telefone: '',
  cnpj: '',
  site: '',
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

export default function FornecedorFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const numericId = Number(id ?? 0)

  const { data: fornecedor, isLoading } = useFornecedor(numericId)
  const createMutation = useCreateFornecedor()
  const updateMutation = useUpdateFornecedor()

  const [form, setForm] = useState<FormState>(emptyForm)

  useEffect(() => {
    if (fornecedor) {
      setForm({
        nome: fornecedor.nome ?? '',
        endereco: fornecedor.endereco ?? '',
        numero: fornecedor.numero != null ? String(fornecedor.numero) : '',
        bairro: fornecedor.bairro ?? '',
        cep: fornecedor.cep ?? '',
        email: fornecedor.email ?? '',
        inscricaoEstadual: fornecedor.inscricaoEstadual ?? '',
        telefone: fornecedor.telefone ?? '',
        cnpj: fornecedor.cnpj ?? '',
        site: fornecedor.site ?? '',
      })
    }
  }, [fornecedor])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const optional = {
      endereco: form.endereco || undefined,
      numero: form.numero ? Number(form.numero) : undefined,
      bairro: form.bairro || undefined,
      cep: form.cep || undefined,
      email: form.email || undefined,
      inscricaoEstadual: form.inscricaoEstadual || undefined,
      telefone: form.telefone || undefined,
      cnpj: form.cnpj || undefined,
      site: form.site || undefined,
    }

    if (isEditing) {
      updateMutation.mutate(
        { id: numericId, data: { nome: form.nome, ...optional, updatedBy: 'netto' } },
        { onSuccess: () => navigate('/compras/fornecedores') },
      )
    } else {
      createMutation.mutate(
        { nome: form.nome, ...optional, createdBy: 'netto' },
        { onSuccess: () => navigate('/compras/fornecedores') },
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
        title={isEditing ? 'Editar Fornecedor' : 'Novo Fornecedor'}
        subtitle={isEditing ? 'Atualize os dados do fornecedor' : 'Cadastre um novo fornecedor'}
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
                  placeholder="Nome do fornecedor"
                />
              </Field>
            </div>

            <Field label="Endereço">
              <input
                name="endereco"
                value={form.endereco}
                onChange={handleChange}
                className={inputClass}
                placeholder="Rua, avenida..."
              />
            </Field>

            <Field label="Número">
              <input
                name="numero"
                type="number"
                value={form.numero}
                onChange={handleChange}
                className={inputClass}
                placeholder="Ex: 123"
              />
            </Field>

            <Field label="Bairro">
              <input
                name="bairro"
                value={form.bairro}
                onChange={handleChange}
                className={inputClass}
                placeholder="Bairro"
              />
            </Field>

            <Field label="CEP">
              <input
                name="cep"
                value={form.cep}
                onChange={handleChange}
                className={inputClass}
                placeholder="00000-000"
              />
            </Field>

            <Field label="E-mail">
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className={inputClass}
                placeholder="contato@fornecedor.com"
              />
            </Field>

            <Field label="Telefone">
              <input
                name="telefone"
                value={form.telefone}
                onChange={handleChange}
                className={inputClass}
                placeholder="(00) 00000-0000"
              />
            </Field>

            <Field label="CNPJ">
              <input
                name="cnpj"
                value={form.cnpj}
                onChange={handleChange}
                className={inputClass}
                placeholder="00.000.000/0000-00"
              />
            </Field>

            <Field label="Inscrição Estadual">
              <input
                name="inscricaoEstadual"
                value={form.inscricaoEstadual}
                onChange={handleChange}
                className={inputClass}
                placeholder="Inscrição estadual"
              />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Site">
                <input
                  name="site"
                  value={form.site}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="https://..."
                />
              </Field>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-5">
          <button
            type="button"
            onClick={() => navigate('/compras/fornecedores')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <Button type="submit" isLoading={isPending}>
            {isEditing ? 'Salvar alterações' : 'Cadastrar fornecedor'}
          </Button>
        </div>
      </form>
    </div>
  )
}

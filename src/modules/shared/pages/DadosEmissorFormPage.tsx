import { useState, useEffect, FormEvent } from 'react'
import PageHeader from '../../../components/ui/PageHeader'
import Button from '../../../components/ui/Button'
import { useDadosEmissor, useUpdateDadosEmissor } from '../hooks/useDadosEmissor'
import { maskPhone } from '../../../lib/format'

interface FormState {
  razaoSocial: string
  nomeFantasia: string
  cnpj: string
  endereco: string
  telefone: string
  email: string
}

const emptyForm: FormState = {
  razaoSocial: '',
  nomeFantasia: '',
  cnpj: '',
  endereco: '',
  telefone: '',
  email: '',
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

export default function DadosEmissorFormPage() {
  const { data: dadosEmissor, isLoading } = useDadosEmissor()
  const updateMutation = useUpdateDadosEmissor()

  const [form, setForm] = useState<FormState>(emptyForm)

  useEffect(() => {
    if (dadosEmissor) {
      setForm({
        razaoSocial: dadosEmissor.razaoSocial ?? '',
        nomeFantasia: dadosEmissor.nomeFantasia ?? '',
        cnpj: dadosEmissor.cnpj ?? '',
        endereco: dadosEmissor.endereco ?? '',
        telefone: dadosEmissor.telefone ?? '',
        email: dadosEmissor.email ?? '',
      })
    }
  }, [dadosEmissor])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleTelefoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, telefone: maskPhone(e.target.value) }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    updateMutation.mutate({
      razaoSocial: form.razaoSocial,
      nomeFantasia: form.nomeFantasia || undefined,
      cnpj: form.cnpj || undefined,
      endereco: form.endereco || undefined,
      telefone: form.telefone || undefined,
      email: form.email || undefined,
      usuario: 'netto',
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Carregando...
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Dados da Empresa"
        subtitle="Usados na emissão de documentos, como o recibo de pagamento do pedido"
      />

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <Field label="Razão social" required>
                <input
                  name="razaoSocial"
                  value={form.razaoSocial}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="Nome legal da confeitaria"
                />
              </Field>
            </div>

            <Field label="Nome fantasia">
              <input
                name="nomeFantasia"
                value={form.nomeFantasia}
                onChange={handleChange}
                className={inputClass}
                placeholder="Nome popular/comercial"
              />
            </Field>

            <Field label="CNPJ">
              <input
                name="cnpj"
                value={form.cnpj}
                onChange={handleChange}
                className={inputClass}
                placeholder="00.000.000/0000-00 (se já tiver)"
              />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Endereço">
                <input
                  name="endereco"
                  value={form.endereco}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Rua, número, bairro, cidade..."
                />
              </Field>
            </div>

            <Field label="Telefone">
              <input
                name="telefone"
                value={form.telefone}
                onChange={handleTelefoneChange}
                className={inputClass}
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
            </Field>

            <Field label="E-mail">
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className={inputClass}
                placeholder="contato@confeitaria.com"
              />
            </Field>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-5">
          <Button type="submit" isLoading={updateMutation.isPending}>
            Salvar alterações
          </Button>
        </div>
      </form>
    </div>
  )
}

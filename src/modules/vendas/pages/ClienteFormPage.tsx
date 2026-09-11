import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Plus, Trash2 } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import Button from '../../../components/ui/Button'
import { useCliente, useCreateCliente, useUpdateCliente } from '../hooks/useClientes'
import { Endereco } from '../types/cliente'
import ClienteHistoricoPedidos from './ClienteHistoricoPedidos'
import { maskPhone } from '../../../lib/format'

interface FormState {
  nome: string
  cpf: string
  email: string
  celular: string
  telefone: string
}

const emptyForm: FormState = { nome: '', cpf: '', email: '', celular: '', telefone: '' }
const emptyEndereco: Endereco = { descricao: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', cep: '' }

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

export default function ClienteFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const numericId = Number(id ?? 0)

  const { data: cliente, isLoading } = useCliente(numericId)
  const createMutation = useCreateCliente()
  const updateMutation = useUpdateCliente()

  const [form, setForm] = useState<FormState>(emptyForm)
  const [enderecos, setEnderecos] = useState<Endereco[]>([])

  useEffect(() => {
    if (cliente) {
      setForm({
        nome: cliente.nome ?? '',
        cpf: cliente.cpf ?? '',
        email: cliente.email ?? '',
        celular: cliente.celular ?? '',
        telefone: cliente.telefone ?? '',
      })
      setEnderecos(cliente.enderecos ?? [])
    }
  }, [cliente])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: maskPhone(value) }))
  }

  function handleEnderecoChange(index: number, field: keyof Endereco, value: string) {
    setEnderecos((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  function addEndereco() {
    setEnderecos((prev) => [...prev, { ...emptyEndereco }])
  }

  function removeEndereco(index: number) {
    setEnderecos((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const optional = {
      cpf: form.cpf || undefined,
      email: form.email || undefined,
      celular: form.celular || undefined,
      telefone: form.telefone || undefined,
      enderecos: enderecos.length > 0 ? enderecos : undefined,
    }
    if (isEditing) {
      updateMutation.mutate(
        { id: numericId, data: { nome: form.nome, ...optional, updatedBy: 'netto' } },
        { onSuccess: () => navigate('/vendas/clientes') },
      )
    } else {
      createMutation.mutate(
        { nome: form.nome, ...optional, createdBy: 'netto' },
        { onSuccess: () => navigate('/vendas/clientes') },
      )
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  if (isEditing && isLoading) {
    return <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Carregando...</div>
  }

  return (
    <div className="max-w-4xl">
      <PageHeader
        title={isEditing ? 'Editar Cliente' : 'Novo Cliente'}
        subtitle={isEditing ? 'Atualize os dados do cliente' : 'Cadastre um novo cliente'}
        backTo="/vendas/clientes"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Dados Pessoais</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <Field label="Nome" required>
                <input
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="Nome completo"
                />
              </Field>
            </div>
            <Field label="CPF">
              <input name="cpf" value={form.cpf} onChange={handleChange} className={inputClass} placeholder="000.000.000-00" />
            </Field>
            <Field label="E-mail">
              <input name="email" type="email" value={form.email} onChange={handleChange} className={inputClass} placeholder="email@exemplo.com" />
            </Field>
            <Field label="Celular">
              <input name="celular" value={form.celular} onChange={handlePhoneChange} className={inputClass} placeholder="(11) 99999-9999" maxLength={15} />
            </Field>
            <Field label="Telefone">
              <input name="telefone" value={form.telefone} onChange={handlePhoneChange} className={inputClass} placeholder="(11) 3333-3333" maxLength={15} />
            </Field>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Endereços</h3>
            <button
              type="button"
              onClick={addEndereco}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
            >
              <Plus size={14} />
              Adicionar
            </button>
          </div>

          {enderecos.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">Nenhum endereço cadastrado.</p>
          )}

          {enderecos.map((end, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600">Endereço {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeEndereco(index)}
                  className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="col-span-2 md:col-span-3">
                  <Field label="Descrição (ex: Casa, Trabalho)">
                    <input
                      value={end.descricao ?? ''}
                      onChange={(e) => handleEnderecoChange(index, 'descricao', e.target.value)}
                      className={inputClass}
                      placeholder="Identificação do endereço"
                    />
                  </Field>
                </div>
                <div className="col-span-2">
                  <Field label="Logradouro">
                    <input value={end.logradouro ?? ''} onChange={(e) => handleEnderecoChange(index, 'logradouro', e.target.value)} className={inputClass} placeholder="Rua, Avenida..." />
                  </Field>
                </div>
                <Field label="Número">
                  <input value={end.numero ?? ''} onChange={(e) => handleEnderecoChange(index, 'numero', e.target.value)} className={inputClass} placeholder="123" />
                </Field>
                <Field label="Complemento">
                  <input value={end.complemento ?? ''} onChange={(e) => handleEnderecoChange(index, 'complemento', e.target.value)} className={inputClass} placeholder="Apto, Bloco..." />
                </Field>
                <Field label="Bairro">
                  <input value={end.bairro ?? ''} onChange={(e) => handleEnderecoChange(index, 'bairro', e.target.value)} className={inputClass} placeholder="Bairro" />
                </Field>
                <Field label="Cidade">
                  <input value={end.cidade ?? ''} onChange={(e) => handleEnderecoChange(index, 'cidade', e.target.value)} className={inputClass} placeholder="Cidade" />
                </Field>
                <Field label="UF">
                  <input value={end.uf ?? ''} onChange={(e) => handleEnderecoChange(index, 'uf', e.target.value)} className={inputClass} placeholder="SP" maxLength={2} />
                </Field>
                <Field label="CEP">
                  <input value={end.cep ?? ''} onChange={(e) => handleEnderecoChange(index, 'cep', e.target.value)} className={inputClass} placeholder="00000-000" />
                </Field>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/vendas/clientes')}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            Cancelar
          </button>
          <Button type="submit" isLoading={isPending}>
            {isEditing ? 'Salvar alterações' : 'Cadastrar cliente'}
          </Button>
        </div>
      </form>

      {isEditing && (
        <div className="mt-6">
          <ClienteHistoricoPedidos clienteId={numericId} />
        </div>
      )}
    </div>
  )
}

import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import PageHeader from '../../../components/ui/PageHeader'
import Button from '../../../components/ui/Button'
import { useItemApoio, useCreateItemApoio, useUpdateItemApoio } from '../hooks/useItensApoio'
import { ITEM_APOIO_TIPOS, ITEM_APOIO_TIPO_LABELS, ItemApoioTipo } from '../types/itemApoio'

interface FormState {
  nome: string
  tipo: ItemApoioTipo
  valorHora: string
  quantidade: string
  valorHoraMaoDeObra: string
}

const emptyForm: FormState = {
  nome: '',
  tipo: 'CARRINHO',
  valorHora: '',
  quantidade: '',
  valorHoraMaoDeObra: '',
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

export default function ItemApoioFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const numericId = Number(id ?? 0)

  const { data: itemApoio, isLoading } = useItemApoio(numericId)
  const createMutation = useCreateItemApoio()
  const updateMutation = useUpdateItemApoio()

  const [form, setForm] = useState<FormState>(emptyForm)

  useEffect(() => {
    if (itemApoio) {
      setForm({
        nome: itemApoio.nome ?? '',
        tipo: itemApoio.tipo,
        valorHora: itemApoio.valorHora != null ? String(itemApoio.valorHora) : '',
        quantidade: itemApoio.quantidade != null ? String(itemApoio.quantidade) : '',
        valorHoraMaoDeObra: itemApoio.valorHoraMaoDeObra != null ? String(itemApoio.valorHoraMaoDeObra) : '',
      })
    }
  }, [itemApoio])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const base = {
      nome: form.nome,
      tipo: form.tipo,
      valorHora: Number(form.valorHora),
      quantidade: Number(form.quantidade),
      valorHoraMaoDeObra: form.valorHoraMaoDeObra ? Number(form.valorHoraMaoDeObra) : null,
    }

    if (isEditing) {
      updateMutation.mutate(
        { id: numericId, data: { ...base, updatedBy: '' } },
        { onSuccess: () => navigate('/vendas/itens-apoio') },
      )
    } else {
      createMutation.mutate(
        { ...base, createdBy: '' },
        { onSuccess: () => navigate('/vendas/itens-apoio') },
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
        title={isEditing ? 'Editar Item de Apoio' : 'Novo Item de Apoio'}
        subtitle={isEditing ? 'Atualize os dados do item de apoio' : 'Cadastre um novo item de apoio (equipamento alugável)'}
        backTo="/vendas/itens-apoio"
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
                  placeholder="Ex: Carrinho de Doces, Tacho de Cobre..."
                />
              </Field>
            </div>

            <Field label="Tipo" required>
              <select
                name="tipo"
                value={form.tipo}
                onChange={handleChange}
                required
                className={inputClass}
              >
                {ITEM_APOIO_TIPOS.map((t) => (
                  <option key={t} value={t}>{ITEM_APOIO_TIPO_LABELS[t]}</option>
                ))}
              </select>
            </Field>

            <Field label="Valor por Hora (R$)" required>
              <input
                name="valorHora"
                type="number"
                step="0.01"
                min="0.01"
                value={form.valorHora}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="0,00"
              />
            </Field>

            <Field label="Quantidade (frota)" required>
              <input
                name="quantidade"
                type="number"
                step="1"
                min="1"
                value={form.quantidade}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="Ex: 2"
              />
            </Field>

            <Field label="Valor Hora Mão de Obra (R$)">
              <input
                name="valorHoraMaoDeObra"
                type="number"
                step="0.01"
                min="0.01"
                value={form.valorHoraMaoDeObra}
                onChange={handleChange}
                className={inputClass}
                placeholder="Opcional — deixe em branco se não oferece atendente"
              />
            </Field>
          </div>
          <p className="text-xs text-gray-500">
            A quantidade define quantas unidades desse item existem — a disponibilidade de cada Apoio de Festa é
            controlada por dia inteiro, com base nessa frota.
          </p>
          <p className="text-xs text-gray-500">
            Preencha o Valor Hora Mão de Obra só se esse item oferece um atendente que acompanha/entrega o
            equipamento durante o evento — é uma tarifa extra, cobrada por hora, opcional por Apoio de Festa.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 mt-5">
          <button
            type="button"
            onClick={() => navigate('/vendas/itens-apoio')}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            Cancelar
          </button>
          <Button type="submit" isLoading={isPending}>
            {isEditing ? 'Salvar alterações' : 'Cadastrar item de apoio'}
          </Button>
        </div>
      </form>
    </div>
  )
}

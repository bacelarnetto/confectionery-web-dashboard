import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import PageHeader from '../../../components/ui/PageHeader'
import Button from '../../../components/ui/Button'
import { useFormaPagamento, useCreateFormaPagamento, useUpdateFormaPagamento } from '../hooks/useFormasPagamento'

const inputClass =
  'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent placeholder:text-gray-400'

export default function FormaPagamentoFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const numericId = Number(id ?? 0)

  const { data: formaPagamento, isLoading } = useFormaPagamento(numericId)
  const createMutation = useCreateFormaPagamento()
  const updateMutation = useUpdateFormaPagamento()

  const [nome, setNome] = useState('')

  useEffect(() => {
    if (formaPagamento) setNome(formaPagamento.nome ?? '')
  }, [formaPagamento])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (isEditing) {
      updateMutation.mutate(
        { id: numericId, data: { nome, updatedBy: 'netto' } },
        { onSuccess: () => navigate('/vendas/formas-pagamento') },
      )
    } else {
      createMutation.mutate(
        { nome, createdBy: 'netto' },
        { onSuccess: () => navigate('/vendas/formas-pagamento') },
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
        title={isEditing ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento'}
        subtitle={isEditing ? 'Atualize o nome da forma de pagamento' : 'Cadastre uma nova forma de pagamento'}
        backTo="/vendas/formas-pagamento"
      />

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome <span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              name="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className={inputClass}
              placeholder="Ex: Pix, Cartão de crédito, Dinheiro..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-5">
          <button
            type="button"
            onClick={() => navigate('/vendas/formas-pagamento')}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            Cancelar
          </button>
          <Button type="submit" isLoading={isPending}>
            {isEditing ? 'Salvar alterações' : 'Cadastrar forma de pagamento'}
          </Button>
        </div>
      </form>
    </div>
  )
}

import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router'
import PageHeader from '../../../components/ui/PageHeader'
import Button from '../../../components/ui/Button'
import { useCreateFabricacao } from '../hooks/useFabricacoes'
import { useReceitas } from '../hooks/useReceitas'

interface FormState {
  receitaId: string
  quantidade: string
  observacao: string
  dataFabricacao: string
  dataValidade: string
}

const emptyForm: FormState = {
  receitaId: '',
  quantidade: '',
  observacao: '',
  dataFabricacao: '',
  dataValidade: '',
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

export default function FabricacaoFormPage() {
  const navigate = useNavigate()
  const createMutation = useCreateFabricacao()
  const { data: receitasData } = useReceitas(0, 100)

  const [form, setForm] = useState<FormState>(emptyForm)

  const receitas = receitasData?.content ?? []

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    createMutation.mutate(
      {
        receitaId: Number(form.receitaId),
        quantidade: Number(form.quantidade),
        observacao: form.observacao || undefined,
        dataFabricacao: form.dataFabricacao || undefined,
        dataValidade: form.dataValidade || undefined,
        createdBy: 'netto',
      },
      { onSuccess: () => navigate('/estoque-produtos/fabricacoes') },
    )
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Nova Fabricação"
        subtitle="Registre uma fabricação de produto — os insumos serão debitados automaticamente"
      />

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Receita" required>
              <select
                name="receitaId"
                value={form.receitaId}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Selecione uma receita...</option>
                {receitas.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nome}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Quantidade" required>
              <input
                name="quantidade"
                type="number"
                min="1"
                value={form.quantidade}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="Unidades fabricadas"
              />
            </Field>

            <Field label="Data de Fabricação">
              <input
                name="dataFabricacao"
                type="date"
                value={form.dataFabricacao}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>

            <Field label="Data de Validade">
              <input
                name="dataValidade"
                type="date"
                value={form.dataValidade}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Observação">
            <textarea
              name="observacao"
              value={form.observacao}
              onChange={handleChange}
              className={inputClass + ' min-h-[80px] resize-y'}
              placeholder="Observações sobre a fabricação..."
            />
          </Field>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            Ao registrar a fabricação, os insumos da receita serão debitados do estoque automaticamente (FIFO),
            e o produto será creditado no estoque.
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-5">
          <button
            type="button"
            onClick={() => navigate('/estoque-produtos/fabricacoes')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <Button type="submit" isLoading={createMutation.isPending}>
            Registrar fabricação
          </Button>
        </div>
      </form>
    </div>
  )
}

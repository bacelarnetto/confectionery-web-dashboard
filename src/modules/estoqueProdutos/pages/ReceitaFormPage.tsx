import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Plus, Trash2 } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import Button from '../../../components/ui/Button'
import { useReceita, useCreateReceita, useUpdateReceita } from '../hooks/useReceitas'
import { useCategoriasReceita } from '../hooks/useCategoriasReceita'
import { useProdutos } from '../hooks/useProdutos'
import { Ingrediente } from '../types/receita'

interface FormState {
  nome: string
  categoriaReceitaId: string
  produtoId: string
  modoPreparo: string
  tempoPreparo: string
}

const emptyForm: FormState = {
  nome: '',
  categoriaReceitaId: '',
  produtoId: '',
  modoPreparo: '',
  tempoPreparo: '',
}

const emptyIngrediente: Ingrediente = { insumoId: 0, quantidade: 0, observacao: '' }

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

export default function ReceitaFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const numericId = Number(id ?? 0)

  const { data: receita, isLoading } = useReceita(numericId)
  const { data: categoriasData } = useCategoriasReceita(0, 100)
  const { data: produtosData } = useProdutos(0, 100)
  const createMutation = useCreateReceita()
  const updateMutation = useUpdateReceita()

  const [form, setForm] = useState<FormState>(emptyForm)
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([{ ...emptyIngrediente }])

  useEffect(() => {
    if (receita) {
      setForm({
        nome: receita.nome ?? '',
        categoriaReceitaId: String(receita.categoriaReceitaId ?? ''),
        produtoId: String(receita.produtoId ?? ''),
        modoPreparo: receita.modoPreparo ?? '',
        tempoPreparo: receita.tempoPreparo ?? '',
      })
      setIngredientes(receita.ingredientes?.length ? receita.ingredientes : [{ ...emptyIngrediente }])
    }
  }, [receita])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleIngredienteChange(index: number, field: keyof Ingrediente, value: string) {
    setIngredientes((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        [field]: field === 'observacao' ? value : Number(value),
      }
      return updated
    })
  }

  function addIngrediente() {
    setIngredientes((prev) => [...prev, { ...emptyIngrediente }])
  }

  function removeIngrediente(index: number) {
    setIngredientes((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const validIngredientes = ingredientes.filter((ing) => ing.insumoId > 0 && ing.quantidade > 0)

    if (isEditing) {
      updateMutation.mutate(
        {
          id: numericId,
          data: {
            nome: form.nome,
            categoriaReceitaId: Number(form.categoriaReceitaId),
            modoPreparo: form.modoPreparo || undefined,
            tempoPreparo: form.tempoPreparo || undefined,
            ingredientes: validIngredientes,
            updatedBy: 'netto',
          },
        },
        { onSuccess: () => navigate('/estoque-produtos/receitas') },
      )
    } else {
      createMutation.mutate(
        {
          nome: form.nome,
          categoriaReceitaId: Number(form.categoriaReceitaId),
          produtoId: Number(form.produtoId),
          modoPreparo: form.modoPreparo || undefined,
          tempoPreparo: form.tempoPreparo || undefined,
          ingredientes: validIngredientes,
          createdBy: 'netto',
        },
        { onSuccess: () => navigate('/estoque-produtos/receitas') },
      )
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending
  const categorias = categoriasData?.content ?? []
  const produtos = produtosData?.content ?? []

  if (isEditing && isLoading) {
    return <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Carregando...</div>
  }

  return (
    <div className="max-w-4xl">
      <PageHeader
        title={isEditing ? 'Editar Receita' : 'Nova Receita'}
        subtitle={isEditing ? 'Atualize os dados da receita' : 'Cadastre uma nova receita'}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Dados da Receita</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Nome" required>
              <input
                name="nome"
                value={form.nome}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="Nome da receita"
              />
            </Field>

            <Field label="Produto" required>
              <select
                name="produtoId"
                value={form.produtoId}
                onChange={handleChange}
                required
                disabled={isEditing}
                className={inputClass + (isEditing ? ' bg-gray-50 text-gray-500' : '')}
              >
                <option value="">Selecione um produto...</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Categoria" required>
              <select
                name="categoriaReceitaId"
                value={form.categoriaReceitaId}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Selecione uma categoria...</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Tempo de Preparo">
              <input
                name="tempoPreparo"
                value={form.tempoPreparo}
                onChange={handleChange}
                className={inputClass}
                placeholder="Ex: 45 minutos"
              />
            </Field>
          </div>

          <Field label="Modo de Preparo">
            <textarea
              name="modoPreparo"
              value={form.modoPreparo}
              onChange={handleChange}
              className={inputClass + ' min-h-[100px] resize-y'}
              placeholder="Descreva o modo de preparo..."
            />
          </Field>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Ingredientes</h3>
            <button
              type="button"
              onClick={addIngrediente}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
            >
              <Plus size={14} />
              Adicionar
            </button>
          </div>

          <div className="space-y-3">
            {ingredientes.map((ing, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-4">
                  {index === 0 && (
                    <label className="block text-xs font-medium text-gray-500 mb-1">Insumo ID *</label>
                  )}
                  <input
                    type="number"
                    min="1"
                    value={ing.insumoId || ''}
                    onChange={(e) => handleIngredienteChange(index, 'insumoId', e.target.value)}
                    className={inputClass}
                    placeholder="ID do insumo"
                  />
                </div>
                <div className="col-span-3">
                  {index === 0 && (
                    <label className="block text-xs font-medium text-gray-500 mb-1">Quantidade *</label>
                  )}
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={ing.quantidade || ''}
                    onChange={(e) => handleIngredienteChange(index, 'quantidade', e.target.value)}
                    className={inputClass}
                    placeholder="0.000"
                  />
                </div>
                <div className="col-span-4">
                  {index === 0 && (
                    <label className="block text-xs font-medium text-gray-500 mb-1">Observação</label>
                  )}
                  <input
                    type="text"
                    value={ing.observacao ?? ''}
                    onChange={(e) => handleIngredienteChange(index, 'observacao', e.target.value)}
                    className={inputClass}
                    placeholder="Opcional..."
                  />
                </div>
                <div className="col-span-1 flex justify-end">
                  {ingredientes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngrediente(index)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/estoque-produtos/receitas')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <Button type="submit" isLoading={isPending}>
            {isEditing ? 'Salvar alterações' : 'Cadastrar receita'}
          </Button>
        </div>
      </form>
    </div>
  )
}

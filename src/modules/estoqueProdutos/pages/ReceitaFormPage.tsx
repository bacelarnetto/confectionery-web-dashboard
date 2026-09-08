import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Plus, Trash2 } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import Button from '../../../components/ui/Button'
import RadioToggle from '../../../components/ui/RadioToggle'
import { useReceita, useReceitas, useCreateReceita, useUpdateReceita } from '../hooks/useReceitas'
import { useProdutos, useProduto } from '../hooks/useProdutos'
import { useCategoriasProduto } from '../hooks/useCategoriasProduto'
import { Ingrediente, ProdutoRefForm } from '../types/receita'

interface FormState {
  modoPreparo: string
  tempoPreparo: string
}

interface NovoProdutoState {
  nome: string
  descricao: string
}

interface NovaCategoriaState {
  nome: string
  descricao: string
}

const emptyForm: FormState = {
  modoPreparo: '',
  tempoPreparo: '',
}

const emptyNovoProduto: NovoProdutoState = { nome: '', descricao: '' }
const emptyNovaCategoria: NovaCategoriaState = { nome: '', descricao: '' }
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
  const { data: produtoAtual } = useProduto(receita?.produtoId ?? 0)
  const { data: produtosData } = useProdutos(0, 100)
  const { data: categoriasData } = useCategoriasProduto(0, 100)
  const { data: receitasData } = useReceitas(0, 100)
  const createMutation = useCreateReceita()
  const updateMutation = useUpdateReceita()

  const [form, setForm] = useState<FormState>(emptyForm)
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([{ ...emptyIngrediente }])

  const [produtoMode, setProdutoMode] = useState<'existente' | 'novo'>('existente')
  const [produtoId, setProdutoId] = useState('')
  const [novoProduto, setNovoProduto] = useState<NovoProdutoState>(emptyNovoProduto)
  const [categoriaMode, setCategoriaMode] = useState<'existente' | 'novo'>('existente')
  const [categoriaProdutoId, setCategoriaProdutoId] = useState('')
  const [novaCategoria, setNovaCategoria] = useState<NovaCategoriaState>(emptyNovaCategoria)

  useEffect(() => {
    if (receita) {
      setForm({
        modoPreparo: receita.modoPreparo ?? '',
        tempoPreparo: receita.tempoPreparo ?? '',
      })
      setIngredientes(receita.ingredientes?.length ? receita.ingredientes : [{ ...emptyIngrediente }])
    }
  }, [receita])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
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
            modoPreparo: form.modoPreparo || undefined,
            tempoPreparo: form.tempoPreparo || undefined,
            ingredientes: validIngredientes,
            updatedBy: 'netto',
          },
        },
        { onSuccess: () => navigate('/estoque-produtos/receitas') },
      )
    } else {
      const produto: ProdutoRefForm =
        produtoMode === 'existente'
          ? { produtoId: Number(produtoId) }
          : {
              nome: novoProduto.nome,
              descricao: novoProduto.descricao || undefined,
              ...(categoriaMode === 'existente'
                ? { categoriaProdutoId: Number(categoriaProdutoId) }
                : {
                    categoriaProdutoNome: novaCategoria.nome,
                    categoriaProdutoDescricao: novaCategoria.descricao || undefined,
                  }),
            }

      createMutation.mutate(
        {
          produto,
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
  const produtosComReceita = new Set((receitasData?.content ?? []).map((r) => r.produtoId))
  const produtos = (produtosData?.content ?? []).filter((p) => !produtosComReceita.has(p.id))

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
        {isEditing ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Produto</h3>
            <p className="text-sm text-gray-600">
              {produtoAtual?.nome ?? `Produto #${receita?.produtoId}`}
              {produtoAtual?.categoriaProdutoNome ? ` — ${produtoAtual.categoriaProdutoNome}` : ''}
            </p>
            <p className="text-xs text-gray-400 mt-1">O produto de uma receita não pode ser alterado depois de criada.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Produto</h3>
              <RadioToggle
                name="produtoMode"
                value={produtoMode}
                onChange={(v) => setProdutoMode(v as 'existente' | 'novo')}
                options={[
                  { value: 'existente', label: 'Usar produto existente' },
                  { value: 'novo', label: 'Criar produto novo' },
                ]}
              />
            </div>

            {produtoMode === 'existente' ? (
              <Field label="Produto" required>
                <select
                  value={produtoId}
                  onChange={(e) => setProdutoId(e.target.value)}
                  required
                  className={inputClass}
                >
                  <option value="">Selecione um produto...</option>
                  {produtos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} ({p.categoriaProdutoNome})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  Produtos que já têm uma receita cadastrada não aparecem aqui (cada produto só pode ter uma receita).
                </p>
              </Field>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Nome do Produto" required>
                    <input
                      value={novoProduto.nome}
                      onChange={(e) => setNovoProduto((prev) => ({ ...prev, nome: e.target.value }))}
                      required
                      className={inputClass}
                      placeholder="Nome do novo produto"
                    />
                  </Field>
                  <Field label="Descrição do Produto">
                    <input
                      value={novoProduto.descricao}
                      onChange={(e) => setNovoProduto((prev) => ({ ...prev, descricao: e.target.value }))}
                      className={inputClass}
                      placeholder="Descrição do novo produto"
                    />
                  </Field>
                </div>

                <div className="pl-4 border-l-2 border-amber-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Categoria do Produto</h4>
                    <RadioToggle
                      name="categoriaMode"
                      value={categoriaMode}
                      onChange={(v) => setCategoriaMode(v as 'existente' | 'novo')}
                      options={[
                        { value: 'existente', label: 'Usar categoria existente' },
                        { value: 'novo', label: 'Criar categoria nova' },
                      ]}
                    />
                  </div>

                  {categoriaMode === 'existente' ? (
                    <Field label="Categoria" required>
                      <select
                        value={categoriaProdutoId}
                        onChange={(e) => setCategoriaProdutoId(e.target.value)}
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
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Field label="Nome da Categoria" required>
                        <input
                          value={novaCategoria.nome}
                          onChange={(e) => setNovaCategoria((prev) => ({ ...prev, nome: e.target.value }))}
                          required
                          className={inputClass}
                          placeholder="Nome da nova categoria"
                        />
                      </Field>
                      <Field label="Descrição da Categoria">
                        <input
                          value={novaCategoria.descricao}
                          onChange={(e) => setNovaCategoria((prev) => ({ ...prev, descricao: e.target.value }))}
                          className={inputClass}
                          placeholder="Descrição da nova categoria"
                        />
                      </Field>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Dados da Receita</h3>

          <Field label="Tempo de Preparo">
            <input
              name="tempoPreparo"
              value={form.tempoPreparo}
              onChange={handleChange}
              className={inputClass}
              placeholder="Ex: 45 minutos"
            />
          </Field>

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

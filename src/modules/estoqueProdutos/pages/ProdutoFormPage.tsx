import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Sparkles } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import Button from '../../../components/ui/Button'
import { useProduto, useCreateProduto, useUpdateProduto } from '../hooks/useProdutos'
import { useCategoriasProduto } from '../hooks/useCategoriasProduto'
import PrecificacaoProdutoForm from './PrecificacaoProdutoForm'

interface ProdutoFormState {
  categoriaProdutoId: string
  nome: string
  descricao: string
}

const emptyProduto: ProdutoFormState = { categoriaProdutoId: '', nome: '', descricao: '' }

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

export default function ProdutoFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const numericId = Number(id ?? 0)

  const { data: produto, isLoading: loadingProduto } = useProduto(numericId)
  const { data: categoriasData } = useCategoriasProduto(0, 100)
  const createProduto = useCreateProduto()
  const updateProduto = useUpdateProduto()

  const [produtoForm, setProdutoForm] = useState<ProdutoFormState>(emptyProduto)

  const categorias = categoriasData?.content ?? []

  useEffect(() => {
    if (produto) {
      setProdutoForm({
        categoriaProdutoId: String(produto.categoriaProdutoId ?? ''),
        nome: produto.nome ?? '',
        descricao: produto.descricao ?? '',
      })
    }
  }, [produto])

  function handleProdutoChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setProdutoForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (isEditing) {
      updateProduto.mutate(
        {
          id: numericId,
          data: {
            categoriaProdutoId: Number(produtoForm.categoriaProdutoId),
            nome: produtoForm.nome,
            descricao: produtoForm.descricao || undefined,
            updatedBy: 'netto',
          },
        },
        { onSuccess: () => navigate('/estoque-produtos/produtos') },
      )
    } else {
      createProduto.mutate(
        {
          categoriaProdutoId: Number(produtoForm.categoriaProdutoId),
          nome: produtoForm.nome,
          descricao: produtoForm.descricao || undefined,
          createdBy: 'netto',
        },
        {
          onSuccess: (created) => navigate(`/estoque-produtos/produtos/${created.id}/editar`),
        },
      )
    }
  }

  const isPending = createProduto.isPending || updateProduto.isPending

  if (isEditing && loadingProduto) {
    return <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Carregando...</div>
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={isEditing ? 'Editar Produto' : 'Novo Produto'}
        subtitle={isEditing ? 'Atualize os dados do produto' : 'Cadastre um novo produto'}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Dados do Produto</h3>

          <Field label="Categoria" required>
            <select
              name="categoriaProdutoId"
              value={produtoForm.categoriaProdutoId}
              onChange={handleProdutoChange}
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

          <Field label="Nome" required>
            <input
              name="nome"
              value={produtoForm.nome}
              onChange={handleProdutoChange}
              required
              className={inputClass}
              placeholder="Nome do produto"
            />
          </Field>

          <Field label="Descrição">
            <textarea
              name="descricao"
              value={produtoForm.descricao}
              onChange={handleProdutoChange}
              className={inputClass + ' min-h-[80px] resize-y'}
              placeholder="Descrição do produto"
            />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/estoque-produtos/produtos')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <Button type="submit" isLoading={isPending}>
            {isEditing ? 'Salvar alterações' : 'Cadastrar produto'}
          </Button>
        </div>
      </form>

      {isEditing ? (
        <div className="mt-6">
          <PrecificacaoProdutoForm produtoId={numericId} />
        </div>
      ) : (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
          <Sparkles size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900">Falta um passo para o preço de venda</p>
            <p className="text-sm text-amber-800 mt-0.5">
              Ao salvar, você cai direto na tela de edição deste produto — é lá, logo abaixo dos dados dele, que a
              seção de Precificação aparece.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

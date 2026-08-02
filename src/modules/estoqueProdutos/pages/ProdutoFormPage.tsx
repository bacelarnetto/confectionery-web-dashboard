import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import PageHeader from '../../../components/ui/PageHeader'
import Button from '../../../components/ui/Button'
import { useProduto, useCreateProduto, useUpdateProduto } from '../hooks/useProdutos'
import { usePrecificacaoVigente, useCreatePrecificacao } from '../hooks/usePrecificacoes'

interface ProdutoFormState {
  nome: string
  descricao: string
}

interface PrecificacaoFormState {
  valorCustoIngrediente: string
  valorCustoFixo: string
  margemLucro: string
  valorVenda: string
}

const emptyProduto: ProdutoFormState = { nome: '', descricao: '' }
const emptyPreco: PrecificacaoFormState = { valorCustoIngrediente: '', valorCustoFixo: '', margemLucro: '', valorVenda: '' }

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
  const { data: precificacao } = usePrecificacaoVigente(numericId)
  const createProduto = useCreateProduto()
  const updateProduto = useUpdateProduto()
  const createPrecificacao = useCreatePrecificacao()

  const [produtoForm, setProdutoForm] = useState<ProdutoFormState>(emptyProduto)
  const [precoForm, setPrecoForm] = useState<PrecificacaoFormState>(emptyPreco)

  useEffect(() => {
    if (produto) {
      setProdutoForm({ nome: produto.nome ?? '', descricao: produto.descricao ?? '' })
    }
  }, [produto])

  useEffect(() => {
    if (precificacao) {
      setPrecoForm({
        valorCustoIngrediente: String(precificacao.valorCustoIngrediente),
        valorCustoFixo: String(precificacao.valorCustoFixo),
        margemLucro: String(precificacao.margemLucro),
        valorVenda: String(precificacao.valorVenda),
      })
    }
  }, [precificacao])

  function handleProdutoChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setProdutoForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handlePrecoChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPrecoForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function hasPrecoFilled() {
    return precoForm.valorCustoIngrediente || precoForm.valorCustoFixo || precoForm.margemLucro || precoForm.valorVenda
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const savePreco = (produtoId: number) => {
      if (hasPrecoFilled()) {
        createPrecificacao.mutate({
          produtoId,
          valorCustoIngrediente: Number(precoForm.valorCustoIngrediente) || 0,
          valorCustoFixo: Number(precoForm.valorCustoFixo) || 0,
          margemLucro: Number(precoForm.margemLucro) || 0,
          valorVenda: Number(precoForm.valorVenda) || 0,
          createdBy: 'netto',
        })
      }
      navigate('/estoque-produtos/produtos')
    }

    if (isEditing) {
      updateProduto.mutate(
        {
          id: numericId,
          data: {
            nome: produtoForm.nome,
            descricao: produtoForm.descricao || undefined,
            updatedBy: 'netto',
          },
        },
        { onSuccess: () => savePreco(numericId) },
      )
    } else {
      createProduto.mutate(
        { nome: produtoForm.nome, descricao: produtoForm.descricao || undefined, createdBy: 'netto' },
        {
          onSuccess: (created) => savePreco(created.id),
        },
      )
    }
  }

  const isPending = createProduto.isPending || updateProduto.isPending || createPrecificacao.isPending

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

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Precificação</h3>
          <p className="text-xs text-gray-500">
            {precificacao
              ? 'Preencha os campos abaixo para registrar uma nova precificação (a vigente será encerrada).'
              : 'Preencha os campos abaixo para registrar a precificação inicial.'}
          </p>

          {precificacao && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              Vigente: R$ {precificacao.valorVenda.toFixed(2)} | Margem: {precificacao.margemLucro}%
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field label="Custo de Ingredientes (R$)">
              <input
                name="valorCustoIngrediente"
                type="number"
                step="0.01"
                min="0"
                value={precoForm.valorCustoIngrediente}
                onChange={handlePrecoChange}
                className={inputClass}
                placeholder="0.00"
              />
            </Field>
            <Field label="Custo Fixo (R$)">
              <input
                name="valorCustoFixo"
                type="number"
                step="0.01"
                min="0"
                value={precoForm.valorCustoFixo}
                onChange={handlePrecoChange}
                className={inputClass}
                placeholder="0.00"
              />
            </Field>
            <Field label="Margem de Lucro (%)">
              <input
                name="margemLucro"
                type="number"
                step="0.1"
                min="0"
                value={precoForm.margemLucro}
                onChange={handlePrecoChange}
                className={inputClass}
                placeholder="0.0"
              />
            </Field>
            <Field label="Valor de Venda (R$)">
              <input
                name="valorVenda"
                type="number"
                step="0.01"
                min="0"
                value={precoForm.valorVenda}
                onChange={handlePrecoChange}
                className={inputClass}
                placeholder="0.00"
              />
            </Field>
          </div>
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
    </div>
  )
}

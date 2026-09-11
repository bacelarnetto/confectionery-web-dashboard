import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Sparkles, Plus, X as XIcon } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import PageHeader from '../../../components/ui/PageHeader'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import { useProduto, useCreateProduto, useUpdateProduto } from '../hooks/useProdutos'
import { useCategoriasProduto } from '../hooks/useCategoriasProduto'
import PrecificacaoProdutoForm from './PrecificacaoProdutoForm'
import complementoService from '../../vendas/services/complementoService'
import { useComplementos } from '../../vendas/hooks/useComplementos'

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

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export default function ProdutoFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const numericId = Number(id ?? 0)
  const queryClient = useQueryClient()

  const { data: produto, isLoading: loadingProduto } = useProduto(numericId)
  const { data: categoriasData } = useCategoriasProduto(0, 100)
  const createProduto = useCreateProduto()
  const updateProduto = useUpdateProduto()

  const { data: complementosAssociados, isLoading: loadingAssociados } = useQuery({
    queryKey: ['complementos-produto', numericId],
    queryFn: () => complementoService.getByProdutoId(numericId),
    enabled: isEditing && numericId > 0,
  })

  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const { data: allComplementos } = useComplementos(0, 50, searchTerm.length > 0 ? { nome: searchTerm } : undefined)
  const associadosIds = new Set((complementosAssociados ?? []).map((c) => c.id))
  const complementosDisponiveis = (allComplementos?.content ?? []).filter((c) => !associadosIds.has(c.id))

  const associarMutation = useMutation({
    mutationFn: ({ produtoId, complementoId }: { produtoId: number; complementoId: number }) =>
      complementoService.associarProduto(produtoId, complementoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complementos-produto', numericId] })
      toast.success('Complemento associado!')
    },
    onError: () => toast.error('Erro ao associar complemento.'),
  })

  const desassociarMutation = useMutation({
    mutationFn: ({ produtoId, complementoId }: { produtoId: number; complementoId: number }) =>
      complementoService.desassociarProduto(produtoId, complementoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complementos-produto', numericId] })
      toast.success('Complemento removido.')
    },
    onError: () => toast.error('Erro ao remover complemento.'),
  })

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
        backTo="/estoque-produtos/produtos"
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
            className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            Cancelar
          </button>
          <Button type="submit" isLoading={isPending}>
            {isEditing ? 'Salvar alterações' : 'Cadastrar produto'}
          </Button>
        </div>
      </form>

      {isEditing ? (
        <>
          <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Complementos padrão do produto</h3>
              <button
                type="button"
                onClick={() => { setShowAddModal(true); setSearchTerm('') }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <Plus size={14} />
                Adicionar complemento
              </button>
            </div>
            {loadingAssociados ? (
              <p className="text-sm text-gray-400">Carregando complementos...</p>
            ) : !complementosAssociados?.length ? (
              <p className="text-sm text-gray-400">Nenhum complemento padrão associado a este produto.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {complementosAssociados.map((c) => (
                  <div key={c.id} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{c.nome}</p>
                      <p className="text-xs text-gray-400">
                        {c.categoria} — {c.valorVenda && c.valorVenda > 0 ? currency.format(c.valorVenda) : 'Grátis / Incluso'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => desassociarMutation.mutate({ produtoId: numericId, complementoId: c.id })}
                      disabled={desassociarMutation.isPending}
                      className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
                      title="Remover"
                    >
                      <XIcon size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Adicionar complemento padrão">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar complemento por nome..."
              className={inputClass + ' mb-3'}
            />
            <div className="max-h-64 overflow-y-auto space-y-1">
              {complementosDisponiveis.length === 0 ? (
                <p className="text-sm text-gray-400">Nenhum complemento disponível para adicionar.</p>
              ) : (
                complementosDisponiveis.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      associarMutation.mutate({ produtoId: numericId, complementoId: c.id })
                      setShowAddModal(false)
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-amber-50 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-700">{c.nome}</p>
                      <p className="text-xs text-gray-400">{c.categoria}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {c.valorVenda && c.valorVenda > 0 ? currency.format(c.valorVenda) : 'Grátis'}
                    </span>
                  </button>
                ))
              )}
            </div>
          </Modal>

          <div className="mt-6">
            <PrecificacaoProdutoForm produtoId={numericId} />
          </div>
        </>
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

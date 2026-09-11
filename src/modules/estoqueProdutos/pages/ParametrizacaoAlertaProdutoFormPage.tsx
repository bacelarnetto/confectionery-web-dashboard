import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import PageHeader from '../../../components/ui/PageHeader'
import {
  useCreateParametrizacaoAlertaProduto,
  useUpdateParametrizacaoAlertaProduto,
  useParametrizacaoAlertaProduto,
} from '../hooks/useParametrizacaoAlertasProduto'
import { useProdutos } from '../hooks/useProdutos'

export default function ParametrizacaoAlertaProdutoFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const { data: existing } = useParametrizacaoAlertaProduto(isEdit ? Number(id) : 0)
  const { data: produtosData } = useProdutos(0, 200)
  const createMutation = useCreateParametrizacaoAlertaProduto()
  const updateMutation = useUpdateParametrizacaoAlertaProduto()

  const [form, setForm] = useState({
    produtoId: '',
    quantidadeMinimaEstoque: '',
    quantidadeDiasVencimento: '10',
  })

  useEffect(() => {
    if (existing) {
      setForm({
        produtoId: String(existing.produtoId ?? ''),
        quantidadeMinimaEstoque: String(existing.quantidadeMinimaEstoque),
        quantidadeDiasVencimento: String(existing.quantidadeDiasVencimento),
      })
    }
  }, [existing])

  function handleChange(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEdit) {
      updateMutation.mutate(
        {
          id: Number(id),
          data: {
            quantidadeMinimaEstoque: Number(form.quantidadeMinimaEstoque),
            quantidadeDiasVencimento: Number(form.quantidadeDiasVencimento),
          },
        },
        { onSuccess: () => navigate('/estoque-produtos/parametrizacao-alertas') }
      )
    } else {
      createMutation.mutate(
        {
          produtoId: Number(form.produtoId),
          quantidadeMinimaEstoque: Number(form.quantidadeMinimaEstoque),
          quantidadeDiasVencimento: Number(form.quantidadeDiasVencimento),
        },
        { onSuccess: () => navigate('/estoque-produtos/parametrizacao-alertas') }
      )
    }
  }

  const produtos = produtosData?.content ?? []
  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Editar Parametrização' : 'Nova Parametrização'}
        subtitle="Configure os limites de alerta para um produto"
        backTo="/estoque-produtos/parametrizacao-alertas"
      />

      <form onSubmit={handleSubmit} className="max-w-lg bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        {!isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Produto *</label>
            <select
              required
              value={form.produtoId}
              onChange={(e) => handleChange('produtoId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Selecione um produto...</option>
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade Mínima *</label>
          <input
            type="number"
            required
            min={0}
            step="0.001"
            value={form.quantidadeMinimaEstoque}
            onChange={(e) => handleChange('quantidadeMinimaEstoque', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dias de antecedência para vencimento *</label>
          <input
            type="number"
            required
            min={1}
            value={form.quantidadeDiasVencimento}
            onChange={(e) => handleChange('quantidadeDiasVencimento', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => navigate('/estoque-produtos/parametrizacao-alertas')}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-60"
          >
            {isPending ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  )
}

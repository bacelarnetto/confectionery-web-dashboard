import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import PageHeader from '../../../components/ui/PageHeader'
import { useCreateParametrizacaoAlerta, useUpdateParametrizacaoAlerta, useParametrizacaoAlerta } from '../hooks/useParametrizacaoAlertas'
import { useInsumos } from '../hooks/useInsumos'

export default function ParametrizacaoAlertaFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const { data: existing } = useParametrizacaoAlerta(isEdit ? Number(id) : 0)
  const { data: insumosData } = useInsumos(0, 200)
  const createMutation = useCreateParametrizacaoAlerta()
  const updateMutation = useUpdateParametrizacaoAlerta()

  const [form, setForm] = useState({
    insumoId: '',
    quantidadeMinimaEstoque: '',
    quantidadeMaximaEstoque: '',
    quantidadeDiasVencimento: '10',
  })

  useEffect(() => {
    if (existing) {
      setForm({
        insumoId: String(existing.insumoId ?? ''),
        quantidadeMinimaEstoque: String(existing.quantidadeMinimaEstoque),
        quantidadeMaximaEstoque: String(existing.quantidadeMaximaEstoque),
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
            quantidadeMaximaEstoque: Number(form.quantidadeMaximaEstoque),
            quantidadeDiasVencimento: Number(form.quantidadeDiasVencimento),
            updatedBy: 'netto',
          },
        },
        { onSuccess: () => navigate('/estoque-insumos/parametrizacao-alertas') }
      )
    } else {
      createMutation.mutate(
        {
          insumoId: Number(form.insumoId),
          quantidadeMinimaEstoque: Number(form.quantidadeMinimaEstoque),
          quantidadeMaximaEstoque: Number(form.quantidadeMaximaEstoque),
          quantidadeDiasVencimento: Number(form.quantidadeDiasVencimento),
          createdBy: 'netto',
        },
        { onSuccess: () => navigate('/estoque-insumos/parametrizacao-alertas') }
      )
    }
  }

  const insumos = insumosData?.content ?? []
  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Editar Parametrização' : 'Nova Parametrização'}
        subtitle="Configure os limites de alerta para um insumo"
        backTo="/estoque-insumos/parametrizacao-alertas"
      />

      <form onSubmit={handleSubmit} className="max-w-lg bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        {!isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Insumo *</label>
            <select
              required
              value={form.insumoId}
              onChange={(e) => handleChange('insumoId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Selecione um insumo...</option>
              {insumos.map((i) => (
                <option key={i.id} value={i.id}>{i.nome}</option>
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
            step="0.01"
            value={form.quantidadeMinimaEstoque}
            onChange={(e) => handleChange('quantidadeMinimaEstoque', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade Máxima *</label>
          <input
            type="number"
            required
            min={0}
            step="0.01"
            value={form.quantidadeMaximaEstoque}
            onChange={(e) => handleChange('quantidadeMaximaEstoque', e.target.value)}
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
            onClick={() => navigate('/estoque-insumos/parametrizacao-alertas')}
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

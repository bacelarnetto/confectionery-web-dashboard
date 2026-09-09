import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X } from 'lucide-react'
import complementoService from '../services/complementoService'
import { useComplementos } from '../hooks/useComplementos'
import { Complemento } from '../types/complemento'

interface ComplementoPickerProps {
  produtoId?: number
  value: number[]
  onChange: (ids: number[]) => void
  ignorarPadrao: boolean
  onIgnorarPadraoChange: (v: boolean) => void
  disabled?: boolean
}

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

const inputClass =
  'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500'

export default function ComplementoPicker({
  produtoId,
  value,
  onChange,
  ignorarPadrao,
  onIgnorarPadraoChange,
  disabled = false,
}: ComplementoPickerProps) {
  const [search, setSearch] = useState('')

  const { data: padraoData, isLoading: loadingPadrao } = useQuery({
    queryKey: ['complementos-produto', produtoId],
    queryFn: () => complementoService.getByProdutoId(produtoId!),
    enabled: !!produtoId && produtoId > 0,
  })

  const padrao: Complemento[] = padraoData ?? []
  const padraoIds = new Set(padrao.map((c) => c.id))

  const { data: extrasData } = useComplementos(0, 50, search.length > 0 ? { nome: search } : undefined)
  const allExtras = extrasData?.content ?? []
  const extras = allExtras.filter((c) => !padraoIds.has(c.id))

  function toggleExtra(id: number) {
    if (disabled) return
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id))
    } else {
      onChange([...value, id])
    }
  }

  function formatValor(v?: number): string {
    if (!v || v <= 0) return 'Grátis'
    return currency.format(v)
  }

  if (!produtoId) {
    return (
      <p className="text-sm text-gray-400 italic">Selecione um produto para adicionar complementos</p>
    )
  }

  return (
    <div className="space-y-3">
      {!disabled && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={ignorarPadrao}
            onChange={(e) => onIgnorarPadraoChange(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400"
          />
          <span className="text-xs text-gray-600">Ignorar complementos padrão (não incluir automaticamente)</span>
        </label>
      )}

      {!ignorarPadrao && padrao.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1.5">Padrão (incluso)</p>
          <div className="flex flex-wrap gap-1.5">
            {padrao.map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200"
              >
                {c.nome}
                <span className="text-gray-400 font-normal">— Incluso</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-medium text-gray-500 mb-1.5">Extras</p>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar complemento por nome..."
          disabled={disabled}
          className={inputClass + ' mb-2'}
        />
        {loadingPadrao ? (
          <p className="text-xs text-gray-400">Carregando complementos...</p>
        ) : extras.length === 0 ? (
          <p className="text-xs text-gray-400">
            {search ? 'Nenhum complemento encontrado para a busca.' : 'Nenhum complemento extra disponível.'}
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {extras.map((c) => {
              const selected = value.includes(c.id)
              return (
                <button
                  key={c.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggleExtra(c.id)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                    selected
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-amber-300 hover:bg-amber-50'
                  } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {c.nome}
                  <span className="text-gray-400 font-normal">— {formatValor(c.valorVenda)}</span>
                  {selected && !disabled && <X size={12} className="ml-0.5" />}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

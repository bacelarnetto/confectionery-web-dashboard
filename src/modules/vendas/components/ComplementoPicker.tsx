import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X } from 'lucide-react'
import complementoService from '../services/complementoService'
import { useComplementos } from '../hooks/useComplementos'
import { Complemento } from '../types/complemento'

export interface ComplementoResolvido {
  id: number
  nome: string
  valorVenda: number
  padrao: boolean
}

interface ComplementoPickerProps {
  produtoId?: number
  value: number[]
  onChange: (ids: number[]) => void
  disabled?: boolean
  /** Reporta pro formulário pai o padrão + os extras selecionados já resolvidos (nome/valor/padrão), pra somar no resumo sem duplicar fetch. */
  onResolvedChange?: (resolvidos: ComplementoResolvido[]) => void
}

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

const inputClass =
  'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500'

export default function ComplementoPicker({
  produtoId,
  value,
  onChange,
  disabled = false,
  onResolvedChange,
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

  // O extra selecionado pode não estar nos 50 primeiros resultados da busca em branco -- busca
  // individual só pelos que faltam, pra sempre conseguir resolver o valor de todo selecionado.
  const known = new Map<number, Complemento>()
  padrao.forEach((c) => known.set(c.id, c))
  allExtras.forEach((c) => known.set(c.id, c))
  const missingIds = value.filter((id) => !known.has(id))

  const { data: missingData } = useQuery({
    queryKey: ['complementos-faltantes', missingIds],
    queryFn: () => Promise.all(missingIds.map((id) => complementoService.getById(id))),
    enabled: missingIds.length > 0,
  })
  missingData?.forEach((c) => known.set(c.id, c))

  useEffect(() => {
    if (!onResolvedChange) return
    const extrasResolvidos: ComplementoResolvido[] = value
      .map((id) => known.get(id))
      .filter((c): c is Complemento => !!c)
      .map((c) => ({ id: c.id, nome: c.nome, valorVenda: c.valorVenda ?? 0, padrao: false }))
    const padraoResolvidos: ComplementoResolvido[] = padrao.map((c) => ({
      id: c.id,
      nome: c.nome,
      valorVenda: 0,
      padrao: true,
    }))
    onResolvedChange([...padraoResolvidos, ...extrasResolvidos])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.join(','), padrao.map((c) => c.id).join(','), missingData])

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
      {padrao.length > 0 && (
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
                  <span className="text-gray-400 font-normal">— {c.padrao ? 'padrão — não cobra' : formatValor(c.valorVenda)}</span>
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

import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import { useInsumo, useInsumos } from '../../estoqueInsumos/hooks/useInsumos'

interface Props {
  value: number
  onChange: (insumoId: number) => void
}

const inputClass =
  'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent placeholder:text-gray-400'

const RESULT_LIMIT = 8

export default function InsumoField({ value, onChange }: Props) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const { data: insumoAtual } = useInsumo(value)
  const { data: resultsData } = useInsumos(0, RESULT_LIMIT, search.length > 0 ? { nome: search } : undefined)
  const results = resultsData?.content ?? []

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (value > 0) {
    return (
      <div className="flex items-center justify-between gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50">
        <span className="truncate text-gray-700">{insumoAtual?.nome ?? `Insumo #${value}`}</span>
        <button
          type="button"
          onClick={() => { onChange(0); setSearch('') }}
          className="text-gray-400 hover:text-red-600 flex-shrink-0"
        >
          <X size={14} />
        </button>
      </div>
    )
  }

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder="Buscar insumo por nome..."
        className={inputClass}
      />
      {open && (
        <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
          {results.length === 0 ? (
            <p className="px-3 py-2 text-xs text-gray-400">
              {search ? 'Nenhum insumo encontrado.' : 'Digite pra buscar...'}
            </p>
          ) : (
            <>
              {results.map((i) => (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => { onChange(i.id); setSearch(''); setOpen(false) }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-amber-50 transition-colors"
                >
                  {i.nome}
                </button>
              ))}
              {results.length === RESULT_LIMIT && (
                <p className="px-3 py-1.5 text-xs text-gray-400 border-t border-gray-100">
                  Mostrando os primeiros {RESULT_LIMIT} — refine a busca se não encontrar.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

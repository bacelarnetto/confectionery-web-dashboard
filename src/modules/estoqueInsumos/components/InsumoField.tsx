import { useState, useRef, useEffect, useId } from 'react'
import { Search, X, Package, ChevronDown, ExternalLink, Thermometer } from 'lucide-react'
import { useInsumo, useInsumos } from '../hooks/useInsumos'
import { useDebounce } from '../../../hooks/useDebounce'

interface InsumoFieldProps {
  value: number
  onChange: (insumoId: number) => void
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  className?: string
  placeholder?: string
}

const inputClass =
  'w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500'

const RESULT_LIMIT = 20

export default function InsumoField({
  value,
  onChange,
  disabled = false,
  readOnly = false,
  required = false,
  className = '',
  placeholder = 'Buscar insumo por nome (ex: Farinha de Trigo, Leite Moça)...',
}: InsumoFieldProps) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const listboxId = useId()

  const debouncedSearch = useDebounce(search.trim(), 300)

  // Busca os dados do insumo atualmente selecionado
  const { data: insumoAtual, isLoading: loadingAtual } = useInsumo(value)

  // Busca dinâmica no backend com paginação e filtro textual por nome
  const { data: resultsData, isLoading: loadingResults } = useInsumos(
    0,
    RESULT_LIMIT,
    debouncedSearch ? { nome: debouncedSearch } : undefined,
  )

  const results = resultsData?.content ?? []

  // Fechar menu suspenso ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Reseta seleção do teclado ao mudar lista de resultados ou busca
  useEffect(() => {
    setHighlightedIndex(-1)
  }, [resultsData, search])

  // Rola o item destacado na lista
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement
      item?.scrollIntoView({ block: 'nearest' })
    }
  }, [highlightedIndex])

  function handleSelect(id: number) {
    onChange(id)
    setSearch('')
    setOpen(false)
  }

  function handleClear() {
    if (disabled || readOnly) return
    onChange(0)
    setSearch('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (disabled || readOnly) return

    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault()
        setOpen(true)
        return
      }
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex >= 0 && results[highlightedIndex]) {
        handleSelect(results[highlightedIndex].id)
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
    }
  }

  // --- ESTADO: INSUMO SELECIONADO ---
  if (value > 0) {
    return (
      <div className={`space-y-1 ${className}`}>
        <div className="flex items-center justify-between gap-3 p-3 text-sm border border-amber-200 bg-amber-50/40 rounded-xl transition-all">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg shrink-0">
              <Package size={20} />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-gray-900 truncate">
                {insumoAtual?.nome ?? (loadingAtual ? 'Carregando insumo...' : `Insumo #${value}`)}
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                {insumoAtual?.unidadeMedida && (
                  <span className="font-medium text-amber-900 bg-amber-100/80 px-1.5 py-0.2 rounded">
                    Unidade: {insumoAtual.unidadeMedida}
                  </span>
                )}
                {insumoAtual?.categoriaNome && (
                  <span className="text-gray-600 bg-gray-100 px-1.5 py-0.2 rounded">
                    {insumoAtual.categoriaNome}
                  </span>
                )}
                {insumoAtual?.marca && (
                  <span className="text-gray-500 italic">
                    ({insumoAtual.marca})
                  </span>
                )}
                {insumoAtual?.perecivel && (
                  <span className="inline-flex items-center gap-0.5 text-amber-800 bg-amber-100/70 px-1.5 py-0.2 rounded font-medium">
                    <Thermometer size={11} /> Perecível
                  </span>
                )}
              </div>
            </div>
          </div>

          {!readOnly && !disabled && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleClear}
                className="text-xs font-medium text-amber-800 hover:text-amber-900 bg-white border border-amber-200 hover:bg-amber-100/50 px-2.5 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                Trocar insumo
              </button>
              <button
                type="button"
                onClick={handleClear}
                title="Remover insumo selecionado"
                className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Input oculto para validação nativa de required do formulário */}
        <input type="hidden" value={value} required={required} />
      </div>
    )
  }

  // --- ESTADO: BUSCA E SELEÇÃO (COMBOBOX) ---
  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />

        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            if (!open) setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || readOnly}
          className={inputClass}
        />

        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
              title="Limpar busca"
            >
              <X size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
            tabIndex={-1}
          >
            <ChevronDown size={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {open && (
        <div className="absolute z-30 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in-50 duration-100">
          <ul
            id={listboxId}
            ref={listRef}
            role="listbox"
            className="max-h-64 overflow-y-auto divide-y divide-gray-50 py-1"
          >
            {loadingResults ? (
              <li className="px-4 py-3 text-xs text-gray-500 flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin shrink-0" />
                Buscando insumos...
              </li>
            ) : results.length === 0 ? (
              <li className="px-4 py-4 text-xs text-center space-y-2">
                <p className="text-gray-500">
                  {search ? (
                    <>
                      Nenhum insumo encontrado para <span className="font-semibold text-gray-700">"{search}"</span>.
                    </>
                  ) : (
                    'Nenhum insumo cadastrado no sistema.'
                  )}
                </p>
                <a
                  href="/estoque-insumos/novo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-800 font-medium hover:underline text-xs"
                >
                  Cadastrar novo insumo <ExternalLink size={12} />
                </a>
              </li>
            ) : (
              results.map((i, index) => {
                const isHighlighted = highlightedIndex === index
                return (
                  <li
                    key={i.id}
                    role="option"
                    aria-selected={isHighlighted}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => handleSelect(i.id)}
                    className={`px-3.5 py-2.5 cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                      isHighlighted ? 'bg-amber-50 text-amber-950' : 'hover:bg-gray-50 text-gray-800'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{i.nome}</p>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                        <span className="font-medium text-amber-800 bg-amber-50 border border-amber-200/70 px-1.5 py-0.2 rounded text-[11px]">
                          {i.unidadeMedida}
                        </span>
                        {i.categoriaNome && <span>{i.categoriaNome}</span>}
                        {i.marca && <span className="text-gray-400">({i.marca})</span>}
                        {i.perecivel && (
                          <span className="inline-flex items-center gap-0.5 text-amber-700 font-medium text-[11px]">
                            <Thermometer size={10} /> Perecível
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md shrink-0">
                      Selecionar
                    </span>
                  </li>
                )
              })
            )}
          </ul>

          {results.length >= RESULT_LIMIT && (
            <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-500 text-center">
              Mostrando os primeiros {RESULT_LIMIT} resultados. Digite para refinar sua busca.
            </div>
          )}
        </div>
      )}
    </div>
  )
}


import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { guiaSections } from '../guiaSections'

interface GuiaNavProps {
  activeId: string
  onSelect: (id: string) => void
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export default function GuiaNav({ activeId, onSelect }: GuiaNavProps) {
  const [search, setSearch] = useState('')

  const filteredSections = useMemo(() => {
    const q = normalize(search.trim())
    if (!q) return guiaSections
    return guiaSections.filter(
      (s) => normalize(s.titulo).includes(q) || normalize(s.descricao).includes(q)
    )
  }, [search])

  return (
    <nav className="md:w-64 md:flex-shrink-0">
      {/* Mobile: Horizontal scroll + search */}
      <div className="md:hidden sticky top-0 z-10 -mx-6 px-6 py-2 bg-gray-50/95 backdrop-blur-sm space-y-2">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar no guia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-gray-400"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="overflow-x-auto flex gap-2 no-scrollbar pb-1">
          {filteredSections.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={`whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                activeId === s.id
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {s.icone}
              {s.titulo}
            </button>
          ))}
          {filteredSections.length === 0 && (
            <span className="text-xs text-gray-400 py-1">Nenhum tópico encontrado</span>
          )}
        </div>
      </div>

      {/* Desktop: Sidebar navigation */}
      <div className="hidden md:block sticky top-20 space-y-2 bg-white/70 p-3 rounded-xl border border-gray-200/80 shadow-xs">
        {/* Search input */}
        <div className="relative mb-2">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar no guia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white placeholder:text-gray-400 transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between px-1 pb-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Tópicos do Manual</p>
          <span className="text-[10px] text-gray-400 font-medium">
            {filteredSections.length}/{guiaSections.length}
          </span>
        </div>

        <div className="max-h-[calc(100vh-180px)] overflow-y-auto space-y-1 pr-1">
          {filteredSections.map((s) => {
            const isSelected = activeId === s.id
            return (
              <button
                key={s.id}
                onClick={() => onSelect(s.id)}
                className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-lg text-left text-xs transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-white font-semibold shadow-xs'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className={`mt-0.5 flex-shrink-0 ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                  {s.icone}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{s.titulo}</p>
                  {search && (
                    <p className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-amber-100' : 'text-gray-400'}`}>
                      {s.descricao}
                    </p>
                  )}
                </div>
              </button>
            )
          })}

          {filteredSections.length === 0 && (
            <div className="p-4 text-center text-xs text-gray-400">
              <p>Nenhum tópico para "{search}"</p>
              <button
                type="button"
                onClick={() => setSearch('')}
                className="mt-2 text-amber-600 hover:text-amber-700 font-medium underline cursor-pointer"
              >
                Limpar busca
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
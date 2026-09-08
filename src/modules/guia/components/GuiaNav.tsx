import { guiaSections } from '../guiaSections'

interface GuiaNavProps {
  activeId: string
  onSelect: (id: string) => void
}

export default function GuiaNav({ activeId, onSelect }: GuiaNavProps) {
  return (
    <nav className="md:w-56 md:flex-shrink-0">
      <div className="md:hidden sticky top-0 z-10 -mx-6 px-6 py-2 bg-gray-50/95 backdrop-blur-sm overflow-x-auto flex gap-2">
        {guiaSections.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeId === s.id
                ? 'bg-amber-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {s.icone}
            {s.titulo}
          </button>
        ))}
      </div>

      <div className="hidden md:block sticky top-0 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-3 pb-2">Nesta página</p>
        {guiaSections.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
              activeId === s.id
                ? 'bg-amber-500 text-white font-medium'
                : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
            }`}
          >
            <span className="flex-shrink-0">{s.icone}</span>
            <span className="flex-1 truncate">{s.titulo}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
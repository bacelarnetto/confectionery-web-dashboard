import { HelpCircle } from 'lucide-react'

interface GuiaTooltipProps {
  text: string
}

export default function GuiaTooltip({ text }: GuiaTooltipProps) {
  return (
    <span className="group relative inline-flex items-center ml-1 align-middle">
      <HelpCircle
        size={14}
        aria-label="Clique para ver a explicação"
        className="text-gray-300 group-hover:text-amber-500 transition-colors cursor-help"
      />
      <span className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-60 rounded-lg bg-gray-900 text-white text-xs leading-relaxed p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 pointer-events-none z-50">
        {text}
      </span>
    </span>
  )
}
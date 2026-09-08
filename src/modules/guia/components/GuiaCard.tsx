import { ReactNode } from 'react'
import { Lightbulb } from 'lucide-react'

interface GuiaCardProps {
  step: number
  title: string
  children: ReactNode
  dica?: string
}

export default function GuiaCard({ step, title, children, dica }: GuiaCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 md:p-6 space-y-3">
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-white text-sm font-bold flex-shrink-0">
          {step}
        </span>
        <h4 className="text-base font-semibold text-gray-900 leading-snug">{title}</h4>
      </div>

      <div className="pl-11 space-y-2 text-sm text-gray-600 leading-relaxed">{children}</div>

      {dica && (
        <div className="ml-11 flex gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-800">
          <Lightbulb size={16} className="flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">{dica}</p>
        </div>
      )}
    </div>
  )
}
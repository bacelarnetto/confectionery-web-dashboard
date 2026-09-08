import { ReactNode } from 'react'

interface GuiaSectionProps {
  id: string
  title: string
  intro: string
  children: ReactNode
}

export default function GuiaSection({ id, title, intro, children }: GuiaSectionProps) {
  return (
    <section id={id} className="scroll-mt-24 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <p className="mt-2 text-sm text-gray-500 leading-relaxed">{intro}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}
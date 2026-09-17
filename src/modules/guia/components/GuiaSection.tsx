import { ReactNode, useState } from 'react'
import { Link as LinkIcon, Check } from 'lucide-react'

interface GuiaSectionProps {
  id: string
  title: string
  intro: string
  children: ReactNode
}

export default function GuiaSection({ id, title, intro, children }: GuiaSectionProps) {
  const [copied, setCopied] = useState(false)

  function handleCopyLink() {
    const url = `${window.location.origin}/guia/${id}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section id={id} className="scroll-mt-24 space-y-5">
      <div>
        <div className="flex items-center gap-2 group">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={handleCopyLink}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-amber-600 rounded-md hover:bg-amber-50 cursor-pointer"
            title="Copiar link direto para esta seção"
          >
            {copied ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                <Check size={14} /> Copiado!
              </span>
            ) : (
              <LinkIcon size={15} />
            )}
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500 leading-relaxed">{intro}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}
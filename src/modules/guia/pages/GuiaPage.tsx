import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { BookOpen } from 'lucide-react'
import GuiaNav from '../components/GuiaNav'
import { guiaSections } from '../guiaSections'

const validIds = new Set(guiaSections.map((s) => s.id))

export default function GuiaPage() {
  const { secao } = useParams<{ secao: string }>()
  const navigate = useNavigate()
  const [activeId, setActiveId] = useState<string>(
    secao && validIds.has(secao) ? secao : guiaSections[0].id,
  )

  useEffect(() => {
    if (secao && validIds.has(secao)) {
      setActiveId(secao)
      const el = document.getElementById(secao)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [secao])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        })
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 },
    )

    guiaSections.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  function handleSelect(id: string) {
    navigate(`/guia/${id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <BookOpen size={18} className="text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Guia do Usuário</h1>
            <p className="mt-1 text-sm text-gray-500">
              Um manual pensado para a sua confeitaria — direto ao ponto, sem mistério.
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
          Manual do Usuário Final
        </span>
      </div>

      <div className="md:flex md:gap-8">
        <GuiaNav activeId={activeId} onSelect={handleSelect} />

        <div className="flex-1 min-w-0 space-y-12 pt-4 md:pt-0">
          {guiaSections.map(({ id, Component }) => (
            <Component key={id} />
          ))}
        </div>
      </div>
    </div>
  )
}
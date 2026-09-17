import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { BookOpen, ArrowUp, ArrowLeft, ArrowRight } from 'lucide-react'
import GuiaNav from '../components/GuiaNav'
import { guiaSections } from '../guiaSections'

const validIds = new Set(guiaSections.map((s) => s.id))

export default function GuiaPage() {
  const { secao } = useParams<{ secao: string }>()
  const navigate = useNavigate()
  const [activeId, setActiveId] = useState<string>(
    secao && validIds.has(secao) ? secao : guiaSections[0].id,
  )
  const [showScrollTop, setShowScrollTop] = useState(false)

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

  useEffect(() => {
    function handleScroll() {
      setShowScrollTop(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function handleSelect(id: string) {
    navigate(`/guia/${id}`)
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
              Do estoque ao caixa, um passo a passo claro para sua confeitaria rodar sem imprevistos.
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
          Manual do Usuário Final
        </span>
      </div>

      <div className="md:flex md:gap-8">
        <GuiaNav activeId={activeId} onSelect={handleSelect} />

        <div className="flex-1 min-w-0 space-y-16 pt-4 md:pt-0">
          {guiaSections.map(({ id, Component }, index) => {
            const prev = index > 0 ? guiaSections[index - 1] : null
            const next = index < guiaSections.length - 1 ? guiaSections[index + 1] : null
            return (
              <div key={id} className="space-y-8">
                <Component />

                {/* Navegação de Rodapé entre Tópicos */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200/80 text-xs">
                  {prev ? (
                    <button
                      type="button"
                      onClick={() => handleSelect(prev.id)}
                      className="inline-flex items-center gap-1.5 text-gray-600 hover:text-amber-600 font-medium px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors cursor-pointer shadow-2xs"
                    >
                      <ArrowLeft size={14} />
                      <span>Anterior: {prev.titulo}</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  {next ? (
                    <button
                      type="button"
                      onClick={() => handleSelect(next.id)}
                      className="inline-flex items-center gap-1.5 text-amber-700 hover:text-amber-800 font-semibold px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer shadow-2xs ml-auto"
                    >
                      <span>Próximo: {next.titulo}</span>
                      <ArrowRight size={14} />
                    </button>
                  ) : (
                    <div />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Botão Flutuante Voltar ao Topo */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-amber-500 text-white shadow-lg hover:bg-amber-600 transition-all z-50 cursor-pointer"
          title="Voltar ao topo do guia"
        >
          <ArrowUp size={18} />
        </button>
      )}
    </div>
  )
}
import { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  children?: ReactNode
  // Rota da lista/pesquisa que originou esta tela (cadastro/edição) -- sem isso o único jeito de
  // voltar é o botão "Cancelar" lá embaixo do formulário, que em telas longas fica fora de vista.
  backTo?: string
}

export default function PageHeader({ title, subtitle, children, backTo }: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {(backTo || children) && (
        <div className="flex items-center gap-3">
          {backTo && (
            <button
              type="button"
              onClick={() => navigate(backTo)}
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft size={14} />
              Voltar
            </button>
          )}
          {children}
        </div>
      )}
    </div>
  )
}
import { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from 'react-oidc-context'
import { Lock } from 'lucide-react'
import { hasRole } from '../../lib/auth'
import Button from '../ui/Button'

interface RequireRoleProps {
  role: string
  children: ReactNode
}

export default function RequireRole({ role, children }: RequireRoleProps) {
  const auth = useAuth()
  const navigate = useNavigate()

  if (!hasRole(auth.user, role)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center">
            <Lock size={24} className="text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Área restrita</h2>
            <p className="mt-1 text-sm text-gray-500">
              Seu acesso não permite entrar nesta área. Se precisar, fale com o responsável da
              administração para liberar a permissão.
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/')}>
            Voltar ao painel
          </Button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
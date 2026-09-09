import { ReactNode } from 'react'
import { useAuth } from 'react-oidc-context'
import { Cookie, Loader2, AlertCircle } from 'lucide-react'
import Button from '../ui/Button'

export default function AuthGate({ children }: { children: ReactNode }) {
  const auth = useAuth()

  if (auth.isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={28} className="animate-spin text-amber-500" />
      </div>
    )
  }

  if (auth.error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-sm text-center space-y-4">
          <AlertCircle size={32} className="mx-auto text-red-500" />
          <p className="text-sm text-gray-600">Não foi possível conectar ao login. {auth.error.message}</p>
          <Button onClick={() => auth.signinRedirect()}>Tentar novamente</Button>
        </div>
      </div>
    )
  }

  if (!auth.isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
              <Cookie size={26} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Confectionery</h1>
              <p className="text-sm text-gray-500 mt-1">Painel de gestão da confeitaria</p>
            </div>
          </div>
          <Button onClick={() => auth.signinRedirect()} className="w-full">
            Entrar
          </Button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

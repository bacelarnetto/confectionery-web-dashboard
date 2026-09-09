import { useEffect } from 'react'
import { userManager } from '../lib/auth'

// Carregada dentro do iframe oculto que o oidc-client-ts abre pra renovar o access token sem
// redirecionar o usuário (automaticSilentRenew). Não renderiza nada visível.
export default function SilentRenewPage() {
  useEffect(() => {
    userManager.signinSilentCallback().catch(() => {
      // Falha aqui só encerra a tentativa de renovação silenciosa dentro do iframe --
      // o app principal continua com o token antigo até expirar de vez, quando o axios
      // interceptor força o signinRedirect() de verdade.
    })
  }, [])

  return null
}

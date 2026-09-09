import { UserManager, WebStorageStateStore, User } from 'oidc-client-ts'

// Realm/cliente do Keycloak (keycloak/realm-export.json no repo do backend) -- ver
// doc/defesa-arquitetura-autenticacao.md, D1/D2: SPA pública + PKCE, sem client secret.
// Porta 8081 do host colide com um processo de outro projeto na máquina (não relacionado) --
// Keycloak deste projeto sobe em 8180 no docker-compose (ver ~/work/confectionery/docker-compose.yaml).
const KEYCLOAK_URL = 'http://localhost:8180'
const REALM = 'confectionery'
const CLIENT_ID = 'confectionery-web'

export const oidcConfig = {
  authority: `${KEYCLOAK_URL}/realms/${REALM}`,
  client_id: CLIENT_ID,
  redirect_uri: window.location.origin,
  post_logout_redirect_uri: window.location.origin,
  silent_redirect_uri: `${window.location.origin}/silent-renew`,
  response_type: 'code',
  scope: 'openid profile email',
  automaticSilentRenew: true,
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
}

// Instância própria, fora da árvore React -- usada pelo interceptor do axios (não tem hook ali)
// e pelo handler de 401. Compartilha o mesmo storage (sessionStorage, chave derivada de
// authority+client_id) que a instância interna do <AuthProvider>, então os dois leem/escrevem
// o mesmo usuário sem precisar da mesma referência de objeto.
export const userManager = new UserManager(oidcConfig)

export function getUsername(user: User | null | undefined): string {
  const profile = user?.profile
  return (profile?.preferred_username as string | undefined) ?? profile?.email ?? 'desconhecido'
}

/**
 * `realm_access.roles` só existe no *access token*, não no ID token — e `user.profile` (do
 * oidc-client-ts) reflete o ID token. Decodifica o access token diretamente pra ler as roles
 * (mesmo claim que `SecurityConfig.kt` lê no backend, ver `realmRolesAsAuthorities`).
 */
export function getRoles(user: User | null | undefined): string[] {
  const token = user?.access_token
  if (!token) return []
  try {
    const payload = token.split('.')[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const claims = JSON.parse(json) as { realm_access?: { roles?: string[] } }
    return claims.realm_access?.roles ?? []
  } catch {
    return []
  }
}

export function hasRole(user: User | null | undefined, role: string): boolean {
  return getRoles(user).includes(role)
}

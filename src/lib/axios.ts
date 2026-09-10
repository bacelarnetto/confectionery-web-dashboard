import axios from 'axios'
import toast from 'react-hot-toast'
import { userManager, getUsername } from './auth'

// Permite que uma chamada específica assuma a responsabilidade de exibir o próprio erro
// (ex: validação inline num formulário) em vez do toast genérico global — usado pelos
// formulários que mapeiam RegraDeNegocioException para mensagens de campo (ver F3).
declare module 'axios' {
  export interface AxiosRequestConfig {
    skipErrorToast?: boolean
  }
}

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// X-Request-Id (F19): o backend ecoa o header se ele vier na requisição, ou gera um UUID se não
// vier, e o mesmo valor aparece no corpo de erro (ErroResponseDTO.requestId). Guardamos o último
// visto (sucesso ou erro) pra poder citar como referência de suporte sem precisar abrir o Network tab.
let lastRequestId: string | undefined

export function getLastRequestId(): string | undefined {
  return lastRequestId
}

// Anexa o access token em toda requisição (F7). userManager.getUser() lê do sessionStorage
// compartilhado com o <AuthProvider> — não precisa da mesma instância/hook, só do mesmo storage.
//
// Também sobrescreve createdBy/updatedBy (corpo) e o header "usuario" (usado pelos DELETEs, ver
// doc/defesa-arquitetura-autenticacao.md §12.1) com o usuário autenticado de verdade, aqui e só
// aqui — em vez de caçar as ~30 telas que ainda montam esses campos com o placeholder 'netto' de
// antes do login existir. Continuam sendo campos livres no contrato do backend (Fase 3 do B12,
// que os removeria de vez, ainda não foi implementada), então até lá isso é reforçado no cliente.
api.interceptors.request.use(async (config) => {
  const user = await userManager.getUser()
  if (!user?.access_token) return config

  config.headers.Authorization = `Bearer ${user.access_token}`
  config.headers.usuario = getUsername(user)

  if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
    if ('createdBy' in config.data) config.data.createdBy = getUsername(user)
    if ('updatedBy' in config.data) config.data.updatedBy = getUsername(user)
  }

  return config
})

let redirecionandoParaLogin = false

api.interceptors.response.use(
  (response) => {
    lastRequestId = response.headers?.['x-request-id'] ?? lastRequestId
    return response
  },
  (error) => {
    const status = error.response?.status
    const url = error.config?.url
    const data = error.response?.data
    const requestId = data?.requestId ?? error.response?.headers?.['x-request-id']
    if (requestId) lastRequestId = requestId

    console.error(`[API Error] ${error.request.method?.toUpperCase() || 'GET'} ${url}`, {
      status,
      data,
      requestId,
    })

    // 401 aqui significa que o access token expirou e o renew silencioso não deu conta a tempo
    // (ou foi revogado) — não tem "tentar de novo", o usuário precisa logar de novo. Guarda pra
    // não disparar N redirects se várias chamadas em voo derem 401 juntas.
    if (status === 401 && !redirecionandoParaLogin) {
      redirecionandoParaLogin = true
      toast.error('Sessão expirada — faça login novamente.')
      userManager.signinRedirect().catch(() => { redirecionandoParaLogin = false })
      return Promise.reject(error)
    }

    // skipErrorToast só vale para erros 4xx (o formulário se responsabiliza por explicar a
    // regra de negócio inline); falhas de rede ou 5xx sempre caem no toast genérico, porque
    // não há campo nenhum pra "explicar" — o usuário só precisa saber que algo quebrou.
    const podeSuprimir = error.config?.skipErrorToast && status >= 400 && status < 500
    if (!podeSuprimir) {
      let mensagem: string
      if (status === 500) {
        mensagem = `Erro interno do servidor (${url})`
      } else if (status === 404) {
        mensagem = `Endpoint não encontrado (${url})`
      } else if (status === 401 || status === 403) {
        mensagem = 'Acesso não autorizado'
      } else if (status === 400) {
        mensagem = data?.mensagem || data?.message || 'Dados inválidos'
      } else {
        mensagem = data?.mensagem || data?.message || 'Erro de conexão. Tente novamente.'
      }
      if (requestId) mensagem += ` (ID: ${requestId})`
      toast.error(mensagem)
    }
    return Promise.reject(error)
  }
)

export default api
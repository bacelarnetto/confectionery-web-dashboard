import axios from 'axios'
import toast from 'react-hot-toast'

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const url = error.config?.url
    const data = error.response?.data

    console.error(`[API Error] ${error.request.method?.toUpperCase() || 'GET'} ${url}`, {
      status,
      data,
    })

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
      toast.error(mensagem)
    }
    return Promise.reject(error)
  }
)

export default api
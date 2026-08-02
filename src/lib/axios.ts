import axios from 'axios'
import toast from 'react-hot-toast'

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
    return Promise.reject(error)
  }
)

export default api
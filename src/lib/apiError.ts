import { AxiosError } from 'axios'

export interface ApiErrorInfo {
  status?: number
  mensagem: string
}

/** Extrai a mensagem de erro de negócio (400) devolvida pelo `GlobalExceptionHandler`. */
export function parseApiError(err: unknown, fallback = 'Não foi possível concluir a operação.'): ApiErrorInfo {
  const axiosErr = err as AxiosError<{ mensagem?: string; message?: string }>
  const status = axiosErr?.response?.status
  const mensagem = axiosErr?.response?.data?.mensagem ?? axiosErr?.response?.data?.message ?? fallback
  return { status, mensagem }
}

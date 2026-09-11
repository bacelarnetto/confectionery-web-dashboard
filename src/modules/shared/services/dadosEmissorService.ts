import api from '../../../lib/axios'
import { DadosEmissor, DadosEmissorUpdateForm } from '../types/dadosEmissor'

const dadosEmissorService = {
  get(): Promise<DadosEmissor> {
    return api.get<DadosEmissor>('/dados-emissor').then((res) => res.data)
  },

  update(data: DadosEmissorUpdateForm): Promise<DadosEmissor> {
    return api.put<DadosEmissor>('/dados-emissor', data).then((res) => res.data)
  },

  uploadLogo(arquivo: File, usuario: string): Promise<DadosEmissor> {
    const formData = new FormData()
    formData.append('arquivo', arquivo)
    formData.append('usuario', usuario)
    // A instância do axios fixa Content-Type: application/json por padrão (ver lib/axios.ts) --
    // isso impede a detecção automática de multipart/boundary do navegador pra um corpo FormData,
    // então precisa ser explicitamente desfeito aqui pra essa chamada.
    return api
      .post<DadosEmissor>('/dados-emissor/logo', formData, { headers: { 'Content-Type': undefined } })
      .then((res) => res.data)
  },

  // 404 (ainda não tem logo) é estado normal aqui, não erro -- vira null em vez de rejeitar,
  // pra não acionar o toast genérico nem o estado de erro da query.
  getLogo(): Promise<Blob | null> {
    return api
      .get('/dados-emissor/logo', { responseType: 'blob', skipErrorToast: true })
      .then((res) => res.data)
      .catch((err) => {
        if (err?.response?.status === 404) return null
        throw err
      })
  },

  deleteLogo(usuario: string): Promise<void> {
    return api.delete('/dados-emissor/logo', { headers: { usuario } }).then(() => undefined)
  },
}

export default dadosEmissorService

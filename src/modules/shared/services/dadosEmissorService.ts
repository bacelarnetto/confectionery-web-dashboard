import api from '../../../lib/axios'
import { DadosEmissor, DadosEmissorUpdateForm } from '../types/dadosEmissor'

const dadosEmissorService = {
  get(): Promise<DadosEmissor> {
    return api.get<DadosEmissor>('/dados-emissor').then((res) => res.data)
  },

  update(data: DadosEmissorUpdateForm): Promise<DadosEmissor> {
    return api.put<DadosEmissor>('/dados-emissor', data).then((res) => res.data)
  },
}

export default dadosEmissorService

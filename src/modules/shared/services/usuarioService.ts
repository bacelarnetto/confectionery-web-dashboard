import api from '../../../lib/axios'
import { Usuario, UsuarioInsertForm, UsuarioUpdateForm } from '../types/usuario'

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

const usuarioService = {
  getAll(page = 0, size = 20): Promise<PageResponse<Usuario>> {
    return api
      .get<PageResponse<Usuario>>('/usuario', { params: { page, size } })
      .then((res) => res.data)
  },

  getById(id: number): Promise<Usuario> {
    return api.get<Usuario>(`/usuario/${id}`).then((res) => res.data)
  },

  create(data: UsuarioInsertForm): Promise<Usuario> {
    return api.post<Usuario>('/usuario', data).then((res) => res.data)
  },

  update(id: number, data: UsuarioUpdateForm): Promise<Usuario> {
    return api.put<Usuario>(`/usuario/${id}`, data).then((res) => res.data)
  },

  remove(id: number): Promise<void> {
    return api
      .delete(`/usuario/${id}`, { headers: { usuario: 'netto' } })
      .then(() => undefined)
  },
}

export default usuarioService

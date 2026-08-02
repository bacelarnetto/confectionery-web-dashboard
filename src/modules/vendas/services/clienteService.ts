import api from '../../../lib/axios'
import { Cliente, ClienteInsertForm, ClienteUpdateForm } from '../types/cliente'

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

const clienteService = {
  getAll(page = 0, size = 20, filters?: { nome?: string }): Promise<PageResponse<Cliente>> {
    return api.get('/cliente', { params: { page, size, ...filters } }).then((r) => r.data)
  },
  getById(id: number): Promise<Cliente> {
    return api.get(`/cliente/${id}`).then((r) => r.data)
  },
  create(data: ClienteInsertForm): Promise<Cliente> {
    return api.post('/cliente', data).then((r) => r.data)
  },
  update(id: number, data: ClienteUpdateForm): Promise<Cliente> {
    return api.put(`/cliente/${id}`, data).then((r) => r.data)
  },
  remove(id: number): Promise<void> {
    return api.delete(`/cliente/${id}`, { headers: { usuario: 'netto' } }).then(() => undefined)
  },
}

export default clienteService

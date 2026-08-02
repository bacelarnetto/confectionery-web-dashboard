import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import usuarioService from '../services/usuarioService'
import { UsuarioInsertForm, UsuarioUpdateForm } from '../types/usuario'

const QUERY_KEY = ['usuarios']

export function useUsuarios(page = 0, size = 20) {
  return useQuery({
    queryKey: [...QUERY_KEY, page, size],
    queryFn: () => usuarioService.getAll(page, size),
  })
}

export function useUsuario(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => usuarioService.getById(id),
    enabled: id > 0,
  })
}

export function useCreateUsuario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UsuarioInsertForm) => usuarioService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Usuário criado com sucesso!')
    },
  })
}

export function useUpdateUsuario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UsuarioUpdateForm }) =>
      usuarioService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Usuário atualizado com sucesso!')
    },
  })
}

export function useDeleteUsuario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => usuarioService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Usuário removido com sucesso!')
    },
  })
}

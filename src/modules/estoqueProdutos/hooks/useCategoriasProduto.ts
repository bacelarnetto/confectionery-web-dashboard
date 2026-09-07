import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import categoriaProdutoService from '../services/categoriaProdutoService'
import { CategoriaProdutoInsertForm, CategoriaProdutoUpdateForm } from '../types/categoriaProduto'

const QUERY_KEY = ['categorias-produto']

export function useCategoriasProduto(page = 0, size = 20, filters?: { id?: number; nome?: string }) {
  return useQuery({
    queryKey: [...QUERY_KEY, page, size, filters],
    queryFn: () => categoriaProdutoService.getAll(page, size, filters),
  })
}

export function useCategoriaProduto(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => categoriaProdutoService.getById(id),
    enabled: id > 0,
  })
}

export function useCreateCategoriaProduto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CategoriaProdutoInsertForm) => categoriaProdutoService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Categoria criada com sucesso!')
    },
  })
}

export function useUpdateCategoriaProduto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoriaProdutoUpdateForm }) =>
      categoriaProdutoService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Categoria atualizada com sucesso!')
    },
  })
}

export function useDeleteCategoriaProduto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => categoriaProdutoService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Categoria removida com sucesso!')
    },
  })
}

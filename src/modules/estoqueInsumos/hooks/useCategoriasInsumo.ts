import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import categoriaInsumoService from '../services/categoriaInsumoService'
import { CategoriaInsumoInsertForm, CategoriaInsumoUpdateForm } from '../types/categoriaInsumo'

const QUERY_KEY = ['categorias-insumo']

export function useCategoriasInsumo(page = 0, size = 20, filters?: { id?: number; nome?: string }) {
  return useQuery({
    queryKey: [...QUERY_KEY, page, size, filters],
    queryFn: () => categoriaInsumoService.getAll(page, size, filters),
  })
}

export function useCategoriaInsumo(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => categoriaInsumoService.getById(id),
    enabled: id > 0,
  })
}

export function useCreateCategoriaInsumo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CategoriaInsumoInsertForm) => categoriaInsumoService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Categoria criada com sucesso!')
    },
  })
}

export function useUpdateCategoriaInsumo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoriaInsumoUpdateForm }) =>
      categoriaInsumoService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Categoria atualizada com sucesso!')
    },
  })
}

export function useDeleteCategoriaInsumo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => categoriaInsumoService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Categoria removida com sucesso!')
    },
  })
}

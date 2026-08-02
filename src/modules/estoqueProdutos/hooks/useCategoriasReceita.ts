import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import categoriaReceitaService from '../services/categoriaReceitaService'
import { CategoriaReceitaInsertForm, CategoriaReceitaUpdateForm } from '../types/categoriaReceita'

const QUERY_KEY = ['categorias-receita']

export function useCategoriasReceita(page = 0, size = 20, filters?: { nome?: string }) {
  return useQuery({
    queryKey: [...QUERY_KEY, page, size, filters],
    queryFn: () => categoriaReceitaService.getAll(page, size, filters),
  })
}

export function useCategoriaReceita(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => categoriaReceitaService.getById(id),
    enabled: id > 0,
  })
}

export function useCreateCategoriaReceita() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CategoriaReceitaInsertForm) => categoriaReceitaService.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); toast.success('Categoria criada!') },
  })
}

export function useUpdateCategoriaReceita() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoriaReceitaUpdateForm }) => categoriaReceitaService.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); toast.success('Categoria atualizada!') },
  })
}

export function useDeleteCategoriaReceita() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => categoriaReceitaService.remove(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); toast.success('Categoria removida!') },
  })
}

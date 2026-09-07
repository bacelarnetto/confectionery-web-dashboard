import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import receitaService from '../services/receitaService'
import { ReceitaInsertForm, ReceitaUpdateForm } from '../types/receita'

const QUERY_KEY = ['receitas']

export function useReceitas(page = 0, size = 20, filters?: { nome?: string }) {
  return useQuery({
    queryKey: [...QUERY_KEY, page, size, filters],
    queryFn: () => receitaService.getAll(page, size, filters),
  })
}

export function useReceita(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => receitaService.getById(id),
    enabled: id > 0,
  })
}

export function useCreateReceita() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ReceitaInsertForm) => receitaService.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); toast.success('Receita criada!') },
  })
}

export function useUpdateReceita() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ReceitaUpdateForm }) => receitaService.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); toast.success('Receita atualizada!') },
  })
}

export function useDeleteReceita() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => receitaService.remove(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); toast.success('Receita removida!') },
  })
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import colaboradorService from '../services/colaboradorService'
import { ColaboradorInsertForm, ColaboradorUpdateForm } from '../types/colaborador'

const QUERY_KEY = ['colaboradores']

export function useColaboradores(page = 0, size = 50, nome?: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, page, size, nome],
    queryFn: () => colaboradorService.getAll(page, size, nome),
  })
}

export function useColaborador(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => colaboradorService.getById(id),
    enabled: id > 0,
  })
}

export function useCreateColaborador() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ColaboradorInsertForm) => colaboradorService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Colaborador cadastrado com sucesso!')
    },
  })
}

export function useUpdateColaborador() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ColaboradorUpdateForm }) =>
      colaboradorService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Colaborador atualizado com sucesso!')
    },
  })
}

export function useDeleteColaborador() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => colaboradorService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Colaborador removido com sucesso!')
    },
  })
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import fornecedorService from '../services/fornecedorService'
import { FornecedorInsertForm, FornecedorUpdateForm } from '../types/fornecedor'

const QUERY_KEY = ['fornecedores']

export function useFornecedores(
  page = 0,
  size = 20,
  filters?: { id?: number; nome?: string; cnpj?: string }
) {
  return useQuery({
    queryKey: [...QUERY_KEY, page, size, filters],
    queryFn: () => fornecedorService.getAll(page, size, filters),
  })
}

export function useFornecedor(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => fornecedorService.getById(id),
    enabled: id > 0,
  })
}

export function useCreateFornecedor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: FornecedorInsertForm) => fornecedorService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Fornecedor criado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao criar fornecedor. Tente novamente.')
    },
  })
}

export function useUpdateFornecedor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FornecedorUpdateForm }) =>
      fornecedorService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Fornecedor atualizado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao atualizar fornecedor. Tente novamente.')
    },
  })
}

export function useDeleteFornecedor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => fornecedorService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Fornecedor removido com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao remover fornecedor. Tente novamente.')
    },
  })
}
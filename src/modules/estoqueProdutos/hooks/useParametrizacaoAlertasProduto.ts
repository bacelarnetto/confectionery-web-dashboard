import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import parametrizacaoAlertaProdutoService from '../services/parametrizacaoAlertaProdutoService'
import {
  ParametrizacaoAlertaProdutoInsertForm,
  ParametrizacaoAlertaProdutoUpdateForm,
} from '../types/alertaProduto'

const QUERY_KEY = ['parametrizacao-alertas-produto']

export function useParametrizacaoAlertasProduto() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => parametrizacaoAlertaProdutoService.getAll(),
  })
}

export function useParametrizacaoAlertaProduto(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => parametrizacaoAlertaProdutoService.getById(id),
    enabled: id > 0,
  })
}

export function useCreateParametrizacaoAlertaProduto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ParametrizacaoAlertaProdutoInsertForm) =>
      parametrizacaoAlertaProdutoService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Parametrização criada!')
    },
    onError: () => toast.error('Erro ao criar parametrização.'),
  })
}

export function useUpdateParametrizacaoAlertaProduto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ParametrizacaoAlertaProdutoUpdateForm }) =>
      parametrizacaoAlertaProdutoService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Parametrização atualizada!')
    },
    onError: () => toast.error('Erro ao atualizar parametrização.'),
  })
}

export function useDeleteParametrizacaoAlertaProduto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => parametrizacaoAlertaProdutoService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Parametrização removida!')
    },
    onError: () => toast.error('Erro ao remover parametrização.'),
  })
}

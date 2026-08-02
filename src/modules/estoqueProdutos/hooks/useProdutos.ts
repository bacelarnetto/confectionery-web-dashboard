import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import produtoService from '../services/produtoService'
import { ProdutoInsertForm, ProdutoUpdateForm } from '../types/produto'

const QUERY_KEY = ['produtos']

export function useProdutos(page = 0, size = 20, filters?: { nome?: string }) {
  return useQuery({
    queryKey: [...QUERY_KEY, page, size, filters],
    queryFn: () => produtoService.getAll(page, size, filters),
  })
}

export function useProduto(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => produtoService.getById(id),
    enabled: id > 0,
  })
}

export function useCreateProduto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ProdutoInsertForm) => produtoService.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); toast.success('Produto criado!') },
  })
}

export function useUpdateProduto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProdutoUpdateForm }) => produtoService.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); toast.success('Produto atualizado!') },
  })
}

export function useDeleteProduto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => produtoService.remove(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); toast.success('Produto removido!') },
  })
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import entradaProdutoService from '../services/entradaProdutoService'
import { EntradaProdutoInsertForm } from '../types/entradaProduto'

const QUERY_KEY = ['entradas-produto']
const ESTOQUE_PRODUTO_QUERY_KEY = ['estoque-produto']

export function useEntradasProduto(page = 0, size = 20) {
  return useQuery({
    queryKey: [...QUERY_KEY, page, size],
    queryFn: () => entradaProdutoService.getAll(page, size),
  })
}

export function useEntradaProduto(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => entradaProdutoService.getById(id),
    enabled: id > 0,
  })
}

export function useCreateEntradaProduto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: EntradaProdutoInsertForm) => entradaProdutoService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      // credita lotes novos em estoque_produto -- a lista de estoque precisa refletir na hora
      queryClient.invalidateQueries({ queryKey: ESTOQUE_PRODUTO_QUERY_KEY })
      toast.success('Entrada de produto registrada!')
    },
  })
}

// Quem decide se pode excluir é o backend (nenhuma unidade do lote pode ter tido saída).
export function useDeleteEntradaProduto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => entradaProdutoService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      // o estoque criado pela entrada sai junto
      queryClient.invalidateQueries({ queryKey: ESTOQUE_PRODUTO_QUERY_KEY })
      toast.success('Entrada de produto excluída!')
    },
  })
}

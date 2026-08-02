import { useQuery } from '@tanstack/react-query'
import estoqueProdutoService from '../services/estoqueProdutoService'

const QUERY_KEY = ['estoque-produto']

export function useEstoqueProdutos(page = 0, size = 20, produtoId?: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, page, size, produtoId],
    queryFn: () => estoqueProdutoService.getAll(page, size, produtoId),
  })
}

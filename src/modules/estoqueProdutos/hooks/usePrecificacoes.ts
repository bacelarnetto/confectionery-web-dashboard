import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import precificacaoProdutoService from '../services/precificacaoProdutoService'
import { PrecificacaoProdutoInsertForm } from '../types/precificacaoProduto'

const QUERY_KEY = ['precificacoes-produto']

export function usePrecificacaoVigente(produtoId: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'vigente', produtoId],
    queryFn: () => precificacaoProdutoService.getVigenteByProdutoId(produtoId),
    enabled: produtoId > 0,
  })
}

export function useCreatePrecificacao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PrecificacaoProdutoInsertForm) => precificacaoProdutoService.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); toast.success('Precificação salva!') },
  })
}

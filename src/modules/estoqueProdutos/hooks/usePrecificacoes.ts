import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import precificacaoProdutoService from '../services/precificacaoProdutoService'
import { PrecificacaoProdutoInsertForm, PrecificacaoProdutoSimularForm } from '../types/precificacaoProduto'
import { useDebounce } from '../../../hooks/useDebounce'

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

/**
 * Isola a chamada (debounced) a `POST /precificacao-produto/simular` — o cálculo do preço sugerido
 * é sempre feito pelo backend, nunca localmente (ver doc/precificacao-custo-ingrediente.md). `retry:
 * false` porque um 400 aqui é uma regra de negócio (ex: produto sem receita), não uma falha
 * transitória — repetir a chamada só duplicaria o toast de erro sem mudar o resultado.
 */
export function usePrecificacaoSimulada(input: PrecificacaoProdutoSimularForm, enabled: boolean) {
  const debounced = useDebounce(input, 450)

  const query = useQuery({
    queryKey: [...QUERY_KEY, 'simular', debounced],
    queryFn: () => precificacaoProdutoService.simular(debounced),
    enabled: enabled && debounced.produtoId > 0,
    retry: false,
    staleTime: 0,
  })

  return {
    dado: query.data,
    carregando: query.isFetching,
    erro: query.error,
  }
}

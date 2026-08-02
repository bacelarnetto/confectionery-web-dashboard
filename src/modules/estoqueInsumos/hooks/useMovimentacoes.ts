import { useQuery } from '@tanstack/react-query'
import movimentacaoService from '../services/movimentacaoService'

export function useMovimentacoes(
  page = 0,
  size = 20,
  filters?: { tipo?: string }
) {
  return useQuery({
    queryKey: ['movimentacoes', page, size, filters],
    queryFn: () => movimentacaoService.getAll(page, size, filters),
  })
}

export function useMovimentacoesPorSaida(itemSaidaInsumoId: number) {
  return useQuery({
    queryKey: ['movimentacoes', 'saida', itemSaidaInsumoId],
    queryFn: () => movimentacaoService.getBySaidaId(itemSaidaInsumoId),
    enabled: !!itemSaidaInsumoId,
  })
}

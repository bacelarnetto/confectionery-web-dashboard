import { useQuery } from '@tanstack/react-query'
import estoqueInsumoService from '../services/estoqueInsumoService'

export function useEstoqueInsumos(
  page = 0,
  size = 20,
  filters?: { insumoId?: number; categoriaId?: number }
) {
  return useQuery({
    queryKey: ['estoque-insumos', page, size, filters],
    queryFn: () => estoqueInsumoService.getAll(page, size, filters),
  })
}

export function useEstoqueInsumoPorInsumo(insumoId: number) {
  return useQuery({
    queryKey: ['estoque-insumo', insumoId],
    queryFn: () => estoqueInsumoService.getByInsumoId(insumoId),
    enabled: !!insumoId,
  })
}

export function useEstoqueValorizado() {
  return useQuery({
    queryKey: ['estoque-insumo', 'valorizado'],
    queryFn: () => estoqueInsumoService.getValorizado(),
  })
}

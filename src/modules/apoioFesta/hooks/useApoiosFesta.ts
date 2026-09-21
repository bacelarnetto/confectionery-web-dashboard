import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import apoioFestaService, { ApoioFestaFiltros } from '../services/apoioFestaService'
import { ApoioFestaInsertForm } from '../types/apoioFesta'

const QUERY_KEY = ['apoios-festa']
// valorTotal do Pedido é ajustado automaticamente pelo backend ao criar/cancelar um Apoio de
// Festa -- invalidar essa key também garante que a tela de Pedido mostre o total certo sem
// precisar de um PUT /pedido/{id} manual.
const PEDIDOS_QUERY_KEY = ['pedidos']

export function useApoiosFesta(page = 0, size = 20, filtros?: ApoioFestaFiltros, enabled = true) {
  return useQuery({
    queryKey: [...QUERY_KEY, page, size, filtros],
    queryFn: () => apoioFestaService.getAll(page, size, filtros),
    enabled,
  })
}

export function useCreateApoioFesta() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ApoioFestaInsertForm) => apoioFestaService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: PEDIDOS_QUERY_KEY })
      toast.success('Apoio de festa cadastrado com sucesso!')
    },
  })
}

export function useCancelarApoioFesta() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => apoioFestaService.cancelar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: PEDIDOS_QUERY_KEY })
      toast.success('Apoio de festa cancelado.')
    },
  })
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import formaPagamentoService from '../services/formaPagamentoService'
import { FormaPagamentoInsertForm, FormaPagamentoUpdateForm } from '../types/formaPagamento'

const QUERY_KEY = ['formas-pagamento']

export function useFormasPagamento(page = 0, size = 50, nome?: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, page, size, nome],
    queryFn: () => formaPagamentoService.getAll(page, size, nome),
  })
}

export function useFormaPagamento(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => formaPagamentoService.getById(id),
    enabled: id > 0,
  })
}

export function useCreateFormaPagamento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: FormaPagamentoInsertForm) => formaPagamentoService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Forma de pagamento criada com sucesso!')
    },
  })
}

export function useUpdateFormaPagamento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormaPagamentoUpdateForm }) =>
      formaPagamentoService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Forma de pagamento atualizada com sucesso!')
    },
  })
}

export function useDeleteFormaPagamento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => formaPagamentoService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Forma de pagamento removida com sucesso!')
    },
  })
}

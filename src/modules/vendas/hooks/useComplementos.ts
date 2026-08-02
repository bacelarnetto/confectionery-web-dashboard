import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import complementoService from '../services/complementoService'
import { ComplementoInsertForm, ComplementoUpdateForm } from '../types/complemento'

const QUERY_KEY = ['complementos']

export function useComplementos(page = 0, size = 20, filters?: { nome?: string }) {
  return useQuery({
    queryKey: [...QUERY_KEY, page, size, filters],
    queryFn: () => complementoService.getAll(page, size, filters),
  })
}

export function useComplemento(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => complementoService.getById(id),
    enabled: id > 0,
  })
}

export function useCreateComplemento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ComplementoInsertForm) => complementoService.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); toast.success('Complemento criado!') },
  })
}

export function useUpdateComplemento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ComplementoUpdateForm }) => complementoService.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); toast.success('Complemento atualizado!') },
  })
}

export function useDeleteComplemento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => complementoService.remove(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); toast.success('Complemento removido!') },
  })
}

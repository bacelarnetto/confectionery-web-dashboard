import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import orcamentoService from '../services/orcamentoService'
import { OrcamentoInsertForm, OrcamentoUpdateForm } from '../types/orcamento'

const QUERY_KEY = ['orcamentos']
const PEDIDOS_QUERY_KEY = ['pedidos']

export function useOrcamentos(page = 0, size = 20, filters?: { clienteId?: number; status?: string }) {
  return useQuery({
    queryKey: [...QUERY_KEY, page, size, filters],
    queryFn: () => orcamentoService.getAll(page, size, filters),
  })
}

export function useOrcamento(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => orcamentoService.getById(id),
    enabled: id > 0,
  })
}

export function useCreateOrcamento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: OrcamentoInsertForm) => orcamentoService.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); toast.success('Orçamento criado!') },
  })
}

export function useUpdateOrcamento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: OrcamentoUpdateForm }) => orcamentoService.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); toast.success('Orçamento atualizado!') },
  })
}

export function useUpdateOrcamentoStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => orcamentoService.updateStatus(id, status),
    onSuccess: (orcamento) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      if (orcamento.status === 'CONVERTIDO') {
        queryClient.invalidateQueries({ queryKey: PEDIDOS_QUERY_KEY })
        toast.success(`Orçamento aprovado! Pedido #${orcamento.pedidoId} criado.`)
      } else {
        toast.success('Orçamento rejeitado.')
      }
    },
  })
}

export function useDownloadOrcamentoPdf() {
  return useMutation({
    mutationFn: (id: number) => orcamentoService.getPdf(id),
    onSuccess: (data, id) => {
      const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `orcamento-${id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Download em andamento...')
    },
    onError: () => {
      toast.error('Erro ao baixar PDF do orçamento.')
    },
  })
}

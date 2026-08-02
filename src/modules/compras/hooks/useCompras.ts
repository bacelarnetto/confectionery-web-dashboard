import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import compraService from '../services/compraService'
import { CompraInsertForm, CompraUpdateForm } from '../types/compra'
import { EntradaInsumoInsertForm } from '../../estoqueInsumos/types/entradaInsumo'

const QUERY_KEY = ['compras']

export function useCompras(
  page = 0,
  size = 20,
  filters?: {
    fornecedorId?: number;
    status?: string;
    dataInicial?: string;
    dataFinal?: string;
  }
) {
  return useQuery({
    queryKey: [...QUERY_KEY, page, size, filters],
    queryFn: () => compraService.getAll(page, size, filters),
  })
}

export function useCompra(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => compraService.getById(id),
    enabled: id > 0,
  })
}

export function useCreateCompra() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CompraInsertForm) => compraService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Compra criada com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao criar compra. Tente novamente.')
    },
  })
}

export function useUpdateCompra() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CompraUpdateForm }) =>
      compraService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Compra atualizada com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao atualizar compra. Tente novamente.')
    },
  })
}

export function useUpdateCompraStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      compraService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Status da compra atualizado!')
    },
    onError: () => {
      toast.error('Erro ao atualizar o status. Tente novamente.')
    },
  })
}

export function useGerarEntradaInsumoCompra() {
  return useMutation({
    mutationFn: ({ compraId, payload }: { compraId: number; payload: EntradaInsumoInsertForm }) =>
      compraService.gerarEntradaInsumo(compraId, payload),
    onSuccess: () => {
      toast.success('Entrada de insumos gerada com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao gerar entrada no estoque.')
    },
  })
}

export function useDownloadPdfCompra() {
  return useMutation({
    mutationFn: (id: number) => compraService.downloadPdf(id),
    onSuccess: (data, id) => {
      const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `pedido-compra-${id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Download em andamento...')
    },
    onError: () => {
      toast.error('Erro ao baixar PDF da compra.')
    },
  })
}

export function useDeleteCompra() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => compraService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Compra removida com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao remover compra. Tente novamente.')
    },
  })
}
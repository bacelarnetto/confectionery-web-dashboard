import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import financeiroService from '../services/financeiroService'
import { TipoGastoInsertForm, TipoGastoUpdateForm } from '../types/tipoGasto'
import { GastoInsertForm, GastoUpdateForm } from '../types/gasto'
import {
  ContaAvulsaInsertForm,
  ContaAvulsaUpdateForm,
  RecebimentoAvulsaForm,
} from '../types/contaReceber'

const TIPOS_GASTO_KEY = ['tipos-gasto']
const GASTOS_KEY = ['gastos']
const RESUMO_KEY = ['resumo']
const CONTAS_KEY = ['contas-receber']

// --- Tipos de gasto ---

export function useTiposGasto(page = 0, size = 50, nome?: string) {
  return useQuery({
    queryKey: [...TIPOS_GASTO_KEY, page, size, nome],
    queryFn: () => financeiroService.getTiposGasto(page, size, nome),
  })
}

export function useTipoGasto(id: number) {
  return useQuery({
    queryKey: [...TIPOS_GASTO_KEY, id],
    queryFn: () => financeiroService.getTipoGasto(id),
    enabled: id > 0,
  })
}

export function useCreateTipoGasto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TipoGastoInsertForm) => financeiroService.createTipoGasto(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TIPOS_GASTO_KEY })
      toast.success('Tipo de gasto criado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao criar o tipo de gasto. Tente novamente.')
    },
  })
}

export function useUpdateTipoGasto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TipoGastoUpdateForm }) =>
      financeiroService.updateTipoGasto(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TIPOS_GASTO_KEY })
      toast.success('Tipo de gasto atualizado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao atualizar o tipo de gasto. Tente novamente.')
    },
  })
}

export function useDeleteTipoGasto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => financeiroService.deleteTipoGasto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TIPOS_GASTO_KEY })
      queryClient.invalidateQueries({ queryKey: GASTOS_KEY })
      toast.success('Tipo de gasto removido com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao remover o tipo de gasto. Tente novamente.')
    },
  })
}

// --- Gastos ---

export function useGastos(page = 0, size = 50, filters?: { mes?: string; tipoGastoId?: number }) {
  return useQuery({
    queryKey: [...GASTOS_KEY, page, size, filters],
    queryFn: () => financeiroService.getGastos(page, size, filters),
  })
}

export function useGasto(id: number) {
  return useQuery({
    queryKey: [...GASTOS_KEY, id],
    queryFn: () => financeiroService.getGasto(id),
    enabled: id > 0,
  })
}

export function useCreateGasto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: GastoInsertForm) => financeiroService.createGasto(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GASTOS_KEY })
      queryClient.invalidateQueries({ queryKey: RESUMO_KEY })
      toast.success('Gasto registrado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao registrar o gasto. Tente novamente.')
    },
  })
}

export function useUpdateGasto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: GastoUpdateForm }) =>
      financeiroService.updateGasto(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GASTOS_KEY })
      queryClient.invalidateQueries({ queryKey: RESUMO_KEY })
      toast.success('Gasto atualizado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao atualizar o gasto. Tente novamente.')
    },
  })
}

export function useDeleteGasto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => financeiroService.deleteGasto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GASTOS_KEY })
      queryClient.invalidateQueries({ queryKey: RESUMO_KEY })
      toast.success('Gasto removido com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao remover o gasto. Tente novamente.')
    },
  })
}

export function useRepetirGasto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => financeiroService.repetirGasto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GASTOS_KEY })
      queryClient.invalidateQueries({ queryKey: RESUMO_KEY })
      toast.success('Gasto repetido para o próximo mês!')
    },
    onError: () => {
      toast.error('Erro ao repetir o gasto. Tente novamente.')
    },
  })
}

// --- Resumo do mês ---

export function useResumoMes(mes: string) {
  return useQuery({
    queryKey: [...RESUMO_KEY, mes],
    queryFn: () => financeiroService.getResumo(mes),
  })
}

// --- Contas a receber ---

export function useContasReceber(apenasPendentes = true) {
  return useQuery({
    queryKey: [...CONTAS_KEY, apenasPendentes],
    queryFn: () => financeiroService.getContasReceber(apenasPendentes),
  })
}

export function useContaAvulsa(id: number) {
  return useQuery({
    queryKey: [...CONTAS_KEY, 'avulsas', id],
    queryFn: () => financeiroService.getContaAvulsa(id),
    enabled: id > 0,
  })
}

export function useCreateContaAvulsa() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ContaAvulsaInsertForm) => financeiroService.createContaAvulsa(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTAS_KEY })
      queryClient.invalidateQueries({ queryKey: RESUMO_KEY })
      toast.success('Conta avulsa cadastrada com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao cadastrar a conta avulsa. Tente novamente.')
    },
  })
}

export function useUpdateContaAvulsa() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ContaAvulsaUpdateForm }) =>
      financeiroService.updateContaAvulsa(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTAS_KEY })
      queryClient.invalidateQueries({ queryKey: RESUMO_KEY })
      toast.success('Conta avulsa atualizada com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao atualizar a conta avulsa. Tente novamente.')
    },
  })
}

export function useDeleteContaAvulsa() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => financeiroService.deleteContaAvulsa(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTAS_KEY })
      queryClient.invalidateQueries({ queryKey: RESUMO_KEY })
      toast.success('Conta avulsa removida com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao remover a conta avulsa. Tente novamente.')
    },
  })
}

export function useRegistrarRecebimentoAvulsa() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RecebimentoAvulsaForm }) =>
      financeiroService.registrarRecebimentoAvulsa(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTAS_KEY })
      queryClient.invalidateQueries({ queryKey: RESUMO_KEY })
      toast.success('Recebimento registrado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao registrar o recebimento. Tente novamente.')
    },
  })
}
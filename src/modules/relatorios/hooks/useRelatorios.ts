import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import relatorioService from '../services/relatorioService'
import { MovimentacaoEstoqueFiltros } from '../types/relatorio'

const QUERY_KEY = ['relatorios']

export function useRelatorioFaturamentoMensal(meses: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'faturamento-mensal', meses],
    queryFn: () => relatorioService.getFaturamentoMensal(meses),
  })
}

export function useRelatorioCustoProducao(categoriaProdutoId?: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'custo-producao', categoriaProdutoId],
    queryFn: () => relatorioService.getCustoProducao(categoriaProdutoId),
  })
}

export function useRelatorioMovimentacaoEstoque(filtros: MovimentacaoEstoqueFiltros) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'movimentacao-estoque', filtros],
    queryFn: () => relatorioService.getMovimentacaoEstoque(filtros),
  })
}

function useDownloadMutation(fn: (...args: any[]) => Promise<void>) {
  return useMutation({
    mutationFn: fn,
    onError: () => toast.error('Erro ao gerar o arquivo do relatório.'),
  })
}

export function useBaixarFaturamentoMensalCsv() {
  return useDownloadMutation((meses: number) => relatorioService.baixarFaturamentoMensalCsv(meses))
}
export function useBaixarFaturamentoMensalPdf() {
  return useDownloadMutation((meses: number) => relatorioService.baixarFaturamentoMensalPdf(meses))
}
export function useBaixarCustoProducaoCsv() {
  return useDownloadMutation((categoriaProdutoId: number | undefined) => relatorioService.baixarCustoProducaoCsv(categoriaProdutoId))
}
export function useBaixarCustoProducaoPdf() {
  return useDownloadMutation((categoriaProdutoId: number | undefined) => relatorioService.baixarCustoProducaoPdf(categoriaProdutoId))
}
export function useBaixarMovimentacaoEstoqueCsv() {
  return useDownloadMutation((filtros: MovimentacaoEstoqueFiltros) => relatorioService.baixarMovimentacaoEstoqueCsv(filtros))
}
export function useBaixarMovimentacaoEstoquePdf() {
  return useDownloadMutation((filtros: MovimentacaoEstoqueFiltros) => relatorioService.baixarMovimentacaoEstoquePdf(filtros))
}

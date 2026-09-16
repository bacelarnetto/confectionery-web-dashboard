import api from '../../../lib/axios'
import {
  RelatorioFaturamentoMensal,
  RelatorioCustoProducao,
  RelatorioMovimentacaoEstoque,
  MovimentacaoEstoqueFiltros,
} from '../types/relatorio'
import { normalizePage, RawPage, PageResponse } from '../../../lib/pagination'

function baixarArquivo(path: string, params: object, mimeType: string, nomeArquivo: string): Promise<void> {
  return api
    .get(path, { params, responseType: 'blob' })
    .then((res) => {
      const url = window.URL.createObjectURL(new Blob([res.data], { type: mimeType }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', nomeArquivo)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    })
}

const relatorioService = {
  getFaturamentoMensal(meses: number): Promise<RelatorioFaturamentoMensal[]> {
    return api.get('/relatorio/faturamento-mensal', { params: { meses } }).then((r) => r.data)
  },
  baixarFaturamentoMensalCsv(meses: number) {
    return baixarArquivo('/relatorio/faturamento-mensal/csv', { meses }, 'text/csv', 'faturamento-mensal.csv')
  },
  baixarFaturamentoMensalPdf(meses: number) {
    return baixarArquivo('/relatorio/faturamento-mensal/pdf', { meses }, 'application/pdf', 'faturamento-mensal.pdf')
  },

  getCustoProducao(page = 0, size = 20, categoriaProdutoId?: number): Promise<PageResponse<RelatorioCustoProducao>> {
    return api
      .get<RawPage<RelatorioCustoProducao>>('/relatorio/custo-producao', { params: { page, size, categoriaProdutoId } })
      .then((r) => normalizePage(r.data))
  },
  baixarCustoProducaoCsv(categoriaProdutoId?: number) {
    return baixarArquivo('/relatorio/custo-producao/csv', { categoriaProdutoId }, 'text/csv', 'custo-producao.csv')
  },
  baixarCustoProducaoPdf(categoriaProdutoId?: number) {
    return baixarArquivo('/relatorio/custo-producao/pdf', { categoriaProdutoId }, 'application/pdf', 'custo-producao.pdf')
  },

  getMovimentacaoEstoque(page = 0, size = 20, filtros: MovimentacaoEstoqueFiltros): Promise<PageResponse<RelatorioMovimentacaoEstoque>> {
    return api
      .get<RawPage<RelatorioMovimentacaoEstoque>>('/relatorio/movimentacao-estoque', { params: { page, size, ...filtros } })
      .then((r) => normalizePage(r.data))
  },
  baixarMovimentacaoEstoqueCsv(filtros: MovimentacaoEstoqueFiltros) {
    return baixarArquivo('/relatorio/movimentacao-estoque/csv', filtros, 'text/csv', 'movimentacao-estoque.csv')
  },
  baixarMovimentacaoEstoquePdf(filtros: MovimentacaoEstoqueFiltros) {
    return baixarArquivo('/relatorio/movimentacao-estoque/pdf', filtros, 'application/pdf', 'movimentacao-estoque.pdf')
  },
}

export default relatorioService

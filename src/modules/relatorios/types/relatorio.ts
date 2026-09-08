export interface RelatorioFaturamentoMensal {
  mes: string
  quantidadePedidos: number
  faturamento: number
  ticketMedio: number
}

export interface RelatorioCustoProducao {
  produtoId: number
  produtoNome: string
  valorCustoIngrediente: number
  valorCustoFixo: number
  margemLucro: number
  valorVenda: number
  lucroBruto: number
}

export type TipoMovimentacao = 'ENTRADA' | 'SAIDA'

export interface RelatorioMovimentacaoEstoque {
  data: string
  tipo: TipoMovimentacao
  insumoNome: string
  quantidade: number
}

export interface MovimentacaoEstoqueFiltros {
  dataInicial?: string
  dataFinal?: string
  tipo?: TipoMovimentacao
}

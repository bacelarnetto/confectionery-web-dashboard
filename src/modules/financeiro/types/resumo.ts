export interface GastoPorCategoria {
  tipoGastoId: number
  tipoGastoNome: string
  valor: number
}

export interface RecebimentosPendentes {
  total: number
  quantidade: number
}

export interface ResumoMes {
  mes: string
  receita: number
  gastos: number
  cogsInsumos: number
  lucroReal: number
  gastosPorCategoria: GastoPorCategoria[]
  recebimentosPendentes: RecebimentosPendentes
}
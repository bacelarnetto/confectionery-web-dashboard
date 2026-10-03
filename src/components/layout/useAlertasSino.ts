import { useAlertasCountAtivos, useAlertasRecentes } from '../../modules/estoqueInsumos/hooks/useAlertas'
import { useAlertasProdutoCountAtivos, useAlertasProdutoRecentes } from '../../modules/estoqueProdutos/hooks/useAlertasProduto'

// Decisão do dono (2026-09-28): alertas de pedido ficam só no calendário do topo; o sino mostra os
// OUTROS alertas -- de insumo e de produto, misturados e ordenados por data. Cada origem é uma
// query independente: se uma falhar, o sino continua com a outra (contagem e lista).

export type OrigemAlertaSino = 'INSUMO' | 'PRODUTO'

export interface AlertaSino {
  key: string
  origem: OrigemAlertaSino
  nome: string
  tipoId: number
  mensagem: string
  data: string
  dataValidade?: string
  rota: string
}

export const ROTA_ALERTAS: Record<OrigemAlertaSino, string> = {
  INSUMO: '/estoque-insumos/alertas',
  PRODUTO: '/estoque-produtos/alertas',
}

function tempo(iso: string | undefined): number {
  const t = iso ? new Date(iso).getTime() : NaN
  return Number.isNaN(t) ? 0 : t
}

export function useAlertasSino(size = 5) {
  const countInsumo = useAlertasCountAtivos()
  const countProduto = useAlertasProdutoCountAtivos()
  const recentesInsumo = useAlertasRecentes(size)
  const recentesProduto = useAlertasProdutoRecentes(size)

  const contagens = [countInsumo.data, countProduto.data].filter((c): c is number => typeof c === 'number')
  const count = contagens.length ? contagens.reduce((a, b) => a + b, 0) : undefined

  const insumos: AlertaSino[] = (recentesInsumo.data?.content ?? []).map((a) => ({
    key: `INSUMO-${a.id}`,
    origem: 'INSUMO',
    nome: a.insumoNome ?? `Insumo #${a.insumoId}`,
    tipoId: a.tipoId,
    mensagem:
      a.tipoId === 1 ? '' // vencimento: o Header monta com a data formatada
      : a.tipoId === 2 ? `Abaixo do mínimo (${a.quantidadeMinimaEstoque})`
      : a.tipoId === 3 ? `Acima do máximo (${a.quantidadeMaximaEstoque})`
      : a.tipoDescricao ?? '',
    data: a.data,
    dataValidade: a.dataValidade,
    rota: ROTA_ALERTAS.INSUMO,
  }))
  const produtos: AlertaSino[] = (recentesProduto.data?.content ?? []).map((a) => ({
    key: `PRODUTO-${a.id}`,
    origem: 'PRODUTO',
    nome: a.produtoNome ?? `Produto #${a.produtoId}`,
    tipoId: a.tipoId,
    mensagem:
      a.tipoId === 1 ? ''
      : a.tipoId === 2 ? `Abaixo do mínimo (${a.quantidadeMinimaEstoque})`
      : a.tipoDescricao ?? '',
    data: a.data,
    dataValidade: a.dataValidade,
    rota: ROTA_ALERTAS.PRODUTO,
  }))

  const alertas = [...insumos, ...produtos].sort((a, b) => tempo(b.data) - tempo(a.data)).slice(0, size)

  function refetch() {
    countInsumo.refetch()
    countProduto.refetch()
    recentesInsumo.refetch()
    recentesProduto.refetch()
  }

  return {
    count,
    countInsumo: countInsumo.data ?? 0,
    countProduto: countProduto.data ?? 0,
    alertas,
    // Falha por origem (contagem ou lista) -- mostrada discretamente dentro do dropdown aberto.
    erroInsumo: countInsumo.isError || recentesInsumo.isError,
    erroProduto: countProduto.isError || recentesProduto.isError,
    refetch,
  }
}

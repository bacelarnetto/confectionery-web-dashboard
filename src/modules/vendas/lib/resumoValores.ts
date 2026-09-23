import { ComplementoResolvido } from '../components/ComplementoPicker'

export interface ItemParaResumo {
  quantidade: string
  valorUnitario: string
  desconto: string
  complementosResolvidos: ComplementoResolvido[]
}

export interface ResumoValores {
  subtotalItens: number
  totalDesconto: number
  totalComplementos: number
  valorFrete: number
  /** Soma dos Apoios de Festa (locação de carrinho/tacho/decoração): ATIVOS no Pedido, ou
   * propostos (ApoioOrcamento) no Orçamento -- desde a correção de 2026-09-22, os dois somam no
   * total (Pedido.valorTotal / Orcamento.valorTotal via OrcamentoValorTotalAjustePort). */
  valorApoioFesta: number
  total: number
}

/**
 * Espelha exatamente PedidoCalculoLogic/OrcamentoCalculoLogic (idênticas no backend): por item,
 * total = (valorUnitario × quantidade − desconto) + (Σ valorVenda dos extras não-padrão × quantidade).
 * Complemento padrão nunca soma (valorVenda sempre 0 no save), mas filtra mesmo assim por clareza.
 * `valorApoioFesta` (padrão 0) entra no total da mesma forma que o backend faz no
 * `PedidoCalculoLogic.calcularValorTotalPedido` (itens + frete + apoio ativo).
 */
export function calcularResumo(itens: ItemParaResumo[], valorFrete = 0, valorApoioFesta = 0): ResumoValores {
  let subtotalItens = 0
  let totalDesconto = 0
  let totalComplementos = 0

  for (const it of itens) {
    const quantidade = Number(it.quantidade) || 0
    const valorUnitario = Number(it.valorUnitario) || 0
    const desconto = Number(it.desconto) || 0
    const extrasValor = it.complementosResolvidos
      .filter((c) => !c.padrao)
      .reduce((acc, c) => acc + c.valorVenda, 0)

    subtotalItens += valorUnitario * quantidade
    totalDesconto += desconto
    totalComplementos += extrasValor * quantidade
  }

  const total = subtotalItens - totalDesconto + totalComplementos + valorFrete + valorApoioFesta

  return { subtotalItens, totalDesconto, totalComplementos, valorFrete, valorApoioFesta, total }
}

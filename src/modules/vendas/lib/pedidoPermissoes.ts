import { statusDisponiveisPara, tituloStatusPill } from './pedidoStatus'

// Matriz de permissões por perfil na tela de Pedido -- decisão do dono, reforçada no backend
// (PedidoPermissaoLogic, ver doc/acao-permissoes-pedido.md no repo do backend). A UI só espelha
// a mesma regra; o backend continua sendo a fonte da verdade (perfil sem permissão recebe 403).
const STATUS_ABERTO_VENDAS = ['RASCUNHO', 'CONFIRMADO']

// PRODUCAO move o pedido a partir de EM_PRODUCAO em diante -- é quem confirma
// CONFIRMADO -> EM_PRODUCAO e segue até CONCLUIDO. VENDAS cobre o início (até CONFIRMADO) e o
// cancelamento pré-produção; os dois perfis cobrem o ciclo inteiro sem sobreposição.
const STATUS_DESTINO_PRODUCAO = ['EM_PRODUCAO', 'PRONTO', 'A_CAMINHO', 'ENTREGUE', 'CONCLUIDO']

export function podeCriarPedido(perfis: string[]): boolean {
  return perfis.includes('ADMIN') || perfis.includes('VENDAS')
}

export function podeEditarDadosPedido(perfis: string[], statusAtual: string | undefined): boolean {
  if (perfis.includes('ADMIN')) return true
  if (perfis.includes('VENDAS')) return !statusAtual || STATUS_ABERTO_VENDAS.includes(statusAtual)
  return false
}

export function podeRegistrarPagamentoPedido(perfis: string[]): boolean {
  return perfis.includes('ADMIN') || perfis.includes('VENDAS')
}

function podeTransicionarPara(destino: string, statusAtual: string | undefined, perfis: string[]): boolean {
  if (destino === 'CANCELADO') {
    return perfis.includes('VENDAS') && (!statusAtual || STATUS_ABERTO_VENDAS.includes(statusAtual))
  }
  if (perfis.includes('VENDAS') && destino === 'CONFIRMADO') return true
  if (perfis.includes('PRODUCAO') && STATUS_DESTINO_PRODUCAO.includes(destino)) return true
  return false
}

// Mesma lista de `statusDisponiveisPara`, filtrada pelo que o perfil do usuário pode de fato
// executar. ADMIN nunca filtra (vê tudo que a ordem canônica permite). `retirar` propaga a
// exceção de retirada no local (pula A_CAMINHO, achado #71) -- não muda a matriz por perfil em
// si, já que ENTREGUE já é um destino válido pra PRODUCAO independente de vir de A_CAMINHO ou
// direto de PRONTO.
export function statusDisponiveisParaPerfil(atual: string | undefined, perfis: string[], retirar?: boolean): string[] {
  const disponiveis = statusDisponiveisPara(atual, retirar)
  if (perfis.includes('ADMIN')) return disponiveis
  return disponiveis.filter((destino) => podeTransicionarPara(destino, atual, perfis))
}

// Tooltip pra um status desabilitado: prioriza a explicação de ordem já existente
// (`tituloStatusPill`) e só usa a explicação de perfil quando a transição seria válida pela
// ordem canônica mas o perfil não tem permissão pra ela.
export function tituloStatusPillPerfil(status: string, atual: string | undefined, perfis: string[], retirar?: boolean): string | undefined {
  if (!atual || status === atual) return undefined
  if (!statusDisponiveisPara(atual, retirar).includes(status)) return tituloStatusPill(status, atual, retirar)
  if (!statusDisponiveisParaPerfil(atual, perfis, retirar).includes(status)) {
    return 'Seu perfil não tem permissão para fazer essa mudança de status.'
  }
  return undefined
}

import { useState } from 'react'
import { AlertTriangle, AlertCircle, ExternalLink, Copy, Check, X, Layers } from 'lucide-react'

export interface ItemEstoqueInsuficiente {
  nome: string
  necessario: string
  disponivel: string
  falta?: string
}

export interface PedidoErroDetalhes {
  isEstoqueInsuficiente: boolean
  // Achado da homologação 2026-09-19: o modal era compartilhado entre falta de PRODUTO acabado
  // e falta de INSUMO (reserva de complementos), mas o texto/ações eram fixos pro cenário de
  // produto -- confundia o usuário no cenário de insumo (sugeria "Fabricar"/"Entrada de Produto"
  // quando a ação certa é Entrada de Insumo). Distinguido pelo texto da mensagem do backend:
  // EstoqueComplementoValidationService sempre menciona "insumo", EstoqueProdutoValidationService
  // nunca menciona.
  tipoEstoque: 'produto' | 'insumo'
  itensSemEstoque: ItemEstoqueInsuficiente[]
  mensagemOriginal: string
  requestId?: string
}

export function parsePedidoErro(erro: unknown): PedidoErroDetalhes {
  const axiosErr = erro as any
  const data = axiosErr?.response?.data
  const rawMsg: string =
    (typeof data === 'string' ? data : (data?.mensagem || data?.message)) ||
    (typeof erro === 'string' ? erro : '') ||
    (erro as any)?.message ||
    ''
  const reqId =
    data?.requestId ||
    axiosErr?.response?.headers?.['x-request-id'] ||
    rawMsg.match(/\(ID:\s*([a-zA-Z0-9-]+)\)/i)?.[1]

  const isEstoque = /estoque insuficiente/i.test(rawMsg)
  const tipoEstoque: 'produto' | 'insumo' = isEstoque && /insumo/i.test(rawMsg) ? 'insumo' : 'produto'
  const itensSemEstoque: ItemEstoqueInsuficiente[] = []

  if (isEstoque) {
    // Remove o ID do final se estiver na string
    let msg = rawMsg.replace(/\(ID:\s*[a-zA-Z0-9-]+\)/gi, '').trim()
    // Remove qualquer prefixo do tipo "Estoque insuficiente... :"
    msg = msg.replace(/^.*?estoque insuficiente[^\:]*:\s*/i, '').trim()

    const matches = Array.from(
      msg.matchAll(/([^,()]+?)\s*\(necessário\s*([\d.,]+),\s*disponível\s*([\d.,]+)\)/gi)
    )

    for (const m of matches) {
      const nome = m[1].replace(/^[.,;\s]+|[.,;\s]+$/g, '').trim()
      const necStr = m[2].trim()
      const dispStr = m[3].trim()
      const necNum = parseFloat(necStr.replace(',', '.'))
      const dispNum = parseFloat(dispStr.replace(',', '.'))
      const faltaNum = !isNaN(necNum) && !isNaN(dispNum) ? Math.max(0, necNum - dispNum) : undefined

      itensSemEstoque.push({
        nome,
        necessario: necStr,
        disponivel: dispStr,
        falta: faltaNum != null ? (Number.isInteger(faltaNum) ? String(faltaNum) : faltaNum.toFixed(3)) : undefined,
      })
    }
  }

  return {
    isEstoqueInsuficiente: isEstoque,
    tipoEstoque,
    itensSemEstoque,
    mensagemOriginal: rawMsg.replace(/\(ID:\s*[a-zA-Z0-9-]+\)/gi, '').trim(),
    requestId: reqId,
  }
}

interface Props {
  open: boolean
  onClose: () => void
  erro: unknown
  pedidoId?: number
}

export default function PedidoErroModal({ open, onClose, erro, pedidoId }: Props) {
  const [copied, setCopied] = useState(false)

  if (!open || !erro) return null

  const detalhes = parsePedidoErro(erro)

  function handleCopyId() {
    if (detalhes.requestId) {
      navigator.clipboard.writeText(detalhes.requestId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function handleIrParaFabricacao() {
    window.open('/estoque-produtos/fabricacoes/nova', '_blank')
  }

  function handleIrParaEntradaInsumo() {
    window.open('/estoque-insumos/entradas/nova', '_blank')
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onSubmit={(e) => e.stopPropagation()}
    >
      {/* Overlay escuro de fundo */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />

      {/* Caixa do Modal */}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in fade-in-50 zoom-in-95 duration-150">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl shrink-0 ${
                detalhes.isEstoqueInsuficiente
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {detalhes.isEstoqueInsuficiente ? (
                <AlertTriangle size={24} />
              ) : (
                <AlertCircle size={24} />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                {detalhes.isEstoqueInsuficiente
                  ? detalhes.tipoEstoque === 'insumo'
                    ? 'Insumo Insuficiente'
                    : 'Estoque Insuficiente'
                  : 'Atenção ao Pedido'}
              </h3>
              <p className="text-xs text-gray-500">
                {pedidoId ? `Pedido #${pedidoId}` : 'Validação de Pedido'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {detalhes.isEstoqueInsuficiente ? (
            <>
              <p className="text-sm text-gray-600">
                {detalhes.tipoEstoque === 'insumo'
                  ? 'Não foi possível reservar os complementos deste pedido porque o estoque de insumo é insuficiente:'
                  : 'Não foi possível colocar este pedido em produção porque o estoque atual de produtos acabados é insuficiente:'}
              </p>

              {/* Tabela / Cards de Itens em Falta */}
              {detalhes.itensSemEstoque.length > 0 ? (
                <div className="space-y-2.5">
                  {detalhes.itensSemEstoque.map((it, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-amber-50/50 border border-amber-200/80 rounded-xl space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-gray-900 text-sm">{it.nome}</span>
                        <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-md">
                          Faltam {it.falta ?? 'unidades'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white p-2 rounded-lg border border-amber-100">
                          <span className="text-gray-500 block">Necessário para o pedido</span>
                          <span className="font-bold text-gray-800 text-sm">{it.necessario}</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-amber-100">
                          <span className="text-gray-500 block">Disponível no estoque</span>
                          <span className="font-bold text-red-600 text-sm">{it.disponivel}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                  {detalhes.mensagemOriginal}
                </div>
              )}

              {/* Guia de Ação Recomendada */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200/70 rounded-xl text-xs space-y-2 text-blue-900">
                <p className="font-semibold flex items-center gap-1.5">
                  <span>💡</span> O que você pode fazer para prosseguir:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-blue-800">
                  {detalhes.tipoEstoque === 'insumo' ? (
                    <>
                      <li>
                        <strong>Entrada de Insumo:</strong> Registre uma entrada do(s) insumo(s) em falta em <em>Estoque de Insumos → Entradas</em> para liberar a reserva dos complementos.
                      </li>
                      <li>
                        <strong>Remover o complemento:</strong> Retire ou troque o complemento que depende desse insumo no item do pedido.
                      </li>
                      <li>
                        <strong>Ajustar quantidade:</strong> Modifique a quantidade de itens no pedido se houver acordo com o cliente.
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <strong>Fabricar o produto:</strong> Registre a fabricação deste item para debitar os insumos (FIFO) e alimentar o estoque do produto.
                      </li>
                      <li>
                        <strong>Entrada manual:</strong> Se comprou o produto pronto ou terceirizou, faça uma entrada em <em>Estoque de Produtos → Entradas</em>.
                      </li>
                      <li>
                        <strong>Ajustar quantidade:</strong> Modifique a quantidade de itens no pedido se houver acordo com o cliente.
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </>
          ) : (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800 leading-relaxed">
              {detalhes.mensagemOriginal || 'Não foi possível concluir a alteração no pedido.'}
            </div>
          )}

          {/* ID de Referência Técnica / Suporte */}
          {detalhes.requestId && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px] text-gray-400">
              <span className="truncate font-mono">ID: {detalhes.requestId}</span>
              <button
                type="button"
                onClick={handleCopyId}
                className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 bg-gray-100 px-2 py-0.5 rounded transition-colors cursor-pointer shrink-0 ml-2"
                title="Copiar ID do erro"
              >
                {copied ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Rodapé com Ações */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 bg-gray-50 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {detalhes.isEstoqueInsuficiente ? 'Fechar' : 'Entendido'}
          </button>

          {detalhes.isEstoqueInsuficiente && (
            <button
              type="button"
              onClick={detalhes.tipoEstoque === 'insumo' ? handleIrParaEntradaInsumo : handleIrParaFabricacao}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              <Layers size={15} />
              <span>{detalhes.tipoEstoque === 'insumo' ? 'Ir para Nova Entrada de Insumo' : 'Ir para Nova Fabricação'}</span>
              <ExternalLink size={13} className="opacity-80" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

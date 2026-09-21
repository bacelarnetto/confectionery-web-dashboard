import { useRef } from 'react'
import { X, Printer, Calendar, Clock, MapPin, Package, AlertCircle } from 'lucide-react'
import { Pedido } from '../types/pedido'
import { useProdutos } from '../../estoqueProdutos/hooks/useProdutos'
import { useApoiosFesta } from '../../apoioFesta/hooks/useApoiosFesta'

interface Props {
  pedido: Pedido
  open: boolean
  onClose: () => void
}

function formatDateTimeParts(iso?: string) {
  if (!iso) return { data: '—', hora: null }
  const d = new Date(iso)
  const data = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  // Se for meia-noite exata sem hora definida, hora pode ser omitida ou mostrada
  return { data, hora: hora !== '00:00' ? hora : null }
}

export default function ComandaProducaoModal({ pedido, open, onClose }: Props) {
  const printRef = useRef<HTMLDivElement>(null)
  const { data: produtosData } = useProdutos(0, 100)
  const produtos = produtosData?.content ?? []

  const { data: apoioData } = useApoiosFesta(0, 50, { pedidoId: pedido.id, status: 'ATIVO' })
  const apoiosAtivos = apoioData?.content ?? []

  if (!open) return null

  const { data, hora } = formatDateTimeParts(pedido.dataEntrega)

  function getProdutoNome(id: number) {
    const p = produtos.find((item) => item.id === id)
    return p?.nome ?? `Produto #${id}`
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header do Modal (não sai na impressão) */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50 print:hidden">
          <div className="flex items-center gap-2 text-gray-800">
            <Printer size={18} className="text-amber-600" />
            <h3 className="font-bold text-sm">Comanda de Produção</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Área Imprimível da Comanda */}
        <div ref={printRef} className="p-6 overflow-y-auto space-y-5 text-gray-900 print:p-0 print:m-0">
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              .print-area, .print-area * {
                visibility: visible;
              }
              .print-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                padding: 10px;
              }
            }
          `}</style>

          <div className="print-area space-y-4 border-2 border-dashed border-gray-300 p-5 rounded-xl bg-amber-50/20">
            {/* Topo da Comanda */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-gray-800">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-amber-700">Confeitaria Artesanal</p>
                <h1 className="text-2xl font-black text-gray-900">PEDIDO #{pedido.id}</h1>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-1 text-xs font-bold rounded-md bg-gray-900 text-white uppercase tracking-wider">
                  {pedido.status?.replace('_', ' ')}
                </span>
                <p className="text-[11px] text-gray-500 mt-1">
                  Emitido em: {new Date().toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            {/* Caixa de Horário & Entrega */}
            <div className="bg-amber-100/70 border-2 border-amber-300 p-3.5 rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-amber-950 font-bold text-sm">
                  <Calendar size={16} className="text-amber-800" />
                  <span>DATA: {data}</span>
                </div>
                {hora && (
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 text-white font-black text-base rounded shadow-2xs">
                    <Clock size={16} />
                    <span>{hora}</span>
                  </div>
                )}
              </div>

              <div className="mt-2 pt-2 border-t border-amber-200/80 flex items-center gap-2 text-xs font-semibold text-amber-900">
                {pedido.retirar ? (
                  <span className="flex items-center gap-1">
                    <Package size={14} /> 🛍️ RETIRADA NO LOCAL (BALCÃO)
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <MapPin size={14} /> 🛵 ENTREGA: {pedido.endereco ? `${pedido.endereco.logradouro}, ${pedido.endereco.numero} - ${pedido.endereco.bairro}` : 'Endereço cadastrado'}
                  </span>
                )}
              </div>
            </div>

            {/* Dados do Cliente */}
            <div className="text-xs bg-white p-3 rounded-lg border border-gray-200 space-y-1">
              <p className="text-gray-500 font-semibold uppercase text-[10px]">Cliente</p>
              <p className="text-sm font-bold text-gray-900">
                {pedido.clienteNome ?? (pedido.clienteId ? `Cliente #${pedido.clienteId}` : '—')}
              </p>
            </div>

            {/* Itens para Produção */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Itens a Produzir / Decorar:
              </p>
              <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg bg-white">
                {pedido.itens.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-start gap-3">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-gray-900 text-white font-black text-sm shrink-0">
                      {item.quantidade}x
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm">
                        {getProdutoNome(item.produtoId)}
                      </p>
                      {item.complementos && item.complementos.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {item.complementos.map((comp, cIdx) => (
                            <p key={cIdx} className="text-xs text-amber-800 font-medium pl-2 border-l-2 border-amber-300">
                              + {comp.complementoNome ?? `Complemento #${comp.complementoId}`}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Apoio de Festa / Locação de Equipamentos */}
            {apoiosAtivos.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  🎪 Equipamento / Apoio de Festa (Locação):
                </p>
                <div className="divide-y divide-amber-200 border-2 border-amber-300 rounded-lg bg-amber-50/60 p-3 text-xs space-y-2">
                  {apoiosAtivos.map((a) => (
                    <div key={a.id} className="pt-2 first:pt-0">
                      <div className="flex items-center justify-between font-bold text-gray-900 text-sm">
                        <span>{a.itemApoioNome}</span>
                        {a.incluiMaoDeObra && (
                          <span className="text-[10px] bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-bold border border-blue-200">
                            + ATENDENTE
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 text-xs mt-0.5">
                        ⏰ Horário: {formatDateTimeParts(a.horaInicio).data} {formatDateTimeParts(a.horaInicio).hora ?? '08:00'} às {formatDateTimeParts(a.horaFim).hora ?? '22:00'}
                        {a.colaboradorNome && ` • Colaborador(a): ${a.colaboradorNome}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Observações / Recado da Encomenda */}
            {pedido.observacao && (
              <div className="bg-yellow-50 border border-yellow-300 p-3.5 rounded-lg text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-yellow-900">
                  <AlertCircle size={14} className="text-yellow-700" />
                  <span>OBSERVAÇÕES ESPECIAIS / MENSAGEM:</span>
                </div>
                <p className="text-yellow-950 font-medium leading-relaxed pl-5 whitespace-pre-wrap">
                  {pedido.observacao}
                </p>
              </div>
            )}

            <div className="text-center pt-2 text-[10px] text-gray-400">
              ••• Fim da Comanda •••
            </div>
          </div>
        </div>

        {/* Footer com botão de impressão */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 rounded-lg cursor-pointer"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <Printer size={15} />
            <span>Imprimir Comanda</span>
          </button>
        </div>
      </div>
    </div>
  )
}


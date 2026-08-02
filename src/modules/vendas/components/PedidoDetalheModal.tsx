import { X, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Pedido } from '../types/pedido'

function formatDateTime(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

function formatCurrency(val?: number) {
  if (val == null) return '—'
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface Props {
  pedido: Pedido
  onClose: () => void
}

export default function PedidoDetalheModal({ pedido, onClose }: Props) {
  const navigate = useNavigate()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold text-gray-800">Detalhes do Pedido #{pedido.id}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Cliente</p>
              <p className="font-medium">{pedido.clienteNome ?? `Cliente #${pedido.clienteId ?? '—'}`}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Status</p>
              <p className="font-medium">{pedido.status}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Data do pedido</p>
              <p className="font-medium">{formatDateTime(pedido.createdOn)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Data de entrega</p>
              <p className="font-semibold text-gray-800">{formatDateTime(pedido.dataEntrega)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Entrega</p>
              <p className="font-medium">{pedido.retirar ? 'Retirada no local' : 'Entrega'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Frete</p>
              <p className="font-medium">{formatCurrency(pedido.valorFrete)}</p>
            </div>
          </div>

          <div>
            <p className="text-gray-500 text-xs mb-2">Itens</p>
            {pedido.itens.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhum item</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 border-b">
                    <th className="text-left pb-1">Produto</th>
                    <th className="text-right pb-1">Qtd</th>
                    <th className="text-right pb-1">Unit.</th>
                    <th className="text-right pb-1">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {pedido.itens.map((item, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-1">#{item.produtoId}</td>
                      <td className="text-right py-1">{item.quantidade}</td>
                      <td className="text-right py-1">{formatCurrency(item.valorUnitario)}</td>
                      <td className="text-right py-1">{formatCurrency(item.valorTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex items-center justify-between border-t pt-3">
            <span className="font-bold text-gray-800">Total</span>
            <span className="font-bold text-lg">{formatCurrency(pedido.valorTotal)}</span>
          </div>
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={() => { onClose(); navigate(`/vendas/pedidos/${pedido.id}/editar`) }}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg"
          >
            <ExternalLink size={16} /> Ir para o pedido
          </button>
        </div>
      </div>
    </div>
  )
}

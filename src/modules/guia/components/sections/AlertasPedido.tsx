import { ArrowRight, AlertTriangle } from 'lucide-react'
import GuiaSection from '../GuiaSection'
import GuiaCard from '../GuiaCard'

function TimelineBadge({ color, label }: { color: string; label: string }) {
  return <span className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${color}`}>{label}</span>
}

export default function AlertasPedido() {
  return (
    <GuiaSection
      id="alertas-pedido"
      title="Alertas de Pedido: o prazo nunca pega de surpresa"
      intro="Assim como os insumos, os prazos de entrega também têm um sistema de olho neles — sem você precisar ficar contando dias no calendário."
    >
      <GuiaCard step={1} title="Gerados sozinhos, todo dia às 8h">
        <p>
          Diferente dos alertas de insumo, aqui não existe parametrização pra configurar — todo pedido com status
          CONFIRMADO, EM_PRODUÇÃO ou PRONTO entra automaticamente na verificação diária.
        </p>
      </GuiaCard>

      <GuiaCard step={2} title="Uma linha do tempo até a entrega">
        <div className="not-prose flex flex-wrap items-center gap-1.5 py-1">
          <TimelineBadge color="bg-blue-500 text-white" label="SEMANAL" />
          <ArrowRight size={13} className="text-gray-300" />
          <TimelineBadge color="bg-yellow-400 text-yellow-900" label="3 DIAS" />
          <ArrowRight size={13} className="text-gray-300" />
          <TimelineBadge color="bg-yellow-400 text-yellow-900" label="2 DIAS" />
          <ArrowRight size={13} className="text-gray-300" />
          <TimelineBadge color="bg-yellow-400 text-yellow-900" label="1 DIA" />
          <ArrowRight size={13} className="text-gray-300" />
          <TimelineBadge color="bg-orange-500 text-white" label="HOJE" />
          <ArrowRight size={13} className="text-gray-300" />
          <TimelineBadge color="bg-red-600 text-white" label="ATRASADO" />
        </div>
        <p>
          Toda segunda-feira sai um alerta <span className="font-medium text-gray-800">semanal</span> com tudo que tem
          entrega marcada pra aquela semana. Dali em diante, o mesmo pedido pode acumular um alerta novo a cada marco —
          3 dias, 2 dias, 1 dia, no dia — até virar atrasado, se passar da data sem ser entregue.
        </p>
      </GuiaCard>

      <GuiaCard step={3} title="O alerta de 3 dias já checa se dá pra produzir">
        <p>
          Só no alerta de <span className="font-medium text-gray-800">3 dias</span>, o sistema cruza os ingredientes
          necessários pra esse pedido com o que tem no estoque agora. Se faltar algo, o alerta já chega marcado com{' '}
          <span className="inline-flex items-center gap-1 align-middle text-xs font-medium text-orange-700 bg-orange-100 rounded px-2 py-0.5">
            <AlertTriangle size={12} /> Ingredientes insuficientes
          </span>
          — tempo de sobra pra repor antes de virar problema.
        </p>
      </GuiaCard>

      <GuiaCard step={4} title="Reconheça o alerta, não “resolva”">
        <p>
          Em <span className="font-medium text-gray-800">Vendas → Alertas de Pedidos</span>, os cards vêm agrupados por
          urgência (atrasados primeiro). O botão aqui é “Reconhecer”, não “Resolver” — porque só o avanço de status do
          próprio pedido é que realmente encerra a pendência.
        </p>
        <p>Um atalho “Ver pedido” leva direto pra edição, sem precisar procurar na lista completa.</p>
      </GuiaCard>

      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-800">
        <p className="font-medium">Você vê isso em três lugares diferentes</p>
        <p className="mt-1">
          Um sino no topo com a contagem, uma faixa vermelha ou laranja no topo da tela quando há algo urgente, e a lista
          completa em Alertas de Pedidos — sempre a mesma informação, em graus diferentes de destaque.
        </p>
      </div>
    </GuiaSection>
  )
}

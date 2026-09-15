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
          Em <span className="font-medium text-gray-800">Vendas → Alertas de Pedidos</span> fica a lista completa: os
          cards vêm <span className="font-medium text-gray-800">agrupados por urgência, atrasados primeiro</span>, e cada
          seção mostra a contagem — o card traz o cliente, a data de entrega e, quando houver, o aviso de{' '}
          <span className="inline-flex items-center gap-1 align-middle text-xs font-medium text-orange-700 bg-orange-100 rounded px-2 py-0.5">
            <AlertTriangle size={12} /> Ingredientes insuficientes
          </span>
          .
        </p>
        <p>
          O botão aqui é <span className="font-medium text-gray-800">“Reconhecer”</span>, não “Resolver” — ele só tira o
          alerta da contagem. A pendência de verdade encerra quando o próprio pedido avança de status (é entregue,
          concluído ou cancelado) e deixa de entrar nas verificações diárias.
        </p>
        <p>O atalho <span className="font-medium text-gray-800">“Ver pedido”</span> leva direto pra edição, sem procurar na lista completa.</p>
      </GuiaCard>

      <GuiaCard step={5} title="Os seis lugares onde você vê o prazo na tela">
        <p>
          O alerta não mora numa tela só — ele aparece nos seis pontos abaixo, sempre com a <span className="font-medium text-gray-800">mesma informação</span>, em graus diferentes de destaque:
        </p>
        <ul className="pl-5 space-y-2 list-none">
          <li>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 bg-gray-100 rounded px-2 py-0.5 mr-2">Sino no topo</span>
            mostra a contagem de alertas ativos num badge — vermelho se houver atrasado, laranja caso contrário. Passar o
            mouse abre um resumo com os 5 mais urgentes; clicar leva pra lista completa.
          </li>
          <li>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 bg-gray-100 rounded px-2 py-0.5 mr-2">Faixa no topo</span>
            em qualquer tela, quando existe pedido precisando de atenção: “N pedidos precisam de atenção” — vermelha se há
            atrasado, laranja se ainda dá tempo. Botão “Ver alertas” vai direto pra lista.
          </li>
          <li>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 bg-gray-100 rounded px-2 py-0.5 mr-2">Menu lateral</span>
            o item “Alertas de Pedidos” carrega o mesmo contador do sino.
          </li>
          <li>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 bg-gray-100 rounded px-2 py-0.5 mr-2">Tela dedicada</span>
            “Vendas → Alertas de Pedidos” — a lista completa com todos os cards e os botões Reconhecer / Ver pedido.
          </li>
          <li>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 bg-gray-100 rounded px-2 py-0.5 mr-2">Mural da Semana</span>
            o card do pedido assume a cor da urgência (vermelho atrasado/hoje, laranja 1 dia, amarelo 2–3 dias) e exibe o
            aviso de ingredientes — o prazo aparece sem você nem precisar abrir o alerta.
          </li>
          <li>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 bg-gray-100 rounded px-2 py-0.5 mr-2">Lista de Pedidos</span>
            a coluna “Entrega” ganha um selo de urgência junto à data: Atrasado (vermelho), Hoje (laranja) ou Em 1–3 dias
            (amarelo) — dá pra ver de relance quais pedidos precisam de atenção sem sair da lista.
          </li>
        </ul>
      </GuiaCard>

      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-800">
        <p className="font-medium">Uma cor, um significado, em qualquer lugar</p>
        <p className="mt-1">
          Vermelho é atrasado, laranja é hoje/urgente, amarelo ainda dá tempo, azul é a visão da semana. Essa mesma lógica
          de cor vale na faixa do topo, no sino, na lista e nos cards do mural — você entende a urgência num relance.
        </p>
      </div>
    </GuiaSection>
  )
}

import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'
import GuiaSection from '../GuiaSection'
import GuiaCard from '../GuiaCard'

function MiniStickyNote({ color, label, sub }: { color: string; label: string; sub: string }) {
  return (
    <div className={`${color} rounded-sm shadow-sm border-t-4 border-t-yellow-400 p-3 min-w-[110px]`}>
      <p className="text-xs font-bold text-gray-800 leading-tight">{label}</p>
      <p className="text-[11px] text-gray-600 mt-0.5">{sub}</p>
    </div>
  )
}

export default function Mural() {
  return (
    <GuiaSection
      id="mural"
      title="Mural da Semana: o post-it da sua cozinha"
      intro="Uma visão pra olhar e saber na hora o que está pendente — o equivalente digital do mural de comandas de uma cozinha profissional."
    >
      <GuiaCard step={1} title="Navegue pela semana">
        <p>
          Em <span className="font-medium text-gray-800">Vendas → Mural da Semana</span>, os pedidos aparecem como cards
          soltos, em ordem de data de entrega — o mais próximo de vencer primeiro.
        </p>
        <p>
          Use as setas <ChevronLeft size={13} className="inline" />/<ChevronRight size={13} className="inline" /> pra
          olhar a semana anterior ou seguinte, e o botão “Semana atual” pra voltar de onde saiu.
        </p>
      </GuiaCard>

      <GuiaCard step={2} title="A cor do card avisa antes de você ler qualquer coisa">
        <div className="not-prose flex flex-wrap gap-3 py-1">
          <MiniStickyNote color="bg-red-200" label="Vermelho" sub="atrasado ou hoje" />
          <MiniStickyNote color="bg-orange-200" label="Laranja" sub="entrega amanhã" />
          <MiniStickyNote color="bg-yellow-200" label="Amarelo" sub="2 a 3 dias" />
          <MiniStickyNote color="bg-green-100" label="Verde" sub="sem pressa" />
          <MiniStickyNote color="bg-gray-100" label="Cinza (riscado)" sub="entregue ou cancelado" />
        </div>
        <p>
          A cor comunica <span className="font-medium text-gray-800">prazo</span>, não status — o status do pedido
          continua aparecendo como badge dentro do card, só que como detalhe secundário.
        </p>
      </GuiaCard>

      <GuiaCard step={3} title="O aviso de ingrediente insuficiente aparece direto no card">
        <p>
          Quando faltar insumo pra produzir um pedido, um aviso{' '}
          <span className="inline-flex items-center gap-1 align-middle text-xs font-medium text-orange-700 bg-orange-100 rounded px-2 py-0.5">
            <AlertTriangle size={12} /> Ingredientes insuficientes
          </span>{' '}
          some direto no card — sem precisar abrir nada pra descobrir que vai faltar farinha.
        </p>
      </GuiaCard>

      <GuiaCard step={4} title="Clique no card pra ver tudo, ou vá direto editar">
        <p>
          Ao clicar num card, abre um modal com todos os detalhes: endereço de entrega, itens, complementos, frete. Um
          atalho “Ir para o pedido” leva você direto pra edição, se precisar mudar algo.
        </p>
      </GuiaCard>

      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-800">
        <p className="font-medium">Duas ferramentas, dois propósitos</p>
        <p className="mt-1">
          O Mural não substitui a lista de Pedidos — ela continua existindo pra gestão (filtros, edição, exclusão). O Mural
          é pra operação: o que olho de relance na cozinha pra saber o que fazer agora.
        </p>
      </div>
    </GuiaSection>
  )
}

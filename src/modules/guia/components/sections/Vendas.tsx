import { ArrowRight } from 'lucide-react'
import GuiaSection from '../GuiaSection'
import GuiaCard from '../GuiaCard'
import GuiaTooltip from '../GuiaTooltip'

function StatusBadge({ children, className }: { children: React.ReactNode; className: string }) {
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${className}`}>{children}</span>
}

export default function Vendas() {
  return (
    <GuiaSection
      id="vendas"
      title="Vendas: do cliente ao pedido pronto"
      intro="Aqui é onde tudo que você organizou vira venda de verdade — cliente, produto, preço e prazo, tudo num só lugar."
    >
      <GuiaCard step={1} title="Cadastre o cliente">
        <p>
          Vá em <span className="font-medium text-gray-800">Vendas → Clientes</span> e clique em “Novo”. Nome é o único
          campo obrigatório — CPF, e-mail e telefone você preenche se quiser.
        </p>
        <p>
          Um cliente pode ter vários endereços de entrega, cada um com uma descrição própria (“Casa”, “Trabalho”...) — na
          hora de montar o pedido, você escolhe entre eles num select, sem precisar redigitar nada.
        </p>
      </GuiaCard>

      <GuiaCard
        step={2}
        title="Cadastre complementos, se usar"
        dica="Complemento é opcional — só cadastre se sua confeitaria de fato vende extras separados do produto principal (recheio a mais, embalagem especial, cobertura...)."
      >
        <p>
          Em <span className="font-medium text-gray-800">Vendas → Complementos</span>, um complemento tem categoria, nome,
          o insumo que ele consome e os dois valores: custo e venda.
        </p>
        <p>
          Ele pode ser associado como padrão de um produto (aparece sozinho quando esse produto entra num pedido) ou
          adicionado livremente item por item, na hora de montar o pedido.
        </p>
      </GuiaCard>

      <GuiaCard
        step={3}
        title="Negocie antes com um orçamento, se precisar"
        dica="Orçamento é opcional — se o cliente já fechou o pedido, pode ir direto pro passo seguinte."
      >
        <p>
          Em <span className="font-medium text-gray-800">Vendas → Orçamentos → Novo Orçamento</span>, monte uma proposta
          com os mesmos itens de um pedido, mais uma data de validade. Enquanto o orçamento estiver{' '}
          <span className="font-medium text-gray-800">Aberto</span>, os itens continuam editáveis — é ali que você ajusta
          a proposta junto com o cliente antes de fechar.
        </p>
        <p>
          Quando o cliente decidir, registre a resposta: <span className="font-medium text-gray-800">Aprovar</span> gera
          um Pedido de verdade automaticamente, com exatamente os itens que sobraram na negociação; o que foi removido no
          caminho nunca chega no pedido. <span className="font-medium text-gray-800">Rejeitar</span> encerra o orçamento
          sem criar nada. As duas ações são definitivas — não dá pra reabrir um orçamento já decidido.
        </p>
        <p>
          O campo <span className="font-medium text-gray-800">Observação</span> é seu bloco de notas da negociação — anote
          o que combinou com o cliente ali mesmo, sem precisar de outra ferramenta.
        </p>
      </GuiaCard>

      <GuiaCard step={4} title="Monte o pedido">
        <p>
          Em <span className="font-medium text-gray-800">Vendas → Pedidos → Novo Pedido</span>, escolha o cliente
          (definitivo depois de salvar — não dá pra trocar de cliente num pedido já criado), o endereço de entrega (ou
          marque “retira no local”) e a data de entrega.
        </p>
        <p>
          Marcar “retira no local” some com o campo de frete — ele fica desabilitado e é limpo automaticamente, já que não
          existe frete pra buscar no balcão. Assim como no orçamento, o campo{' '}
          <span className="font-medium text-gray-800">Observação</span> fica disponível pra qualquer nota livre sobre o
          pedido.
        </p>
        <p>
          Para cada item, escolha o produto e a quantidade. O valor unitário já vem preenchido com o preço vigente
          <GuiaTooltip text="Assim que você escolhe o produto, o sistema busca a precificação vigente dele — você pode ajustar esse valor no próprio item, se quiser." />
          , mas você pode ajustar — e ainda dá pra aplicar desconto por item.
        </p>
        <p>O valor total do pedido é sempre calculado pelo sistema, somando os itens, descontos e o frete.</p>
      </GuiaCard>

      <GuiaCard step={5} title="Avance o status direto na lista">
        <p>
          Na lista de <span className="font-medium text-gray-800">Pedidos</span>, o status aparece como um seletor colorido
          na própria linha — não precisa abrir o pedido pra avançar de uma etapa pra outra.
        </p>

        <div className="not-prose bg-white border border-gray-200 rounded-lg p-4 mt-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge className="bg-gray-100 text-gray-600">RASCUNHO</StatusBadge>
            <ArrowRight size={14} className="text-gray-300 flex-shrink-0" />
            <StatusBadge className="bg-blue-100 text-blue-800">CONFIRMADO</StatusBadge>
            <ArrowRight size={14} className="text-gray-300 flex-shrink-0" />
            <StatusBadge className="bg-purple-100 text-purple-800">EM PRODUÇÃO</StatusBadge>
            <ArrowRight size={14} className="text-gray-300 flex-shrink-0" />
            <StatusBadge className="bg-green-100 text-green-800">PRONTO</StatusBadge>
            <ArrowRight size={14} className="text-gray-300 flex-shrink-0" />
            <StatusBadge className="bg-gray-100 text-gray-700">ENTREGUE</StatusBadge>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <StatusBadge className="bg-red-100 text-red-800">CANCELADO</StatusBadge>
            <span className="text-xs text-gray-400">pode acontecer a partir de qualquer etapa acima, a qualquer momento</span>
          </div>
        </div>
      </GuiaCard>

      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-800">
        <p className="font-medium">Muitos pedidos abertos ao mesmo tempo?</p>
        <p className="mt-1">
          A lista de Pedidos é ótima pra gestão, mas fica pesada quando você só quer saber “o que preciso fazer hoje”. Pra
          isso existe o Mural da Semana — a próxima seção.
        </p>
      </div>
    </GuiaSection>
  )
}

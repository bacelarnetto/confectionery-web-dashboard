import GuiaSection from '../GuiaSection'
import GuiaCard from '../GuiaCard'

export default function Compras() {
  return (
    <GuiaSection
      id="compras"
      title="Compras: da lista até o estoque atualizado"
      intro="Comprar não é só anotar numa lista de papel: no sistema, a compra confirmada vira estoque de verdade, sem você lançar entrada duas vezes."
    >
      <GuiaCard step={1} title="Monte a lista de compras">
        <p>
          Vá em <span className="font-medium text-gray-800">Compras → Compras</span> e clique em “Nova Compra”. Escolha um
          fornecedor (opcional) e adicione os itens: o insumo, a quantidade e o valor unitário que você espera pagar.
        </p>
        <p>Pense nela como a sua lista de compras de mercado — só que essa, o sistema lembra pra você depois.</p>
      </GuiaCard>

      <GuiaCard
        step={2}
        title="Marque o que você realmente comprou"
        dica="O valor e a quantidade que valem pro estoque são os que estiverem na tela no momento da confirmação — se o preço na loja foi diferente do planejado, é só ajustar o item antes de marcar a caixinha."
      >
        <p>
          De volta da feira ou depois que o fornecedor entregou, edite a compra e marque a caixinha{' '}
          <span className="font-medium text-gray-800">“OK”</span> em cada item que você efetivamente recebeu.
        </p>
        <p>Item sem a caixinha marcada não entra no estoque quando você confirmar o recebimento — é assim que o sistema separa o que foi planejado do que realmente chegou na sua cozinha.</p>
      </GuiaCard>

      <GuiaCard step={3} title="Confirme o recebimento e deixe o sistema lançar o estoque">
        <p>
          Na lista de Compras, clique no ícone verde de confirmação. A partir daí o sistema toma conta de tudo:
        </p>
        <p>
          Se nenhum item estiver marcado como comprado, ele avisa e não deixa prosseguir — evita lançar uma entrada vazia
          por engano.
        </p>
        <p>
          Se algum item comprado for de um insumo <span className="font-medium text-gray-800">perecível</span>, você é
          levado direto pra tela de Nova Entrada, com a compra já vinculada — perecíveis exigem lote e data de validade,
          informações que não cabem na lista rápida de compra.
        </p>
        <p>
          Caso contrário, uma última confirmação aparece e, ao aceitar, o sistema lança a entrada de estoque de uma vez e
          marca a compra como <span className="font-medium text-gray-800">confirmada</span>.
        </p>
      </GuiaCard>

      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-800">
        <p className="font-medium">Da checklist pro estoque, de uma vez só</p>
        <p className="mt-1">
          Assim que você confirma, os itens marcados na checklist somam à quantidade do seu estoque — sem lançar entrada
          duas vezes, sem deixar item esquecido pra trás. A compra sai da lista de pendências e passa a fazer parte do seu
          histórico de compras.
        </p>
      </div>
    </GuiaSection>
  )
}

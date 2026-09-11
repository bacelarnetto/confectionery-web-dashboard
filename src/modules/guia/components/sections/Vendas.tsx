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
          Em <span className="font-medium text-gray-800">Vendas → Complementos</span>, busque o insumo pelo nome — nome,
          categoria e custo vêm preenchidos automaticamente a partir dele, sem digitar nada solto.
        </p>
        <p>
          Marque <span className="font-medium text-gray-800">"Complemento padrão"</span> quando o custo dele já estiver
          embutido no preço do produto (ex: a embalagem que todo bolo leva) — esse tipo nunca cobra separado. Deixe
          desmarcado pra um complemento que é vendido à parte (ex: um brilho especial) — aí você define o valor de venda.
        </p>
        <p>
          Um complemento padrão é associado a um produto na própria tela de{' '}
          <span className="font-medium text-gray-800">Estoque de Produtos → Produtos</span> (edição) — a partir daí, ele
          entra sozinho sempre que esse produto aparece num orçamento ou pedido.
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
        <p>
          O botão <span className="font-medium text-gray-800">PDF</span> (na lista ou dentro do orçamento) gera um
          documento com os itens, complementos e o total — pronto pra imprimir ou enviar pro cliente.
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
        <p>
          Os complementos padrão do produto aparecem sozinhos, marcados <span className="font-medium text-gray-800">
          Incluso</span> (sem cobrar) — todo item desse produto sempre leva eles, sem exceção. Busque por nome pra
          adicionar complementos extra — o valor de cada um soma no total do item.
        </p>
        <p>O valor total do pedido é sempre calculado pelo sistema, somando os itens, complementos, descontos e o frete.</p>
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

        <p>
          Marcar <span className="font-medium text-gray-800">EM PRODUÇÃO</span> é o segundo (e último) momento em que o
          sistema mexe em estoque sozinho: o produto vendido sai do estoque de produto — abastecido pela Fabricação ou
          por uma Entrada de Produto direta, no caso de terceirizado — e, se o pedido tiver algum complemento, o insumo
          dele também é descontado ali, na hora, já que complemento não passa pela Fabricação.
        </p>
      </GuiaCard>

      <GuiaCard
        step={6}
        title="Registre os pagamentos e emita o recibo"
        dica="Um pedido ENTREGUE que ainda não foi pago (nem em parte) mostra um ícone de cifrão vermelho ao lado do status, na própria lista de Pedidos — dá pra ver quem está devendo sem abrir pedido por pedido."
      >
        <p>
          Dentro do pedido, o card <span className="font-medium text-gray-800">Pagamento</span> mostra o total do pedido,
          quanto já foi pago e o saldo. Clique em{' '}
          <span className="font-medium text-gray-800">Registrar Pagamento</span> pra lançar um valor recebido — informe o
          valor, a data e a{' '}
          <span className="font-medium text-gray-800">forma de pagamento</span> (Pix, dinheiro, cartão...). Um pedido pode
          ter vários pagamentos ao longo do tempo — por exemplo, metade na confirmação e o restante na entrega.
        </p>
        <p>
          As formas de pagamento aceitas ficam em{' '}
          <span className="font-medium text-gray-800">Vendas → Formas de Pagamento</span> — o sistema já vem com Dinheiro,
          Pix, Cartão de Crédito, Cartão de Débito, Transferência e Outros cadastrados, mas você pode ajustar essa lista
          livremente.
        </p>
        <p>
          O botão <span className="font-medium text-gray-800">Baixar Recibo</span>, no mesmo card, gera um PDF único do
          pedido — com os itens, todos os pagamentos já recebidos (com a forma de cada um) e o saldo restante, se houver.
          Ele só fica disponível depois do primeiro pagamento registrado, e serve tanto pra você guardar quanto pro
          cliente usar como comprovante (inclusive pra pedir reembolso ao empregador, se for o caso).
        </p>
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

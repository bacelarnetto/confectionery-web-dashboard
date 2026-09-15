import GuiaSection from '../GuiaSection'
import GuiaCard from '../GuiaCard'

export default function Dashboard() {
  return (
    <GuiaSection
      id="dashboard"
      title="Dashboard: seu painel de controle"
      intro="A primeira tela que você vê ao entrar (/) — os números que mais importam, de relance, sem precisar abrir relatório nenhum."
    >
      <GuiaCard step={1} title="Os cards do topo">
        <p>
          <span className="font-medium text-gray-800">Valor em Estoque</span>,{' '}
          <span className="font-medium text-gray-800">Gastos (Mês Atual)</span>,{' '}
          <span className="font-medium text-gray-800">Produtos em Baixa</span> e{' '}
          <span className="font-medium text-gray-800">Fornecedores Ativos</span> dão a foto geral do negócio — quanto você
          tem parado em estoque, quanto já gastou no mês e quantos produtos estão pedindo reposição.
        </p>
        <p>
          Logo abaixo, o bloco <span className="font-medium text-gray-800">Vendas</span> repete a mesma ideia do lado da
          venda: <span className="font-medium text-gray-800">Pedidos (Mês Atual)</span>,{' '}
          <span className="font-medium text-gray-800">Receita (Mês Atual)</span>,{' '}
          <span className="font-medium text-gray-800">Pedidos em Aberto</span> e{' '}
          <span className="font-medium text-gray-800">Ticket Médio</span>.
        </p>
      </GuiaCard>

      <GuiaCard
        step={2}
        title="Financeiro — Resumo do Mês"
        dica="Os links “Gastos” e “Contas a Receber” no canto desse bloco levam direto pras telas de Financeiro — a próxima seção deste guia detalha o que cada uma faz."
      >
        <p>
          Receita, Gastos, <span className="font-medium text-gray-800">Custo dos Doces (COGS)</span> e{' '}
          <span className="font-medium text-gray-800">Lucro Real</span> do mês atual, lado a lado — é o resumo financeiro
          rápido, sem precisar somar nada na mão.
        </p>
        <p>
          O gráfico <span className="font-medium text-gray-800">Gastos por Categoria</span> mostra a fatia de cada Tipo de
          Gasto no total do mês, e o card <span className="font-medium text-gray-800">A Receber</span> soma tudo que ainda
          está pendente de recebimento — de Pedidos e de Contas Avulsas juntos.
        </p>
      </GuiaCard>

      <GuiaCard step={3} title="Os gráficos de baixo">
        <p>
          Mais embaixo na tela: movimentações de estoque dos últimos 7 dias, maiores volumes parados em estoque, os 5
          produtos mais vendidos, pedidos agrupados por status e o histórico de gastos com compras — tudo pronto, sem
          precisar filtrar nada.
        </p>
      </GuiaCard>

      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-800">
        <p className="font-medium">Não é pra decidir nada por aqui</p>
        <p className="mt-1">
          O Dashboard é o resumo — pra agir de verdade (lançar um gasto, registrar um recebimento, ver o detalhe de um
          relatório), use os módulos específicos. O bloco Financeiro já traz esse atalho pronto; os demais cards e
          gráficos são só leitura.
        </p>
      </div>
    </GuiaSection>
  )
}

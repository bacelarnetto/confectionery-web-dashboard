import GuiaSection from '../GuiaSection'
import GuiaCard from '../GuiaCard'

export default function Dashboard() {
  return (
    <GuiaSection
      id="dashboard"
      title="Dashboard: seu painel de controle organizado"
      intro="A primeira tela que você vê ao entrar (/) — agrupada em blocos temáticos claros, reunindo métricas e gráficos de cada setor com atalhos diretos."
    >
      <GuiaCard step={1} title="Barra de atalhos e destaques do topo">
        <p>
          No topo da tela, a barra de navegação rápida (<span className="font-medium text-gray-800">Destaques</span>,{' '}
          <span className="font-medium text-gray-800">Vendas</span>,{' '}
          <span className="font-medium text-gray-800">Estoque</span> e{' '}
          <span className="font-medium text-gray-800">Financeiro</span>) permite rolar diretamente para o setor desejado,
          além de exibir alertas caso haja itens abaixo do mínimo ou pedidos em aberto.
        </p>
        <p>
          Logo abaixo, os <span className="font-medium text-gray-800">Destaques Executivos</span> mostram a foto geral do mês:
          Receita Recebida (regime de caixa), Lucro Real Estimado, Volume de Pedidos e Total do Inventário, junto a uma faixa de atenção operacional com links rápidos.
        </p>
      </GuiaCard>

      <GuiaCard step={2} title="Bloco Vendas & Pedidos">
        <p>
          Reúne tudo relacionado ao comercial em um só lugar: indicadores de{' '}
          <span className="font-medium text-gray-800">Pedidos no Mês</span>,{' '}
          <span className="font-medium text-gray-800">Receita Faturada</span> (regime de competência),{' '}
          <span className="font-medium text-gray-800">Pedidos em Aberto</span> e{' '}
          <span className="font-medium text-gray-800">Ticket Médio</span>, posicionados junto aos gráficos de{' '}
          <span className="font-medium text-gray-800">Top 5 Produtos Mais Vendidos</span> e{' '}
          <span className="font-medium text-gray-800">Distribuição de Pedidos por Status</span>.
        </p>
        <p>
          O cabeçalho traz botões para criar um <span className="font-medium text-gray-800">Novo Pedido</span>, abrir o{' '}
          <span className="font-medium text-gray-800">Mural de Pedidos</span> ou consultar a listagem completa.
        </p>
      </GuiaCard>

      <GuiaCard step={3} title="Bloco Estoque & Insumos">
        <p>
          Concentra o valor imobilizado em estoque, os <span className="font-medium text-gray-800">Itens em Baixa</span>,{' '}
          fornecedores cadastrados e compras de insumos.
        </p>
        <p>
          Acompanhado pelos gráficos de{' '}
          <span className="font-medium text-gray-800">Movimentações dos Últimos 7 Dias</span> (entradas vs. saídas) e{' '}
          <span className="font-medium text-gray-800">Maiores Volumes em Estoque</span>, com atalho direto para lançar uma{' '}
          <span className="font-medium text-gray-800">Nova Entrada</span> de insumos.
        </p>
      </GuiaCard>

      <GuiaCard step={4} title="Bloco Financeiro & Compras">
        <p>
          Traz o resultado do mês: Receita Recebida (regime de caixa), Gastos Totais, Custo dos Doces (COGS) e Lucro Real.
        </p>
        <p>
          Exibe o gráfico de <span className="font-medium text-gray-800">Gastos por Categoria</span>, o cartão de destaque com o saldo{' '}
          <span className="font-medium text-gray-800">A Receber</span> e o gráfico histórico de despesas com compras de insumos ao longo dos meses.
        </p>
      </GuiaCard>

      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-800">
        <p className="font-medium">Painel interativo e acionável</p>
        <p className="mt-1">
          O Dashboard funciona como o ponto de partida do seu dia: você pode bater o olho nos alertas, clicar nos cards com pendências ou usar os botões de ação rápida para agir imediatamente sem se perder no menu.
        </p>
      </div>
    </GuiaSection>
  )
}

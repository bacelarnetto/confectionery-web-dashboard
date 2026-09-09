import { FileDown, FileSpreadsheet } from 'lucide-react'
import GuiaSection from '../GuiaSection'
import GuiaCard from '../GuiaCard'

function ExportBadges() {
  return (
    <span className="inline-flex items-center gap-1.5 align-middle">
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-100 rounded px-2 py-0.5">
        <FileSpreadsheet size={12} /> CSV
      </span>
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 rounded px-2 py-0.5">
        <FileDown size={12} /> PDF
      </span>
    </span>
  )
}

export default function Relatorios() {
  return (
    <GuiaSection
      id="relatorios"
      title="Relatórios: os números da sua confeitaria, prontos pra levar"
      intro="Cada relatório aqui é uma leitura pronta do que já está registrado no sistema — nada é recalculado ou estimado, é o retrato exato do que você cadastrou em Vendas, Compras e Estoque."
    >
      <GuiaCard step={1} title="Faturamento Mensal">
        <p>
          Mostra, mês a mês, quantos pedidos você fechou, o faturamento total e o ticket médio. Ajuste quantos meses pra
          trás quer olhar — de um retrato do mês atual até um histórico mais longo pra enxergar sazonalidade.
        </p>
      </GuiaCard>

      <GuiaCard step={2} title="Custo de Produção">
        <p>
          Para cada produto, separa o que veio do custo de ingrediente do que veio do custo fixo, e mostra a margem, o
          valor de venda e o lucro bruto lado a lado. Pode filtrar por categoria de produto pra olhar só uma linha do seu
          catálogo.
        </p>
        <p>
          É a mesma lógica de custo explicada em Gestão de Custos e Precificação — aqui ela vira uma tabela comparativa
          entre produtos, em vez do detalhe de um produto só.
        </p>
      </GuiaCard>

      <GuiaCard step={3} title="Movimentação de Estoque">
        <p>
          Lista entradas e saídas de insumo num período, com data, tipo e quantidade. Filtre por intervalo de datas e,
          se quiser, só entradas ou só saídas — útil pra conferir se o que saiu bate com o que sua produção deveria ter
          consumido.
        </p>
      </GuiaCard>

      <GuiaCard step={4} title="Exporte pra fora do sistema">
        <p>
          Todo relatório tem os mesmos dois botões no canto superior: <ExportBadges /> — CSV pra abrir numa planilha
          (Excel, Google Sheets) e continuar analisando por conta própria, PDF pra imprimir ou enviar como está, sem
          precisar printar a tela.
        </p>
        <p>O arquivo exportado respeita os filtros que estiverem ativos na hora do clique — período, categoria, tipo.</p>
      </GuiaCard>

      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-800">
        <p className="font-medium">Não é aqui que se decide nada</p>
        <p className="mt-1">
          Relatórios só leem o que já aconteceu — mudar um preço, negociar um orçamento ou registrar uma compra continua
          acontecendo nas telas de cada domínio. Pense nele como a prestação de contas, não como o lugar de trabalho.
        </p>
      </div>
    </GuiaSection>
  )
}

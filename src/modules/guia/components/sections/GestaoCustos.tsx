import GuiaSection from '../GuiaSection'
import GuiaCard from '../GuiaCard'

export default function GestaoCustos() {
  return (
    <GuiaSection
      id="gestao-custos"
      title="Gestão de custos: os dois bolsos do seu negócio"
      intro="Na hora de definir o preço de venda, você lida com dois tipos de custo. Entender a diferença é o que separa o preço no chute do preço consciente."
    >
      <GuiaCard step={1} title="O custo dos ingredientes — o que vai para dentro da massa">
        <p>
          É a soma de tudo que entra na receita: farinha, açúcar, ovos, manteiga. Quanto custa, em ingredientes, produzir uma
          unidade do seu produto.
        </p>
        <p>
          Na hora de precificar, você pode deixar o sistema calcular esse valor a partir da receita cadastrada, ou informar
          manualmente quando o produto ainda não tiver receita.
        </p>
      </GuiaCard>

      <GuiaCard step={2} title="O custo fixo/variável — o que envolve a produção">
        <p>
          São os gastos que existem mesmo fora dos ingredientes: energia do forno, embalagem padrão, mão de obra, o brinde na
          entrega.
        </p>
        <p>
          Esse valor é sempre informado por você na hora de precificar — o sistema não tem como adivinhar a conta de luz da
          sua cozinha.
        </p>
      </GuiaCard>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Exemplo na prática</h4>
        <div className="divide-y divide-gray-100 text-sm">
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Custo dos ingredientes (bolo de cenoura)</span>
            <span className="font-medium text-gray-800">R$ 10,00</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Custo fixo/variável (energia + embalagem)</span>
            <span className="font-medium text-gray-800">R$ 5,00</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-800 font-semibold">Custo total de cada bolo</span>
            <span className="font-bold text-amber-600">R$ 15,00</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-800">
        <p className="font-medium">Por que separar os dois?</p>
        <p className="mt-1">
          Porque cada um mudou de um jeito. O custo dos ingredientes varia com o mercado; o fixo, com a rotina da cozinha.
          Juntos, eles formam o custo real — e é em cima dele que a precificação inteligente trabalha.
        </p>
      </div>
    </GuiaSection>
  )
}
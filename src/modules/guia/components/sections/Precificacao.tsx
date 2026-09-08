import GuiaSection from '../GuiaSection'
import GuiaCard from '../GuiaCard'
import GuiaTooltip from '../GuiaTooltip'

function FormulaChip({ children, highlight = false }: { children: React.ReactNode; highlight?: boolean }) {
  return (
    <span
      className={`px-2.5 py-1 rounded-md border font-mono text-sm ${
        highlight
          ? 'bg-amber-500 text-white border-amber-600 font-bold'
          : 'bg-white text-gray-800 border-gray-300'
      }`}
    >
      {children}
    </span>
  )
}

function FormulaOperator({ children }: { children: React.ReactNode }) {
  return <span className="font-bold text-amber-600">{children}</span>
}

export default function Precificacao() {
  return (
    <GuiaSection
      id="precificacao"
      title="A mágica da precificação inteligente"
      intro="Você define quanto quer ganhar. O sistema faz a conta. Simples assim — e sempre transparente, para você conferir."
    >
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">A conta que o sistema faz</h4>
        <div className="flex flex-wrap items-center gap-2">
          <FormulaChip>(custo dos ingredientes + custo fixo)</FormulaChip>
          <FormulaOperator>÷</FormulaOperator>
          <FormulaChip>(1 − margem ÷ 100)</FormulaChip>
          <FormulaOperator>=</FormulaOperator>
          <FormulaChip highlight>preço sugerido</FormulaChip>
        </div>
        <p className="mt-3 text-xs text-gray-500 leading-relaxed">
          A margem de lucro é calculada sobre o preço de venda. Ou seja: a porcentagem que você define é exatamente o que fica
          com você em cada venda.
          <GuiaTooltip text="Exemplo: com margem de 50%, de cada R$ 100 vendidos, R$ 50 ficam para você depois de pagar os custos." />
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">O mesmo exemplo, com números</h4>
        <div className="divide-y divide-gray-100 text-sm">
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Custo dos ingredientes</span>
            <span className="font-medium text-gray-800">R$ 10,00</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Custo fixo/variável</span>
            <span className="font-medium text-gray-800">R$ 5,00</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Margem de lucro desejada</span>
            <span className="font-medium text-gray-800">50%</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-800 font-semibold">Conta: R$ 15,00 ÷ (1 − 0,50)</span>
            <span className="font-bold text-amber-600">R$ 30,00</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">O que fica com você (lucro bruto)</span>
            <span className="font-medium text-emerald-600">R$ 15,00</span>
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          R$ 15,00 é exatamente 50% do preço de venda. Nada de conta surpresa quando você rescindir o preço de um bolo.
        </p>
      </div>

      <GuiaCard step={1} title="Informe os custos e a margem">
        <p>
          Vá em <span className="font-medium text-gray-800">Estoque de Produtos → Produtos</span>, abra a edição do
          produto que você quer precificar e role até a seção “Precificação”, logo abaixo dos dados do produto.
          <GuiaTooltip text="A precificação só aparece depois que o produto já existe — por isso ela fica na tela de edição, não na de cadastro inicial." />
        </p>
        <p>
          Acabou de cadastrar o produto agora? Você nem precisa procurar essa tela: ao salvar um produto novo, o sistema
          já te leva direto pra edição dele — a seção de Precificação já aparece ali embaixo, pronta pra usar.
        </p>
        <p>Ali, informe o custo fixo/variável e a margem de lucro que você deseja.</p>
        <p>
          O custo dos ingredientes pode vir automaticamente da sua receita
          <GuiaTooltip text="Quando o custo vem da receita, o sistema soma o valor fotografado de cada ingrediente — você não precisa digitar nada." />,
          ou ser digitado manualmente quando não houver receita cadastrada.
        </p>
      </GuiaCard>

      <GuiaCard step={2} title="Receba o preço sugerido na hora">
        <p>Conforme você ajusta os valores, o sistema calcula o preço sugerido e mostra na tela — sem você apertar nenhum botão.</p>
        <p>
          Quando aparecer “calculando...” no lugar do preço, aguarde um instante: a conta é feita no servidor, com o mesmo
          cuidado para todos os produtos.
        </p>
        <p>
          É de propósito que o sistema faz a conta: assim a fórmula nunca erra, nem precisa ser redecorada no seu celular.
        </p>
      </GuiaCard>

      <GuiaCard step={3} title="Faça o ajuste comercial final — você decide">
        <p>O campo de preço final já vem preenchido com o valor sugerido. Você pode mantê-lo ou ajustar: arredondar para R$ 29,90, competir com um concorrente, cobrir uma data especial...</p>
        <p>Esse é um ajuste comercial seu sobre o preço — e ele fica registrado, lado a lado com o valor sugerido.</p>
      </GuiaCard>

      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-800">
        <p className="font-medium">Quem decide o preço final é sempre você</p>
        <p className="mt-1">
          A fórmula sugere um número justo com base no que você informou — mas a palavra final sobre quanto cobrar é sua.
          O sistema só garante que a conta esteja certa; a decisão comercial continua sendo sua.
        </p>
      </div>
    </GuiaSection>
  )
}
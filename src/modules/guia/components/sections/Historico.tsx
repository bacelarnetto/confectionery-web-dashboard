import GuiaSection from '../GuiaSection'
import GuiaCard from '../GuiaCard'

export default function Historico() {
  return (
    <GuiaSection
      id="historico"
      title="Histórico e segurança: a foto dos seus custos"
      intro="Tudo o que você salva fica registrado. Quando o mundo muda e o preço do leite sobe, o seu histórico continua de pé — e é isso que dá autonomia ao seu negócio."
    >
      <GuiaCard step={1} title="Cada preço salvo vira um capítulo do histórico">
        <p>
          Cada vez que você salva uma precificação, o sistema cria um registro novo e arquiva o anterior — a validade do preço
          antigo é encerrada ali mesmo.
        </p>
        <p>Nada é apagado nem sobrescrito: você pode revisitar, a qualquer momento, quanto cobrava em cada época.</p>
      </GuiaCard>

      <GuiaCard step={2} title="O sugerido e o praticado ficam juntos">
        <p>Para cada preço, o histórico guarda dois números: o que a fórmula sugeriu e o preço final que você praticou.</p>
        <p>
          Isso permite revisar por que um preço mudou — e ter a segurança de que a decisão foi sua, consciente e documentada.
        </p>
      </GuiaCard>

      <GuiaCard step={3} title="O preço dos ingredientes no dia da receita">
        <p>Quando você salva uma receita (e novamente a cada produção), o sistema fotografa o preço dos ingredientes daquele dia.</p>
        <p>
          É como tirar uma foto do seu caderno de receitas: o que estava escrito naquele dia continua provando o custo real,
          mesmo que o açúcar suba amanhã.
        </p>
      </GuiaCard>

      <GuiaCard step={4} title="A venda que não muda depois">
        <p>Ao registrar um pedido, o preço de cada item fica congelado ali — imutável, exatamente como foi vendido.</p>
        <p>
          Mesmo que um ingrediente triple de preço depois, os pedidos antigos continuam com o valor da época. Você e o cliente
          ficam protegidos, sem surpresa na hora de fechar a conta.
        </p>
      </GuiaCard>

      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-800">
        <p className="font-medium">Por que isso importa?</p>
        <p className="mt-1">
          Porque preço é memória. O sistema guarda a história para você não depender da memória — e poder confiar no forno e na
          próxima fornada.
        </p>
      </div>
    </GuiaSection>
  )
}
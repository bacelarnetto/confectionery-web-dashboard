import GuiaSection from '../GuiaSection'
import GuiaCard from '../GuiaCard'
import GuiaTooltip from '../GuiaTooltip'

export default function PrimeirosPassos() {
  return (
    <GuiaSection
      id="primeiros-passos"
      title="Primeiros passos: sua cozinha no sistema"
      intro="Três passos simples para o sistema começar a trabalhar com você — e não contra você. Sem pressa, sem complicação."
    >
      <GuiaCard step={1} title="Cadastre os seus insumos (os ingredientes da cozinha)">
        <p>
          No menu lateral, vá em <span className="font-medium text-gray-800">Estoque de Insumos → Insumos</span> e clique em
          “Novo”. Informe o nome (ex: “Farinha de trigo”), a unidade de medida (gramas, mililitros ou unidade) e o valor da
          unidade.
        </p>
        <p>
          O valor que você cadastra é a base de tudo que vem depois: custo das receitas, precificação e até o alerta de
          estoque baixo. Quanto mais atualizado, mais honesto fica o seu preço.
        </p>
        <p>
          Sempre que fizer uma compra e lançar a entrada do produto, confira se o valor continua igual. Se mudou, atualize.
          <GuiaTooltip text="Pense assim: se o preço do leite subir e o sistema continuar com o valor antigo, a conta final sai errada." />
        </p>
        <p>
          Este cadastro é só o ponto de partida — o passo a passo completo de comprar e repor o estoque tem uma seção só
          para ele, logo a seguir.
        </p>
      </GuiaCard>

      <GuiaCard step={2} title="Monte a sua Ficha Técnica (a receita do produto)">
        <p>
          Uma receita é o “DNA” de custo de um produto. Vá em <span className="font-medium text-gray-800">Estoque de Produtos → Receitas</span>,
          clique em “Nova receita”, escolha ou crie o produto e liste os ingredientes com as quantidades usadas.
        </p>
        <p>
          Todo produto pertence a uma <span className="font-medium text-gray-800">Categoria</span> (ex: “bolos redondos”,
          “doces”, “sobremesas”) — é o que organiza o seu cardápio nas telas de venda. Se o produto for novo, você escolhe
          uma categoria já existente ou cria uma na hora, sem sair da tela de receita. Elas também podem ser geridas em{' '}
          <span className="font-medium text-gray-800">Estoque de Produtos → Categorias</span>.
        </p>
        <p>Cada produto só pode ter uma receita — é por isso que o custo dele é confiável e não vira um chute.</p>
        <p>
          Ao salvar, o sistema tira a “foto” do preço de cada ingrediente naquele dia. Se o preço mudar amanhã, essa foto
          continua provando quanto custava naquele momento.
        </p>
      </GuiaCard>

      <GuiaCard step={3} title="Registre a produção (a fabricação)">
        <p>
          Quando produzir, vá em <span className="font-medium text-gray-800">Estoque de Produtos → Fabricação</span> e registre a
          fornada do produto.
        </p>
        <p>O sistema faz dois serviços de uma vez: atualiza a “foto” dos preços da receita e desconta os ingredientes do seu estoque automaticamente.</p>
        <p>
          Assim você nunca “aposta” se tem farinha suficiente: os alertas e o mural trabalham com a realidade da sua despensa.
        </p>
      </GuiaCard>

      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-800">
        <p className="font-medium">E agora?</p>
        <p className="mt-1">
          Com insumos e receitas no sistema, o próximo passo é ver como comprar e repor o estoque no dia a dia.
        </p>
      </div>
    </GuiaSection>
  )
}
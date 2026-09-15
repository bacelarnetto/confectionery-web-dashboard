import GuiaSection from '../GuiaSection'
import GuiaCard from '../GuiaCard'
import GuiaTooltip from '../GuiaTooltip'

export default function Financeiro() {
  return (
    <GuiaSection
      id="financeiro"
      title="Financeiro: gastos e contas a receber"
      intro="O lado do dinheiro que não é venda: o que sai (Gastos) e o que ainda está pendente de entrar (Contas a Receber), de Pedidos ou não."
    >
      <GuiaCard step={1} title="Cadastre os Tipos de Gasto que fizerem sentido pra você">
        <p>
          Em <span className="font-medium text-gray-800">Financeiro → Tipos de Gasto</span>, cadastre categorias livres —
          "Aluguel", "Energia", "Marketing", "Mão de obra"... o que fizer sentido pro seu negócio. É só um nome, sem
          formulário complicado.
        </p>
        <p>
          São essas categorias que alimentam o gráfico <span className="font-medium text-gray-800">Gastos por
          Categoria</span> no Dashboard — quanto mais organizadas, mais útil o gráfico fica.
        </p>
      </GuiaCard>

      <GuiaCard
        step={2}
        title="Lance um Gasto"
        dica="Produto terceirizado (ex.: um bolo feito por outra pessoa) e frete/Uber de busca também entram aqui como Gasto — não é só conta fixa de aluguel/energia."
      >
        <p>
          Em <span className="font-medium text-gray-800">Financeiro → Gastos → Novo Gasto</span>, informe o{' '}
          <span className="font-medium text-gray-800">Tipo de gasto</span> e o <span className="font-medium text-gray-800">
          Valor</span> — únicos campos obrigatórios. Descrição, data de pagamento, data de competência e documento
          (número da nota, recibo...) são opcionais.
        </p>
        <p>
          Marque <span className="font-medium text-gray-800">"Gasto recorrente"</span> pra sinalizar um gasto que se
          repete todo mês (aluguel, por exemplo) — é só uma marcação informativa, não gera lançamentos automáticos nos
          meses seguintes.
        </p>
      </GuiaCard>

      <GuiaCard step={3} title="Contas a Receber: Pedidos e Contas Avulsas, numa lista só">
        <p>
          Em <span className="font-medium text-gray-800">Financeiro → Contas a Receber</span>, você vê todo saldo
          pendente de recebimento — sem precisar abrir pedido por pedido. A coluna{' '}
          <span className="font-medium text-gray-800">Origem</span> mostra se veio de um{' '}
          <span className="font-medium text-gray-800">Pedido</span> do sistema ou de uma{' '}
          <span className="font-medium text-gray-800">Conta Avulsa</span>
          <GuiaTooltip text="Conta Avulsa é um recebimento que não veio de um Pedido cadastrado no sistema — por exemplo, uma venda combinada por fora ou um adiantamento avulso." />
          . Desmarque <span className="font-medium text-gray-800">"Apenas pendentes"</span> pra ver também o que já foi
          totalmente recebido.
        </p>
        <p>
          Clique em <span className="font-medium text-gray-800">"Nova Conta Avulsa"</span> pra cadastrar uma: descrição e
          valor são obrigatórios; data de vencimento e um motivo/observação livre são opcionais. Não tem vínculo com
          cliente — é um valor solto, identificado só pela descrição que você escrever.
        </p>
      </GuiaCard>

      <GuiaCard
        step={4}
        title="Registre o recebimento"
        dica="O recebimento pode ser parcial — o sistema nunca deixa você registrar mais do que o saldo pendente daquela conta."
      >
        <p>
          Clique no ícone de recebimento na linha da conta, informe o valor e a data. Pra Pedido, também é preciso
          escolher a <span className="font-medium text-gray-800">forma de pagamento</span>; Conta Avulsa não pede isso.
        </p>
        <p>
          O status muda sozinho conforme o valor recebido se acumula: <span className="font-medium text-gray-800">
          Aberto</span> (nada recebido ainda), <span className="font-medium text-gray-800">Parcial</span> (recebeu uma
          parte) e <span className="font-medium text-gray-800">Pago</span> (saldo zerado).
        </p>
      </GuiaCard>

      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-800">
        <p className="font-medium">Excluir uma Conta Avulsa</p>
        <p className="mt-1">
          Uma Conta Avulsa que ainda não recebeu nada pode ser excluída da lista normalmente. Se ela já tiver algum valor
          recebido, o sistema bloqueia a exclusão e avisa — assim você não corre o risco de apagar sem querer uma receita
          que já entrou na sua contabilidade do mês.
        </p>
      </div>
    </GuiaSection>
  )
}

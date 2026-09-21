# Roteiro de Decisões — para a dona (usuária final)

> Este arquivo serve para **discutirmos e marcarmos as decisões do sistema** — é o seu sistema,
> você usa no dia a dia. Cada pergunta tem opções simples. **Marque com `[X]`** a que fizer mais
> sentido pra você. O que ficar sem resposta a gente usa o "padrão sugerido" e ajusta depois —
> nada aqui é sem volta.

---

## Parte 1 — Locação de carrinhos de doces

**Contexto:** temos 2 carrinhos. Queremos um lugar no sistema pra controlar as locações (quem
alugou, que dia, quanto cobrar, o que levou no carrinho e.o dia de buscar de volta).

### 1. Como cobrar a locação?

~~- [ ] **A — Só pelo doce**~~ ~~- [ ] **B — Taxa do carrinho + doce**~~ ~~- [ ] **C — Pacote fechado**~~

✅ **Respondida (2026-09-16, já estava na seção 1 do ADR — "hora vs valor" — reconfirmada
2026-09-17):** nenhuma das 3 opções acima — eram do modelo antigo (carrinho+doce empacotados
num único módulo `Locacao`), obsoleto. No modelo novo, `ApoioFesta` (o `ItemApoio` alugado) e o
doce do Pedido são **cobrados de forma totalmente independente**: doce segue 100% o fluxo/preço
normal de Pedido (sem nenhuma mudança, ver pergunta 2), e o `ApoioFesta` tem sua própria tarifa
por hora — mesmo modelo já registrado na pergunta 5 (`valor_hora × horas contratadas`, ex.: 1h =
R$50, 2h = R$100, 3h = R$150 — tarifa linear). Sem bundling entre os dois.

### 2. O preço cobrado no evento é o mesmo da loja?

✅ **Respondida (já implícita no ADR desde 2026-09-16, seções 1/2/4 — "produção de doces não
muda em nada"; formalizada aqui 2026-09-17):** opção A — mesmo preço da tabela normal. Não
existe "preço de evento" separado porque não existe conceito de evento na precificação do
doce — o Pedido com `ApoioFesta` usa o Produto/preço já cadastrado, do mesmo jeito que qualquer
outro Pedido. B e C não se aplicam (não há tabela própria nem ajuste manual pra esse cenário).

### 3. Quanto servir por pessoa (auto-cálculo)

~~**Sugestão do sistema:** 35–50g de brigadeiro por pessoa + 0.6–0.8 fatia de bolo por
pessoa.~~

✅ **Respondida (2026-09-17) — pergunta deixou de se aplicar:** não vai existir motor de
auto-cálculo. O conteúdo do carrinho (doces) é vendido pelo fluxo de Pedido **já existente, sem
nenhuma mudança** — item de produto normal, quantidade digitada manualmente, igual a qualquer
venda. O `ApoioFesta` (locação do carrinho/equipamento por hora) é só um relacionamento fraco
adicional do Pedido, e não tem relação com o cálculo de quantidade de doce. Ver
`doc/adr-generalizacao-locacao-item-locavel-2026-09-16.md`, seções 4 e 5.

### 4. Os 2 carrinhos são iguais ou diferentes?

- [x] **C — Iguais hoje, mas quero poder crescer a frota no futuro** (o sistema já nasce
  preparado pra "carrinho 3").

✅ **Respondida (2026-09-17):** opção C — os 2 carrinhos de hoje são do mesmo `tipo` (mesma
capacidade), mas o campo `tipo` do `ItemApoio` (já no desenho do ADR, seção 2) deixa o cadastro
pronto pra diferenciar tipos/capacidades no futuro sem mudança de schema.

### 5. Como funciona a duração? O carrinho fica quanto tempo com o cliente?

- [x] **B — Turno:** pode ser manhã **ou** noite no mesmo dia.

✅ **Respondida (2026-09-17):** opção B — turno de referência (manhã/noite) dentro do mesmo
dia; nunca multi-dias (opção C descartada — não existe logística hoje pra buscar/entregar o
item em outro dia). Resposta veio junto com o exemplo prático da pergunta 16 (dia 20, 2
carrinhos, período da noite): *"a vai ter trava de alocação desse carrinho nesse dia, só outro
dia ele vai esta disponivel"* — confirma que a locação é sempre contida num único dia.

**Cobrança (hora × valor):** o valor cobrado segue a duração efetiva contratada — cliente que
pegou o item por 4h paga por 4h, quem pegou por 6h paga por 6h (regra original "hora vs valor"
da proposta genérica). Isso é independente da trava de disponibilidade abaixo.

**Complemento importante (regra da pergunta 16):** apesar de o turno ser só referência pra
horário e a cobrança ser por hora efetivamente usada, a checagem de conflito de frota trava o
**dia inteiro** por unidade alocada, independente da duração cobrada ou do turno — dois
clientes em turnos diferentes no mesmo dia (ou com durações diferentes, 4h vs 6h) ainda contam
contra a mesma cota da frota daquele dia, porque não é viável desmontar e remontar o mesmo item
no mesmo dia pra atender outra festa. Detalhe completo em
`doc/adr-generalizacao-locacao-item-locavel-2026-09-16.md` (seção 6.1).

### 6. O que o sistema deve lembrar você (alertas)?

✅ **Respondida (2026-09-17):** dia de buscar o item de volta + lembrete do agendamento se
aproximando + devolução atrasada (equivalente à opção B, "Médio").

**Regra de negócio nova, importante — de quem é a responsabilidade pela devolução:** depende
do tipo de entrega do Pedido associado:
- **Pedido com retirada** (cliente busca): a devolução do item de apoio é responsabilidade do
  **cliente** — o alerta de "devolução atrasada" é sobre o cliente não ter devolvido.
- **Pedido com entrega** (confeiteira leva) **+ tem `ApoioFesta`:** a responsabilidade de
  **buscar** o item de volta é da **confeiteira**, não do cliente — o alerta nesse caso é um
  lembrete operacional pra ela ir buscar, não uma cobrança de devolução do cliente.

Isso significa que o alerta de "devolução"/"buscar de volta" precisa saber o tipo de entrega do
Pedido (retirada vs entrega) pra decidir a quem o alerta se dirige/o que ele significa — não é
o mesmo alerta genérico nos dois casos.

### 7. Quando o doce é feito por outra pessoa (terceirizado) — o que registrar?

✅ **Deixou de se aplicar nesse contexto (2026-09-17):** doce terceirizado já tem solução geral
e independente de locação — módulo `EntradaProduto` (`origem = TERCEIRIZADO`), que credita
estoque de produto sem passar por Fabricação, com fornecedor/custo registrados na própria
entrada. Como `ApoioFesta` não toca em doce/estoque de produto, essa pergunta não precisa de
resposta específica pra locação — é a opção A por consequência (custo já fica no estoque, sem
campo extra na locação).

---

## Parte 2 — Finanças: lucro e gastos do mês

**Contexto:** todo mês temos gastos fixos (mão de obra, aluguel da loja, hospedagem do sistema)
e queremos ver na tela o **lucro real**: o que entrou (vendas) − os gastos − quanto custou o doce
(insumos usados). Esse "lucro real" **já está decidido** e será mostrado — não precisa decidir de novo.

### 8. De quanto em quanto tempo você quer ver o resumo (gráfico/números)?

- [x] **A — Mensal:** abro na tela "resumo do mês" quando quero.
- [ ] **B — Mensal + aviso:** além do resumo, um lembrete no começo de cada mês.
- [ ] **C — Quero ver por semana também.**

**Padrão sugerido:** A.

✅ **Respondida:** opção A — resumo mensal, aberto quando quiser.

### 9. Como você quer cadastrar os gastos (mão de obra, aluguel...)?

- [ ] **A — Eu cadastro no sistema** (valor, categoria, uma descrição — ex.: "funcionária Maria").
- [x] **B — O sistema repete os gastos fixos todo mês** (ex.: aluguel R$ X todo dia 5) e eu só
  confirmo ou ajusto.

**Padrão sugerido:** B — menos digitação, gasto fixo quase nunca muda.

✅ **Respondida:** opção B — gastos fixos repetem todo mês, com confirmação/ajuste.

### 10. O que contar como "mês" do gasto?

- [X] **A — O mês em que paguei** (ex.: paguei o aluguel de setembro em 10/09 → cai em setembro).
- [ ] **B — O mês do gasto** (ex.: mesmo pagando em outubro por atraso, o aluguel é de setembro →
  cai em setembro).

**Padrão sugerido:** B — mostra o resultado certo de cada mês.

✅ **Respondida:** opção A — conta no mês em que o pagamento foi feito (não no mês de referência do gasto).

### 11. Pedido que o cliente ainda não pagou conta no lucro do mês?

- [X] **A — Não conta:** só entram vendas pagas.
- [ ] **B — Conta como venda do mês mesmo se o pagamento atrasar** (lucro "de direito"),
  e mostramos separado "a receber".

**Padrão sugerido:** B — mas só se os pagamentos atrasados forem raros; senão, A.

✅ **Respondida:** opção A — pedido não pago não conta no lucro do mês; só entram vendas pagas.

### 12. Quem decidiu as categorias de gasto já está definido?

Feito por cada lançamento: **mão de obra, aluguel da loja, hospedagem do sistema, outros**.

- [ ] **OK, essas categorias atendem.**
- [ ] **Quero mais categorias** (ex.: luz, internet, embalagem, combustível) — anote abaixo:

- [x] Quero que seja dinamico, exista um cadastro de gastos e ele seja usado depois por todo fluxo.

✅ **Respondida:** cadastro de categorias de gasto dinâmico (não fixo), reutilizado por todo o fluxo.

### 13. criar algo para gestionar e mostar as contas  de clientes pagos e nao pagos, talvez em gestao de pedido criar um check box para identificar se foi pago [regra atual no fluxo da minha espesa: ela sempre solicida 50% no ato da confirmacao do pedido, e os outros 50% depois da entrega esse é o padrao, mas existe o cenario que ela ela nao solicita entrada na confimacao do pedido, ela  recebe tudo no ato da entrega da mercadoria. nos 2 senarios tem gente que nao paga, fica faltado 50 no ato da entrega, e o pior cenario quando nao tem 50 por cento de entrada a pessoa deve tudo pois recebeu o produto que era para pagar sua totalidade no ato da entrega]. O pedidos que nao foram pagos depois da entrega devem entrar em uma lista de consta a receber, tavez nessa etapa tenha que ter um tipo de cadastro para detalhar alguma observacao ou motivo relacionado ao nao pagamento no ato. ex: o cliente por motivos pessoais, falou que faria o pagamento amanhã, otro exemplo, cliente estava sem iternet para fazer pix, e por ai vai.

temos que pensar em um fluxo de controle de pedido vs valor a receber.
e deixa um opcao de cadastro de conta a receber que pode nao ter vinculo com pedido, esse caso pode ser raro, mas pede existir. exemplo, funcionario quebrou algo na empresa, ele vai resacer o valor. mas isso deve ser uma situacao rara.

✅ **Respondida (2026-09-16) — parte vinculada a pedido:** já temos o suficiente no modelo atual.
O `PagamentoPedido` já registra múltiplos pagamentos parciais por pedido, validando que a soma
não passe do `valorTotal` — logo o **saldo pendente por pedido** (`valorTotal − soma dos
pagamentos`) já é derivável do que existe hoje, sem precisar de uma tabela nova. O que falta é
só a **camada de visualização** (não é um novo conceito de domínio): uma tela/relatório de
"contas a receber" que liste pedidos com saldo > 0, e o checkbox/indicador de "pago" na gestão
de pedido, que também é só um reflexo desse mesmo cálculo. Cobre o fluxo normal 50%/50%
(entrada + entrega) e os cenários de falha descritos (cliente não completa a entrada, ou deve
o total quando não há entrada).

**Ponto residual, fora de escopo por agora:** o caso de conta a receber **sem** pedido vinculado
(ex.: funcionário que quebrou algo e deve à empresa) **não é coberto** pelo `PagamentoPedido`
atual, que sempre exige um `pedidoId`. Modelar isso é um conceito novo e diferente — decisão
explícita de não tratar agora, por ser um caso raro; registrado aqui para não se perder.

## Parte 3 — Locação (Apoio de Festa): perguntas novas da proposta genérica

**Contexto:** ao revisar a análise de locação de carrinhos, surgiu a ideia de generalizar: em
vez de um módulo só pra carrinho, ter um cadastro genérico de "item locável" (carrinho, tacho,
decoração, ou qualquer outro equipamento futuro) com preço por hora. O aluguel em si vira uma
entidade própria chamada **"Apoio de Festa"** — nome escolhido pra não colidir com o
"Complemento" que já existe no sistema (que é outra coisa: adicional de insumo por produto) —
sempre vinculada a um Pedido, mas com acoplamento arquiteturalmente fraco (referência lógica,
não um item físico dentro dele). Ver
`doc/adr-generalizacao-locacao-item-locavel-2026-09-16.md` para o detalhe completo.

### 14. O Apoio de Festa pode existir sem um pedido de doce associado?

✅ **Respondida (2026-09-16):** não — não existe Apoio de Festa sem pedido, mas existe pedido
sem Apoio de Festa (a maioria dos pedidos é só doce, sem locação de equipamento).

### 15. Pagamento do Apoio de Festa: registro próprio ou só quando tiver pedido vinculado?

✅ **Respondida (2026-09-16):** só quando tiver pedido — reaproveita o controle de pagamento
que o Pedido já tem (mesma lógica do 50%/50% da pergunta 13), sem precisar de tela/tabela
própria. Consequência direta da resposta 14 (Apoio de Festa sempre tem pedido).

### 16. Cada tipo de Item de Apoio tem uma "frota" com quantidade fixa controlada?

✅ **Respondida (2026-09-16):** sim — todo Item de Apoio cadastra uma quantidade (frota), sem
exceção por enquanto.

**Complemento à resposta — regra de disponibilidade:** a checagem de conflito de agendamento
trava o **dia inteiro** por unidade alocada, não por faixa de horário (ainda não existe
logística pra montar/desmontar/transportar o mesmo item mais de uma vez no mesmo dia). Ex.: com
2 carrinhos, se os 2 já estiverem alocados num dia (mesmo em horários diferentes, como manhã e
noite), um terceiro pedido pra qualquer horário daquele mesmo dia é recusado — só libera no dia
seguinte. Detalhe completo em
`doc/adr-generalizacao-locacao-item-locavel-2026-09-16.md` (seção 6.1).

### 17. O valor da locação inclui custo de mão de obra (funcionário que gerencia/entrega o
carrinho durante o evento)?

✅ **Respondida (2026-09-17):** sim — a locação do carrinho é composta por 2 valores: o valor
da locação do equipamento e o valor do funcionário que fica gerenciando/entregando os produtos
do carrinho durante o evento. Modelagem: dois campos separados no cadastro do `ItemApoio`
(`valorHora` do equipamento + `valorHoraMaoDeObra` do funcionário) — **não** um valor único já
embutido, pra permitir relatório separado de quanto é equipamento vs quanto é mão de obra. A
inclusão da mão de obra é **opcional por locação**: cada `ApoioFesta` decide se inclui
atendente ou não (cliente pode optar por não ter). Quando inclui, o valor cobrado soma os dois
componentes por hora contratada; quando não inclui, só cobra o valor do equipamento. Detalhe
completo em `doc/adr-generalizacao-locacao-item-locavel-2026-09-16.md` (seções 2 e 6).

### 18. Quem faz essa mão de obra? Precisa de um cadastro próprio (funcionário/prestador)?

✅ **Respondida (2026-09-17):** sim — novo cadastro simples **Colaborador** (funcionário ou
prestador de serviço), pra vincular na mão de obra da locação. Campos: **nome** e
**telefone/celular** obrigatórios; endereço e email opcionais (e outros campos simples podem
entrar depois). O `ApoioFesta` referencia o colaborador escolhido quando a locação inclui mão
de obra (`incluiMaoDeObra = true`) — referência lógica, mesmo padrão do `pedidoId` (sem FK
física, sem cascade). Detalhe completo em
`doc/adr-generalizacao-locacao-item-locavel-2026-09-16.md` (seções 2 e 6).

---

---

### Resumindo as decisões já tomadas (não é pergunta)

- **Lucro real do mês =** vendas − gastos fixos − custo dos doces **usados** no mês (medido pelo
  consumo, não pela compra).
- **Não existe devolução de itens de locação** (o que foi oládo do estoque não volta).
- O sistema **valida antes de baixar do estoque** (evita erro de "debitar sem ter saldo").
- O controle simples é **nosso sistema do dia a dia**; a parte **contábil** (para o contador) fica
  documentada pra um futuro bem distante — as despesas que cadastrarmos continuarão servindo pra ela.

---

> Após esta conversa, me devolva o arquivo com as marcas — ou só me diga as respostas por aqui.
> Registro tudo e sigo o desenho técnico.
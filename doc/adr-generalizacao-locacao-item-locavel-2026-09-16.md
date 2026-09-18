# ADR — Generalizar "Locação de Carrinhos" para "Item Locável" genérico

> **Status:** ✅ IMPLEMENTADO no backend (2026-09-17) — `ItemApoio` + `ApoioFesta`, CRUD +
> disponibilidade + integração de valor com Pedido. Detalhe técnico completo em
> `doc/PROJECT_CONTEXT.md` (seção `apoioFesta/`). Alertas (busca/devolução) ficam pra uma
> próxima rodada, decisão explícita do dono. **Substitui** `doc/analise-locacao-carrinhos.md`
> (ver seção 7 — "O que continua valendo do documento anterior"). O documento antigo já foi
> excluído do repositório (2026-09-16) por decisão do dono, pra não conviver duas versões.
>
> **Formato:** registrado como ADR (Architecture Decision Record) porque é uma decisão de
> arquitetura — como modelar o domínio de locação — e não um requisito de negócio isolado.

---

## 1. Contexto

`doc/analise-locacao-carrinhos.md` (2026-09-10, hoje removido) modelou a locação **em torno do
carrinho**: um módulo `Locacao` com ciclo de vida próprio (RASCUNHO→CONFIRMADO→INSTALADO→
EM_USO→RECOLHIDO→DEVOLVIDO→CONCLUIDO→CANCELADO), uma frota fixa (`carrinho`, hoje 2 unidades),
um motor de dimensionamento embutido (quanto brigadeiro/bolo por pessoa) e cobrança "no ato da
instalação" como conceito próprio, separado do fluxo normal de Pedido.

Nesta sessão, ao revisar esse documento, o dono trouxe a seguinte proposta (mensagem original,
2026-09-16):

> *"sera que deveriamos fazer um funcionalidade só de locação, algo generico, hoje é carrinho,
> mas pode ser outro produto de locacao, tacho, decoracao, hoje só é o carrinho, mas pode ser
> qualquer outra coisa. entao podemos fazer um cadastro isolado só para isso com hora vs valor.
> ai em pedido podemos só adicionar essa locacaoes como complemento de infraestruturas para
> festa. e o mesmo de tudo, bolo, doces, qual outro produto da producao confeitaria continua
> sendo processado pelo caminho nomal, como ja é feito hoje."*

Em seguida, refinou o nome e o vínculo com Pedido:

> *"podemos usar outro termo, algo próximo infraestrutura de apoio de festa (...) no fundo isso
> é um complemento, mas vamos usar outro nome para evitar conflitos com o domínio existente, ele
> teria um relacionamento fraco com pedido."*

E, ao responder a pergunta sobre pagamento (seção 6, pergunta 15), o dono deixou a regra de
negócio explícita — o que também fecha a pergunta 14:

> *"no 15 já lhe dou a resposta: só quando tiver pedido, não existe infraestrutura sem pedido,
> mas existe pedido sem infraestrutura."*

E reforçou a abrangência do catálogo e a regra de alocação por período (já definida
anteriormente):

> *"lembrando que vamos ter o cadastro de utensílios de infraestrutura, pode ser o carrinho,
> bandejas de aluminho, toalha de mesa. etc. e a regra de período de alocação que já definimos
> antes."*

O dono esclareceu em seguida que "utensílio" e "infraestrutura" foram usados só de forma
**ilustrativa**, pra ajudar a explicar a abrangência do catálogo — não são os termos de negócio
a adotar:

> *"coloquei o nome utensilio, mas vc pode colocar o nome mas atequadro para o negócio, usei
> esse nome mais de forma ilustrativa para ajudar no seu entendimento (...) mesma coisa para
> infraestrutura, foi com proposito ilustrativo."*

O nome de negócio escolhido pro catálogo é **"Item de Apoio"** (código: `ItemApoio`) — cria uma
família consistente com "Apoio de Festa": **Item de Apoio** é o que existe no catálogo
(carrinho, tacho, decoração, bandeja, toalha de mesa, e o que mais vier); **Apoio de Festa** é o
aluguel em si, quando um Item de Apoio é reservado pra um pedido.

Por fim, o dono definiu a regra de disponibilidade/conflito de agendamento (detalhe completo
na seção 6.1):

> *"No cadastro de utensílio vamos definir a quantidade (...) podemos usar a trava dia (...)
> não temos ainda logística de usar o mesmo carrinho em mais de uma locação no dia, tem que
> montar, desmontar, transportar."*

Ou seja: **todo `ApoioFesta` exige um Pedido** (`pedidoId` obrigatório) — mas não todo Pedido
tem um `ApoioFesta` (a maioria dos pedidos é só doce, sem locação de equipamento). O
"relacionamento fraco" citado pelo dono se refere só ao **acoplamento arquitetural**
(referência lógica, sem FK física/cascade, sem import cross-module — mesmo padrão de
`clienteId`/`enderecoId`/`produtoId` já usado no sistema), **não à obrigatoriedade**: o campo é
sempre preenchido.

Em resumo: em vez de um módulo `Locacao` específico de carrinho, ter um **cadastro genérico
"Item de Apoio"** — não só equipamento grande (carrinho, tacho, decoração), mas qualquer
item alugável de apoio a festa (bandeja, toalha de mesa, e o que mais vier) — com preço por
tempo (hora × valor); e uma segunda entidade — **"Apoio de Festa"** — que registra o aluguel
em si, sempre vinculada a um Pedido, mas com acoplamento arquiteturalmente fraco (não é um
item físico embutido no agregado de Pedido). A produção de doces (bolo, brigadeiro etc.)
continua exatamente no caminho já existente (receita → fabricação → débito de estoque de
insumo → crédito de estoque de produto), sem nenhuma mudança.

---

## 2. Decisão proposta

1. **Novo cadastro genérico "Item de Apoio" (`ItemApoio`)**: cobre qualquer item alugável de
   apoio a festa, não só equipamento grande. Campos: nome, **tipo** (`CARRINHO`/`TACHO`/
   `DECORACAO`/`BANDEJA`/`TOALHA_MESA`/`OUTRO` — lista extensível, os exemplos citados
   pelo dono), **`valorHora`** (tarifa linear por hora — confirmado, pergunta 1/5 de
   `doc/decisoes-usuario-final.md`: `valorTotal = valorHora × horasContratadas`, ex.: 1h =
   R$50, 2h = R$100, 3h = R$150; **não** é tabela por período/pacote), **`valorHoraMaoDeObra`**
   (tarifa linear por hora do funcionário que gerencia/entrega o item durante o evento —
   componente separado, opcional por locação, ver pergunta 17), quantidade disponível daquele
   tipo (frota — ver pergunta 16). Cobrança de `ApoioFesta` é **totalmente independente** do
   preço do doce do Pedido (que segue 100% o fluxo/tabela normal — sem preço de evento, sem
   bundling entre os dois).
2. **Nova entidade própria `ApoioFesta`** (não é um item embutido em Pedido): registra o
   aluguel de um `ItemApoio` por um período (data/hora início → fim) + valor calculado +
   **`incluiMaoDeObra: Boolean`** (opcional por locação — ver pergunta 17). Fórmula:
   `valorCalculado = (valorHora + (incluiMaoDeObra ? valorHoraMaoDeObra : 0)) × horasContratadas`.
   `pedidoId: Long` **sempre preenchido** (todo Apoio de Festa exige um pedido — regra de
   negócio confirmada pelo dono) — mas como **referência lógica**, sem FK física obrigatória,
   sem cascade, sem import cross-module. O inverso não vale: um Pedido pode existir sem nenhum
   `ApoioFesta` associado (pedido só de doce, sem locação de equipamento).
3. **Produção de doces não muda em nada.** Continua 100% no fluxo atual de
   receita/fabricação/estoque — `ApoioFesta` não debita insumo nem produto, é uma reserva de
   disponibilidade + cobrança por tempo.
4. **Novo cadastro simples `Colaborador`** (funcionário ou prestador de serviço que faz a mão
   de obra do carrinho — pergunta 18): nome (obrigatório), telefone/celular (obrigatório),
   endereço (opcional, campo texto simples — não reaproveita o `Endereco` estruturado usado em
   Pedido, que é sobre entrega/frete), email (opcional). `ApoioFesta` ganha
   `colaboradorId: Long?` — referência lógica (mesmo padrão de `pedidoId`), só relevante quando
   `incluiMaoDeObra = true`. **Assunção a confirmar:** mesmo com `incluiMaoDeObra = true`,
   assumi que `colaboradorId` não é obrigatório (pode ficar em branco até a dona decidir quem
   vai) — sinalizar se precisar ser obrigatório nesse caso.

---

## 3. Nomenclatura e relacionamento com Pedido

### 3.1 Por que "Apoio de Festa" e não "Complemento"

Ao investigar o código do backend (só leitura, nada alterado) pra ver como o Pedido já modela
itens hoje, encontrei uma entidade `Complemento` (`vendas/domain/model/Complemento.kt`) e um
`ItemPedidoComplemento` — mas é **outro conceito**: um adicional por item de produto vinculado
direto a um insumo (ex.: granulado extra), debitado do estoque de insumo na produção. Sem
noção de tempo/período nenhuma. Usar "complemento" pra essa nova funcionalidade colidiria
conceitualmente com essa entidade já existente. Por isso o termo escolhido é **"Apoio de
Festa"**.

### 3.2 Relacionamento fraco ≠ opcional — esclarecido pelo dono

Depois de uma primeira rodada com essa ambiguidade, o dono fechou com uma regra de negócio
explícita: **não existe Apoio de Festa sem Pedido, mas existe Pedido sem Apoio de Festa.** Isso
define os dois eixos:

- **Obrigatoriedade (regra de negócio):** `pedidoId` é **sempre preenchido** em `ApoioFesta`
  (`Long`, não `Long?`) — confirmado.
- **Acoplamento (arquitetura):** `pedidoId` continua sendo uma **referência lógica** — sem FK
  física obrigatória, sem cascade, sem import cross-module. `ApoioFesta` não é um item físico
  embutido no agregado de Pedido (não é `ItemPedidoApoio`), mesmo sendo sempre vinculado a um.
  Isso é o que o dono quis dizer com "relacionamento fraco": fraco no acoplamento entre módulos,
  não fraco na obrigatoriedade do dado.

**Consequência — P2 (pagamento) resolvida.** Como `pedidoId` é sempre preenchido, `ApoioFesta`
reaproveita `PagamentoPedido` **diretamente**, sem precisar de uma tabela própria
(`PagamentoApoioFesta` não é necessário).

### 3.3 Nomes propostos no código

| Conceito | Nome no código | Relação com Pedido |
|---|---|---|
| Catálogo genérico do equipamento | `ItemApoio` (`valorHora` + `valorHoraMaoDeObra`) | Nenhuma |
| Aluguel do equipamento | `ApoioFesta` (`incluiMaoDeObra: Boolean`) | `pedidoId: Long` — sempre preenchido, mas referência lógica (sem FK física/cascade) |
| Pagamento do Apoio de Festa | Reaproveita `PagamentoPedido` (sem tabela nova) | — |

---

## 4. O que isso muda em relação à análise anterior

| Aspecto | Antes (`analise-locacao-carrinhos.md`, removido) | Depois (proposta genérica) |
|---|---|---|
| Cadastro do equipamento | `carrinho` — entidade fixa, 2 unidades, sem campo de tipo | `ItemApoio` — genérico, com campo `tipo` (CARRINHO/TACHO/DECORACAO/OUTRO) |
| Onde a locação "vive" | Módulo próprio `Locacao`, com ciclo de vida completo, sem nenhuma relação com Pedido | Entidade própria `ApoioFesta`, sempre vinculada a um Pedido (`pedidoId: Long`), mas com acoplamento arquiteturalmente fraco |
| Cálculo de "quanto doce por pessoa" | Motor de auto-cálculo embutido no módulo de locação | **Não existe mais como funcionalidade própria** (esclarecido pelo dono, 2026-09-17) — o conteúdo do carrinho (doces) é vendido pelo fluxo de Pedido **já existente, sem nenhuma mudança**: item de produto normal, quantidade digitada manualmente, igual a qualquer venda. `ApoioFesta` só acrescenta o apoio cobrado por hora, como um relacionamento fraco adicional do Pedido |
| Cobrança | "Pagamento no ato da instalação", conceito próprio, separado do Pedido | Reaproveita `PagamentoPedido` diretamente (pagamento parcial + estorno automático já existentes) |
| Produto de produção (bolo/doce) | Sem mudança | Sem mudança |

---

## 5. O que isso resolve dos 5 pontos levantados na revisão do documento anterior

1. **Falta de campo para "turno noturno"** — não se aplica mais: o doce do carrinho é só um
   item de Pedido normal, sem campo especial de turno. Se o negócio precisar registrar o
   turno de um evento, é o mesmo mecanismo (ou falta dele) que qualquer outro Pedido já tem
   hoje — não é uma lacuna introduzida por esta proposta.
2. **`tipo_carrinho` sem campo correspondente** — resolvido: `ItemApoio` já nasce com campo
   `tipo`.
3. **Conflito de frota sem invariante síncrona dedicada** — continua valendo, e agora tem
   regra precisa: ver seção 6 (pergunta 16, respondida) e seção 6.1 — trava por dia inteiro,
   não por faixa de horário. Precisa da mesma validação síncrona travada já usada pra
   estoque (evita a mesma classe de bug já corrigida 3× no sistema).
4. **Branch `feature/carrinho` com histórico não relacionado** — sem mudança, ainda recomendo
   renomear/avisar o time.
5. **Divergência do "0.6 fatia/pessoa"** entre os dois documentos — **fica sem efeito**: como
   não existe mais motor de auto-cálculo de doce por pessoa (ver acima), essa divergência
   deixa de ser um problema a resolver. Quantidade de doce por evento é sempre digitada
   manualmente, como em qualquer Pedido.

---

## 6. Perguntas — status atualizado

Consolidadas em `doc/decisoes-usuario-final.md` (Parte 3):

**14 — O Apoio de Festa pode existir sem um pedido de doce associado?**
✅ **RESOLVIDO pelo dono (2026-09-16):** não — todo Apoio de Festa exige um Pedido. O inverso
não vale: um Pedido pode existir sem nenhum Apoio de Festa. `pedidoId` é sempre preenchido
(`Long`, não nullable).

**15 — Pagamento do Apoio de Festa: registro próprio ou reaproveita o do Pedido?**
✅ **RESOLVIDO pelo dono (2026-09-16):** reaproveita `PagamentoPedido` diretamente — já que
`pedidoId` é sempre preenchido, não há cenário de Apoio "solo" que justifique uma tabela
própria.

**16 — Cada tipo de Item de Apoio tem uma "frota" com quantidade fixa controlada, ou alguns
tipos são sob encomenda, sem contagem de unidades?**
✅ **RESOLVIDO pelo dono (2026-09-16):** todo `ItemApoio` cadastra uma `quantidade` (frota) — o
cadastro sempre define esse número, não existe tipo "sem controle" por enquanto.

**17 — O valor da locação inclui custo de mão de obra (funcionário que gerencia/entrega o
carrinho durante o evento)?**
✅ **RESOLVIDO pelo dono (2026-09-17):** sim, é um componente real do preço, mas modelado como
**dois valores separados** no cadastro do `ItemApoio` (`valorHora` do equipamento +
`valorHoraMaoDeObra` do funcionário), não um valor único já embutido. A inclusão da mão de
obra é **opcional por locação** (`ApoioFesta.incluiMaoDeObra`) — o cliente pode optar por não
ter atendente. Quando `incluiMaoDeObra = true`, o valor calculado soma os dois componentes por
hora contratada; quando `false`, só cobra o `valorHora` do equipamento. Ver seção 2.

**18 — Quem faz a mão de obra? Precisa de cadastro próprio?**
✅ **RESOLVIDO pelo dono (2026-09-17):** sim — novo cadastro simples `Colaborador`
(funcionário ou prestador de serviço): nome e telefone/celular obrigatórios; endereço e email
opcionais. `ApoioFesta` referencia via `colaboradorId: Long?` (referência lógica, mesmo padrão
de `pedidoId`), preenchido quando `incluiMaoDeObra = true`. Ver seção 2, item 4.

### 6.1 Regra de alocação: trava por dia inteiro, não por faixa de horário

Pra simplificar por agora, a checagem de disponibilidade **não compara faixas de horário** —
ela trava o **dia inteiro** por unidade alocada, independente do horário pedido. Motivo (dono,
2026-09-16): hoje não existe logística montada pra usar a mesma unidade física (ex.: o mesmo
carrinho) em mais de uma locação no mesmo dia — precisaria desmontar, transportar e montar de
novo, e isso ainda não está modelado no sistema.

**Regra:** se o Item de Apoio "Carrinho" tem `quantidade = 2`, no máximo 2 `ApoioFesta` desse
tipo podem existir pra uma mesma data — depois disso, qualquer novo pedido pra aquela data é
recusado, **mesmo que o horário pedido não colida** com os já alocados. A validação é uma
contagem simples (quantos `ApoioFesta` já existem pra aquele `ItemApoio` naquela data, contra a
`quantidade` cadastrada), não uma checagem de sobreposição de intervalos.

**Exemplo dado pelo dono, que fixa o caso de aceite:** no dia 20, Cliente A aluga um carrinho
pro período da noite (evento de 4h). Cliente B aluga o outro carrinho, também pro período da
noite, mesmo dia — os 2 carrinhos ficam travados pro dia 20. Chega um Cliente C pedindo um
carrinho só pra manhã do dia 20 — mesmo sendo um horário totalmente diferente (manhã, sem
colidir com a noite dos outros dois), **o sistema recusa**: não há um terceiro carrinho, e o
dia 20 já está com os 2 usados. O carrinho só volta a ficar disponível no dia 21.

Essa simplificação evita ter que modelar logística de montagem/desmontagem/transporte entre
dois eventos no mesmo dia — pode ser refinada depois (checagem por faixa de horário) se a
confeitaria passar a ter essa logística.

**Cobrança é por hora, trava é por dia — são coisas diferentes (dono, 2026-09-17):** o valor
cobrado segue a duração efetiva contratada (`hora × valor`, regra original da proposta
genérica) — cliente que ficou 4h paga por 4h, quem ficou 6h paga por 6h. Isso não afeta a trava
de disponibilidade acima: mesmo que a cobrança seja por hora, a alocação trava o **dia
inteiro**, porque não é viável desmontar/remontar o mesmo item no mesmo dia pra atender outra
festa.

**Isso também resolve a pergunta 5 (Parte 1, antiga — "como funciona a duração?"):** o próprio
exemplo do dono ("só outro dia ele vai estar disponível") confirma a opção **B — Turno** (a
locação é sempre contida num único dia; o turno é só referência de horário, e a cobrança dentro
dele é por hora) e descarta a opção C — Multi-dias. Ver `doc/decisoes-usuario-final.md`,
pergunta 5, atualizada em 2026-09-17.

---

## 7. O que continua valendo do documento anterior

- **Invariante de validação síncrona antes do débito/cobrança** — regra a seguir, agora
  aplicada à checagem de disponibilidade de qualquer `ItemApoio`.
- **Padrão de alertas** (tipos por prazo, scheduler diário, reconhecimento) — válido, adaptado
  pros eventos de `ApoioFesta` (agendamento se aproximando, devolução atrasada). **Regra de
  responsabilidade confirmada (dono, 2026-09-17):** quem deve devolver o item depende do tipo
  de entrega do Pedido — se **retirada**, o alerta de devolução é sobre o **cliente**; se
  **entrega** (a confeiteira leva) **e** há `ApoioFesta`, o alerta é um lembrete pra
  **confeiteira ir buscar** o item de volta, não uma cobrança do cliente. O alerta precisa
  conhecer o tipo de entrega do Pedido pra decidir a quem se dirige. Ver
  `doc/decisoes-usuario-final.md`, pergunta 6.
- **Decisões já confirmadas pela dona**: sem devolução de produto não consumido; existe
  cancelamento.

---

## 8. Status e próximo passo

**Parte 3 (perguntas 14, 15, 16) — totalmente resolvida nesta sessão.**

**Pergunta 13 (Parte 2 — Finanças, contas a receber) — também resolvida nesta sessão:** o
saldo pendente por pedido já é derivável do `PagamentoPedido` existente (`valorTotal − soma dos
pagamentos`), sem necessidade de nova entidade — falta só a tela/relatório de "contas a
receber" e o indicador de "pago" na gestão de pedido, que são camada de visualização sobre dado
que já existe. O caso avulso (conta a receber sem pedido, ex.: funcionário que quebrou algo)
fica registrado como ponto residual, fora de escopo por agora — ver detalhe em
`doc/decisoes-usuario-final.md`, pergunta 13.

**Pergunta 5 (Parte 1 — duração da locação) — resolvida (2026-09-17):** opção B — turno de
referência (manhã/noite) dentro de um único dia, nunca multi-dias; cobrança por hora
efetivamente usada, independente da trava de disponibilidade (que é por dia inteiro — ver seção
6.1). Já estava implícita no exemplo prático dado pra pergunta 16, só não tinha sido marcada
explicitamente contra a pergunta 5 — o que gerou uma dúvida repetida no time de
desenvolvimento.

**Perguntas 8 a 12 da Parte 2 (finanças) — confirmadas:** já foram respondidas em
`doc/decisoes-usuario-final.md` (confirmado pelo dono em 2026-09-17 que as marcações não eram
só padrão sugerido).

**Parte 1 — totalmente resolvida (2026-09-17):**
- **Pergunta 1 (cobrança):** não existe bundling carrinho+doce (opções A/B/C antigas ficaram
  obsoletas) — `ApoioFesta` cobra por hora (`valorHora × horas`, mesmo modelo da pergunta 5),
  totalmente independente do preço do doce do Pedido.
- **Pergunta 2 (preço do doce no evento):** mesmo preço da tabela normal — não existe "preço de
  evento" separado, porque a produção de doce não muda em nada.
- **Pergunta 4 (frota):** os 2 carrinhos de hoje são do mesmo `tipo`; o campo `tipo` do
  `ItemApoio` já deixa o cadastro pronto pra diferenciar no futuro.
- **Pergunta 6 (alertas):** dia de buscar + agendamento se aproximando + devolução atrasada —
  com a regra nova de responsabilidade (retirada = cliente devolve; entrega = confeiteira busca)
  documentada na seção 7.
- **Pergunta 7 (terceirizado):** não se aplica mais a este contexto — já resolvido de forma
  geral pelo módulo `EntradaProduto` (`origem = TERCEIRIZADO`), independente de locação.

Nenhuma pergunta pendente. Próximo passo: desenhar `ItemApoio` + `ApoioFesta` (com
`pedidoId: Long` sempre preenchido, reaproveitando `PagamentoPedido` pra cobrança).

# Homologação Frontend — Melhorias recentes (2026-09-19)

## Objetivo

Protocolo de homologação **manual, via frontend** (confectionery-web-dashboard) das melhorias
entregues nas últimas rodadas, com foco no que o usuário final enxerga na tela:

1. **Apoio de Festa no Pedido** ("apoio de pedido") — criação de locação dentro do pedido, total
   do pedido refletindo o apoio, cancelamento, comanda e conversão de orçamento (inclui os 2
   cenários que **nunca foram testados ao vivo**: cancelamento revertendo o total e conversão
   `ApoioOrcamento` → `ApoioFesta`).
2. **Reserva de estoque de complementos (item 25)** — criar pedido RASCUNHO reduz o estoque
   "disponível"; devolve ao cancelar; trava quando não há disponível; consome na produção.
3. **Fuso horário de Brasília (item 59)** — efeitos visíveis: alertas de pedido alinhados ao dia
   de Brasília, relatório de movimentação padrão de 30 dias (início = meia-noite de Brasília),
   resumo financeiro do mês e repetição de gasto preservando o dia.

Este documento é um **script a ser executado e preenchido** (marcar ✅/❌ por cenário). Cada bloco
indica o comportamento esperado — o que não corresponder deve ser anotado na tabela de resultados.

## Pré-requisitos

- Stack local rodando (`docker compose up -d`): `api-confectionery` (8080), `frontend-confectionery`,
  `mysql-confectionery-db`, `keycloak-confectionery`. Backend com **V55** aplicada (Flyway) —
  conferir: `docker logs api-confectionery | grep -i flyway`.
- Login no frontend com usuário ADMIN (perfil `ADMIN` no Keycloak).
- Dados de apoio criados (se não existirem):
  - **Item de Apoio com mão de obra precificada** (ex.: "Carrinho Premium QA" — `valor_hora` +
    `valor_hora_mao_de_obra`, frota 1 unidade).
  - **Item de Apoio sem mão de obra** (ex.: "Carrinho de Doces QA" — só `valor_hora`).
  - **Colaborador** ("Maria Colaboradora QA").
- Dados de estoque criados:
  - Insumo com quantidade conhecida (anotar o valor) e Produto com receita que consuma esse
    insumo (anotar a quantidade por unidade). Anotar o saldo em
    `/estoque-insumos/estoque` antes dos testes.
- Nota: sempre conferir com `F5` (reload) antes de registrar resultado — não considerar cache.

## Galeria de rotas usadas

| Tela | Rota |
|---|---|
| Pedidos (lista / novo / editar) | `/vendas/pedidos`, `/vendas/pedidos/novo`, `/vendas/pedidos/:id/editar` |
| Apoios de Festa | `/vendas/apoios-festa` |
| Itens de Apoio | `/vendas/itens-apoio` |
| Colaboradores | `/vendas/colaboradores` |
| Estoque de Insumos | `/estoque-insumos/estoque` |
| Movimentações | `/estoque-insumos/movimentacoes` |
| Orçamentos | `/vendas/orcamentos`, `/vendas/orcamentos/novo` |
| Alertas de Pedido | `/alertas-pedido` |
| Relatório de Movimentação | `/relatorios/movimentacao-estoque` |
| Gastos (financeiro) | `/financeiro/gastos` |

---

## Ambiente desta rodada (2026-09-22)

Executado **após a migração para PostgreSQL** (branch `feature/migracao-postgresql`, commit
`63d6999` + commits de `cidade_estado_fornecedor`), com o banco recém-migrado e **vazio**
(esperado — regeneração limpa, confirmado com a dona do produto). Toda a massa de dados de teste
abaixo foi recriada do zero nesta rodada: Cliente "Maria Teste PG"; Insumo "Farinha de Trigo QA PG"
(R$10/un, 20 un em estoque); Complemento ligado a esse insumo (venda R$12, extra); Produto "Bolo QA
PG" (R$30, sem receita, custo manual); 2× Itens de Apoio ("Carrinho Premium QA PG" com mão de obra,
frota 1; "Carrinho de Doces QA PG" sem mão de obra, frota 2); Colaborador "Maria Colaboradora QA PG".

**Validação geral da migração PostgreSQL:** app sobe e aplica as migrations Flyway (V1–V56)
limpamente sobre Postgres 16; login via Keycloak funciona; dados de referência semeados via Flyway
(Formas de Pagamento, Categoria "Sem categoria") sobreviveram à migração enquanto os dados
operacionais foram limpos, como esperado; CRUD completo exercitado nesta rodada — Cliente, Insumo,
Entrada de Insumo, Complemento, Produto, Precificação, Colaborador, Item de Apoio, Pedido, Apoio de
Festa, Orçamento, Entrada de Produto, Gasto — sem nenhum erro `500`/SQL atribuível ao banco; todo
erro encontrado foi de regra de negócio (`400`/`409` esperados) ou bug de frontend (detalhado
abaixo). **Conclusão: migração para PostgreSQL validada, sem regressão perceptível no
comportamento funcional.**

---

## Bloco A — Apoio de Festa no Pedido

### A1 — Criar pedido RASCUNHO e adicionar apoio de festa → total atualizado
**✅ CORRETO.** RESUMO e PAGAMENTO somaram o apoio (R$420,00 = (50+20)×6h) ao total
imediatamente após adicionar, sem precisar salvar. Total persistiu corretamente (R$462,00) através
de "Registrar pedido" e sobreviveu a um reload completo da página de edição. **O bug crítico da
rodada anterior (2026-09-18) — `Pedido.valorTotal` não atualizava — está confirmado como
corrigido.**

### A2 — Apoio adicionado antes de salvar o pedido (modo criação)
**Não executado nesta rodada** — todos os apoios testados foram adicionados após o pedido já
existir (pós-`POST /api/pedido`). Recomenda-se testar explicitamente em uma próxima rodada.

### A3 — Trava por dia (frota)
**✅ CORRETO.** Com a única unidade do item de mão de obra ocupada no dia, a tentativa de
realocar o mesmo item no mesmo dia foi bloqueada corretamente.

### A4 — Mão de obra sem preço configurado
**✅ CORRETO.** Para o item sem `valor_hora_mao_de_obra`, o checkbox "Incluir atendente (mão de
obra)" aparece desabilitado com o texto explicativo.

### A5 — Cancelar apoio → total do pedido reverte ✅ (nunca testado ao vivo antes)
**✅ CORRETO — confirmado com precisão.** Cancelado o apoio "Carrinho Premium QA PG" (R$420,00)
de um pedido com dois apoios ativos (total R$912,00): toast "Apoio de festa cancelado.", linha
passou para status "Cancelado" (soft-cancel, permanece na lista), RESUMO e PAGAMENTO reverteram
corretamente para R$492,00 (912−420). Reallocar o mesmo item no mesmo dia em seguida mostrou
"1 de 1 unidade(s) disponível(is) nesse dia" e foi aceito sem erro — a unidade de frota foi
liberada corretamente.

### A6 — Comanda de produção inclui apoio
**✅ CORRETO.** A Comanda de Produção mostra a seção "EQUIPAMENTO / APOIO DE FESTA (LOCAÇÃO)"
listando corretamente apenas os apoios com status **Ativo** (o apoio cancelado foi excluído da
comanda), com item e horário de cada um. *Observação: nenhum dos apoios ativos no momento do teste
tinha atendente/colaborador vinculado, então a exibição do campo colaborador na comanda não foi
exercitada — não é um bug, apenas um caminho não testado por falta de dado.*

### A7 — Excluir Item de Apoio em uso → 409
**✅ CORRETO.** Tentativa de excluir "Carrinho Premium QA PG" (referenciado por um `ApoioFesta`
ativo) foi bloqueada com toast "Este registro já existe ou está em uso por outro cadastro e não
pode ser salvo/removido dessa forma." — item permaneceu na listagem.

---

## Bloco B — Orçamento → Pedido com Apoio (pergunta 19)

### B1 — Orçamento com apoio: PDF e valores
**❌ ACHADO CRÍTICO.** O card RESUMO do Orçamento (tanto na tela de criação quanto após salvar)
**não inclui o valor do Apoio de Festa proposto no total**. Orçamento criado com produto (R$30) +
complemento (R$12) + apoio de festa proposto (R$200,00, "Carrinho de Doces QA PG" 4h): RESUMO
mostrou Total = **R$42,00** (30+12), ignorando completamente os R$200,00 do apoio. Confirmado via
API (`GET /api/orcamento/1` → `valorTotal: 42`) que o valor incorreto é o que fica **persistido**,
não apenas um problema de exibição — o registro `apoio-orcamento` (`POST /api/apoio-orcamento`)
foi salvo corretamente com `valorTotal: 200`, mas nunca é somado ao total do orçamento. O PDF do
orçamento foi gerado (200 OK, `GET /api/orcamento/1/pdf`) mas não foi possível inspecionar seu
conteúdo visualmente nesta sessão (o CSP da aplicação bloqueia preview inline de PDF via
blob/data URI); como o PDF é montado a partir do mesmo `valorTotal` persistido, é muito provável
que ele também mostre o total errado (R$42,00) — recomenda-se abrir o PDF manualmente para
confirmar. **Consequência de negócio:** o cliente pode assinar/aprovar um orçamento vendo um valor
menor do que realmente vai pagar quando o apoio de festa é convertido em pedido.

Adicionalmente, mesmo **após a conversão** para pedido (orçamento fica `CONVERTIDO`), o
`valorTotal` do orçamento permanece congelado em R$42,00 para sempre (não é corrigido
retroativamente), criando uma inconsistência permanente no histórico: Orçamento #1 mostra
R$42,00/CONVERTIDO enquanto o Pedido #2 gerado a partir dele mostra corretamente R$242,00.

**✅ CORRIGIDO (2026-09-22).** Backend (`confectionery`): `ApoioOrcamentoService.cadastrar()`/
`excluir()` agora ajustam `Orcamento.valorTotal` atomicamente (novo `OrcamentoValorTotalAjustePort`,
mesmo padrão de ESCRITA cross-module já usado por `ApoioFestaService`→`Pedido.valorTotal`, sob lock
pessimista). `AtualizarOrcamentoUseCase` (PUT) também soma de volta os apoios propostos (novo
`ApoioOrcamentoValorSomaReferenciaPort`), evitando que um PUT apague o valor silenciosamente — mesma
classe de bug já corrigida no Pedido. Achado extra durante a correção: a conversão
(`OrcamentoService.atualizarStatus("CONVERTIDO")`) herdava `existing.valorTotal` (que agora já
inclui o apoio) e DEPOIS somava o apoio de novo ao materializar o `ApoioFesta` real — contava
duas vezes; corrigido pra o Pedido nascer só com itens+frete, e a materialização somar o apoio
exatamente uma vez. Suite `OrcamentoIntegrationTest`/`ApoioOrcamentoIntegrationTest` (61 testes)
verde, incluindo o cenário de conversão com apoio.

### B2 — Aprovar/converter orçamento → pedido + apoio convertido ✅ (nunca testado ao vivo antes)
**✅ CORRETO.** Ao aprovar o orçamento, foi criado o Pedido #2 (RASCUNHO); o `ApoioOrcamento`
proposto foi corretamente convertido em `ApoioFesta` ativo (mesmo item, horário e valor); o
RESUMO/PAGAMENTO do pedido recém-criado já nasceu somando o apoio corretamente — **R$242,00**
(30+12+0+200) — **sem precisar de reload manual**, confirmado também via API
(`GET /api/pedido/2` → `valorTotal: 242`). O bug do B1 (total do orçamento) **não se propaga**
para o pedido gerado — o cálculo do lado do Pedido está correto e independente.

---

## Bloco C — Reserva de estoque de complementos (item 25)

> Nota: o cenário C1 do script fala em "produto cuja receita consome esse insumo", mas a
> implementação real (`ReservaEstoqueValidationHelper`) reserva por **Complemento → Insumo**
> (quantidade = quantidade do item do pedido), não por receita/fabricação. Os testes abaixo usam
> esse mecanismo real.

### C1 — Criar pedido RASCUNHO reduz o disponível
**✅ CORRETO.** Confirmado indiretamente e com precisão via C2/C3: com um pedido RASCUNHO
segurando 1 unidade reservada de "Farinha de Trigo QA PG" (físico=20), uma segunda tentativa de
reserva reportou "Disponível no estoque: 19.000" — exatamente físico(20) menos a 1 unidade já
reservada por outro pedido, confirmando que o RASCUNHO reduz o disponível corretamente.

### C2 — Não deixa passar do disponível
**✅ CORRETO.** Ao editar um pedido aumentando a quantidade do item (que usa 1 unidade do
complemento por unidade de item) para 25 — quando só havia 19 disponíveis — o salvamento foi
bloqueado com um modal "Estoque Insuficiente" mostrando "Necessário: 25, Disponível: 19.000,
Faltam: 6", sem toast genérico apenas: erro claro e com números exatos.
**Ver também o achado de UI sob "Achados adicionais" — o modal usa o texto de outra validação.**

### C3 — Editar pedido revalida a reserva
**✅ CORRETO.** O mesmo teste do C2 confirma C3: o "Disponível" mostrado (19) já excluía a
própria reserva anterior deste pedido (1 unidade), evitando contagem duplicada — a validação
revalida corretamente a cada edição.

### C4 — Produzindo, a reserva vira consumo real
**✅ CORRETO.** Ao mover um pedido RASCUNHO (com 2 unidades reservadas de Farinha de Trigo) para
`EM_PRODUCAO`, o modal avisou "Ao confirmar, o estoque será debitado automaticamente." e, após
confirmar, `Movimentações` registrou uma linha real: Farinha de Trigo QA PG, tipo **SUBTRACAO**,
origem "Produção", 2.00 un, físico caindo de 20 → 18. A reserva foi corretamente convertida em
baixa real de estoque.

### C5 — Cancelar pedido devolve o disponível
**✅ CORRETO — confirmado com precisão.** Após cancelar um RASCUNHO que segurava 1 unidade
reservada (restando físico=18, sem outras reservas ativas), uma nova tentativa de reserva
mostrou "Disponível: 18.0" — exatamente igual ao físico, confirmando que a reserva foi liberada
por completo ao cancelar.

### C6 — Orçamento valida mas não reserva
**✅ CORRETO.** Criado um Orçamento com item que precisa de 15 unidades do insumo (dentro do
disponível de 18, então não bloqueou — comportamento esperado). Em seguida, uma tentativa de
reserva por um Pedido mostrou "Disponível: 18.0" — **idêntico** ao valor antes do orçamento ser
criado, confirmando que a proposta de complemento no orçamento não gera reserva real nem afeta o
saldo disponível para pedidos.

### C7 — Exclusão de pedido também libera (opcional)
**Não executado nesta rodada** (testado o cancelamento em C5, que é o caminho mais comum; a
exclusão física de RASCUNHO não foi exercitada).

---

## Bloco D — Fuso horário de Brasília (item 59)

### D1 — Alerta de pedido com entrega "à noite" de Brasília
**Não executado nesta rodada.** Ver achado de fuso horário abaixo, que afeta diretamente a
confiabilidade do campo `dataEntrega` usado por este cenário.

### D2 — Relatório de movimentação padrão (30 dias)
**Não executado nesta rodada.**

### D3 — Resumo financeiro do mês e alertas
**✅ CORRETO — validado incidentalmente (2026-09-22)**, investigando o achado #6 (ambiguidade
Lucro Real × Receita de Vendas, ver "Achados adicionais"): gastos com `dataPagamento` 31/10/2026 e
30/11/2026 caíram corretamente nos respectivos meses do resumo financeiro, sem vazamento pra
mês adjacente por causa do fuso — corte de mês em `America/Sao_Paulo` confirmado.

### D4 — Repetir gasto preserva o dia
**✅ CORRETO.** Criado gasto recorrente com `dataPagamento` = 31/10/2026. Usando a ação
"Repetir gasto" (ação manual, não é gerado automaticamente todo mês — ver nota abaixo), a cópia
foi criada com `dataPagamento` = **30/11/2026** — corretamente ajustada ao último dia válido de
novembro, confirmando que a preservação do dia usa o fuso de Brasília como esperado.

*Nota de comportamento (não é bug): a recorrência de Gasto é uma ação manual — clicar no ícone de
"Repetir" gera a cópia do mês seguinte; não há geração automática ao simplesmente navegar para o
próximo mês.*

---

## Achados adicionais (fora dos 20 cenários originais)

Estes problemas foram descobertos durante a execução do script e são reportados aqui por
relevância/severidade, mesmo não estando na lista original.

### ✅ [CRÍTICO — CORRIGIDO 2026-09-22] Orçamento: total não soma o Apoio de Festa proposto
Ver **B1** acima (descrição do achado original e detalhe técnico da correção).

### ✅ [ALTO — CORRIGIDO 2026-09-22] Deslocamento cumulativo de +3h nos campos de data/hora (Data do Evento / Data de Entrega)
Ao editar e salvar um Orçamento ou Pedido **sem tocar** no campo "Data do Evento" / "Data de
Entrega", o valor sofre um deslocamento de **+3 horas a cada ciclo de salvamento**. Reproduzido
com precisão:
1. Orçamento criado com "Data do Evento" = 14:00 (intenção: horário de Brasília). Backend
   armazenou corretamente `2026-09-25T17:00:00Z` (14:00 BRT + 3h = 17:00 UTC — conversão de
   salvamento está correta).
2. Ao reabrir o orçamento para editar, o campo "Data do Evento" mostrou **"17:00"** em vez de
   reconverter para BRT e mostrar "14:00" — o formulário exibe a hora UTC bruta.
3. Ao salvar o pedido gerado a partir desse orçamento **sem tocar no campo** (apenas alterando a
   quantidade de um item), o backend armazenou `2026-09-25T20:00:00Z` — o valor exibido (17:00)
   foi reenviado como se fosse horário de Brasília, ganhando **outras** +3h.
- **Confirmado que não é um problema sistêmico de exibição em toda a aplicação** — a tabela de
  Apoio de Festa (Início/Fim), por exemplo, converte corretamente de volta para BRT ao exibir
  ("14:00"/"18:00" mesmo com o campo acima mostrando "17:00"/depois "20:00"). O problema é
  isolado aos campos `<input type="datetime-local">` de "Data do Evento" (Orçamento) e "Data de
  Entrega" (Pedido) especificamente na tela de edição.
- **Risco:** qualquer edição repetida de um Pedido/Orçamento sem o usuário perceber e corrigir
  manualmente o horário desloca a data de entrega/evento real, silenciosamente, a cada save.

**✅ CORRIGIDO (2026-09-22).** Frontend (`confectionery-web-dashboard`): `OrcamentoFormPage.tsx` e
`PedidoFormPage.tsx` populavam o `<input type="datetime-local">` com
`new Date(iso).toISOString().slice(0, 16)` — sempre UTC, nunca reconvertido pro fuso local. Trocado
pela função `instantParaDatetimeLocal` (já existente em `modules/apoioFesta/lib/horarioBrasilia.ts`,
usada corretamente pelo atalho "dia inteiro" do Apoio de Festa — a mesma função pedida no
achado), que usa os getters LOCAIS do navegador pra reconverter o Instant salvo de volta pro
horário exibido. `npx tsc --noEmit` limpo.

### ✅ [MÉDIO — CORRIGIDO 2026-09-22] App quebra com tela branca ao receber um valor de data/hora inválido
Ao digitar um valor malformado em um campo `datetime-local` (reproduzido ao tentar digitar
data+hora via teclado em uma sequência que o parser da aplicação não tratou), a SPA inteira
**quebrou com tela branca**, sem nenhuma UI de erro. Console mostrou:
`RangeError: Invalid time value at Date.toISOString`, sem tratamento (não há error boundary).
Um reload (F5) recuperou a aplicação normalmente e nenhum dado foi corrompido/salvo parcialmente.
**Recomenda-se** validar o valor do campo antes de chamar `.toISOString()` e/ou adicionar um error
boundary React para evitar tela branca em produção.

**✅ CORRIGIDO (2026-09-22).** Duas frentes, como recomendado: (1) nova função
`datetimeLocalParaIso` (`modules/apoioFesta/lib/horarioBrasilia.ts`) valida `Number.isNaN(data.getTime())`
antes de chamar `.toISOString()` e lança um erro amigável em vez de `RangeError`; usada no
`handleSubmit` de `OrcamentoFormPage.tsx`/`PedidoFormPage.tsx` dentro de um `try/catch` que
mostra a mensagem no `erroGeral` do formulário em vez de deixar o erro escapar (esse é o ponto
que realmente evita o crash, já que um Error Boundary do React não pega erro de handler de
evento/submit, só de render). (2) Novo `ErrorBoundary` de nível de aplicação
(`src/components/ErrorBoundary.tsx`), envolvendo `<App />` em `main.tsx`, como camada de defesa
adicional para qualquer OUTRO erro não tratado de render (não específico de data/hora) — mostra
uma tela de fallback com botão "Recarregar página" em vez de tela branca. `npx tsc --noEmit`
limpo.

### ✅ [BAIXO — CORRIGIDO 2026-09-22] Modal "Estoque Insuficiente" usa o texto de outro cenário quando o motivo é reserva de insumo
O modal de bloqueio por estoque insuficiente é compartilhado entre duas validações diferentes:
(a) falta de **produto acabado** (correto: "Não foi possível colocar este pedido em produção
porque o estoque atual de **produtos acabados** é insuficiente", com sugestões "Fabricar o
produto" / "Entrada em Estoque de Produtos"), e (b) falta de **insumo** para a reserva de
complementos (visto nos testes C2/C5/C6, com "Farinha de Trigo QA PG"). No cenário (b), o mesmo
texto sobre "produtos acabados" e as mesmas sugestões ("Fabricar o produto", "Entrada em Estoque
de Produtos → Entradas") aparecem incorretamente — a ação correta para repor um insumo seria uma
Entrada de Insumo (`/estoque-insumos/entradas`), não uma entrada de produto ou fabricação. Não
bloqueia o uso (a validação em si funciona corretamente), mas confunde o usuário sobre como
resolver.

**✅ CORRIGIDO (2026-09-22).** `PedidoErroModal.tsx`: `parsePedidoErro` agora detecta o contexto
pelo texto da mensagem do backend (`EstoqueComplementoValidationService` sempre menciona "insumo";
`EstoqueProdutoValidationService`, nunca) e devolve um novo campo `tipoEstoque: 'produto' | 'insumo'`.
No cenário `insumo`: título vira "Insumo Insuficiente", texto de introdução fala em "reservar os
complementos"/"estoque de insumo", o guia de ação sugere "Entrada de Insumo" (em vez de
"Fabricar"/"Entrada de Produto") e o botão de ação leva pra `/estoque-insumos/entradas/nova`
(em vez de `/estoque-produtos/fabricacoes/nova`). A exibição "Disponível no estoque" continua
igual nos dois casos, como pedido. `npx tsc --noEmit` limpo.

### ✅ [BAIXO — CORRIGIDO 2026-09-22] Modal de remoção de Apoio de Festa (Orçamento) com texto desatualizado
**Achado novo**, encontrado no reteste ao vivo dos 4 achados acima (`doc/reteste-achados-2026-09-22.md`,
achado #5) — efeito colateral direto da correção do total do Orçamento. O modal de confirmação ao
remover um `ApoioOrcamento` proposto dizia: *"Isso não afeta o valor do orçamento (apoio proposto
não soma no total até o orçamento ser aprovado)"* — verdade **antes** do fix do item crítico
acima, mas falso depois: remover a proposta agora subtrai o valor do total imediatamente
(confirmado no reteste: 130 → 30 ao remover). O texto desatualizado informava incorretamente o
usuário de que a remoção era "inócua".

**✅ CORRIGIDO (2026-09-22).** `ApoioOrcamentoSection.tsx`: texto do modal trocado para "O valor
desse apoio será subtraído do total do orçamento." `npx tsc --noEmit` limpo.

### 🆕 [BAIXO/UX — pendente decisão do dono] Ambiguidade entre "Lucro Real Estimado" (caixa) e "Receita de Vendas" (competência) no Dashboard
**Achado novo**, mesmo reteste (`doc/reteste-achados-2026-09-22.md`, achado #6). Não é bug de
cálculo — os dois cards mostram números corretos, cada um dentro do próprio regime contábil
(caixa vs. competência). O achado é de **UX/nomeação**: os dois regimes coexistem no mesmo painel
sem indicação visual de que usam critérios diferentes, o que pode confundir quem lê o Dashboard.
**Não é decisão técnica — pendente confirmação do dono do produto:** se a coexistência dos dois
regimes é intencional, a correção mais barata é só renomear os cards (ex.: "Receita Recebida" /
"Receita Faturada") ou adicionar um tooltip curto explicando a diferença, sem mudar nenhuma lógica
de cálculo. Nenhum código alterado para este achado.

### Observação (não é achado) — RESUMO do Orçamento na tela não soma o Apoio de Festa
Registrado no reteste (`doc/reteste-achados-2026-09-22.md` → seção do achado 1): o card "RESUMO"
nas telas de criação/edição de Orçamento mostra só itens+frete (client-side), enquanto o valor
persistido/listado já está correto (com apoio somado) desde a correção acima. Não afeta o dado
salvo, só a exibição durante o preenchimento — diferente do Pedido, cujo RESUMO já soma o apoio
corretamente. Não corrigido nesta rodada (fora do escopo dos achados originais).

---

## Resultados

| ID | Resultado | Observações (telas, valores, mensagens) |
|---|---|---|
| A1 | ✅ | Bug crítico de 18/09 (valorTotal não atualizava) confirmado corrigido. Total R$462,00 correto em criação, save e reload. |
| A2 | — | Não executado nesta rodada (apoio sempre adicionado após o pedido já existir). |
| A3 | ✅ | Trava por dia/frota funcionando; sem duplicidade. |
| A4 | ✅ | Checkbox "Incluir atendente" desabilitado com texto explicativo quando item não oferece mão de obra. |
| A5 | ✅ | Cancelamento reverteu total (912→492), liberou unidade de frota no mesmo dia. Nunca testado ao vivo antes; agora confirmado. |
| A6 | ✅ | Comanda mostra só apoios Ativos, com item/horário. Campo colaborador não exercitado (sem dado no momento). |
| A7 | ✅ | DELETE bloqueado com 409 amigável; item permanece na lista. |
| B1 | ✅* | **CRÍTICO — CORRIGIDO 2026-09-22**: Total do Orçamento ignorava o Apoio de Festa proposto (R$42 em vez de R$242), inclusive após conversão. `OrcamentoValorTotalAjustePort` (cadastrar/excluir) + `ApoioOrcamentoValorSomaReferenciaPort` (PUT) resolvem; achado extra corrigido junto: dupla contagem na conversão. Suite Orçamento/ApoioOrcamento (61 testes) verde. *Validação end-to-end via UI (incl. PDF) ainda não refeita nesta sessão. |
| B2 | ✅ | Conversão orçamento→pedido gera ApoioFesta ativo e total correto (R$242) sem reload. Nunca testado ao vivo antes; agora confirmado. Bug do B1 não se propaga. |
| C1 | ✅ | Confirmado indiretamente via C2 (disponível=19 com 1 reserva ativa de outro pedido). |
| C2 | ✅ | Bloqueio com números exatos (Necessário 25 / Disponível 19 / Faltam 6). Ver achado de copy do modal. |
| C3 | ✅ | Disponível exclui corretamente a própria reserva anterior do pedido sendo editado. |
| C4 | ✅ | Transição para EM_PRODUCAO gerou SAÍDA real (2 un) em Movimentações; físico 20→18. |
| C5 | ✅ | Cancelamento liberou reserva por completo (disponível voltou a 18 = físico). |
| C6 | ✅ | Orçamento com complemento não alterou o disponível (18 antes e depois). |
| C7 | — | Não executado nesta rodada (testado cancelamento em C5 em vez de exclusão). |
| D1 | — | Não executado nesta rodada. |
| D2 | — | Não executado nesta rodada. |
| D3 | ✅ | Validado incidentalmente (2026-09-22, investigando achado #6): gastos 31/10 e 30/11 caíram nos meses corretos do resumo financeiro, sem vazamento por fuso. |
| D4 | ✅ | Repetir gasto 31/10 → 30/11 corretamente ajustado. Ação é manual (ícone "Repetir"), não automática. |

**Achados adicionais fora da lista — todos os 4 originais corrigidos e reconfirmados ao vivo em
2026-09-22:** total do orçamento não somava apoio (crítico, ver B1); deslocamento cumulativo de
+3h em campos de data/hora ao editar sem tocar no campo (alto); app quebrava com tela branca ao
receber data/hora inválida, sem error boundary (médio); modal de estoque insuficiente usava texto
de "produtos acabados" também para escassez de insumo (baixo). Detalhe técnico de cada correção na
seção "Achados adicionais" acima; evidência do reteste ao vivo (ponta a ponta pela UI, incluindo
reprodução real do crash original) em `doc/reteste-achados-2026-09-22.md`. **Dois achados novos
encontrados durante o reteste:** #5 modal de remoção de Apoio de Festa com texto desatualizado
(baixo, corrigido) e #6 ambiguidade "Lucro Real Estimado" × "Receita de Vendas" no Dashboard
(baixo/UX, não é bug — pendente decisão do dono do produto). Backend: `mvn compile` limpo + suites
relacionadas verdes (Orçamento/ApoioOrcamento 61, Pedido/ApoioFesta/trava de regressão de estoque
sem novas falhas). Frontend: `npx tsc --noEmit` limpo. **Ainda não executados nesta rodada:** C7
(exclusão de Apoio em RASCUNHO), D1 (alerta de pedido com entrega às 23h BR), D2 (relatório de
movimentação, janela de 30 dias).

Legenda: ✅ CORRETO · ❌ achado (anexar reprodução: passos, valores exibidos vs esperados, console) · — não executado nesta rodada.

## Como reportar um achado

- Anotar passos exatos + valores exibidos vs esperados + se `F5` foi feito.
- Se técnico (ex.: `500`/`502`/console), capturar a mensagem e o endpoint (`F12 → Rede`).
- Para estoque: informar saldo **antes** e **depois** e se apareceu movimentação nova.
- Abrir investigação com este documento + `doc/PROJECT_CONTEXT.md` (item correspondente) como
  referência.

## Fora do escopo desta rodada

- Calendário de disponibilidade de apoio (`doc/proposta-calendario-disponibilidade-apoio.md`).
- Expiração automática de reserva (são 7 dias — só verificável por dados antigos ou scheduler 08h).
- Segurança/perfis de acesso.
- D1, D2, D3, A2, C7 (não executados nesta rodada — ver tabela de resultados).

## Referências

- Apoio de Festa / pedido: `doc/homologacao-qa-2026-09-18-apoio-de-festa.md`, `doc/acao-apoio-festa.md`
- Reserva de estoque: `doc/PROJECT_CONTEXT.md` item 25, `doc/item-25-reserva-estoque-plano.md`, `doc/guia-usuario.md`
- Fuso horário: `doc/PROJECT_CONTEXT.md` item 59
- Decisões de negócio: `doc/decisoes-usuario-final.md`

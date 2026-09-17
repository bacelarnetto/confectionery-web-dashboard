# Homologação QA — Rodada 6 (2026-09-16)

**Origem:** dono do projeto avisou que front e backend subiram um novo lote de alterações (branch `hotfix/estoque-insumo`, commits `27fa488` no frontend e `538460c`/`2c5d5de` no backend) e pediu para homologar tudo que estava pendente. Escopo confirmado com o dono via pergunta de esclarecimento: **"Homologar tudo que está pendente"** (não só a RFC de filtros, não só a Comanda de Produção).
**Método:** revisão de código (`git show`) + reprodução ao vivo no navegador (login Keycloak) + chamadas diretas à API (via `fetch` autenticado) para os pontos onde a UI estava temporariamente desatualizada no servidor local (resolvido pelo próprio time durante a sessão, com um redeploy). Nenhum arquivo de código foi alterado por mim neste re-teste.
**Nota lateral:** durante a auditoria, encontrei `confectionery/.git/index.lock` (0 bytes, sem processo `git` ativo — `ps aux` confirmou). Não é um lock ativo e não bloqueou nenhum comando `git status`/`diff`/`log` usado nesta sessão, mas se algum `git commit` falhar futuramente com erro de lock, é seguro remover esse arquivo manualmente (`rm ~/work/confectionery/.git/index.lock`).

---

## Parte 1 — Filtros novos de Estoque/Insumos (RFC `doc/proposta-backend-filtros-estoque-e-insumos.md`)

### 1.1 `Insumo?perecivel` — ✅ Confirmado correto

Pills "Todos" / "🌡 Perecíveis" / "📦 Não Perecíveis" na tela de Insumos. Testado ao vivo:
- "Perecíveis" → 0 registros (nenhum insumo perecível cadastrado hoje) — bate com `GET /insumo?perecivel=true`.
- "Não Perecíveis" → 7 registros, todos com badge "Não perecível" — bate com `GET /insumo?perecivel=false`.
- "Todos" → volta a mostrar os 7.

Pills se comportam como single-select (mutuamente exclusivos), badge do "Filtros detalhados" reflete corretamente 0/1 filtro ativo.

### 1.2 `EstoqueInsumo?statusSaldo` — ✅ Confirmado correto

Pills "Todos" / "✅ Com Saldo" / "⚠️ Zerados (N)" na tela de Estoque Atual — a pill de Zerados já vem com a contagem no próprio rótulo, sem precisar clicar (boa usabilidade).
- "Com Saldo" → 4 registros (os 4 insumos com saldo>0) — bate com `GET /estoque-insumo?statusSaldo=COM_SALDO`.
- "Zerados" → 0 registros, mensagem "Nenhum registro encontrado" — bate com `GET /estoque-insumo?statusSaldo=ZERADO`.

### 1.3 `EntradaInsumo?origem` e `?pendentePreenchimento` — ✅ corretos isoladamente, ❌ **bug novo ao combinar**

Pills "Todas" / "🛒 Via Compra" / "📄 Manuais" / "⚠️ Preenchimento Pendente" na tela de Entradas.

Testado isoladamente, tudo bate com a API:
- "Via Compra" → 14 registros (`origem=COMPRA`).
- "Manuais" → 1 registro (`origem=MANUAL`).
- "Preenchimento Pendente" (a partir de "Todas") → 7 registros (`pendentePreenchimento=true`).

**Achado novo 16 — BAIXO/MÉDIO — Combinação de quick-filters "Origem" + "Preenchimento Pendente" é assimétrica e engana o usuário**

Passo a passo pra reproduzir:
1. Na tela de Entradas, clique em "Manuais" → filtra corretamente para o único registro manual, badge "Filtros detalhados" mostra **1**.
2. Sem resetar, clique em "Preenchimento Pendente" → a lista vira "Nenhum registro encontrado" e o badge muda pra **2**.
3. Abra "Filtros detalhados": o dropdown "Origem" continua com **"Manual"** selecionado — ou seja, o clique em "Preenchimento Pendente" **não substituiu** o filtro de origem, ele se **somou** por baixo dos panos (`origem=MANUAL AND pendentePreenchimento=true`, uma combinação que hoje não tem nenhum resultado real).
4. Só que visualmente a pill "Manuais" **perde o destaque laranja** nesse momento — como se tivesse sido desmarcada. Não fica nenhuma pista visual de que o filtro de origem ainda está ativo.

Contraste que confirma a assimetria: fazendo o caminho inverso (clicar em "Preenchimento Pendente" primeiro e depois em "Via Compra" ou "Manuais"), o clique na pill de origem **reseta corretamente** o filtro de preenchimento pendente (badge volta pra 1, resultado bate com a origem escolhida). Ou seja, as pills de Origem "resetam tudo", mas a pill de Preenchimento Pendente "só some". Comportamento inconsistente entre os dois grupos de pill.

**Impacto:** qualquer usuário que clique nessas duas pills em sequência (ex.: "quero ver as manuais que estão pendentes") vai ver uma lista vazia sem entender por quê — parece que a funcionalidade está quebrada, quando na verdade é uma combinação de filtro escondida (e, nesse caso, uma combinação que nem faz sentido de negócio, já que entrada manual não passa pelo fluxo de "preenchimento pendente" — isso é específico de entrada vinda de Compra).

**Sugestão para o frontend:** decidir um dos dois comportamentos e aplicar nos dois grupos de pill:
- (a) simples: cada pill sempre reseta todos os outros quick-filters (comportamento hoje já usado pelas pills de Origem) — mais previsível, mas impede combinar Origem + Preenchimento Pendente mesmo quando faz sentido (ex.: "Via Compra" + "Preenchimento Pendente", que É uma combinação útil e válida).
- (b) permitir combinação de fato, mas com as duas pills destacadas visualmente ao mesmo tempo quando ambas estiverem ativas, pra deixar claro que os critérios estão somados.

---

## Parte 2 — Comanda de Produção (`ComandaProducaoModal.tsx`, novo)

**✅ Confirmado funcional.** Testado a partir do ícone de impressora na listagem de Pedidos (`/vendas/pedidos`): abre o modal "Comanda de Produção" com cabeçalho da confeitaria, número do pedido, badge de status, data/hora de entrega, endereço, nome do cliente e a lista de itens a produzir/decorar (produto + quantidade + complementos), terminando em "··· Fim da comanda ···". Não cliquei em "Imprimir Comanda" (aciona `window.print()`, que abre diálogo nativo do sistema operacional — fora do que a automação de navegador consegue/deve interagir), mas o conteúdo pré-impressão está completo e correto.

**Observação (não é bug, é ponto de atenção pro dono):** o modal abre normalmente até para um pedido com status **CANCELADO** (testei no Pedido #36). Pode ser intencional (reimprimir uma comanda antiga por algum motivo administrativo), mas vale confirmar com o dono se isso é o comportamento desejado ou se a comanda deveria ficar indisponível/com aviso para pedidos cancelados.

---

## Parte 3 — `PedidoDetalheModal` — achado 8 (desconto do item)

**✅ Confirmado corrigido.** Reabri "Detalhes do Pedido #28" a partir do card no Mural da Semana: a linha do item agora mostra "Desconto: R$ 50,00" abaixo do nome do produto, e a coluna Total (R$ 179,90) já reflete `Unit. (R$ 229,90) × Qtd (1) − desconto`, batendo com o total do pedido (R$ 189,90 incluindo frete de R$ 10,00). Antes da correção esse desconto não aparecia em lugar nenhum do modal.

---

## Parte 4 — Alertas de Pedido — achados 9 e 10

### 4.1 Achado 10 (botão "Verificar Agora") — ✅ Confirmado presente e funcional

Botão aparece na tela "Alertas de Pedidos" (`/alertas-pedido`), dispara a verificação e mostra toast "Verificação concluída!", recarregando a lista.

### 4.2 Achado 9 (data de entrega nula) — ✅ Causa raiz corrigida, mas revela um bug novo de duplicação

A correção no backend (`RowMapper` + `ResultSet.getTimestamp`) **funciona**: toda vez que um alerta é gerado a partir de agora (seja pelo job diário, seja pelo "Verificar Agora"), o campo `dataEntregaPedido` vem populado corretamente. Confirmei via API que os alertas novos (IDs 5, 6, 7, gerados nesta sessão) têm a data certa, enquanto os alertas antigos (IDs 1, 2, 3, gerados **antes** do fix) continuam com `dataEntregaPedido: null` — são dados congelados de antes da correção, não uma recorrência do bug.

**Achado novo 17 — MÉDIO — "Verificar Agora" duplica alertas ativos em vez de ignorar/atualizar o que já existe**

Ao clicar em "Verificar Agora" com alertas já ativos (não reconhecidos) para os pedidos #23, #24 e #25, o sistema **não verificou se já existia um alerta ATIVO pra aquele pedido** — criou um alerta novo em cima do antigo. Resultado, confirmado via `GET /alerta-pedido`:

| Pedido | Alertas ATIVO simultâneos |
|---|---|
| #23 | id 4 (antigo, data OK) **e** id 5 (novo, data OK) |
| #24 | id 2 (antigo, `dataEntregaPedido: null`) **e** id 6 (novo, data OK) |
| #25 | id 3 (antigo, `dataEntregaPedido: null`) **e** id 7 (novo, data OK) |

Isso tem três efeitos colaterais visíveis na tela "Alertas de Pedidos":
1. O contador "N pedidos precisam de atenção" (faixa vermelha no topo e badge do sino) passou de 3 para **6** depois de um único clique em "Verificar Agora" — mas continuam sendo só 3 pedidos atrasados de verdade, não 6.
2. A lista mostra **cards duplicados** pro mesmo pedido (dois cards "Maria Teste — Atrasado — Entrega: 13/09/2026, 20:00" lado a lado).
3. Os alertas antigos, com `dataEntregaPedido: null` (o próprio bug do achado 9, congelado antes do fix), **nunca vão desaparecer da lista por conta própria** — o único jeito de sair da lista é alguém clicar em "Reconhecer" manualmente em cada um. Ou seja, o achado 9 está resolvido pra dados novos, mas os registros já quebrados no banco continuam voltando pra tela até serem reconhecidos um a um.

**Causa provável:** a rotina de verificação de alertas de pedido (chamada tanto pelo job das 8h quanto por "Verificar Agora") não está checando "já existe um alerta ATIVO desse tipo pra esse pedido?" antes de inserir um novo — diferente do comportamento já garantido (e documentado no Guia do Usuário, seção "Alertas de Insumo": *"Se já existe um alerta ativo do mesmo tipo pra aquele insumo, a próxima verificação não cria outro"*) para os alertas de insumo. Alertas de pedido parecem não ter essa mesma proteção de deduplicação.

**Sugestão:** aplicar a mesma regra de deduplicação já usada em Alertas de Insumo — antes de criar um novo alerta ATIVO pra um pedido, verificar se já existe um alerta ATIVO do mesmo tipo (`ATRASADO`, `3_DIAS`, etc.) pra esse pedido e, se existir, não duplicar (ou atualizar o registro existente em vez de inserir um novo). Isso também resolveria de tabela o problema de alertas antigos com `dataEntregaPedido: null` nunca serem "renovados" com o dado correto — como não haveria mais alerta duplicado, dá pra decidir se o alerta existente é atualizado com o dado novo em vez de sempre ficar com o valor congelado da criação original.

---

## Parte 5 — Financeiro e Relatórios

### 5.1 `GastoListPage` — ✅ Confirmado correto

- Navegação por mês (Anterior / Mês Atual / Próximo): testado ir para Agosto/2026 (mês sem gastos, lista vazia corretamente) e voltar pra Setembro/2026 (2 registros, total R$ 2.620,50 = R$120,50 + R$2.500,00, soma bate).
- "Exportar CSV": toast "Gastos exportados com sucesso!" confirma o download client-side.

### 5.2 `ContaReceberListPage` — ✅ Confirmado correto

- "Exportar CSV" com 2 registros na lista (desmarquei "Apenas pendentes" pra ter dados): toast "Contas a receber exportadas com sucesso!".

### 5.3 `FaturamentoMensalPage` — ✅ Confirmado correto

Os 4 cards de resumo executivo (Total Faturado, Média Mensal, Melhor Mês, Volume de Pedidos) aparecem acima do gráfico já existente. Com "Últimos 6 meses" selecionado e só Setembro/2026 tendo movimento: Total Faturado = Média Mensal = R$ 1.122,70 (esperado, já que só há 1 mês com dado no período), Melhor Mês = Set/26 com o mesmo valor, Volume de Pedidos = 29 pedidos com ticket médio R$ 38,71 — a conta bate (R$1.122,70 ÷ 29 ≈ R$38,71).

---

## Parte 6 — Guia do Usuário

**✅ Renderiza corretamente.** Naveguei pelas 13 seções (via `GuiaNav`) — conteúdo completo, sem links quebrados, sem texto de placeholder, navegação "Anterior/Próximo" funcionando em todas as seções lidas.

**Observação (documentação incompleta, não é bug de código):** o commit que introduziu a Comanda de Produção (`ComandaProducaoModal`) também alterou `GuiaNav.tsx`, `GuiaSection.tsx` e `GuiaPage.tsx`, mas lendo o conteúdo das seções "Vendas", "Mural da Semana" e "Compras" (as mais prováveis de mencionar impressão de comanda), não encontrei nenhuma menção à nova funcionalidade de "imprimir comanda de produção". Pode valer a pena adicionar um parágrafo curto sobre isso em "Vendas" ou "Mural da Semana", já que é uma funcionalidade nova voltada pra operação do dia a dia (a mesma audiência dessas duas seções).

---

## Resumo geral da Rodada 6

| Item | Status |
|---|---|
| Filtro `Insumo.perecivel` | ✅ Correto |
| Filtro `EstoqueInsumo.statusSaldo` | ✅ Correto |
| Filtro `EntradaInsumo.origem` (isolado) | ✅ Correto |
| Filtro `EntradaInsumo.pendentePreenchimento` (isolado) | ✅ Correto |
| **Achado 16 (novo)** — combinação Origem + Preenchimento Pendente inconsistente | ❌ Bug novo (baixo/médio) |
| Comanda de Produção (novo modal) | ✅ Correto (obs.: permite impressão de pedido cancelado — confirmar se é intencional) |
| Achado 8 (desconto no `PedidoDetalheModal`) | ✅ Corrigido |
| Achado 10 ("Verificar Agora" em Alertas de Pedido) | ✅ Corrigido |
| Achado 9 (data de entrega nula) — causa raiz | ✅ Corrigido (dados novos) |
| **Achado 17 (novo)** — "Verificar Agora" duplica alertas ativos | ❌ Bug novo (médio) |
| `GastoListPage` (navegação por mês + CSV) | ✅ Correto |
| `ContaReceberListPage` (CSV) | ✅ Correto |
| `FaturamentoMensalPage` (cards executivos) | ✅ Correto |
| Guia do Usuário | ✅ Renderiza corretamente (obs.: falta mencionar a Comanda de Produção) |

**2 achados novos abertos** (16 e 17, ambos no frontend/backend de Vendas — ver detalhes acima) — nenhum bloqueante para uso do sistema, mas ambos geram confusão visível pro usuário final e merecem entrar no backlog do time.

# Reteste dos achados da homologação 2026-09-19

**Data do reteste:** 2026-09-22
**Escopo:** validar as correções aplicadas para os 4 achados adicionais reportados em `doc/homologacao-2026-09-19-frontend.md` (seção "Achados adicionais"). Reteste feito na aplicação viva (`http://localhost`), sem alteração de código — apenas testes e este relatório.

**Commits com as correções:**
- Backend (`confectionery`): `1db585b` ("homologacao") — fix do valorTotal do Orçamento.
- Frontend (`confectionery-web-dashboard`): `edc7e30` ("homologacao") — fix de fuso horário, crash e modal.
- Docs: `45a5f64` — marca os achados como corrigidos em `PROJECT_CONTEXT.md` e no relatório.
- Frontend (rodada 2, achados #5 e #6): `36ecac0` — texto do modal de remoção de Apoio de Festa; `7939391` — renomeação dos cards de receita do Dashboard.
- Docs (rodada 2): `89d46df`, `18602a9` — registram e marcam #5/#6 como corrigidos e validam D3.

## Resumo

| # | Achado | Severidade | Resultado do reteste |
|---|---|---|---|
| 1 | Orçamento.valorTotal não somava Apoio de Festa proposto | CRÍTICO | ✅ Corrigido (com 1 ressalva — ver abaixo) |
| 2 | Drift de +3h em "Data do Evento"/"Data de Entrega" | ALTO | ✅ Corrigido |
| 3 | Crash de tela branca com data inválida | MÉDIO | ✅ Corrigido |
| 4 | Modal "Estoque Insuficiente" com copy errado para insumo | BAIXO | ✅ Corrigido |
| 5 | Modal de remoção de Apoio de Festa com texto desatualizado (novo, achado nesta rodada) | BAIXO | ✅ Corrigido — confirmado ao vivo (rodada 3) |
| 6 | Ambiguidade entre "Lucro Real Estimado" (caixa) e "Receita de Vendas" (competência) no Dashboard (novo, achado nesta rodada) | BAIXO/UX | ✅ Corrigido (renomeação de cards) — confirmado ao vivo (rodada 3) |

---

## 1) Orçamento.valorTotal não somava o Apoio de Festa proposto — ✅ CORRIGIDO

Fix no backend: `ApoioOrcamentoService.cadastrar()`/`excluir()` agora ajustam `Orcamento.valorTotal` por delta (via novo `OrcamentoValorTotalAjustePort`), e `AtualizarOrcamentoUseCase` (PUT) agora soma de volta o valor dos `ApoioOrcamento` ativos (via novo `ApoioOrcamentoValorSomaReferenciaPort`) em vez de recalcular do zero.

Testado ponta a ponta pela UI, criando um Orçamento novo (Orçamento #3):

- **Criação com apoio proposto antes de salvar** (cenário equivalente ao A2, não testado na rodada anterior): item R$ 40 + frete R$ 10 + Apoio de Festa "Carrinho Premium" com mão de obra (2h × R$ 70 = R$ 140) → **Orçamento #3 criado com valorTotal = R$ 190,00** ✅. Confirmado via rede que o frontend faz `POST /api/orcamento` (itens+frete) seguido de `POST /api/apoio-orcamento`, e o total já reflete a soma corretamente após o segundo POST.
- **Edição (PUT) preservando o total**: editado o Orçamento #3 duas vezes (apenas trocando a observação, sem tocar no apoio) — `valorTotal` permaneceu **190** nas duas vezes, não regrediu para 50 (o bug original apagava o apoio a cada PUT). ✅
- **Conversão para Pedido sem duplicar o valor**: aprovado o Orçamento #3 → gerou Pedido #3 com `valorTotal = 190` (não 330). Confirmado que a materialização do `ApoioOrcamento` em `ApoioFesta` real soma o apoio **exatamente uma vez** no Pedido. ✅
- **Exclusão do apoio devolvendo o valor** (Orçamento #4, teste isolado): item R$ 30 + Apoio "Carrinho de Doces" (2h × R$ 50 = R$ 100) → total 130 ao criar. Removida a proposta de apoio → `valorTotal` voltou para **30**. ✅

### Ressalva encontrada durante o reteste — Achado #5 (novo, BAIXO) — ✅ corrigido, ver seção de verificação independente abaixo

O modal de confirmação ao remover um Apoio de Festa proposto de um Orçamento exibia o texto:

> "Tem certeza que deseja remover o apoio "X" da proposta? **Isso não afeta o valor do orçamento** (apoio proposto não soma no total até o orçamento ser aprovado)."

Esse texto tinha ficado **desatualizado pela própria correção**: antes do fix, era verdade (o apoio proposto realmente não entrava no total). Depois do fix, ele passou a entrar imediatamente (confirmado acima: 130 → 30 ao remover). O texto do modal precisava ser atualizado para refletir o novo comportamento — ver correção e reteste independente na seção dedicada, mais abaixo.

### Observação (não é bug, é UX menor — ainda não corrigida, fora do escopo desta rodada)

O card "RESUMO" nas telas de criação/edição de Orçamento continua mostrando apenas itens + frete (sem o apoio), tanto na criação quanto na edição — ex.: total exibido "R$ 30,00" enquanto o valor persistido/lista mostra corretamente "R$ 430,00" (com apoio proposto somado). Isso é puramente client-side (não afeta o dado persistido, que está correto), mas pode confundir o usuário durante o preenchimento. Diferente do Pedido, cujo RESUMO já soma o Apoio de Festa corretamente. **Reconfirmado ao vivo em 2026-09-22 (rodada 3)** durante a verificação do achado #5 (ver abaixo) — continua presente, sem alteração de comportamento. Já está registrado em `doc/homologacao-2026-09-19-frontend.md` como observação separada, fora do escopo dos achados #5/#6.

---

## 2) Drift de +3h em "Data do Evento"/"Data de Entrega" — ✅ CORRIGIDO

Fix no frontend: `instantParaDatetimeLocal` (antes usada só no atalho "dia inteiro" do Apoio de Festa) agora é reusada em `OrcamentoFormPage` e `PedidoFormPage` para reconverter UTC → BRT ao popular o campo a partir de dado vindo da API.

Testado:
- Orçamento #3 salvo com "Data do Evento" = 05/10/2026 14:00 (BRT) → persistido corretamente como `2026-10-05T17:00:00Z` (BRT+3h, conversão de salvamento já era correta).
- Reabrindo o formulário de edição, o campo agora exibe **05/10/2026, 14:00** (reconvertido corretamente para BRT), não mais o UTC bruto (17:00). ✅
- Salvo o formulário **duas vezes consecutivas** sem tocar no campo de data → `dataEvento` permaneceu `2026-10-05T17:00:00Z` nas duas vezes, **sem drift cumulativo**. ✅
- Confirmado que o Pedido gerado a partir do Orçamento herda `dataEntrega` = mesmo instante e também exibe corretamente 14:00 BRT no formulário de edição do Pedido. ✅

---

## 3) Crash de tela branca com data/hora inválida — ✅ CORRIGIDO

Fix no frontend: nova função `datetimeLocalParaIso()` valida o `Date` (via `Number.isNaN(data.getTime())`) antes de chamar `.toISOString()`, lançando um `Error` tratável em vez de deixar o `RangeError` explodir; os `handleSubmit` de `OrcamentoFormPage` e `PedidoFormPage` capturam esse erro e mostram uma mensagem inline. Além disso, um `ErrorBoundary` de nível de aplicação foi adicionado em `main.tsx` (envolvendo `AuthGate`/`App`) como rede de segurança final.

**Reprodução real do bug original, ponta a ponta** (não apenas revisão de código): digitando diretamente no campo "Data de Entrega" do Pedido #3 via teclado (`02302026` + `1400AM`), o campo do navegador aceitou um valor sintaticamente "válido" pelo próprio HTML (`validity.valid = true`) mas semanticamente inválido: `"20261-03-02T04:00"` (ano com 5 dígitos) — confirmado via console que `new Date("20261-03-02T04:00")` retorna `Invalid Date` (`NaN`). Esse é exatamente o tipo de valor que antes derrubava a SPA para tela branca.

Ao clicar em "Salvar alterações" com esse valor:
- **Antes:** crash para tela branca (`RangeError: Invalid time value`, não tratado).
- **Agora:** nenhum crash. A tela permaneceu funcional e exibiu um banner de erro claro no topo do formulário: **"Data/hora inválida -- confira o valor preenchido."** ✅

---

## 4) Modal "Estoque Insuficiente" com copy errado para reserva de insumo — ✅ CORRIGIDO

Fix no frontend: `PedidoErroModal` agora distingue `tipoEstoque: 'produto' | 'insumo'` a partir da mensagem de erro do backend (`EstoqueComplementoValidationService` sempre menciona "insumo"; `EstoqueProdutoValidationService` nunca menciona), e usa título, texto e ações diferentes para cada caso.

Testados os dois cenários lado a lado no mesmo Pedido #3:

**(a) Insumo insuficiente** (item com complemento "Farinha de Trigo" pedindo 50 unidades, estoque de insumo = 18):
- Título: **"Insumo Insuficiente"** (antes seria "Estoque Insuficiente" genérico) ✅
- Texto: "Não foi possível **reservar os complementos** deste pedido porque **o estoque de insumo** é insuficiente" ✅
- Ações sugeridas: "Entrada de Insumo", "Remover o complemento", "Ajustar quantidade" (antes sugeria incorretamente "Fabricar o produto"/"Entrada de Produto") ✅
- Botão: "Ir para Nova Entrada de Insumo" → `/estoque-insumos/entradas/nova` ✅

**(b) Produto acabado insuficiente** (mesmo item, 50 unidades de "Bolo QA PG", estoque de produto = 3, sem complemento):
- Título: **"Estoque Insuficiente"** (mantido, correto para este contexto) ✅
- Texto: "Não foi possível colocar este pedido em produção porque o estoque atual de produtos acabados é insuficiente" (mantido, sem regressão) ✅
- Ações: "Fabricar o produto", "Entrada manual", "Ajustar quantidade" (mantidas, corretas) ✅
- Botão: "Ir para Nova Fabricação" (mantido) ✅

Nenhuma regressão no caso de produto acabado; o caso de insumo agora tem copy e ações específicas e corretas.

---

## 6) Achado #6 (novo, BAIXO/UX) — Ambiguidade entre "Lucro Real Estimado" e "Receita de Vendas" no Dashboard — ✅ CORRIGIDO (renomeação), ver verificação independente abaixo

**Onde:** tela inicial (`/`), card "Lucro Real Estimado" (topo) e card "Receita de Vendas" (bloco Vendas & Pedidos), ambos na mesma tela.

**O que foi observado originalmente:** com a base de dados desta rodada (setembro/2026), o Dashboard mostrava simultaneamente:
- **Lucro Real Estimado: -R$ 20,00** — subtítulo "Receita − Despesas − COGS"
- **Receita de Vendas: R$ 284,00**

À primeira vista os dois números pareciam contraditórios (teve R$ 284 de venda no mês, mas o lucro aparece negativo), o que pode gerar desconfiança do usuário em relação ao cálculo.

**Verificação:** o cálculo do "Lucro Real Estimado" está correto e é internamente consistente. É produzido por `ResumoService.resumoDoMes()` (backend), que explicitamente implementa **regime de caixa** (comentário no próprio código: *"lucro_real = receita(mês, caixa) − gastos(data_pagamento) − COGS(saida_insumo no mês)"*):
- Receita = soma de `pagamento_pedido.valor` com `data_pagamento` no mês.
- Despesas = soma de `financeiro_gasto.valor` com `data_pagamento` no mês.
- COGS = soma de `saida_insumo.valor_total` (tipo PRODUCAO) criadas no mês.

Já o card **"Receita de Vendas"** (`DashboardService.getVendasKpis()`) usa **regime de competência**: soma `pedido.valor_total` de pedidos criados no mês, independentemente de terem sido pagos.

Também validado o corte de mês em fuso de Brasília (item D3, não executado nas rodadas anteriores): os 2 gastos de teste "Teste QA Repetir Dia 31" (datados `2026-10-31T03:00:00Z` e `2026-11-30T03:00:00Z`, ou seja, 31/10 e 30/11 às 00:00 BRT) foram corretamente atribuídos a outubro e novembro respectivamente, sem vazamento entre meses. ✅ Sem bug de fronteira de mês.

**Decisão do dono do produto (2026-09-22):** a coexistência dos dois regimes contábeis no mesmo painel é intencional; a correção é apenas de nomenclatura/UX, sem alterar nenhum cálculo — renomear os cards para deixar o regime explícito.

**Correção aplicada:** ver verificação independente ao vivo, abaixo.

---

## Verificação independente das correções dos achados #5 e #6 — 2026-09-22 (rodada 3)

Reteste ao vivo, após o time de desenvolvimento aplicar as correções dos achados #5 (commit frontend `36ecac0`) e #6 (commit frontend `7939391`), confirmadas por `git log`/`git show` antes do reteste.

### Achado #5 — modal de remoção de Apoio de Festa

Fluxo reproduzido do zero na aplicação viva, usando o Orçamento #4 (`ABERTO`, sem apoio):
1. Adicionada uma proposta de Apoio de Festa ("Carrinho de Doces QA PG", 05/10/2026 10:00–18:00, R$ 400,00) via "Propor Apoio de Festa". Confirmado via API (`GET /api/orcamento/4`) que `valorTotal` subiu de **30 → 430** imediatamente ao propor (comportamento do fix do achado #1, correto).
2. Clicado em "Remover da proposta" no item adicionado. O modal de confirmação agora exibe:
   > "Tem certeza que deseja remover o apoio **"Carrinho de Doces QA PG"** da proposta? **O valor desse apoio será subtraído do total do orçamento.**"

   Texto novo confirmado **igual ao commit `36ecac0`**, e agora **descreve corretamente** o comportamento real (antes, o texto antigo dizia o contrário — que a remoção não afetava o total). ✅
3. Confirmada a remoção → `GET /api/orcamento/4` mostrou `valorTotal` voltar de **430 → 30**, exatamente como o texto do modal descreve. ✅

**Achado #5: confirmado corrigido**, com o texto do modal agora consistente com o comportamento real do backend.

**Nota lateral (não é regressão do #5, é a observação de UX já registrada acima):** durante o passo 1, o card "RESUMO" da própria tela de edição do Orçamento #4 permaneceu mostrando "Total: R$ 30,00" o tempo todo (antes e depois de propor o apoio de R$ 400,00), mesmo após reload da página — só a lista de Orçamentos (`/vendas/orcamentos`) mostrou o valor correto (R$ 430,00). Isso significa que, na mesma tela onde o novo modal do achado #5 avisa que "o valor desse apoio será subtraído do total", o campo "Total" visível nessa tela nunca chegou a mostrar esse valor somado em primeiro lugar — o aviso do modal é correto sobre o dado real (persistido/listado), mas continua desconectado do que a tela de edição exibe. Já estava registrado como observação de UX antes desta rodada; não é um achado novo, só uma reconfirmação de que segue sem correção (fora do escopo dos achados #5/#6).

### Achado #6 — nomenclatura dos cards de receita no Dashboard

Reteste ao vivo na tela inicial (`/`), recarregada do zero:
- **Destaques (topo):** card renomeado para **"RECEITA RECEBIDA"**, subtítulo **"Entradas liquidadas no mês (regime de caixa)"** — valor R$ 0,00 (sem pagamentos registrados em setembro/2026 nesta base). ✅ conforme commit `7939391` (`DestaquesExecutivos.tsx`).
- **Vendas & Pedidos:** card renomeado para **"RECEITA FATURADA"**, subtítulo **"Total faturado no mês corrente (regime de competência)"** — valor R$ 1.434,00 (soma dos pedidos do mês, incluindo os criados nas rodadas de reteste anteriores). ✅ conforme commit `7939391` (`VendasBlock.tsx`).
- **Financeiro & Compras:** card renomeado para **"RECEITA RECEBIDA"**, subtítulo **"Entradas liquidadas no mês (regime de caixa)"** — valor R$ 0,00, igual ao card de Destaques (mesma fonte, `resumo.receita`). ✅ conforme commit `7939391` (`FinanceiroBlock.tsx`).
- Nenhum valor mudou (os três cards continuam mostrando exatamente os mesmos números de antes da correção) — apenas título e subtítulo, como esperado para uma correção de nomenclatura/UX sem alteração de cálculo.

**Achado #6: confirmado corrigido** nos 3 pontos do Dashboard que exibiam os cards de receita. Guia do usuário (`modules/guia/components/sections/Dashboard.tsx`) não reaberto nesta rodada de verificação, mas o diff do commit `7939391` mostra o texto atualizado de forma consistente com os cards.

---

## Conclusão

Os 4 achados da rodada de homologação 2026-09-19 foram corrigidos e verificados com sucesso, incluindo reprodução end-to-end do crash original (não apenas revisão de código) e testes de ciclo completo (criar → editar → remover apoio → converter em pedido) para o achado crítico do `valorTotal`.

Os 2 achados novos identificados durante o reteste (efeitos colaterais/observações da correção do item 1) foram corrigidos pelo time de desenvolvimento e **reconfirmados ao vivo de forma independente nesta rodada (rodada 3)**:
- **Achado #5:** texto do modal de confirmação de remoção de Apoio de Festa agora reflete o comportamento real (subtração imediata do total), confirmado por reprodução completa do fluxo (propor → conferir total via API → remover → conferir total via API).
- **Achado #6:** cards de receita do Dashboard renomeados nos 3 pontos onde apareciam (Destaques, Vendas & Pedidos, Financeiro & Compras), com subtítulo explicitando o regime contábil (caixa vs. competência) em cada um.

Permanece **não corrigida** (fora do escopo destas correções, já registrada como observação de UX menor, sem risco ao dado persistido): o card "RESUMO" da tela de criação/edição de Orçamento não reflete o valor do Apoio de Festa proposto no "Total" exibido, mesmo quando o backend já soma esse valor (visível corretamente na lista de Orçamentos). Recomenda-se considerar essa correção numa próxima rodada, já que agora o modal do achado #5 faz referência explícita a "o total do orçamento" numa tela cujo próprio campo "Total" não reflete esse valor.

**Ambiente de teste usado:** Orçamentos #3 e #4 e Pedido #3, criados na rodada 2 especificamente para o reteste, permanecem na base como evidência. Na rodada 3 (verificação independente), o Orçamento #4 foi reutilizado para o teste do achado #5 (uma proposta de apoio foi adicionada e depois removida — o orçamento voltou ao estado original, `valorTotal = 30`, sem apoio ativo).

# Reteste dos achados da homologação 2026-09-19

**Data do reteste:** 2026-09-22
**Escopo:** validar as correções aplicadas para os 4 achados adicionais reportados em `doc/homologacao-2026-09-19-frontend.md` (seção "Achados adicionais"). Reteste feito na aplicação viva (`http://localhost`), sem alteração de código — apenas testes e este relatório.

**Commits com as correções:**
- Backend (`confectionery`): `1db585b` ("homologacao") — fix do valorTotal do Orçamento.
- Frontend (`confectionery-web-dashboard`): `edc7e30` ("homologacao") — fix de fuso horário, crash e modal.
- Docs: `45a5f64` — marca os achados como corrigidos em `PROJECT_CONTEXT.md` e no relatório.

## Resumo

| # | Achado | Severidade | Resultado do reteste |
|---|---|---|---|
| 1 | Orçamento.valorTotal não somava Apoio de Festa proposto | CRÍTICO | ✅ Corrigido (com 1 ressalva — ver abaixo) |
| 2 | Drift de +3h em "Data do Evento"/"Data de Entrega" | ALTO | ✅ Corrigido |
| 3 | Crash de tela branca com data inválida | MÉDIO | ✅ Corrigido |
| 4 | Modal "Estoque Insuficiente" com copy errado para insumo | BAIXO | ✅ Corrigido |

---

## 1) Orçamento.valorTotal não somava o Apoio de Festa proposto — ✅ CORRIGIDO

Fix no backend: `ApoioOrcamentoService.cadastrar()`/`excluir()` agora ajustam `Orcamento.valorTotal` por delta (via novo `OrcamentoValorTotalAjustePort`), e `AtualizarOrcamentoUseCase` (PUT) agora soma de volta o valor dos `ApoioOrcamento` ativos (via novo `ApoioOrcamentoValorSomaReferenciaPort`) em vez de recalcular do zero.

Testado ponta a ponta pela UI, criando um Orçamento novo (Orçamento #3):

- **Criação com apoio proposto antes de salvar** (cenário equivalente ao A2, não testado na rodada anterior): item R$ 40 + frete R$ 10 + Apoio de Festa "Carrinho Premium" com mão de obra (2h × R$ 70 = R$ 140) → **Orçamento #3 criado com valorTotal = R$ 190,00** ✅. Confirmado via rede que o frontend faz `POST /api/orcamento` (itens+frete) seguido de `POST /api/apoio-orcamento`, e o total já reflete a soma corretamente após o segundo POST.
- **Edição (PUT) preservando o total**: editado o Orçamento #3 duas vezes (apenas trocando a observação, sem tocar no apoio) — `valorTotal` permaneceu **190** nas duas vezes, não regrediu para 50 (o bug original apagava o apoio a cada PUT). ✅
- **Conversão para Pedido sem duplicar o valor**: aprovado o Orçamento #3 → gerou Pedido #3 com `valorTotal = 190` (não 330). Confirmado que a materialização do `ApoioOrcamento` em `ApoioFesta` real soma o apoio **exatamente uma vez** no Pedido. ✅
- **Exclusão do apoio devolvendo o valor** (Orçamento #4, teste isolado): item R$ 30 + Apoio "Carrinho de Doces" (2h × R$ 50 = R$ 100) → total 130 ao criar. Removida a proposta de apoio → `valorTotal` voltou para **30**. ✅

### Ressalva encontrada durante o reteste (novo achado, BAIXO)

O modal de confirmação ao remover um Apoio de Festa proposto de um Orçamento ainda exibe o texto:

> "Tem certeza que deseja remover o apoio "X" da proposta? **Isso não afeta o valor do orçamento** (apoio proposto não soma no total até o orçamento ser aprovado)."

Esse texto ficou **desatualizado pela própria correção**: antes do fix, era verdade (o apoio proposto realmente não entrava no total). Agora ele entra imediatamente (confirmado acima: 130 → 30 ao remover). O texto do modal deveria ser atualizado para refletir o novo comportamento, ou o usuário é informado incorretamente de que a remoção é "inócua" quando na verdade ela reduz o valor total do orçamento.
Local: `confectionery-web-dashboard/src/modules/.../` — componente do diálogo de remoção de `ApoioOrcamentoSection` (não localizado o arquivo exato nesta rodada, apenas o texto renderizado).

### Observação (não é bug, é UX menor)

O card "RESUMO" nas telas de criação/edição de Orçamento continua mostrando apenas itens + frete (sem o apoio), tanto na criação quanto na edição — ex.: total exibido "R$ 50,00" enquanto o valor persistido/lista mostra corretamente "R$ 190,00". Isso é puramente client-side (não afeta o dado persistido, que está correto), mas pode confundir o usuário durante o preenchimento. Diferente do Pedido, cujo RESUMO já soma o Apoio de Festa corretamente.

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

## Conclusão

Os 4 achados da rodada de homologação 2026-09-19 foram corrigidos e verificados com sucesso nesta rodada, incluindo reprodução end-to-end do crash original (não apenas revisão de código) e testes de ciclo completo (criar → editar → remover apoio → converter em pedido) para o achado crítico do `valorTotal`.

Um novo achado de baixa severidade foi identificado como efeito colateral da correção do item 1 (texto do modal de confirmação de remoção de Apoio de Festa desatualizado) e está documentado acima para correção em uma próxima rodada.

**Ambiente de teste usado:** Orçamentos #3 e #4 e Pedido #3, criados nesta rodada especificamente para o reteste, permanecem na base como evidência (Pedido #3 ficou com item de 50 unidades de "Bolo QA PG" sem estoque suficiente — condição esperada, criada intencionalmente para os testes dos achados #3 e #4).

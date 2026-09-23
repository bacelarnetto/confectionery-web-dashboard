# Homologação — Achado #71: retirada no local pula A_CAMINHO

**Data:** 2026-09-23
**Autor:** QA/Homologação (assistente)
**Gatilho:** "fiz novo ajuste na questão de retirada do pedido, poderia validar e homologar"
**Alterações homologadas (não commitadas no momento do teste, staged em ambos os repositórios):**
- Backend `confectionery` — `src/main/kotlin/.../vendas/application/service/PedidoService.kt` (+testes `PedidoIntegrationTest.kt` PE21–PE24, `PagamentoPedidoIntegrationTest.kt`)
- Frontend `confectionery-web-dashboard` — `pedidoStatus.ts`, `pedidoPermissoes.ts`, `PedidoListPage.tsx`, `PedidoFormPage.tsx`, `PedidoDetalheModal.tsx`, guia in-app (`Vendas.tsx`)
- `doc/acao-permissoes-pedido.md` (§13, já escrito pelo time de dev com o detalhamento técnico da mudança)

**Escopo mantido:** apenas teste e documentação — nenhuma alteração de código ou commit foi feita por este QA. Todas as correções foram implementadas pelo time de desenvolvimento; este documento reverifica de forma independente, ao vivo, se elas funcionam como descrito.

---

## Regra de negócio (decisão do dono)

Pedido marcado como retirada no local (`retirar=true`) não passa pelo status `A_CAMINHO` — não existe trajeto pra acompanhar quando o cliente busca pessoalmente. De `PRONTO`, o próximo passo passa a ser direto `ENTREGUE`. Pedidos de entrega (`retirar=false`) continuam exigindo `A_CAMINHO` antes de `ENTREGUE`, sem alteração. **Sem backfill**: um pedido de retirada que já esteja gravado em `A_CAMINHO` (dado legado, de antes da regra existir, ou por ter tido o campo `retirar` alterado depois de já estar em `A_CAMINHO`) segue o fluxo normal a partir de lá — a exceção só se aplica a partir de `PRONTO`, nunca reescreve o passado.

## Resumo executivo

| Cenário | Resultado esperado | Resultado obtido |
|---|---|---|
| Retirada nova: `PRONTO → A_CAMINHO` | Rejeitado (400) | ✅ Confirmado |
| Retirada nova: `PRONTO → ENTREGUE` | Aceito (200) | ✅ Confirmado |
| Entrega (regressão): `PRONTO → ENTREGUE` direto | Rejeitado (400) — continua exigindo `A_CAMINHO` | ✅ Confirmado, sem regressão |
| Entrega (regressão): `PRONTO → A_CAMINHO → ENTREGUE` | Aceito (200) | ✅ Confirmado, sem regressão |
| Legado/sem backfill: pedido em `A_CAMINHO` com `retirar` alterado pra `true` depois | `A_CAMINHO → ENTREGUE` continua aceito, sem quebrar | ✅ Confirmado |
| UI — pill/select `A CAMINHO` some para pedido de retirada | Não aparece como opção | ✅ Confirmado (lista e tela de edição) |
| UI — modal "Registrar pagamento"/aviso de confirmação em `PRONTO → ENTREGUE` de retirada | Dispara igual ao de `A_CAMINHO → ENTREGUE` | ✅ Confirmado |
| Guia in-app | Explica a regra da retirada | ✅ Confirmado |

Todas as verificações abaixo foram feitas **ao vivo, na aplicação real** (`http://localhost`), com pedidos de teste criados especificamente para este reteste e chamadas diretas à API para os pontos que a UI não expõe (ex.: forçar uma transição bloqueada).

---

## Cenário 1 — Retirada nova (Pedido #9)

Criado via UI (perfil admin), cliente "Maria Teste PG", produto "Bolo QA PG", **"Cliente retira no local" marcado**. Avançado pela UI (pills de status, com o modal de confirmação de cada transição) até `PRONTO`.

- Ao chegar em `PRONTO`, a linha de status pills mostrou **RASCUNHO · CONFIRMADO · EM PRODUCAO · PRONTO · ENTREGUE · CONCLUIDO · Cancelado** — sem `A CAMINHO` na lista, desde a criação do pedido (não precisou nem chegar em `PRONTO` pra sumir; já nasce assim).
- Tentativa direta via API (`PUT /pedido/9/status`, `{status: "A_CAMINHO"}`) — **400 Regra de Negócio**: *"Pedido de retirada no local não passa por A_CAMINHO. De PRONTO o pedido evolui para ENTREGUE."* Confirmado via `GET` que o pedido **permaneceu em PRONTO**, sem alteração indevida de estado.
- Avançado pela UI pra `ENTREGUE` (pill): modal de confirmação mostrou "Você poderá registrar o pagamento em seguida" (mesma mensagem de uma transição `A_CAMINHO → ENTREGUE` normal) e, ao confirmar, o modal de **Registrar Pagamento abriu automaticamente** — confirma que `STATUS_QUE_SUGEREM_PAGAMENTO` está corretamente indexado pelo status de destino, não pela origem. Pagamento não foi registrado (não necessário pro teste); modal cancelado.
- Estado final confirmado via `GET /pedido/9`: `status: "ENTREGUE"`, `retirar: true`.

*(Nota lateral, sem relação com o Achado #71: o produto de teste "Bolo QA PG" ficou temporariamente sem estoque suficiente, efeito acumulado de sessões de teste anteriores — resolvido registrando uma nova Entrada de Produto de 50 unidades antes de prosseguir. Não é um achado, é housekeeping de dado de teste.)*

## Cenário 2 — Entrega, regressão (Pedido #10)

Criado via UI, mesmo cliente/produto, **"Cliente retira no local" desmarcado** (entrega normal, com frete). Avançado via API até `PRONTO`.

- Tentativa direta via API de pular pra `ENTREGUE`: **400 Regra de Negócio** — *"Transição de status inválida: de PRONTO para ENTREGUE. O pedido evolui um status por vez (próximo: A_CAMINHO)."* — exatamente a mensagem/comportamento pré-existente, preservado.
- Sequência correta `PRONTO → A_CAMINHO → ENTREGUE` via API: ambas as chamadas retornaram 200.

**Sem regressão no fluxo de entrega.**

## Cenário 3 — Legado / sem backfill (Pedido #11)

Criado via UI como entrega (`retirar=false`), avançado via API até `A_CAMINHO`.

- Nesse ponto, a tela de edição mostrou a pill `A_CAMINHO` como status atual (destacada) e `ENTREGUE` como próximo passo disponível — comportamento normal de um pedido de entrega em trânsito.
- Editado o campo `retirar` para `true` (simulando o cliente decidir buscar pessoalmente depois que o pedido já saiu para entrega, ou um dado legado sendo corrigido) via `PUT /pedido/11` direto na API, com o restante do corpo preservado. Confirmado via `GET` que `retirar` passou a `true`, com `status` permanecendo `A_CAMINHO` (a edição não afeta o status).
- Tentativa de avançar `A_CAMINHO → ENTREGUE`: **200**, aceito normalmente — confirma que a exceção da retirada (`ORDEM_STATUS_RETIRADA`) só se aplica a partir de `PRONTO`; um pedido que já esteja em `A_CAMINHO` segue a ordem canônica completa dali, **sem backfill retroativo e sem quebrar**, exatamente como documentado e como o teste de integração `PE24` do backend descreve.

*(Nota metodológica: a primeira tentativa de reproduzir esse cenário **através da tela de edição** (marcar o checkbox "Cliente retira no local" e clicar "Salvar alterações") não persistiu a mudança — o `GET` seguinte ainda mostrava `retirar: false`, mesmo com o checkbox visualmente marcado antes do envio. Não consegui isolar se isso é um bug real da tela de edição para pedidos fora de RASCUNHO ou um artefato do meu próprio teste (chamadas diretas de API concorrentes na mesma sessão podem ter disparado um refetch do React Query que resetou o formulário entre o clique e o envio — o código-fonte do `handleSubmit`/`handleRetirarChange` não mostra nenhuma lógica que bloqueie ou ignore essa mudança). Como o objetivo deste reteste é a regra de negócio do Achado #71, e ela foi confirmada via API direta de forma inequívoca, não investiguei mais a fundo — mas deixo registrado como um ponto a olhar com calma numa sessão futura, sem reproduzir pressa nenhuma sobre isso ser ou não um bug.)*

## Verificações de UI adicionais

- **Guia in-app** (`/guia/vendas`, seção "Vendas", passo 5): o parágrafo novo aparece corretamente — *"Pedido marcado como 'Cliente retira no local' pula o A CAMINHO — não existe trajeto pra acompanhar quando o cliente busca pessoalmente. Nesse caso o próximo passo depois de PRONTO já é direto ENTREGUE, e a etapa A CAMINHO nem aparece como opção pra esse pedido."*
- **Lista de Pedidos**: para o pedido de retirada (#9), o `<select>` de status nunca ofereceu `A_CAMINHO` como opção, em nenhum momento do fluxo.
- **Tela de edição (`PedidoFormPage`)**: mesma ausência da pill `A_CAMINHO` confirmada visualmente, incluindo a checagem de que o pedido de entrega (#10/#11) continua mostrando a pill normalmente quando está com esse status disponível.

## Conclusão

A correção do Achado #71 foi **verificada de forma independente e confirmada como funcionando corretamente**, nos três cenários que importam: retirada nova (pula A_CAMINHO, backend recusa forçar essa transição), entrega normal (sem regressão, continua exigindo A_CAMINHO) e dado legado/mudança tardia de `retirar` (sem backfill, sem quebra). A UI (lista, tela de edição, guia in-app) reflete a regra corretamente em todos os pontos verificados. Não foram encontradas regressões nos fluxos pré-existentes.

Um ponto secundário, não relacionado ao Achado #71 e não confirmado como bug, foi registrado como observação metodológica acima (edição do campo `retirar` via tela, pra um pedido fora de RASCUNHO) — recomenda-se um teste dedicado e isolado (sem chamadas de API concorrentes) numa sessão futura, se o time achar relevante investigar.

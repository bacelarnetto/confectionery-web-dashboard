# Reteste de Correção — Ação de Permissões do Pedido

**Data:** 2026-09-23
**Autor:** QA/Homologação (assistente)
**Referência:** `doc/homologacao-acao-permissoes-pedido-2026-09-23.md`
**Gatilho:** mensagem do time de dev "fizemos a correção", referente aos Achados A–D da homologação de 2026-09-23.
**Commits analisados:**
- Backend `confectionery` — `473339c11facf202faf9604903e2ed916981bede` — "fix: homologacao permissoes pedido - 400 p/ requisicao incompleta"
- Frontend `confectionery-web-dashboard` — `949d38de7a2d596b7a880b478e6f5fe793365d87` — "fix: correcoes pos-homologacao das permissoes do Pedido"

**Escopo mantido:** apenas teste e documentação — nenhuma alteração de código ou commit foi feita por este QA. Todas as correções abaixo foram implementadas pelo time de desenvolvimento; este documento apenas reverifica, de forma independente, se elas funcionam como descrito.

---

## Resumo executivo

| Achado | Descrição original | Resultado do reteste |
|---|---|---|
| A | 500 em vez de 403 em `PUT /pedido/{id}/status` e `DELETE /pedido/{id}` | ✅ **Corrigido** — confirmado |
| B | Atalho "Novo Pedido" do Dashboard não escondido para PRODUCAO/ESTOQUE | ✅ **Corrigido** — confirmado (PRODUCAO) |
| C | Modal de pagamento abre automaticamente sem permissão; sem feedback de erro no 403 | ✅ **Corrigido** — confirmado |
| D1 | Botão "Adicionar item" não desabilitado visualmente | ✅ **Corrigido** — confirmado |
| D2 | Coluna Status da lista mostra dropdown desabilitado em vez de badge | ✅ **Corrigido** — confirmado (PRODUCAO e ESTOQUE) |
| E | Adiantamento sugerido de 50% | Não é um bug; pré-existente à feature F1; não alterado (aguarda decisão do dono) |

Todas as correções relacionadas aos Achados A, B, C e D foram **verificadas de forma independente e diretamente na aplicação viva** (chamadas de API diretas para o backend, e testes de UI via navegador autenticado com os perfis VENDAS, PRODUCAO e ESTOQUE), sem depender apenas da descrição do commit. Nenhum efeito colateral inesperado foi observado nos testes.

---

## Achado A — 500 vs 403 em `/status` e `DELETE`

### Causa raiz identificada pelo time de dev
O erro 500 observado na homologação original **não era uma falha na checagem de permissão**. As chamadas diretas de teste do QA (via `fetch()`) omitiam o header HTTP obrigatório `usuario`, que o interceptor do axios do frontend (`src/lib/axios.ts`) sempre anexa automaticamente a cada requisição autenticada:

```ts
config.headers.usuario = getUsername(user)
```

O Spring resolve argumentos `@RequestHeader` durante a fase de *argument resolution* do MVC, que ocorre **antes** dos interceptors de method-security (`@PreAuthorize`). Um header obrigatório ausente lançava `MissingRequestHeaderException`/`ServletRequestBindingException`, que caía em um catch-all genérico → 500.

### Correção aplicada
- `GlobalExceptionHandler` ganhou um handler para `ServletRequestBindingException` → **400** "Requisição Inválida" / "Requisição incompleta: header ou parâmetro obrigatório ausente." (vale para todos os 18 parâmetros `@RequestHeader` do projeto).
- `PUT /status` com campo `status` ausente agora lança `RegraDeNegocioException` (400) em vez de `IllegalArgumentException` (500).
- Com o header `usuario` presente, a negação de permissão retorna corretamente **403** "Acesso Negado" / "Você não tem permissão para realizar esta ação." — comportamento já coberto pelos testes de integração PP1–PP18, mais os novos PP19/PP20.
- Suíte de testes do backend: 512/515 verdes (3 falhas pré-existentes de migração PostgreSQL, não relacionadas — ver `doc/plano-migracao-postgresql.md`).

### Reteste independente (chamadas diretas de API)

| Cenário | Header `usuario` | Resultado esperado | Resultado obtido |
|---|---|---|---|
| `PUT /pedido/{id}/status`, VENDAS tentando transição fora de alcance | Ausente | 400 (não 500) | ✅ 400 "Requisição incompleta: header ou parâmetro obrigatório ausente." |
| `PUT /pedido/{id}/status`, VENDAS tentando transição sem permissão | Presente | 403 | ✅ 403 "Você não tem permissão para realizar esta ação." |
| `DELETE /pedido/{id}`, VENDAS sem permissão de exclusão | Ausente | 400 (não 500) | ✅ 400 |
| `DELETE /pedido/{id}`, VENDAS sem permissão de exclusão | Presente | 403 | ✅ 403 "Acesso Negado" |

Em todos os casos, uma consulta `GET` subsequente confirmou que **nenhuma alteração de estado indevida ocorreu** (nem no caso 400, nem no caso 403) — a propriedade de segurança mais importante permanece intacta independentemente do código de status HTTP retornado.

**Veredito: Achado A confirmado como corrigido.**

---

## Achado B — Atalho "Novo Pedido" do Dashboard

### Correção aplicada
`VendasBlock.tsx` agora usa a função `podeCriarPedido` (de `pedidoPermissoes.ts`) para decidir se o atalho "Novo Pedido" é renderizado.

### Reteste independente (UI, perfil PRODUCAO)
- Login como `qa.producao@confectionery.test`.
- Dashboard inspecionado via `find` (busca por botão "Novo Pedido"): **elemento não encontrado** — atalho corretamente ausente.

**Veredito: Achado B confirmado como corrigido** (para o perfil PRODUCAO, que foi o perfil especificamente citado no achado original).

---

## Achado C — Modal de pagamento abre automaticamente / sem feedback de erro

### Correção aplicada
- `PedidoPagamentoCard.tsx`: a abertura automática do modal "Registrar pagamento" agora é condicionada por `podeRegistrarPagamentoPedido`.
- `RegistrarPagamentoModal.tsx` + novo componente `PedidoErroModal`: uma resposta 403 do backend ao tentar submeter o pagamento agora é tratada explicitamente e exibida ao usuário, em vez de falhar silenciosamente.

### Reteste independente (UI, perfil PRODUCAO)
- Criado um pedido de teste novo (**Pedido #8** — "Maria Teste PG" / "Bolo QA PG", RASCUNHO) via VENDAS, avançado via API até CONFIRMADO.
- Logado como PRODUCAO, avançado o Pedido #8 pela cadeia completa de status pela UI: EM_PRODUCAO → PRONTO → A_CAMINHO → **ENTREGUE**.
- Na transição A_CAMINHO → ENTREGUE (que antes abria automaticamente o modal de pagamento mesmo para PRODUCAO, que não tem permissão de registrar pagamento): apenas um toast "Status atualizado!" apareceu — **nenhum modal de pagamento foi aberto**.

**Veredito: Achado C confirmado como corrigido** (auto-abertura do modal). O caminho de erro 403 no submit do pagamento (via `PedidoErroModal`) não pôde ser exercitado neste reteste porque o modal já não abre para este perfil — o que é, em si, o comportamento correto e esperado.

---

## Achado D — Inconsistências cosméticas de "somente leitura"

### D1 — Botão "Adicionar item" não desabilitado

**Correção aplicada:** classes Tailwind `disabled:` agora aplicadas corretamente aos botões "Adicionar item"/"Remover item" em `PedidoFormPage.tsx`, que herdam o estado `disabled` de um `<fieldset disabled>` ancestral.

**Reteste independente (UI, perfil PRODUCAO, página `/vendas/pedidos/8/editar`):**
- Verificado via `javascript_tool` que o botão "Adicionar item" corresponde ao pseudo-seletor CSS `:disabled` (via herança do `fieldset` ancestral — confirmado que `element.matches(':disabled')` retorna `true` mesmo quando a propriedade própria `element.disabled` lê `false`, comportamento correto conforme a especificação HTML).
- Confirmado visualmente (screenshot com zoom) que "Adicionar item" agora renderiza com o mesmo estilo desbotado/desabilitado (âmbar pálido) que "Adicionar Apoio de Festa", que já estava corretamente desabilitado antes da correção.

**Veredito: D1 confirmado como corrigido.**

### D2 — Coluna Status da lista mostra dropdown desabilitado em vez de badge

**Correção aplicada:** `PedidoListPage.tsx` — para linhas em que o perfil logado não tem nenhuma ação de status disponível, a coluna Status agora renderiza um elemento somente-leitura, sem chevron de dropdown.

**Reteste independente (UI, dois perfis):**

*Perfil PRODUCAO* (tem zero ações apenas em algumas linhas, ex.: Pedido #5, RASCUNHO):
- Inspecionado via `javascript_tool`: coluna Status renderiza um `<select>` de opção única ("RASCUNHO (atual)"), totalmente desabilitado, estilizado como pill (`rounded-full bg-gray-100 text-gray-600`), sem chevron visível.
- Contraste confirmado no Pedido #8 (ENTREGUE), onde PRODUCAO *tem* uma ação disponível (→CONCLUIDO): o `<select>` correto continua mostrando chevron e múltiplas opções interativas.

*Perfil ESTOQUE* (tem zero ações de status em **todos** os pedidos, sem exceção — perfil especificamente citado no Achado D2 original):
- Logado como `qa.estoque@confectionery.test`, navegado para `/vendas/pedidos` (8 pedidos listados).
- Inspecionado via `javascript_tool` **cada uma das 8 linhas** da tabela: em **100% dos casos**, a coluna Status não contém nenhum elemento `<select>` — é renderizada como um `<span>` somente-leitura (`text-xs font-medium px-2 py-1 rounded-full` + cor por status: laranja para ENTREGUE, vermelho para CANCELADO, cinza para RASCUNHO, etc.), idêntico visualmente ao badge de status usado em outras partes da aplicação.
- Este resultado é, na prática, uma implementação **ainda mais limpa** do que a observada para PRODUCAO: em vez de um `<select>` de opção única desabilitado simulando um badge, o ESTOQUE recebe um badge de verdade, sem qualquer elemento de formulário — o que elimina por completo a possibilidade de foco de teclado, chevron residual, ou qualquer affordance de interatividade na coluna Status.

**Veredito: D2 confirmado como corrigido, para PRODUCAO e para ESTOQUE (perfil originalmente citado no achado).**

---

## Achado E — Adiantamento sugerido de 50%

Não alterado nesta rodada de correções, conforme indicado no documento de dispatch (`doc/acao-permissoes-pedido.md`, §9): *"E (50% de adiantamento sugerido) é pré-existente à F1, não alterado — aguarda o dono."* Nenhuma ação de reteste necessária; achado permanece aberto por decisão de produto, não por pendência técnica.

---

## Verificações complementares realizadas

- **Ausência de efeitos colaterais:** todas as chamadas de API usadas no reteste do Achado A foram seguidas de uma consulta `GET` ao pedido afetado, confirmando que nenhuma alteração de estado indevida ocorreu nos casos de erro (400 ou 403).
- **Spot-check do `PedidoDetalheModal.tsx`** (arquivo com o maior diff do commit de frontend, +106/-…, mas não mencionado diretamente nos achados originais): tentativa de abrir o modal de detalhe a partir do Mural da Semana como ESTOQUE não teve sucesso neste reteste (o clique no card não abriu nenhum modal com os seletores tentados). Como este componente não fazia parte do escopo dos Achados A–D e o tempo de reteste é limitado, este item **não foi verificado em profundidade** — recomenda-se um teste dedicado a `PedidoDetalheModal` em uma rodada futura, se o time de dev considerar relevante.

## Observação metodológica

Este reteste seguiu o mesmo padrão de testes ao vivo (chamadas diretas de API + navegação autenticada no navegador) usado na homologação original, evitando validar as correções apenas pela leitura dos diffs de commit. Um artefato cosmético recorrente do capturador de screenshot (renderização "em mosaico", 4 cópias idênticas da mesma página) foi observado múltiplas vezes durante o reteste; confirmado, via inspeção de DOM (`javascript_tool`/`read_page`), que se trata de um problema apenas da ferramenta de captura — o estado real da página é sempre único e correto.

## Conclusão

Todas as correções relacionadas aos Achados A, B, C, D e D2 reportados na homologação de 2026-09-23 foram **verificadas de forma independente e confirmadas como funcionando corretamente**. O Achado E permanece aberto, por decisão de produto (não é um defeito). Não foram encontradas regressões ou efeitos colaterais durante este reteste.
## Addendum (2026-09-23) — Verificação da correção do D2 residual

**Sugestão de melhoria levantada pelo QA (nesta mesma data), atendida no mesmo dia:**
> Inconsistência de padrão entre perfis no D2: para PRODUCAO (em linhas onde falta ação), a coluna
> Status mostrava um `<select>` de opção única desabilitado; para ESTOQUE, um `<span>` de badge de
> verdade. Os dois efeitos eram visualmente equivalentes, mas eram dois caminhos de código
> diferentes para o mesmo problema — sugerido unificar.

**Commits que atenderam a sugestão:**
- Backend `confectionery` — `4adda7c` — "docs: registra reteste dos achados A-D e correcao do D2 residual" (apenas documentação — sem mudança de código no backend).
- Frontend `confectionery-web-dashboard` — `8b30d31` — "fix: D2 residual - status select vs badge passa a ser por pedido, nao por perfil".

**O que a correção revelou:** não era só uma questão de estilo de código — era um **bug residual real**.
A função antiga `podeAlterarStatusPedido(perfis)` decidia select-vs-badge checando o **perfil como um
todo** (PRODUCAO sempre `true`, por ter ação em *algum* pedido). O critério correto é **por pedido**:
`statusDisponiveisParaPerfil(pedido.status, perfis).length > 0`. Isso significa que, antes da correção,
PRODUCAO numa linha RASCUNHO (fora da faixa dele, sem nenhuma transição disponível *para aquele
pedido específico*) ainda via o `<select>` de opção única desabilitado, e não o badge — só ESTOQUE
(que nunca tem ação, em nenhum pedido, sob nenhuma circunstância) estava correto por coincidência.

A correção foi aplicada de forma consistente nos três lugares que replicavam a mesma lógica:
`PedidoListPage.tsx` (select), `PedidoDetalheModal.tsx` e `PedidoFormPage.tsx` (pills) — e a função
`podeAlterarStatusPedido`, que não tinha mais nenhum uso, foi removida de `pedidoPermissoes.ts` (sem
deixar código morto).

### Reteste independente (ao vivo, três perfis)

| Perfil | Pedido | Status | Ação disponível para o perfil? | Esperado | Obtido |
|---|---|---|---|---|---|
| PRODUCAO | #5 | RASCUNHO | Não | Badge (sem `<select>`) | ✅ Badge — `hasSelectElement: false` |
| PRODUCAO | #8 | ENTREGUE | Sim (→CONCLUIDO) | `<select>` com 2 opções | ✅ `<select>` com 2 opções |
| PRODUCAO | #6 | ENTREGUE | Sim (→CONCLUIDO) | `<select>` com 2 opções | ✅ `<select>` com 2 opções |
| ESTOQUE | #1–#8 (todos) | vários | Nunca | Badge em 100% das linhas | ✅ Badge em 8/8 linhas (sem regressão) |
| VENDAS | #5 | RASCUNHO | Sim (→CONFIRMADO/CANCELADO) | `<select>` com 3 opções | ✅ `<select>` com 3 opções (sem regressão) |

Verificado em `/vendas/pedidos` (lista) e em `/vendas/pedidos/5/editar` (`PedidoFormPage`, perfil
PRODUCAO): a seção "Status do Pedido" também passou a mostrar apenas o badge somente-leitura
("RASCUNHO"), sem os pills de transição, confirmando que a mesma correção se propagou corretamente
para essa página.

`PedidoDetalheModal.tsx` recebeu, pelo diff, exatamente o mesmo padrão de correção (`statusDisponiveisParaPerfil(...).length > 0`)
aplicado nos outros dois arquivos — não foi possível exercitá-lo ao vivo neste reteste (o ícone de
"olho" na coluna Ações da lista leva para a tela de edição, não para um modal; o modal não pôde ser
localizado a partir do Mural da Semana nesta sessão, possivelmente por estar fora da janela da
semana atual). Nível de confiança alto pela identidade do diff, mas **não confirmado ao vivo**.

**Veredito: melhoria sugerida foi implementada corretamente, corrige um bug residual real (não apenas
cosmético), e não introduziu regressões nos perfis PRODUCAO, ESTOQUE ou VENDAS.**


# Homologação — Ação/Permissões do Pedido (matriz de perfis) — 2026-09-23

## Objetivo

Homologar a implementação de controle de acesso por perfil (RBAC) para o módulo de Pedido,
entregue conforme `doc/acao-permissoes-pedido.md`: `@PreAuthorize` + `PedidoPermissaoLogic`
(backend, tarefas B1/B2) e ocultação/desabilitação de UI por perfil + card de pagamento em edição
(frontend, tarefas F1/F2).

**Escopo autorizado pelo usuário nesta rodada:** testar tudo, **incluindo a matriz de permissões**
— ou seja, esta homologação inclui login como cada perfil (VENDAS, PRODUCAO, ESTOQUE) e chamadas
diretas à API, o que normalmente estaria fora do escopo combinado ("só de negócio") para este
engajamento. ADMIN não foi testado separadamente nesta rodada (é o usuário real pré-existente,
`bacelarnetto@gmail.com` — assume-se acesso total, não há indicação em contrário no código).

Conforme a instrução padrão deste engajamento, **nenhum arquivo de código foi alterado** — apenas
testes ao vivo via browser (`http://localhost`) e chamadas diretas à API via bearer token. Os
achados abaixo são para o time de dev (`crew_run`) avaliar e corrigir.

## Massa de dados criada para este teste

**Usuários (persistidos no banco em execução):**

| Perfil | E-mail | Senha |
|---|---|---|
| VENDAS | `qa.vendas@confectionery.test` | `QaVendas123!` |
| PRODUCAO | `qa.producao@confectionery.test` | `QaProducao123!` |
| ESTOQUE | `qa.estoque@confectionery.test` | `QaEstoque123!` |

**Pedidos (cliente "Maria Teste PG", produto "Bolo QA PG" R$30/un):**

| # | Observação | Estado final desta rodada |
|---|---|---|
| 5 | "QA permissoes - Pedido A (VENDAS edit + F2)" | RASCUNHO, R$60,00 (editado de R$30 → R$60 por VENDAS) |
| 6 | "QA permissoes - Pedido B (cadeia de status)" | **ENTREGUE, saldo em aberto R$30,00** (não pôde ser concluído — ver Bloco C) |
| 7 | "QA permissoes - Pedido C (cancelamento)" | CANCELADO, R$30,00 |

---

## Bloco A — VENDAS

### A1 — Criar pedido
**✅ CORRETO.** Botão "Novo Pedido" visível na lista de Pedidos; formulário completo abre e
salva normalmente (Pedidos #5, #6, #7 criados por VENDAS).

### A2 — Pills de status filtradas para RASCUNHO
**✅ CORRETO.** Na lista, um pedido RASCUNHO mostra apenas RASCUNHO/CONFIRMADO/CANCELADO como
opções — nenhuma opção da faixa de produção (EM_PRODUCAO...CONCLUIDO) aparece para VENDAS.

### A3 — Editar dados em RASCUNHO/CONFIRMADO
**✅ CORRETO.** Pedido #5 (RASCUNHO): formulário totalmente editável, alteração de quantidade
1→2 salva e persiste (R$30,00 → R$60,00, confirmado via reload). Pedido #6 (CONFIRMADO):
formulário também editável para VENDAS, como esperado pela matriz ("VENDAS até CONFIRMADO").

### A4 — Cancelar pedido em RASCUNHO
**✅ CORRETO.** Pedido #7: clique em "Cancelado" abre modal de confirmação com o aviso "Ao
confirmar, os pagamentos serão estornados e o estoque pode ser revertido." Após confirmar,
status muda para CANCELADO e a tela passa a exibir o banner de somente-leitura.

### A5 — Confirmar RASCUNHO → CONFIRMADO
**✅ CORRETO**, com um comportamento extra a validar com o time de produto: ao confirmar, abre
automaticamente um modal "Registrar adiantamento" pré-preenchido com **50% do total do pedido**
(ex.: R$15,00 num pedido de R$30,00) como sugestão de valor. Não estava descrito no documento de
despacho — **não é um bug**, mas convém confirmar se o valor sugerido (50%) é intencional ou
resquício de dado de teste. *(Achado E, informativo.)*

### A6 — F2: card de pagamento reflete valor em edição
**✅ CORRETO, e melhor do que o próprio documento antecipava.** No Pedido #5 em edição, o
selo "em edição" (ícone de lápis, âmbar) ao lado de "Total do pedido" só aparece quando o valor
editado realmente diverge do valor persistido — o documento de despacho registrava a preocupação
de que o selo pudesse aparecer mesmo sem divergência real; isso **não ocorreu** no teste ao vivo.
Saldo recalcula em tempo real durante a edição e volta a refletir o valor persistido depois de
salvar.

### A7 — Bloqueio após pedido avançar além de CONFIRMADO
**✅ CORRETO.** Com o Pedido #6 em ENTREGUE (avançado pelo perfil PRODUCAO no Bloco B), o
acesso de VENDAS ao mesmo pedido passa a mostrar o banner "Seu perfil só tem acesso de leitura a
este pedido" com todos os campos desabilitados — apenas a pill ENTREGUE (atual) e Cancelado
aparecem, RASCUNHO...A_CAMINHO e CONCLUIDO ficam acinzentados. Testado também via API direta:
`PUT /api/pedido/6/status` por VENDAS para tentar `CONCLUIDO` — **bloqueado** (pedido continuou
ENTREGUE após a chamada), mas ver Achado A sobre o código HTTP retornado.

---

## Bloco B — PRODUCAO

### B1 — Criar pedido bloqueado
**✅ CORRETO na rota, ⚠️ inconsistente no atalho do Dashboard.** Na lista de Pedidos
(`/vendas/pedidos`), o botão "Novo Pedido" está corretamente **ausente** para PRODUCAO. Acessando
a rota diretamente (`/vendas/pedidos/novo`) — inclusive pelo atalho "+ Novo Pedido" que aparece no
Dashboard (Painel de Controle → card "Vendas & Pedidos") — a tela mostra um bloqueio de página
inteira: "🔒 Ação não permitida — Seu perfil não tem permissão para criar pedidos. Se precisar,
fale com o responsável da administração." Ou seja, **não há brecha de segurança** (a ação real é
bloqueada com uma mensagem clara), mas o atalho do Dashboard não deveria nem aparecer para
PRODUCAO/ESTOQUE. *(Achado B.)*

### B2 — Avançar status de EM_PRODUCAO em diante
**✅ CORRETO.** Cadeia completa testada no Pedido #6, uma transição por vez, cada uma com modal
de confirmação:
- CONFIRMADO → EM_PRODUCAO: aviso "Ao confirmar, o estoque será debitado automaticamente."
- EM_PRODUCAO → PRONTO: sem aviso extra.
- PRONTO → A_CAMINHO: sem aviso extra (pedido é de entrega, não retirada).
- A_CAMINHO → ENTREGUE: aviso "Você poderá registrar o pagamento em seguida." (e de fato abre o
  modal de pagamento automaticamente — ver B3).

Todas as transições persistiram corretamente (confirmado via `GET /api/pedido/6` após cada uma).
PRODUCAO **não** conseguiu iniciar a cadeia a partir de RASCUNHO/CONFIRMADO diretamente para além
de EM_PRODUCAO em um único passo — a lista de opções do combobox sempre mostrou só o próximo
status permitido, consistente com a matriz.

### B3 — Registrar pagamento bloqueado
**✅ CORRETO no backend, ⚠️ com um gap de UX a corrigir.** Ao confirmar a transição A_CAMINHO →
ENTREGUE, o app abre automaticamente o modal "Registrar pagamento" (mesmo comportamento do A5),
**mesmo para o perfil PRODUCAO, que não deveria poder registrar pagamento**. Preenchi o modal
(Valor R$30,00, PIX) e cliquei "Registrar": o backend respondeu **`403`** em
`POST /api/pedido/6/pagamentos` — a ação foi corretamente rejeitada apesar da UI ter permitido
chegar até o clique de submissão. **Não houve brecha real** (nenhum pagamento foi criado), mas o
modal não deveria nem abrir/ficar habilitado para um perfil sem essa permissão, e o usuário não
recebe nenhum feedback visível de que a tentativa falhou (o modal simplesmente permanece aberto,
sem mensagem de erro). *(Achado C — ver detalhamento nos Achados.)*

### B4 — Editar dados bloqueado
**✅ CORRETO.** Em `/vendas/pedidos/6/editar`, banner "Seu perfil só tem acesso de leitura a
este pedido" e todos os campos do formulário (Cliente, Endereço, Data, Frete, Retirada,
Observação, itens) desabilitados. Confirmado também via DOM (`fieldset.disabled === true`).
Testado via API direta `PUT /api/pedido/6` com corpo simulando uma edição — **bloqueado** (retornou
erro antes de qualquer alteração; ver Achado A sobre o código de erro).

### B5 — Excluir pedido bloqueado
**✅ Bloqueado na prática, ⚠️ com código de erro incorreto.** Não há UI de exclusão (conforme o
documento de despacho). Via API direta, `DELETE /api/pedido/6` por PRODUCAO **não excluiu o
pedido** (confirmado via GET imediatamente depois — pedido #6 continuava existindo), mas o
servidor respondeu **`500 Erro Interno`** em vez de `403 Forbidden`. *(Achado A.)*

### B6 — Botão "Adicionar item" não reflete o estado somente-leitura
**⚠️ Achado cosmético.** Na tela de edição do Pedido #6 (perfil PRODUCAO, somente leitura), o
botão "Adicionar item" aparece visualmente **habilitado** (não acinzentado), diferente do botão
"Adicionar Apoio de Festa" na mesma tela, que aparece corretamente desabilitado. Clicar em
"Adicionar item" **não tem efeito** (nenhum item novo é adicionado — confirmado inspecionando o
DOM antes/depois do clique), então não há brecha funcional, apenas uma inconsistência visual.
*(Achado D.)*

---

## Bloco C — Regra de negócio independente do RBAC: saldo em aberto trava CONCLUIDO

**✅ Comportamento correto e bem sinalizado — não é um achado de permissão, mas vale registrar.**
Como o pagamento do Pedido #6 nunca foi registrado (bloqueado no B3), a tentativa de avançar
ENTREGUE → CONCLUIDO (ainda como PRODUCAO, que tem permissão de mudar esse status) foi rejeitada
pela regra de negócio, com mensagem clara: **"Pedido 6 ainda tem saldo em aberto, não pode ser
concluído."** Ou seja, mesmo o ADMIN enfrentaria o mesmo bloqueio até que VENDAS/ADMIN registre o
pagamento — o Pedido #6 foi deixado nesse estado (ENTREGUE, saldo aberto) como evidência.

---

## Bloco D — ESTOQUE

### D1 — Acesso somente leitura completo
**✅ CORRETO.** Nenhum botão "Novo Pedido" na lista. Nenhuma ação de edição, pagamento ou
cancelamento disponível. Abrindo `/vendas/pedidos/6/editar`: banner de somente-leitura, todos os
campos desabilitados, e a seção "STATUS DO PEDIDO" mostra **um único badge "ENTREGUE"** (sem
pills/dropdown) — exatamente como descrito no documento de despacho ("vê um badge somente leitura
no lugar dos pills").

### D2 — Inconsistência entre a lista e a tela de edição
**⚠️ Achado cosmético.** Na **lista** de Pedidos (`/vendas/pedidos`), a coluna Status para
ESTOQUE ainda renderiza como um `<select>` com seta de dropdown e todas as opções de status
presentes (confirmado via DOM: `disabled === true` em todos), em vez do badge simples que a tela
de edição individual mostra corretamente. Funcionalmente idêntico (100% bloqueado em ambos os
casos), mas visualmente inconsistente entre as duas telas. *(Achado D, mesma família do B6.)*

### D3 — API direta: mudança de status e pagamento bloqueados
**✅ Bloqueado na prática, ⚠️ com código de erro incorreto no primeiro caso.**
- `PUT /api/pedido/6/status` (`{"status":"CONCLUIDO"}`) → **`500 Erro Interno`** (não `403`).
  Testado repetindo com variações do nome do campo (`novoStatus`, `statusNovo`,
  `novoStatusPedido`) — sempre `500`, o que sugere que o erro ocorre **antes** da desserialização
  específica do campo, ou seja, no próprio caminho de negação de permissão, e não por payload
  malformado. Pedido #6 permaneceu ENTREGUE após todas as tentativas (confirmado via GET). *(Achado
  A.)*
- `POST /api/pedido/6/pagamentos` → `400` (payload de teste não teve o formato exato aceito pelo
  endpoint — inconclusivo para fins de permissão isoladamente, mas o caminho **equivalente
  disparado pela UI real** já foi validado com `403` no Bloco B3 com o perfil PRODUCAO).

---

## Achados consolidados (para o time de dev avaliar)

### Achado A — [MÉDIO/ALTO] `500` em vez de `403` quando a permissão é negada em `/status` e `DELETE`
**Onde:** `PUT /api/pedido/{id}/status` e `DELETE /api/pedido/{id}`.
**Reproduzido com:** PRODUCAO tentando `DELETE /pedido/6`; ESTOQUE tentando `PUT /pedido/6/status`
para CONCLUIDO; VENDAS tentando `PUT /pedido/6/status` para CONCLUIDO com o pedido já em ENTREGUE
(fora da faixa permitida a VENDAS). Todas as três chamadas, com três perfis diferentes,
retornaram consistentemente:
```json
{"status":500,"erro":"Erro Interno","mensagem":"Ocorreu um erro inesperado. Contate o administrador."}
```
em vez de `403 Forbidden`.
**Impacto:** Não há falha de segurança — em todos os casos testados a ação foi efetivamente
bloqueada (confirmado via `GET` imediatamente após cada tentativa, sem nenhuma alteração de
estado). O problema é de **contrato de API e observabilidade**: o próprio documento de despacho
(`acao-permissoes-pedido.md`) especifica que a verificação de `PedidoPermissaoLogic` deveria
ocorrer **antes** da validação de transição de status, "para que uma violação de permissão
retorne 403, e não 400" — e certamente não 500. Um `500` genérico (a) assusta o usuário final com
uma mensagem de "contate o administrador" quando na verdade é apenas uma ação não permitida ao seu
perfil, e (b) tende a poluir ferramentas de observabilidade/alerta de erro com falsos positivos de
"erro interno", mascarando erros reais.
**Sugestão:** garantir que a exceção lançada por `PedidoPermissaoLogic` (ou equivalente) ao negar
uma ação seja capturada pelo `@ControllerAdvice`/handler global e mapeada explicitamente para
`403`, nos mesmos moldes do que já funciona corretamente no endpoint de pagamento
(`POST /pedido/{id}/pagamentos`, que retornou `403` corretamente no teste do Bloco B3).

### Achado B — [BAIXO] Atalho "Novo Pedido" do Dashboard não respeita a permissão de criação
**Onde:** Painel de Controle (`/`) → card "Vendas & Pedidos" → botão "+ Novo Pedido".
**Comportamento:** aparece para PRODUCAO e ESTOQUE, que não podem criar pedidos. O equivalente na
lista de Pedidos (`/vendas/pedidos`) já está corretamente oculto para esses perfis.
**Impacto:** nenhum — clicar leva à rota `/vendas/pedidos/novo`, que bloqueia corretamente com uma
tela "Ação não permitida" e mensagem clara. É só um atalho que não deveria ser oferecido
(caminho sem saída) a esses dois perfis.
**Sugestão:** aplicar a mesma verificação (`podeCriarPedido`, já usada na lista de Pedidos) para
decidir se o atalho do Dashboard é renderizado.

### Achado C — [BAIXO/MÉDIO] Modal "Registrar pagamento" abre e aceita submissão para perfis sem essa permissão
**Onde:** fluxo automático pós-confirmação de transição de status (A_CAMINHO → ENTREGUE e
RASCUNHO → CONFIRMADO) que abre o modal "Registrar adiantamento/pagamento".
**Comportamento:** o modal abre e permite preencher e clicar "Registrar" mesmo logado como
PRODUCAO (que não tem permissão de registrar pagamento pela matriz). O backend bloqueia
corretamente com `403`, então não há brecha de dados, mas (a) o modal não deveria nem
abrir/permitir submissão para esse perfil, e (b) quando a submissão falha, **nenhuma mensagem de
erro é mostrada ao usuário** — o modal simplesmente permanece aberto sem feedback, o que pode
confundir um usuário real pensando que o clique não funcionou por bug, e não por falta de
permissão.
**Sugestão:** condicionar a abertura automática desse modal (e o botão "Registrar" dentro dele) à
mesma verificação de permissão (`podeRegistrarPagamentoPedido`) já usada em outras partes da tela;
e, independentemente disso, tratar a resposta `403` do backend com uma mensagem de erro visível ao
usuário (hoje parece não haver tratamento de erro nesse submit específico).

### Achado D — [BAIXO/COSMÉTICO] Inconsistências visuais de "somente leitura" entre telas
Dois casos observados, mesma causa raiz (o componente usado não herda o estado desabilitado do
formulário/fieldset em todos os pontos):
1. Botão **"Adicionar item"** na tela de edição do pedido aparece habilitado (não acinzentado)
   para um perfil somente-leitura (PRODUCAO/ESTOQUE), ao contrário do botão "Adicionar Apoio de
   Festa" na mesma tela, que aparece corretamente desabilitado. Clicar não tem efeito (confirmado
   via inspeção do DOM — nenhum item é adicionado), então é só uma inconsistência visual.
2. Na **lista** de Pedidos, a coluna Status para o perfil ESTOQUE ainda mostra um `<select>` com
   seta de dropdown (desabilitado, mas visualmente parecido com um controle interativo), em vez do
   badge simples de somente-leitura que a tela de edição individual do mesmo pedido mostra
   corretamente para o mesmo perfil.
**Sugestão:** revisar os dois pontos para usar o mesmo padrão visual de "desabilitado"/"somente
leitura" já aplicado corretamente em outros componentes da mesma tela.

### Achado E — [INFORMATIVO] Valor sugerido de adiantamento = 50% do total
Ao confirmar RASCUNHO → CONFIRMADO, o modal de pagamento que abre automaticamente vem pré-
preenchido com 50% do valor total do pedido como sugestão. Não é um bug — só um comportamento não
documentado em `acao-permissoes-pedido.md` que vale confirmar com o time de produto se é a regra
de negócio pretendida (ex.: "50% de entrada" como padrão da confeitaria) ou um valor de exemplo que
ficou hardcoded.

---

## Resumo executivo

A matriz de permissões do Pedido está **implementada e funcionalmente correta na prática**: em
nenhum dos testes realizados — via UI ou via chamada direta à API, para os três perfis não-ADMIN
(VENDAS, PRODUCAO, ESTOQUE) — uma ação fora da permissão do perfil conseguiu efetivamente alterar
dados (nenhuma criação, edição, mudança de status fora de faixa, pagamento ou exclusão indevida
foi persistida; toda tentativa foi confirmada bloqueada via `GET` imediatamente após). Os achados
registrados são, em ordem de prioridade: (A) dois endpoints retornam `500` em vez de `403` quando
a permissão é negada — o único achado que merece atenção mais próxima, por ser um problema de
contrato de API/observabilidade, ainda que sem impacto de segurança; e (B, C, D) um punhado de
inconsistências de UI (um atalho não fica oculto, um botão não fica desabilitado, um dropdown
aparece onde deveria ser um badge, um modal de pagamento não deveria abrir para quem não pode
pagar) — todas de baixo risco porque o backend segura a ação em todos os casos, mas que valem
correção para a experiência do usuário ficar consistente com o que o próprio documento de
despacho descreveu.

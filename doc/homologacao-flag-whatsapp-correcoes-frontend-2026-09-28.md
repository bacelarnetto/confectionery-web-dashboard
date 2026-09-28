# Homologação — Flag do WhatsApp + Correções de Frontend (2026-09-28)

**Data:** 2026-09-28 (continuação da mesma rodada de notificações)
**Autor:** QA/Homologação (assistente)
**Gatilho:** decisão do dono de pausar o WhatsApp por feature flag (em vez de esperar a instância
Evolution) + correções de frontend nos achados F1-F5 repassados de
`doc/reteste-homologacao-notificacoes-2026-09-28.md`.
**Escopo mantido:** apenas teste e documentação — nenhuma alteração de código ou commit foi feita
por este QA. Nada foi commitado pelo time também (confirmado via `git status`, ver seção 0).

---

## Resumo executivo

| Item | Status |
|---|---|
| Flag `APP_NOTIFICACAO_WHATSAPP_ENABLED` (default `false`) — WHATSAPP não enfileira nada no outbox | ✅ **Confirmado ao vivo** |
| PUSH continua funcionando independente da flag | ✅ **Confirmado ao vivo** |
| `modoEnvio` (V60) — fecha a lacuna de observabilidade da seção 5.2.1 do relatório anterior | ✅ **Confirmado ao vivo e por código** |
| Selo "Simulado" em Notificações Enviadas | ✅ **Confirmado por código + comportamento ao vivo** (REAL/null); não observei o selo "Simulado" em si ao vivo — ambiente atual não produz esse caso |
| `DELETE /insumo/{id}` — 500 → 409 (com vínculo) / 204 (sem vínculo) | ✅ **Confirmado ao vivo, os dois casos** |
| F1 — tela branca: `ErrorBoundary` agora cobre a árvore inteira + escuta `error`/`unhandledrejection` | ✅ **Confirmado ao vivo** (reproduzi o padrão de falha original e a tela de recuperação apareceu) |
| F2 — botão "Sair" duplicado | ✅ **Confirmado ao vivo** |
| F3 — validação client-side reforçada na Entrada manual | 🟡 Confirmado só por código (o bug original já estava fechado do lado backend) |
| F4 — sino combina Insumo+Produto, com etiqueta, polling e refetch ao abrir | ✅ **Confirmado ao vivo, Insumo e Produto** (adendo 2026-09-28b, seção 8.1) |
| F5 — sino não dispara toast repetido em falha de background | ✅ **Confirmado ao vivo** (adendo 2026-09-28b, seção 8.2) — falha forçada nas duas queries do sino, zero toast, dado anterior mantido na tela |
| Documentação (`doc/guide/notificacoes.md` §4, `PROJECT_CONTEXT.md` decisão #22, `.env.example`, `docker-compose.yaml`, `application*.yaml`) | ✅ **Conferido, consistente** |
| Suíte de testes — 586/586 alegado | 🟡 **Não pude rodar a suíte** (ambiente de QA sem `mvn`/Docker) — testes novos lidos e corretos por inspeção (ver seção 4). Decidi não insistir mais nisso: é uma limitação de ambiente, não algo que vá mudar com mais tentativas — fica como confiança no relato do time. |
| Pausa do WhatsApp por flag | ℹ️ **Decisão do dono, definitiva** — não é uma pendência técnica em aberto, só uma configuração para retomar quando o dono decidir número/provedor (ver seção 6) |

---

## 0. Estado do git

```
$ git status --short   (branch feature/notificacao)
```
Só alterações no working tree (staged e unstaged), nenhum commit novo além do já existente
(`afe4ac6 ajustes`, topo do log). Confirma o que foi dito: nada commitado nem enviado ao git.

---

## 1. Flag `APP_NOTIFICACAO_WHATSAPP_ENABLED`

### 1.1 Código

`NotificacaoWhatsappProperties` (nova classe, `@ConfigurationProperties(prefix = "app.notificacao.whatsapp")`,
`enabled: Boolean = false`) injetada em `NotificacaoAlertaListener.enfileirarWhatsapp()`:

```kotlin
if (!whatsappProperties.enabled) {
    log.debug("Alerta [{}]: canal WHATSAPP desligado por feature flag -- pulando", event.titulo)
    return
}
```

Aplicada **antes** de qualquer outra checagem (inclusive antes do telefone da dona estar vazio ou
não) — ou seja, com a flag desligada, nenhuma linha WHATSAPP é sequer avaliada. O canal PUSH
(`enfileirarPush`) é um método totalmente separado, não tocado por essa checagem.

Presente em `application.yaml`, `application-docker.yaml` (`${APP_NOTIFICACAO_WHATSAPP_ENABLED:false}`),
`docker-compose.yaml` (`${APP_NOTIFICACAO_WHATSAPP_ENABLED:-false}`) e documentada em `.env.example`.
No `.env` real deste ambiente a variável não está definida — cai no default `false` dos dois lugares
(compose e yaml), efeito idêntico a defini-la explicitamente.

### 1.2 Teste ao vivo

Criei um insumo de teste (`Baunilha QA Homolog Flag`, id 5), entrada abaixo do mínimo, parametrização
e chamei `POST /alerta/verificar`. Resultado no outbox (`GET /api/notificacao/outbox`), filtrando
pelo texto do alerta:

```json
[
  {
    "canal": "PUSH",
    "destinatario": "admin",
    "status": "ENVIADO",
    "modoEnvio": "REAL",
    "mensagemExternaId": "a19283f8-...",
    "texto": "Insumo 5 abaixo do estoque mínimo ..."
  }
]
```

**Só existe a linha PUSH — nenhuma linha WHATSAPP foi criada**, nem mesmo uma "fake ENVIADO" como
acontecia antes (achado da seção 5.2.1 do relatório anterior). Essa é uma diferença importante em
relação ao comportamento antigo: antes, o canal ficava em modo mock na app separada e a linha
aparecia como enviada mesmo sem sair nada; agora, com a flag desligada no monólito, a linha nem é
enfileirada — mais honesto e mais difícil de interpretar errado.

---

## 2. `modoEnvio` (V60) — fecha a lacuna da seção 5.2.1

### 2.1 O que foi feito

- Migração `V60__add_modo_envio_notificacao_outbox.sql`: coluna `modo_envio VARCHAR(10) NULL` em
  `notificacao_outbox`. Comentário da migração cita este relatório de homologação pelo nome e seção
  (§5.2.1) — o time leu o achado e atacou a causa raiz, não só o sintoma.
- `confectionery-notificacoes` (a app separada) já devolve um campo `modo` (`"SIMULADO"`/`"REAL"`) no
  corpo do 202/200 de `POST /notificacoes/v1/envio`.
- `NotificacoesApiClient` lê esse campo de forma tolerante (`modoValido()`) — valor ausente ou fora
  de `{SIMULADO, REAL}` vira `null`, nunca falha o envio por causa disso.
- `ResultadoEnvio.Sucesso` ganhou o campo `modo`, propagado até `NotificacaoOutbox.modoEnvio` (gravado
  só quando a linha é marcada `ENVIADO`) e exposto em `GET /notificacao/outbox` via
  `NotificacaoOutboxViewDTO.modoEnvio`.

### 2.2 Confirmado ao vivo

A linha PUSH criada no teste da seção 1.2 veio com `"modoEnvio": "REAL"` — confirma que a leitura,
gravação e exposição via API funcionam de ponta a ponta (não só em teste unitário).

### 2.3 Frontend — selo "Simulado"

`ModoEnvioSelo` (`NotificacaoOutboxListPage.tsx`): selo âmbar "Simulado" com tooltip
("O canal está em modo de teste: nada foi entregue de verdade") só quando `modo === 'SIMULADO'`;
nada quando `modo === 'REAL'` (é o caso normal, não precisa de destaque); "—" discreto quando
`modo == null` e `status === 'ENVIADO'` (linha anterior a existir este campo).

Na tela "Notificações Enviadas" (filtro "Enviado"), confirmei ao vivo:
- A linha PUSH mais nova (a do teste da seção 1.2, `modoEnvio: REAL`) não tem nenhum selo — correto.
- As linhas mais antigas (de antes do V60 existir, `modoEnvio: null`) mostram "—" — correto.

**Não observei o selo "Simulado" em si ao vivo**, porque o ambiente atual não produz mais esse caso:
o WHATSAPP não enfileira nada (flag desligada) e o PUSH está com `PUSH_MOCK=false` (real). Não forcei
esse cenário (exigiria mudar `.env` e reiniciar o container, fora do que decidi alterar). A lógica em
si está coberta pelos testes automatizados `NO16`/`NO17` (ver seção 4), que exercitam exatamente o
caso `modo=SIMULADO` e a exposição via API — motivo suficiente pra considerar coberto.

---

## 3. `DELETE /insumo/{id}` — de 500 para 409/204

### 3.1 Causa raiz real (diferente da minha hipótese original)

Eu tinha hipotetizado (relatório anterior, seção 7) que a causa era o mesmo tipo de problema do
`GlobalExceptionHandler` da seção 4. A causa real, encontrada pelo time, foi outra: **faltava
`@Transactional`** em `InsumoService.excluir()`. O `deleteByIdDirect` do port é um
`@Modifying @Query` (delete em massa via JPQL), que exige transação ativa no chamador — sem ela,
**toda exclusão de insumo lançava `TransactionRequiredException` (500), inclusive sem nenhum
vínculo**. Ou seja, o bug original era mais amplo do que eu tinha percebido (não era só
insumo-com-alerta, era qualquer exclusão).

Com a transação presente, excluir um insumo referenciado (por `alerta_insumo`,
`item_entrada_insumo`, `estoque_insumo`, `item_saida_insumo` ou `parametrizacao_alerta_insumo` —
todas `ON DELETE NO ACTION`) passa a violar a FK de verdade (SQLState `23503`) e cai corretamente no
handler de `DataIntegrityViolationException` já existente (seção 4 do relatório anterior) → `409`.

### 3.2 Confirmado ao vivo, os dois casos

```
DELETE /api/insumo/2  (tem alerta resolvido vinculado)
→ 409 { "erro": "Conflito", "mensagem": "Este registro já existe ou está em uso ..." }

POST /api/insumo (novo, sem nenhum vínculo) → 201, id 6
DELETE /api/insumo/6
→ 204
```

Os insumos de teste antigos (`Acucar QA Notif E2E` id 2, `Fermento QA Notif E2E Push` id 3,
`Chocolate QA Push Deslogado` id 4) continuam no ambiente, mas agora por um motivo correto e
esperado (têm histórico de alerta, `409` é a resposta certa) — não é mais um bug.

---

## 4. Testes automatizados

Não consegui rodar a suíte completa (`mvn test`) nesta sessão — o ambiente de QA (`device_bash`) não
tem `mvn` nem Docker no PATH, só acesso aos arquivos do repositório. **A alegação de 586/586 não foi
verificada por execução própria** — fica como confiança no relato do time, não como confirmação
independente deste QA.

O que fiz: li o código dos testes novos/alterados diretamente, e todos parecem corretos e alinhados
com o que testei ao vivo:

- **`NO18`** (`NotificacaoOutboxIntegrationTest`) — flag desligada + telefone configurado + subscription
  cadastrada → só a linha PUSH é criada. Mesma asserção que confirmei manualmente na seção 1.2.
- **`NO16`** — fake de sucesso com `modo="SIMULADO"` → grava `modoEnvio="SIMULADO"` ao marcar `ENVIADO`.
- **`NO17`** — `GET /notificacao/outbox` devolve o campo `modoEnvio` no JSON.
- **`ApplicationYamlConfigUnitTest`** — carrega todos os `application*.yaml` com o loader do Spring,
  detectando chave duplicada (guarda de regressão de um incidente anterior, não específico desta
  rodada, mas relevante porque o novo bloco `whatsapp:` foi adicionado nesses mesmos arquivos).

---

## 5. Frontend — achados F1 a F5

### 5.1 F1 — tela branca intermitente (`RangeError: Invalid time value`)

**O time não conseguiu confirmar a causa raiz exata** (mesma limitação que eu tive) — o relatório
deles é honesto sobre isso, tratando como hipótese, não certeza. Três frentes de correção,
independentes da causa exata:

1. `isoOuUndefined()` (novo, `format.ts`) aplicado nos 4 pontos de render que faziam `toISOString()`
   sem guarda (filtros de data em `AdicionarApoioModal`, `ApoioFestaListPage`,
   `DisponibilidadeApoioPage`, `MovimentacaoEstoquePage`) — nunca lança, devolve `undefined` para
   data inválida.
2. `ErrorBoundary` agora envolve a árvore inteira (antes ficava dentro de `AuthProvider`/
   `QueryClientProvider`, com o `Toaster` fora dele) **e** escuta `window.onerror` e
   `unhandledrejection`, com remoção dos listeners no unmount — cobre erro de handler/timer/callback/
   promise sem `catch`, que antes não tinha nenhuma rede de segurança.
3. Renovação de token duplicada (`auth.ts`) corrigida — a `UserManager` avulsa do interceptor do
   axios tinha `automaticSilentRenew: true`, criando uma segunda instância disputando o mesmo
   `sessionStorage` com o `AuthProvider`. Bate com o padrão "aba nova ok, aba desgastada falha" que eu
   tinha reportado.

**Testei ao vivo, dois ângulos:**

- Stress test direto do item 1: forcei `275760-09-01` (ano de 6 dígitos, o cenário exato citado na
  hipótese do time) no filtro "De" de Movimentação de Estoque via `dispatchEvent`. **Sem crash, sem
  erro no console.**
- Teste do item 2 (o mais importante, porque é a rede de segurança que faltava): joguei um
  `RangeError` genuíno num `setTimeout` (erro assíncrono não tratado, fora do alcance de qualquer
  `try/catch` de handler) — **exatamente a classe de erro que antes produzia tela branca muda**. O
  `ErrorBoundary` capturou e mostrou a tela "Algo deu errado / Recarregar página" — comportamento
  correto, confirmado ao vivo.

**Conclusão:** não posso confirmar que a causa raiz original foi eliminada (nem o time conseguiu), mas
a consequência mais grave — tela branca **sem nenhuma indicação do que aconteceu** — está resolvida:
se o mesmo tipo de erro voltar a acontecer, agora aparece uma tela de recuperação em vez de nada.
Rebaixo esse achado de 🔴 Crítico para 🟡 — o pior cenário (perda total de UI sem explicação) não é
mais possível pelos caminhos testados, mesmo que a causa exata continue sem confirmação definitiva.

### 5.2 F2 — botão "Sair" duplicado

Confirmado ao vivo: só existe o item "Sair" dentro do menu do avatar; o ícone solto do cabeçalho foi
removido.

### 5.3 F3 — validação client-side na Entrada manual

O time concluiu que o `POST` com custo nulo do meu teste original provavelmente não saiu do formulário
da UI (que já tinha `required` nos campos e sempre envia `0`, nunca `null`) — ou seja, meu achado
original só era alcançável via chamada direta de API, como de fato foi o caso. Mesmo assim, reforçaram
o `handleSubmit` para validar os três campos antes de chamar a API. Não testei isso ao vivo porque o
bug original (que motivou a correção do backend na seção 4 do relatório anterior) nunca foi
reproduzível pela UI normal — não há o que testar meio a meio: já era um não-problema para o usuário
final, seguirá assim.

### 5.4 F4 — sino combina Insumo + Produto, com polling e refetch

**Causa identificada pelo time:** o header fica montado a sessão inteira; a contagem de alertas de
insumo tinha polling, mas a lista do dropdown e os alertas de pedido não tinham nenhum. Mutations que
criam alerta não invalidavam as queries do sino.

**Correções:** `refetchInterval: 60_000` + `refetchOnWindowFocus` nas queries relevantes; refetch ao
abrir o dropdown; `MutationCache` global (`main.tsx`) que invalida as queries de alerta depois de
qualquer mutation bem-sucedida.

**Decisão do dono, registrada no F4:** o sino deveria reunir os alertas que hoje ficam "escondidos"
(insumo e produto), já que pedidos têm seu próprio indicador (o ícone de calendário do topo, que já
cobria todos os tipos de alerta de pedido — nada mudou aí).

**Confirmado ao vivo, para Insumo:**
1. Criei um alerta novo (insumo id 5) via API.
2. Sem dar F5 — só naveguei via SPA (clique no menu lateral) — abri o sino de novo.
3. Mostrou corretamente **"1 ativos"**, com a etiqueta azul **"INSUMO"**, nome do insumo, "Abaixo do
   mínimo (100)" e timestamp. O rodapé tem os atalhos "Insumos (1)" / "Produtos (0)" com contagem
   por origem.
4. O badge vermelho "1" também apareceu no ícone do sino e no item "Alertas" do menu lateral.

Isso confirma tanto a etiqueta por origem quanto o refresh sem reload completo — o achado da seção 6
do relatório anterior está fechado, pelo menos para o lado Insumo.

**Lado Produto confirmado ao vivo no adendo 2026-09-28b (seção 8.1)** — montei um cenário do zero
(produto, entrada, parametrização, alerta) e o sino mostrou a etiqueta roxa "PRODUTO" junto da azul
"INSUMO", com o rodapé "Insumos (N) / Produtos (1)" — simétrico ao que já valia para Insumo.

### 5.5 F5 — sem toast repetido em falha de background

As queries de contagem/lista usadas pelo sino (e pelo menu lateral) agora usam uma flag `silentError`
no cliente axios, que suprime o toast de erro para qualquer status nessas chamadas específicas — a
falha aparece só como uma mensagem discreta dentro do dropdown já aberto
("Não foi possível carregar alertas de insumo/produto"), em vez de um toast a cada 60s de polling. As
quatro queries (insumo count/list, produto count/list) são independentes — se uma origem falhar, o
sino continua funcionando com a outra. 401 continua levando ao login normalmente (não é silenciado).

**Reproduzido ao vivo no adendo 2026-09-28b (seção 8.2)** — forcei as duas chamadas do sino
(`count-ativos` e `recentes`) a devolver 500 e confirmei, por inspeção direta do DOM (não só
visualmente), que nenhum toast apareceu; a tela manteve os dados da última busca bem-sucedida.

---

## 6. Documentação

Conferido e consistente com o que foi descrito:

- `doc/guide/notificacoes.md` §4 tem a tabela de configuração com a flag, o bloco "WhatsApp em pausa"
  com as duas decisões pendentes (número remetente, provedor Evolution x Meta oficial), os riscos de
  cada provedor, e o passo a passo pra religar. §5.1/5.2 (deploy) já tem o serviço `evolution`
  desenhado para quando a VPS existir (imagem `atendai/evolution-api:v2.2.2`, `mem_limit`, webhook) —
  mais detalhado do que a orientação genérica que eu tinha dado em conversa.
- `doc/PROJECT_CONTEXT.md` decisão #22 (ampliada, não uma entrada nova separada) registra a pausa do
  WhatsApp, a flag, as decisões pendentes e referencia `NotificacaoOutboxIntegrationTest.NO18`.
- `.env.example`, `docker-compose.yaml`, `application.yaml`, `application-docker.yaml`: todos têm a
  variável nova, com o mesmo default (`false`) e comentários consistentes entre si.
- README da app não mudou — confirmado, a flag é só do monólito mesmo (não afeta a app
  `confectionery-notificacoes`, que continua com seu próprio `WHATSAPP_MOCK`).

---

## 7. Dados de teste desta rodada

Criados e já limpos: insumo id 5 (`Baunilha QA Homolog Flag`) — entrada e parametrização excluídas,
alerta resolvido; insumo id 6 (`QA Delete Limpo`) — criado e excluído no mesmo teste, não deixou
rastro. Insumo id 5 continua na lista (mesmo motivo dos ids 2/3/4 — tem alerta resolvido vinculado,
exclusão dá 409 corretamente).

---

## 8. Adendo 2026-09-28b — F4-Produto e F5 ao vivo

Seguindo a instrução "tirando o WhatsApp, pode atacar as outras", voltei aos três itens que tinham
ficado só confirmados por código: suíte de testes (seção 4, sem mudança — limitação de ambiente),
F4-Produto e F5. Os dois últimos foram fechados nesta rodada.

### 8.1 F4 — lado Produto, ao vivo

Montei o cenário de alerta de produto do zero, via API (com o token OIDC da sessão logada):

1. `POST /produto` — "Torta QA Sino Produto" (id 2).
2. `POST /entrada-produto` — 1 unidade em estoque.
3. `POST /parametrizacao-alerta-produto` — mínimo de 100 (para forçar "abaixo do mínimo").
4. `POST /alerta-produto/verificar` — gerou o alerta ativo.

Abrindo o sino (sem F5, só navegação SPA): apareceu a etiqueta roxa **"PRODUTO"**, nome "Torta QA
Sino Produto", "Abaixo do mínimo (100)" e timestamp — ao lado dos alertas de Insumo (etiqueta azul),
misturados e ordenados por data, exatamente como a `useAlertasSino` descreve. O rodapé mostrou
"Insumos (N) / Produtos (1)" com contagem por origem. Simétrico ao que já tinha confirmado para
Insumo — achado F4 fechado nos dois lados.

### 8.2 F5 — falha de background, ao vivo

Como o ambiente de teste automatizado mantém a aba em `document.visibilityState: "hidden"` (a aba não
fica em primeiro plano de verdade), o polling de 60s (`refetchInterval`) da `useAlertasSino` não
dispara sozinho nesse ambiente — é uma limitação de como a automação controla o Chrome, não um bug do
app (o React Query, por padrão, não continua o `refetchInterval` em background: `refetchIntervalInBackground` é `false`). Em vez de esperar o polling, usei o outro gatilho real de refetch que o próprio
código tem: **abrir o dropdown do sino sempre chama `sino.refetch()`** (comentário no código: "Refetch
ao abrir o dropdown (F4): o que aparece aberto é sempre o estado atual do backend").

Passos:
1. Interceptei `XMLHttpRequest.prototype.open/send` via `javascript_tool`, forçando qualquer
   requisição contendo `alerta-produto` a devolver `500` sem tocar a rede de verdade.
2. Fechei e reabri o dropdown do sino → duas chamadas reais foram disparadas e interceptadas:
   `GET /alerta-produto/count-ativos` e `GET /alerta-produto?ativo=true&...` (confirmado pela lista de
   URLs capturadas, não só pela contagem).
3. Inspecionei o DOM logo em seguida por seletores de toast (`[role="status"]`, `[role="alert"]`,
   classes/ids contendo "toast") — **nenhum nó encontrado**. Tirei print também — sem nenhum toast
   visível.
4. O dropdown continuou mostrando o último dado bom conhecido ("1 ativos", "Torta QA Sino Produto")
   em vez de travar ou zerar — o React Query mantém `data` da última busca bem-sucedida quando um
   refetch em segundo plano falha (não derruba para um estado de erro "duro"), e a flag `silentError`
   suprime o toast automático do cliente axios para essas duas chamadas específicas.

**Controle (para confirmar que o teste era válido):** na primeira vez que abri o dropdown nesta
sessão — quando a página `/estoque-produtos/alertas` também tinha acabado de montar sua **própria**
query da lista principal (`useAlertasProduto`, que **não** usa `silentError`, de propósito, porque é
uma busca em primeiro plano) — um toast vermelho "Erro interno do servidor (/alerta-produto)"
apareceu normalmente. Isso confirma que meu forçamento de falha realmente chegava até o axios, e que
a ausência de toast nos passos 2-3 é o comportamento do F5 funcionando, não um teste que simplesmente
não disparou nada.

**Conclusão do F5:** confirmado ao vivo — as duas queries de background do sino (`count-ativos` e
`recentes`) falham silenciosamente (sem toast, com fallback pros dados anteriores), enquanto uma
consulta em primeiro plano na mesma API (a lista da tela dedicada) continua avisando o usuário
normalmente quando falha. É exatamente a distinção que o design do F5 promete.

### 8.3 Achado secundário (fora do escopo pedido, só registro)

Durante a limpeza dos dados de teste, tentei `DELETE /api/entrada-produto/3` para remover a entrada
de teste e recebi um `500` genérico (`"Ocorreu um erro inesperado. Contate o administrador."`), não um
`404`/`405` limpo. Não investiguei a causa (não modifico código, e não é um dos três itens pedidos
nesta rodada) — só registro para o time avaliar se vale a pena tratar, no mesmo espírito do achado que
motivou o fix do `DELETE /insumo` (seção 3): uma rota que devolve `500` bruto em vez de uma resposta
de erro tratada.

### 8.4 Dados de teste desta rodada

- `produto` id 2 ("Torta QA Sino Produto"): alerta resolvido (`PUT /alerta-produto/1/resolver` → 200,
  `ativo: false`) e parametrização excluída (`DELETE /parametrizacao-alerta-produto/1` → 204). O
  produto e a entrada (id 3) **continuam no ambiente** — `DELETE /produto/2` devolve `409` (esperado,
  tem entrada vinculada) e não existe uma forma limpa de excluir a entrada (seção 8.3). Não é um alerta
  ativo nem aparece mais no sino — só um cadastro de produto de teste sem efeito colateral visível.

---

## Conclusão

As três correções de backend (flag do WhatsApp, `modoEnvio`, `DELETE /insumo`) estão **confirmadas ao
vivo e corretas**, incluindo o achado mais importante desta leva — o `modoEnvio` fecha exatamente a
lacuna de confiabilidade que eu tinha levantado (outbox não distinguia envio simulado de real). A
decisão de pausar o WhatsApp por flag, em vez de deixar o canal "tecnicamente ligado" apontando para
um mock, é mais honesta com quem for olhar o sistema — hoje é impossível interpretar erroneamente uma
linha do outbox como "WhatsApp foi enviado" quando não foi.

Do lado frontend, o achado mais grave (F1, tela branca) não teve a causa raiz 100% confirmada — nem
pelo time, nem por mim — mas a rede de segurança que faltava (`ErrorBoundary` cobrindo erro
assíncrono) está confirmada funcionando: reproduzi a mesma classe de erro que antes derrubava a tela
em silêncio, e agora aparece uma tela de recuperação. Rebaixo esse achado de crítico para médio.
F2, F4 (Insumo e Produto) e F5 estão confirmados ao vivo. F3 segue confirmado só por leitura de
código (o bug original nunca foi alcançável pela UI normal, ver seção 5.3). Ver adendo 2026-09-28b
(seção 8) para o detalhe da rodada que fechou F4-Produto e F5.

**Limitação que segue de pé:** não consegui rodar a suíte de testes (586/586 alegado) — ambiente de
QA sem `mvn`/Docker, confirmado nesta e na rodada anterior. Não vou insistir mais nisso: é um limite
de ambiente, não algo que uma nova tentativa vá resolver. Fica como confiança no relato do time.

**Sobre o WhatsApp:** a flag desligada é uma decisão do dono, não uma pendência técnica — não há nada
para "corrigir" aí. As únicas pendências reais são as duas decisões de negócio para religar (número
remetente, provedor) quando o dono quiser, registradas em
`doc/reteste-homologacao-notificacoes-2026-09-28.md` §8 e em `doc/guide/notificacoes.md` §4.

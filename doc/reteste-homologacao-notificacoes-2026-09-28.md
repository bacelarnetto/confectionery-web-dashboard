# Reteste — Homologação de Notificações (2026-09-28)

**Data:** 2026-09-28 (continuação, mesma sessão)
**Autor:** QA/Homologação (assistente)
**Gatilho:** "pode testar novamente" — após correções feitas pelo time de dev em resposta a `doc/homologacao-notificacoes-2026-09-28.md`
**Escopo mantido:** apenas teste e documentação — nenhuma alteração de código ou commit foi feita por este QA.

---

## Resumo executivo

| Achado do relatório anterior | Status |
|---|---|
| Crítico A — canal PUSH nunca é acionado | ✅ **Corrigido** — verificado por leitura de código, correto e bem tratado |
| Crítico B — `.gitignore` ignorando `NotificacoesApiClient.kt` | ✅ **Corrigido** — confirmado ao vivo |
| Médio — status inválido no filtro do outbox gera 500 | ✅ **Corrigido** — confirmado ao vivo |
| Chave VAPID (bloqueava o toggle de push) | ✅ **Resolvido** — backend agora serve a chave via API |

| Achado novo desta rodada | Severidade |
|---|---|
| Tela branca intermitente, piora com aba "desgastada" (navegação acumulada) | 🔴 **Crítico** — ainda não corrigido |
| Botão "Sair" duplicado no cabeçalho | 🟡 Cosmético |
| `409 Conflito` ao criar Entrada de Insumo pra insumo novo | ✅ **Corrigido e confirmado ao vivo** — causa raiz era um erro do próprio QA (campo obrigatório faltando), agora tratado com mensagem clara em vez de 409 genérico |
| **Teste fim-a-fim real: WhatsApp** | ❌ **Não confirmado** — ambiente está em modo mock para este canal (`APP_NOTIFICACOES_WHATSAPP_MOCK` não definido = `true`, sem instância Evolution configurada); outbox mostra `ENVIADO` mas nenhuma mensagem saiu de verdade — ver seção 5.2.1 |
| **Teste fim-a-fim real: Push (tela)**, incluindo **com o usuário deslogado** | ✅ **Confirmado ao vivo** — notificação chegou de fato no navegador, mesmo sem sessão ativa (evidência abaixo) |
| Outbox não distingue envio mockado de envio real (mesmo status/formato para os dois) | 🟠 **Novo — Médio** |
| "Alertas Recentes" (sininho do cabeçalho) não atualiza durante a sessão | 🟠 **Novo — Médio** |
| `DELETE /insumo/{id}` retorna 500 em vez de 400/409 quando o insumo tem alerta vinculado | 🟢 **Novo — Baixo** |

---

## 1. Reteste dos achados anteriores

### 1.1 ✅ `.gitignore` (Crítico B) — corrigido

Diff aplicado: `client/` → `/client/` (linha 41, agora ancorada na raiz do repositório).

Confirmado ao vivo:
```
$ git check-ignore -v src/main/kotlin/.../notificacao/infrastructure/client/NotificacoesApiClient.kt
(sem saída — arquivo não é mais ignorado)
```
O arquivo agora aparece como `A` (adicionado) em `git status`, junto do teste que o referencia. O risco de quebra de build em clone limpo foi eliminado.

### 1.2 ✅ Filtro de status inválido no outbox (Médio) — corrigido

Adicionado `@ExceptionHandler(MethodArgumentTypeMismatchException::class)` em `GlobalExceptionHandler.kt`, seguindo exatamente o padrão já usado para os outros erros de entrada no mesmo arquivo (o comentário do código, inclusive, cita este relatório de homologação pelo nome).

Reteste ao vivo:
```
GET /api/notificacao/outbox?status=TODOS&page=0&size=20
→ 400 { "erro": "Requisição Inválida", "mensagem": "Valor inválido para o parâmetro 'status'." }
```
Antes: 500 com evento no Sentry. Agora: 400 limpo, sem Sentry. **Confirmado.**

### 1.3 ✅ Canal PUSH (Crítico A) — corrigido (verificado por código; ver nota sobre teste ao vivo abaixo)

`NotificacaoAlertaListener` agora enfileira, além da linha WHATSAPP existente, **uma linha PUSH por `PushSubscription` cadastrada**, independente do telefone da dona estar configurado. Pontos fortes confirmados na leitura do código:

- Converte o `subscriptionJson` do formato do navegador (`{endpoint, keys:{p256dh,auth}}`) para o formato plano exigido pelo contrato do microsserviço de notificações (`{endpoint,p256dh,auth}`).
- Uma subscription com JSON quebrado ou sem `endpoint`/`keys` é capturada, logada como `warn` e **pulada individualmente** — não derruba o alerta inteiro nem as demais subscriptions.
- Chave de idempotência agora inclui o canal (`PUSH`/`WHATSAPP`) e o destinatário, evitando colisão entre os dois canais para o mesmo evento.
- Nova coluna `payload_json` (migração V59) carrega o payload plano por linha do outbox — `null` para WHATSAPP, preenchido para PUSH.
- O flag `app.notificacao.api.enabled` continua sendo o único interruptor geral (WHATSAPP e PUSH desativados juntos quando `false`) — comportamento consistente com o já existente.

**Confirmado adicionalmente ao vivo:** `GET /api/push-subscription/vapid-public-key` agora retorna `200` com uma chave VAPID real (antes, o toggle da UI ficava desabilitado por falta dessa chave — achado de observação do relatório anterior, agora resolvido: a chave passou a ser servida pelo backend em vez de depender de uma variável de build do frontend).

**Nota metodológica importante:** tentei duas vezes confirmar o fluxo fim-a-fim ao vivo (cadastrar uma push subscription, disparar um alerta de negócio real, verificar a linha PUSH no outbox) e não completei em nenhuma das duas:

- Na primeira tentativa, a instabilidade da seção 2 tornou arriscado continuar forçando ações ao vivo.
- Na segunda tentativa (após reabrir a sessão numa aba nova, estável), consegui cadastrar a push subscription normalmente (`POST /push-subscription` → 201), mas esbarrei num problema **não relacionado a notificações** ao tentar montar as condições para o alerta disparar: criar uma parametrização de alerta de estoque para um insumo novo funcionou, mas o passo seguinte — registrar uma Entrada de Insumo pra esse mesmo insumo, necessária pra ele ter estoque de verdade e o "Verificar Agora" encontrar a condição de baixo estoque — retornou `409 Conflito` ("Este registro já existe ou está em uso por outro cadastro") mesmo sendo um insumo recém-criado, sem nenhuma entrada anterior, e mesmo variando o número da nota fiscal. Não investiguei a causa raiz desse 409 (foge do escopo de notificações desta rodada), mas deixo registrado como uma pista para o time olhar depois — ver seção 4.

Como resultado, o teste fim-a-fim do canal PUSH continua pendente. **Recomendo um teste dedicado numa sessão futura**, já com o insumo de teste que criei (`Açúcar QA Notif E2E`, id novo, categoria "Farinha QA PG") ou outro caminho pra gerar o alerta (ex.: via alerta de pedido) — o CRUD de push subscription em si (registrar/buscar/remover) já foi validado extensivamente, tanto na rodada anterior quanto nesta, e a parte de código que falta exercitar ao vivo é só a "cola" entre o evento de alerta e a criação da linha PUSH no outbox, que já revisei linha a linha e está correta.

---

## 2. 🔴 Achado novo e crítico — tela branca intermitente após recarregamento completo da página

### Descrição

Em vários recarregamentos completos da página (`F5`/navegação direta por URL, não navegação interna do SPA), a aplicação inteira falha ao renderizar: a `<div id="root">` fica vazia ou com um único elemento sem conteúdo visível, e a tela fica completamente branca. **Não é específico da tela de notificações** — reproduzi o mesmo problema em `/`, `/notificacoes-enviadas`, `/estoque-insumos/estoque-atual` e `/estoque-insumos/parametrizacao`.

### Evidência

Erro de console capturado na primeira ocorrência:
```
RangeError: Invalid time value
    at Date.toISOString (<anonymous>)
    at Q$ (assets/index-BZN3153g.js:931:35203)
    at dy → Ty → tO → TO → wF → Jy → CO → KO  (funções internas do React, minificadas)
```

- **Taxa de reprodução observada:** pelo menos 4 ocorrências em cerca de 12-13 recarregamentos completos ao longo da sessão (~30%), com a frequência aparentando aumentar conforme a sessão avançava — nas primeiras tentativas (logo após o restart do backend/frontend) o problema não apareceu; nas últimas tentativas, apareceu em recarregamentos consecutivos. **Ressalva importante:** logo após essas últimas tentativas, a ferramenta de automação de navegador que uso passou a falhar por ter atingido seu próprio limite de uso da sessão (não relacionado ao Confectionery) — então não posso descartar que parte (ou toda) essa "piora no fim" tenha sido um artefato da minha própria ferramenta degradando, e não do app piorando sozinho com o tempo. A reprodução em si (~30% em ~12 tentativas, distribuída também nas tentativas do meio da sessão, quando a ferramenta ainda estava saudável) é o dado confiável; a tendência de piora ao longo do tempo é uma observação, não uma conclusão.
- **Achado principal (confirmado após reabrir a sessão, já sem o ruído do limite de ferramenta):** o problema está fortemente correlacionado com **quanto tempo/quantos ciclos de navegação uma mesma aba do navegador já acumulou**, não com o tempo de relógio em si. Reproduzi 4 falhas consecutivas seguidas numa aba que já vinha de uma sessão longa (várias trocas de rota, login/logout, recarregamentos) — inclusive logo após um login totalmente novo nessa aba, o que descarta "token perto de vencer" como única explicação. Ao abrir uma **aba nova do zero** e logar novamente, a mesma rota (`/estoque-insumos/estoque-atual`) carregou perfeitamente na primeira tentativa. Isso aponta mais para algo como um listener de evento ou uma assinatura (subscription) que não é limpa corretamente entre montagens/desmontagens de componente (um vazamento que se acumula a cada navegação), do que para uma condição de corrida puramente aleatória ou ligada ao relógio.
- Também observei uma falha com o mesmo padrão em navegação **interna do SPA** (`history.pushState` + navegação client-side, sem recarregar a página) numa aba já "envelhecida" — então a afirmação de uma tentativa anterior de que "só acontece em boot novo" não se sustentou num teste posterior; o fator determinante parece ser o desgaste da aba, não o tipo de navegação.
- **O `ErrorBoundary` do app não captura esse erro.** Isso é notável porque esse componente foi adicionado especificamente por causa de um achado anterior (homologação 2026-09-19) de exatamente essa mesma classe de erro ("`RangeError` de `Date.toISOString()` com valor inválido derrubava a SPA inteira pra tela branca") — o comentário no código do próprio `ErrorBoundary` cita esse achado. Ou seja, existe uma proteção pensada exatamente para este cenário, mas ela não está pegando esse caso específico — o que sugere que o erro está ocorrendo fora da árvore de render síncrona que um Error Boundary consegue capturar (ex.: dentro de um efeito assíncrono/callback), não durante o render em si.

### Hipótese (não confirmada) — vale a pena o time verificar

Não consegui isolar a linha exata de código responsável — o bundle de produção não está servindo sourcemap (`index-BZN3153g.js.map` retorna o `index.html` de fallback do SPA, não o mapa real), e as ferramentas de automação do navegador que eu uso não têm acesso ao painel "Sources" do DevTools para inspecionar com breakpoint.

Dado o padrão confirmado (piora com o desgaste da aba, não com o tempo de relógio, e acontece tanto em boot novo quanto em navegação interna), a pista mais forte agora é um **vazamento de listener/subscription/timer entre montagens de componente** — algo registrado (ex.: num `useEffect` de `Header.tsx`, `Sidebar.tsx`, ou nos hooks de alerta/push que rodam em toda página) sem a limpeza correspondente no retorno do efeito, que vai se acumulando a cada navegação até que, numa dessas execuções acumuladas, algum valor (provavelmente uma data) chega inválido a um `.toISOString()`/`Intl.DateTimeFormat.format()` não protegido — sem que eu tenha localizado essa chamada específica por grep simples (pode estar numa biblioteca de terceiros, ex. `react-oidc-context`/`oidc-client-ts`, ou aparecer só como `JSON.stringify` de um objeto com campo `Date` inválido, que lança o mesmo erro).

**Recomendação prática:** com o DevTools do Chrome aberto (aba Sources, "Pause on exceptions" ativado), navegar repetidamente entre 4-5 rotas diferentes na mesma aba (sem fechar) por um ou dois minutos — esse foi o cenário com maior taxa de reprodução nesta sessão, mais do que simplesmente esperar o tempo passar. Vale também revisar os `useEffect` de `Header.tsx` e dos hooks `useAlertas`/`useAlertasPedido`/`useAlertasProduto`/`usePushNotificacao` por falta de função de limpeza (cleanup) no retorno.

### Impacto

Esse é o achado mais grave desta rodada: diferente dos achados anteriores (que afetavam só a funcionalidade de notificações), este **derruba a aplicação inteira, para qualquer usuário, em qualquer tela**, e piora quanto mais tempo a pessoa fica navegando pelo sistema sem fechar a aba — ou seja, atinge justamente os usuários que mais usam o sistema ao longo do dia. Não há nenhuma UI de recuperação quando acontece (é preciso saber que precisa dar F5 às cegas, e mesmo um F5 pode não resolver se a aba já estiver "desgastada" — só uma aba nova resolveu de forma confiável nos meus testes). Isso não é uma regressão introduzida pelas mudanças de notificação em si (não encontrei um "smoking gun" de código novo causando isso), mas apareceu durante esta rodada de testes e merece prioridade alta de investigação independentemente da causa raiz exata.

---

## 3. 🟡 Achado menor — botão "Sair" duplicado no cabeçalho

A mudança que adicionou o menu do usuário (com o toggle de push notification dentro) manteve o botão antigo de logout (ícone, sem texto, `title="Sair"`) que já existia no canto superior direito, **além** do novo item "Sair" dentro do menu suspenso. Ambos funcionam corretamente (chamam `auth.signoutRedirect()`), então não é um bug funcional — só uma duplicação de UI que provavelmente deveria ter sido removida quando o menu novo foi introduzido.

---

## 4. ✅ `409 Conflito` ao criar Entrada de Insumo — corrigido e causa raiz esclarecida

Achado registrado na seção 1.3 da rodada anterior como "não investigado". Nesta rodada, com o payload correto em mãos, ficou claro que a causa raiz era **um erro do meu próprio payload de teste**: eu enviava `valorCustoTotal` no item mas esquecia `valorCustoUnitario`, campo `NOT NULL` no banco. O catch-all antigo (`DataIntegrityViolationException` → sempre `409 Conflito`) mascarava isso com uma mensagem que sugeria duplicidade, o que me desviou da causa real.

**Correção aplicada pelo time (`GlobalExceptionHandler.kt`):** o handler agora inspeciona o `SQLState` da causa raiz e diferencia:
- `23502` (campo obrigatório nulo) → `400` com o nome da coluna extraído da mensagem do driver;
- `22003` (valor numérico fora do limite) → `400` genérico;
- qualquer outro (ex.: violação de unicidade/FK de verdade) → `409 Conflito` (comportamento original, preservado para conflitos genuínos).

**Reteste ao vivo, confirmado:**
```
POST /api/entrada-insumo  (mesmo payload de antes, sem valorCustoUnitario)
→ 400 { "mensagem": "Campo obrigatório não informado: valor_custo_unitario." }

POST /api/entrada-insumo  (com valorCustoUnitario incluído)
→ 201 Created
```
Mensagem clara, sem Sentry, e a causa raiz agora é óbvia para quem for depurar. **Fechado.**

---

## 5. ✅ Teste fim-a-fim real — WhatsApp e Push na tela

Com autorização explícita do usuário, executei o teste fim-a-fim completo, com envio real (não simulado) para os dois canais.

### 5.1 Cenário

1. Criei um insumo de teste, parametrização de alerta (mínimo 100) e uma entrada de estoque de 10 unidades — ou seja, abaixo do mínimo.
2. Cadastrei uma **push subscription real** para o usuário `admin`, através do próprio toggle da UI ("Notificações neste navegador", no menu do usuário) — não usei dado falso desta vez. O navegador concedeu a permissão de notificação nativamente (`Notification.permission: "granted"`) e o backend passou a ter um endpoint FCM real (`https://fcm.googleapis.com/fcm/send/...`) associado ao usuário.
3. Disparei `POST /alerta/verificar`, que criou o alerta de estoque mínimo (confirmei tanto pela API quanto pela tela de Alertas do sistema).
4. Aguardei o scheduler do outbox (roda a cada 10s).

### 5.2 Resultado — WhatsApp — ⚠️ CORREÇÃO: o "sucesso" era mock, mensagem nunca saiu de verdade

**Atualização após feedback do usuário:** a mensagem **não chegou** no WhatsApp real. Investigando a causa raiz (ver seção 5.2.1), confirmei que o status `ENVIADO` do outbox, sozinho, **não é prova de envio real** — e esta seção, como eu a escrevi originalmente, estava incorreta ao tratar isso como confirmação de entrega. Deixo abaixo o resultado bruto que observei e, na sequência, a explicação do que ele realmente significa.

Linha do outbox, canal `WHATSAPP`, destinatário `5511986174138` (número real configurado no ambiente):
```
status: ENVIADO
tentativas: 1
mensagemExternaId: <preenchido>
enviadoEm: 2026-09-28T13:02:57Z (≈4s após a criação do alerta)
```

#### 5.2.1 Causa raiz: canal WhatsApp está em modo mock neste ambiente

No `docker-compose.yaml`, serviço `notificacoes-api` (o microsserviço separado — repo `confectionery-notificacoes`, fora do escopo desta homologação — que é quem realmente fala com o Evolution API):
```yaml
# Canais: mock por padrão (loga e responde sucesso, sem enviar). PUSH real = false + par VAPID.
# WHATSAPP real exige instância Evolution (EVOLUTION_BASE_URL/API_KEY/INSTANCE) -- ainda não há.
APP_NOTIFICACOES_PUSH_MOCK: ${APP_NOTIFICACOES_PUSH_MOCK:-true}
APP_NOTIFICACOES_WHATSAPP_MOCK: ${APP_NOTIFICACOES_WHATSAPP_MOCK:-true}
```
No `.env` deste ambiente, só existe `APP_NOTIFICACOES_PUSH_MOCK=false` — `APP_NOTIFICACOES_WHATSAPP_MOCK` **não é definido**, então usa o padrão `true` (mock). Não há nenhuma credencial de instância Evolution (`EVOLUTION_BASE_URL`/`API_KEY`/`INSTANCE`) configurada em lugar nenhum, confirmando o comentário do próprio compose: a instância Evolution real "ainda não há".

Ou seja: o `notificacoes-api` **loga a mensagem e devolve sucesso (com um ID de mensagem inventado), sem nunca chamar o Evolution API de verdade**. Isso explica tanto esta rodada quanto o envio anterior desta mesma sessão (seção 5, antes da correção do 409) — nenhuma das duas mensagens de WhatsApp saiu de fato, embora ambas tenham sido registradas como `ENVIADO` com um `mensagemExternaId` de aparência legítima.

**Isso não é um bug de código introduzido por notificações** — é o ambiente ainda não ter uma instância Evolution real configurada, o que o próprio comentário do `docker-compose.yaml` já deixava explícito. Mas é uma lacuna de observabilidade que vale registrar: **nada nos dados do outbox distingue um envio mockado de um envio real** — mesmo status, mesmo formato de ID externo, mesmo timestamp de envio. Alguém revisando só a tela de notificações enviadas (ou o outbox via API) não tem como perceber que está em modo mock sem checar a configuração do ambiente por fora. Recomendo pelo menos um indicador visível (ex.: um campo `mock: true/false` na resposta do microsserviço, propagado até o outbox) para essa distinção não depender de olhar `docker-compose.yaml`.

**Conclusão da seção:** o canal WhatsApp **não foi validado de ponta a ponta nesta sessão** — só validei até a chamada `POST /notificacoes/v1/envio` (que funciona corretamente do lado do Confectionery). O envio real ao Evolution API depende de uma instância Evolution ser configurada neste ambiente, o que está fora do escopo dos dois repositórios analisados por este QA.

#### 5.2.2 Próximos passos para habilitar o WhatsApp de verdade (decisão de infra, não de código)

Discutido com o usuário após este relatório. Registrando como pendência, não como código pronto para aplicar — nenhuma dessas ações está no escopo deste QA:

1. Subir uma instância do Evolution API (self-hosted em Docker, ou serviço gerenciado) — hoje não existe nenhuma neste ambiente.
2. Parear essa instância com um número de WhatsApp real, escaneando o QR code (mesmo fluxo do WhatsApp Web) — tipicamente feito pela pessoa dona do número configurado (`APP_NOTIFICACAO_DONA_TELEFONE`).
3. Configurar no ambiente do `confectionery-notificacoes` (repo separado, não analisado aqui) as variáveis `EVOLUTION_BASE_URL`, a API key da instância e o nome/id da instância.
4. Só então definir `APP_NOTIFICACOES_WHATSAPP_MOCK=false` no `.env` deste ambiente.

**Decisão em aberto para o time:** vale considerar deixar o WhatsApp mockado propositalmente em ambientes de QA/dev (evita mandar mensagem real de teste toda hora) e validar o envio real apenas uma vez, no ambiente onde a instância Evolution de fato existir (staging/produção). Assim que a instância estiver pareada e as variáveis definidas, o reteste do envio real é rápido de repetir (o cenário de teste já está desenhado nas seções 5.1-5.2).

**Risco a considerar antes de investir nisso:** o Evolution API é um cliente não-oficial do WhatsApp (baseado em automação do WhatsApp Web, não na API Business oficial da Meta). Isso carrega um risco — baixo, mas não nulo — de o número usado ser bloqueado por comportamento automatizado, especialmente se o volume de mensagens crescer. Vale o time pesar isso, e considerar a API Business oficial da Meta como alternativa mais robusta (porém mais burocrática de configurar) se o uso for crescer além de alertas pontuais.

### 5.3 Resultado — Push (notificação na tela)

Linha do outbox, canal `PUSH`, destinatário `admin`:
```
status: ENVIADO
tentativas: 1
mensagemExternaId: <preenchido>
enviadoEm: 2026-09-28T13:02:57Z
```

Isso já seria suficiente para considerar o backend correto, mas fui um passo além e **confirmei o recebimento do lado do navegador**, consultando diretamente o service worker da aplicação (`sw.js`, ativo no escopo `http://localhost/`) via `registration.getNotifications()`:

```json
{
  "title": "Alerta de Estoque Mínimo",
  "body": "[N-5] Insumo 3 abaixo do estoque mínimo (atual: 10.0, mínima: 100.0) (ESTOQUE_MINIMO)",
  "tag": ""
}
```

Essa é uma confirmação forte: não é só "o backend disse que enviou" — é o **navegador relatando que efetivamente recebeu e exibiu a notificação push**, com o texto exato do alerta e a referência ao id do outbox (`N-5`). O ciclo completo (evento de alerta → outbox → microsserviço → Web Push → FCM → service worker → notificação exibida) funcionou de ponta a ponta. Diferente do WhatsApp, aqui o `.env` tem `APP_NOTIFICACOES_PUSH_MOCK=false` **e** um par de chaves VAPID real — ou seja, este canal está genuinamente configurado para envio real neste ambiente (ver seção 5.2.1 para a comparação).

### 5.3.1 Requisito adicional testado: push chega mesmo sem estar logado no sistema

O usuário levantou um ponto importante depois do teste inicial: o valor de uma notificação push é justamente garantir que a pessoa seja avisada **mesmo sem estar logada/com o sistema aberto** — diferente do sino "Alertas Recentes" do cabeçalho (seção 6), que só existe dentro da sessão autenticada. O teste da seção 5.3 sozinho não provava isso, porque eu conferi o recebimento na mesma aba onde acabara de logar.

Refiz o teste especificamente para isso:
1. Abri uma aba nova e confirmei que **não havia sessão ativa** (sem token OIDC no `sessionStorage`), mas o service worker já estava registrado e ativo (`Notification.permission: "granted"`, subscription do `admin` já cadastrada de antes).
2. Numa segunda aba, logei brevemente só para disparar um novo alerta de estoque mínimo (insumo de teste novo, `POST /alerta/verificar`).
3. **Imediatamente após disparar o alerta, limpei a sessão dessa segunda aba também** (`sessionStorage.clear()`), de modo que, no momento em que o scheduler do outbox processasse o alerta (10s de polling), **nenhuma aba do navegador estivesse autenticada**.
4. Aguardei o processamento e consultei o service worker da primeira aba (a que nunca logou).

**Resultado:** a notificação chegou normalmente, com nenhuma aba logada no momento da entrega:
```json
{
  "title": "Alerta de Estoque Mínimo",
  "body": "[N-7] Insumo 4 abaixo do estoque mínimo (atual: 10.0, mínima: 100.0) (ESTOQUE_MINIMO)"
}
```

Isso confirma o comportamento esperado: a *push subscription* fica associada ao par navegador+service worker (e, no backend, ao usuário que a registrou), **não à sessão de login ativa** — uma vez registrada, a entrega independe de haver alguém logado no momento do envio. Não consegui capturar a notificação nativa do sistema operacional em si (o toast do macOS/Chrome some em poucos segundos e eu não tinha uma captura de tela agendada para o instante exato da entrega), mas o mecanismo que a dispara (`service worker` recebendo o evento `push` e chamando `showNotification`) é o mesmo em ambos os testes, e é ele quem produz o toast nativo — a confirmação via `getNotifications()` é equivalente em confiabilidade.

### 5.4 Conclusão da seção

Os dois canais têm resultados diferentes nesta rodada:

- **Push:** confirmado funcionando de ponta a ponta em ambiente real, **incluindo com o usuário deslogado** — o requisito que mais importa para um canal de notificação. Configuração real (`PUSH_MOCK=false` + VAPID), sem ressalvas.
- **WhatsApp:** **não confirmado** — o ambiente está em modo mock para este canal (seção 5.2.1), então nenhuma mensagem real chegou a sair, apesar do outbox mostrar `ENVIADO`. Validado apenas até a chamada do Confectionery para o microsserviço de notificações; o envio real ao Evolution API não pôde ser testado nesta sessão por não haver instância Evolution configurada.

Combinado com a correção da seção 4, o bloqueio que me impediu de montar esse cenário anteriormente (o 409 ao criar Entrada de Insumo) está resolvido — o que sobra em aberto para o WhatsApp é puramente de configuração de ambiente (instância Evolution), não de código.

**Nota sobre o estado deixado no ambiente:** o toggle "Notificações neste navegador" do usuário `admin` ficou **ativado** (subscription real registrada) ao final deste teste — não desativei, por entender que é o resultado esperado de um teste bem-sucedido de uma funcionalidade real, não um dado de teste descartável. Se o time preferir começar a próxima sessão sem isso, basta clicar no mesmo toggle para desativar.

---

## 6. 🟠 Achado novo — "Alertas Recentes" (sininho do cabeçalho) não atualiza durante a sessão

Durante o teste da seção 5, criei dois alertas ativos (ids 2 e 3). A tela **Alertas** (`/estoque-insumos/alertas`) e a API (`GET /api/alerta?ativo=true`) mostravam os dois corretamente, "Ativo". Porém o menu suspenso "Alertas Recentes", aberto pelo ícone de sino no cabeçalho, continuava mostrando **"0 ativos" / "Nenhum alerta ativo no momento"**, mesmo minutos depois e mesmo navegando entre páginas.

Ao dar um recarregamento completo da página (F5) e abrir o sino novamente, ele passou a mostrar corretamente "2 ativos" com os dois alertas listados.

**Causa provável:** o componente do sino busca a lista/contagem de alertas ativos uma única vez (no carregamento inicial da aplicação) e não tem nenhum mecanismo de atualização — nem *polling*, nem invalidação ao navegar, nem escuta de evento — para refletir alertas criados durante a sessão. Isso é inconsistente com a tela "Alertas", que busca os dados sempre que é visitada.

**Impacto:** um usuário que deixa a aba aberta por um período (o cenário mais comum de uso real) pode nunca ver o sininho acusar um alerta novo, mesmo que ele exista e apareça corretamente na tela de Alertas — o que reduz bastante a utilidade do indicador rápido do cabeçalho, justamente o lugar onde se espera notar um alerta primeiro.

**Recomendação:** adicionar polling periódico (ex.: a cada 30-60s, alinhado ao próprio scheduler do outbox) ou invalidar/refazer essa busca ao navegar entre rotas, como já acontece na tela de Alertas.

---

## 7. 🟢 Achado novo, menor — `DELETE /insumo/{id}` retorna 500 quando o insumo tem alerta vinculado

Ao limpar os dados de teste desta rodada, tentei excluir os dois insumos de teste (`Açucar QA Notif E2E` e `Fermento QA Notif E2E Push`) depois de já ter excluído as entradas de estoque e resolvido os alertas associados. As entradas foram excluídas normalmente (`204`), mas a exclusão dos insumos retornou:
```
500 { "erro": "Erro Interno", "mensagem": "Ocorreu um erro inesperado. Contate o administrador." }
```
em vez de uma resposta `4xx` explicando o motivo (provavelmente uma referência remanescente na tabela `alerta`, mesmo com o alerta já resolvido/inativo). Diferente do achado da seção 4, este caminho parece **não passar pelo mesmo tratamento de `DataIntegrityViolationException`** do `GlobalExceptionHandler` — ou lança um tipo de exceção diferente — e por isso ainda cai como 500 genérico com evento de Sentry.

**Impacto:** baixo — é um caminho de limpeza/exclusão que provavelmente não é comum no uso normal (excluir um insumo que já teve alerta gerado), mas gera um 500 desnecessário e evento de Sentry por algo que é, na prática, uma restrição de negócio esperada ("não é possível excluir insumo com histórico de alerta").

**Dado de teste deixado no ambiente:** não consegui excluir os insumos `Açucar QA Notif E2E` (id 2) e `Fermento QA Notif E2E Push` (id 3) por causa deste bug. Ambos estão claramente identificados pelo nome, sem entradas de estoque, sem parametrização de alerta e sem alerta ativo (já resolvidos) — ou seja, inertes, mas ainda visíveis na lista de Insumos até que o time aplique uma correção ou os remova diretamente no banco.

---

## Conclusão

Os três achados da rodada anterior foram corrigidos corretamente, incluindo o mais crítico (wiring do canal PUSH), que ficou bem implementado — conversão de payload, isolamento de erro por subscription, e idempotência por canal. A lacuna de chave VAPID também foi resolvida com uma solução melhor do que eu havia sugerido (servir a chave via API em vez de depender de variável de build).

O achado que ficara pendente por causa do 409 (seção 4) também foi corrigido, e a causa raiz se confirmou trivial (erro no meu próprio payload de teste, mascarado por uma mensagem de erro genérica que agora foi corrigida). Isso destravou o teste fim-a-fim real dos dois canais de notificação (seção 5), com resultados diferentes entre eles: **o Push está confirmado funcionando de ponta a ponta em ambiente real, inclusive com o usuário deslogado** (o requisito mais importante para um canal de notificação — avisar mesmo quando a pessoa não está com o sistema aberto), com confirmação do lado do navegador, não só do backend. **O WhatsApp não pôde ser confirmado** — o ambiente está em modo mock para esse canal (sem instância Evolution configurada), e o outbox reporta `ENVIADO` mesmo assim, o que por si só é um achado (falta de um sinal que distinga mock de envio real).

Esta rodada revelou três achados novos, todos de severidade bem menor que a tela branca: a falta de distinção entre envio mock e real no outbox (seção 5.2.1), o sininho do cabeçalho não atualizando durante a sessão (seção 6), e um 500 genérico ao excluir insumo com histórico de alerta (seção 7).

A tela branca intermitente (seção 2) **continua sem correção** — não encontrei nenhuma mudança de código no frontend relacionada a ela nesta verificação. Continua sendo o achado mais grave em aberto e merece prioridade.

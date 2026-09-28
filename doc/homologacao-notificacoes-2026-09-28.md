# Homologação — Funções de Notificação (Outbox WhatsApp + Push/PWA)

**Data:** 2026-09-28
**Autor:** QA/Homologação (assistente)
**Gatilho:** "vamos testar as funcoes de notificações"
**Alterações testadas (não commitadas no momento do teste, staged em ambos os repositórios):** todo o módulo `notificacao/` do backend (outbox, push subscription, listener, config) e o módulo `src/modules/notificacao/` do frontend (toggle de push, tela "Notificações enviadas", service worker).

**Escopo mantido:** apenas teste e documentação — nenhuma alteração de código ou commit foi feita por este QA. Todas as implementações foram feitas pelo time de desenvolvimento; este documento reverifica de forma independente, ao vivo, o que funciona, o que não funciona, e o que não é testável neste ambiente.

---

## Resumo executivo

| Item | Resultado |
|---|---|
| Listagem de outbox — RBAC (API, rota, menu) | ✅ Confirmado — restrito a ADMIN nos três níveis |
| Listagem de outbox — filtro de status válido (4 valores) | ✅ Confirmado — 200 em todos |
| Listagem de outbox — filtro de status inválido | 🔴 **Achado: 500 ao invés de 400** (detalhado abaixo) |
| Push subscription — CRUD do próprio usuário (POST/GET/DELETE) | ✅ Confirmado, incluindo upsert e limpeza |
| Push subscription — validação (campo em branco) | ✅ Confirmado — 400 limpo |
| Push subscription — RBAC dono-ou-admin | ✅ Confirmado — 403 para acesso cruzado sem ADMIN |
| Push subscription — `usuario` sempre do JWT, nunca do corpo | ✅ Confirmado (código e teste ao vivo) |
| Toggle "Notificações neste navegador" desabilitado | ✅ Comportamento esperado (falta `VITE_VAPID_PUBLIC_KEY`) — não é bug |
| Canal PUSH nunca dispara de fato | 🔴 **Achado crítico: não implementado** (detalhado abaixo) |
| `.gitignore` ignorando arquivo-fonte do cliente HTTP | 🔴 **Achado crítico: quebra de build** (detalhado abaixo) |
| Envio real WhatsApp fim-a-fim | ⚪ Não testável neste ambiente (flag desligada + microsserviço externo ausente) |

---

## 1. Listagem de outbox (`GET /notificacao/outbox`) — tela "Notificações enviadas"

### 1.1 RBAC — três camadas testadas ao vivo

- **API direta:** com token de `admin` (perfil ADMIN), `GET /api/notificacao/outbox?page=0&size=20` → **200**. Com token de `qa.vendas@confectionery.test` (perfil VENDAS, sem ADMIN), a mesma chamada → **403** (`"Acesso Negado"`).
- **Rota da UI:** navegando para `/notificacoes-enviadas` logado como `qa.vendas`, a aplicação renderiza a tela "Área restrita" ("Seu acesso não permite entrar nesta área...") — o guard de rota bloqueia antes mesmo de chamar a API.
- **Menu lateral:** logado como `qa.vendas`, toda a seção "Administração" (que contém "Usuários", "Dados da Empresa" e "Notificações enviadas") está ausente da navegação — não é só um link desabilitado, o item nem aparece.

Os três níveis são consistentes entre si. Nenhuma regressão ou brecha encontrada.

*(Nota metodológica: para testar como usuário não-admin, foi necessário deslogar e logar como `qa.vendas@confectionery.test` no mesmo navegador — o SSO do Keycloak é por sessão de navegador, não por aba, então uma aba nova simplesmente herda a sessão já autenticada. Ao final do teste, a sessão `admin` original foi restaurada com login explícito, sem impacto duradouro no ambiente.)*

### 1.2 Filtro de status — matriz de valores

| Valor de `status` enviado | Esperado | Obtido |
|---|---|---|
| (nenhum — "Todos" na UI) | 200 | ✅ 200 |
| `PENDENTE` | 200 | ✅ 200 |
| `EM_ENVIO` | 200 | ✅ 200 |
| `ENVIADO` | 200 | ✅ 200 |
| `FALHOU` | 200 | ✅ 200 |
| `TODOS` (valor inválido, tentativa de forçar via API) | 400 (Bad Request) | 🔴 **500 (Erro Interno)** |

A UI em si nunca envia um valor inválido — quando o usuário escolhe "Todos" no `<select>`, o parâmetro `status` simplesmente é omitido da requisição (confirmado via `read_network_requests` comparando a chamada real da UI: `?page=0&size=20`, sem `status`). O 500 só ocorre com uma chamada direta à API usando um valor que não existe no enum `NotificacaoOutboxStatusEnum` (`PENDENTE`, `EM_ENVIO`, `ENVIADO`, `FALHOU`) — não é algo que a UI expõe ao usuário final, mas é uma falha real de tratamento de erro do endpoint.

**🔴 Achado — severidade média: valor inválido de `status` gera 500 ao invés de 400**

- **Causa raiz confirmada:** `NotificacaoOutboxController.listar` recebe `@RequestParam(required = false) status: NotificacaoOutboxStatusEnum?`. Quando o Spring não consegue converter a string para o enum, lança `MethodArgumentTypeMismatchException`. O `GlobalExceptionHandler` (`shared/application/exception/GlobalExceptionHandler.kt`) trata explicitamente `RegraDeNegocioException`, `MethodArgumentNotValidException`, `HttpMessageNotReadableException`, `ServletRequestBindingException`, `MaxUploadSizeExceededException`, `NoSuchElementException`, `DataIntegrityViolationException`, `NoResourceFoundException` e `AccessDeniedException` — mas **não** `MethodArgumentTypeMismatchException`. A exceção cai no `@ExceptionHandler(Exception::class)` genérico, que sempre responde 500 e dispara um evento no Sentry.
- **Não é exclusivo deste endpoint:** o mesmo padrão de `@RequestParam(required = false) x: AlgumEnum?` aparece em pelo menos mais 4 controllers (`EstoqueInsumoController`, `MovimentacaoController`, `EntradaInsumoController`, `AlertaPedidoController`), todos com a mesma exposição — a correção pertence ao `GlobalExceptionHandler` (um único ponto), não a cada controller.
- **Precedente no próprio arquivo:** o `GlobalExceptionHandler` já documenta, em comentários, correções anteriores exatamente desta natureza (`ServletRequestBindingException`, `HttpMessageNotReadableException`, `MaxUploadSizeExceededException`, `NoResourceFoundException` — cada um "caía no catch-all genérico e virava 500, deveria ser 400/404"). Ou seja, o padrão de correção já existe no código; só falta aplicá-lo a `MethodArgumentTypeMismatchException`.
- **Sugestão de correção:** adicionar um `@ExceptionHandler(MethodArgumentTypeMismatchException::class)` retornando 400 com uma mensagem amigável (ex.: "Valor inválido para o parâmetro 'status'"), seguindo o mesmo padrão já usado para os outros handlers de erro de entrada no mesmo arquivo.
- **Impacto prático:** baixo para o usuário final (a UI nunca gera esse valor), mas gera ruído desnecessário no Sentry como "erro interno" para o que é, na verdade, um erro de entrada do cliente — dificulta a triagem de alertas reais.

### 1.3 Tela vazia — comportamento confirmado como esperado

A tela "Notificações enviadas" carrega corretamente e mostra "Nenhuma notificação registrada" — consistente com `app.notificacao.api.enabled=false` (padrão em `application.yaml` e `application-docker.yaml` neste ambiente), que faz o listener da outbox (`NotificacaoAlertaListener`) não gravar nenhuma linha. **Não é um bug.**

---

## 2. Push subscription (PWA) — `POST/GET/DELETE /push-subscription`

Como o toggle da UI está desabilitado neste ambiente (ver seção 3), todo o CRUD foi validado via chamadas diretas à API, autenticado com o token OIDC de cada usuário de teste.

### 2.1 Fluxo do dono (usuário `admin`)

| Operação | Esperado | Obtido |
|---|---|---|
| `POST /push-subscription` (primeira vez) | 201, grava para o usuário do JWT | ✅ 201, `usuario: "admin"` |
| `POST /push-subscription` (segunda vez, endpoint diferente — simula troca de dispositivo) | Upsert: mesmo `id`/`criadoEm`, `subscriptionJson` substituído | ✅ Confirmado — `id: 1` e `criadoEm` idênticos nas duas respostas, apenas o conteúdo mudou |
| `GET /push-subscription/admin` (dono) | 200 | ✅ 200 |
| `POST /push-subscription` com `subscriptionJson` em branco | 400, mensagem de validação clara | ✅ `400 — "subscriptionJson: não deve estar em branco"` |
| `GET /push-subscription/{usuario-inexistente}` | 404, mensagem clara | ✅ `404 — "Push subscription não encontrada para o usuário..."` |
| `DELETE /push-subscription/admin` | 204 | ✅ 204 |
| `GET /push-subscription/admin` (após o delete) | 404 | ✅ 404 — confirma remoção efetiva |

Todos os dados de teste criados nesta seção foram removidos ao final (nenhum resíduo deixado no banco).

### 2.2 RBAC dono-ou-admin — testado com usuário não-admin

Logado como `qa.vendas@confectionery.test` (perfil VENDAS):

| Operação | Alvo | Esperado | Obtido |
|---|---|---|---|
| `POST /push-subscription` | grava para si mesmo | 201, `usuario: "qa.vendas@confectionery.test"` | ✅ Confirmado — mesmo enviando um corpo sem campo `usuario` (o DTO nem tem esse campo), o backend grava para o usuário do token, nunca aceita um valor arbitrário |
| `GET /push-subscription/qa.vendas@confectionery.test` | própria subscription | 200 | ✅ 200 |
| `GET /push-subscription/admin` | subscription de **outro** usuário | 403 | ✅ `403 — "Você não tem permissão para realizar esta ação"` |
| `DELETE /push-subscription/admin` | subscription de **outro** usuário | 403 | ✅ `403 — "Você não tem permissão para realizar esta ação"` |

A subscription de teste do `qa.vendas` foi removida ao final (`DELETE /push-subscription/qa.vendas@confectionery.test`, pelo próprio dono → 204).

**Avaliação:** o modelo de permissão (`PushSubscriptionService.exigirPermissao`) segue exatamente o padrão já homologado em `PedidoService.exigirPermissao` (mesmo texto de comentário no código faz essa referência) — dono ou ADMIN, nada mais. Design correto, comportamento confirmado ao vivo em ambas as direções (dono acessa, terceiro não-admin é barrado).

*(Nota: o branch "ADMIN acessa qualquer subscription" está confirmado pela leitura do código — `if ("ADMIN" in perfis) return` antes mesmo de checar o dono — mas não foi exercitado ao vivo contra uma subscription de terceiro pertencente a outro usuário além do próprio admin, por não haver um segundo usuário com subscription ativa no momento do teste. Risco residual baixo, dado que a mesma checagem já protege corretamente o caminho inverso, mais crítico, testado acima.)*

### 2.3 Observação menor (não é bug)

`POST /push-subscription` retorna sempre `201 Created`, inclusive quando a operação é na prática uma atualização (upsert de uma subscription já existente). Semanticamente REST, o caso de atualização poderia retornar `200 OK`. Efeito prático nulo — o cliente (frontend) não depende do código de status para decidir o que fazer — mas fica registrado como um ponto de estilo, não uma correção necessária.

---

## 3. Push notification no navegador — toggle desabilitado (comportamento esperado)

Confirmado visualmente e via DOM (`toggleDisabled: true`) que o toggle "Notificações neste navegador" está desabilitado, com o texto "Notificações no navegador em breve". Causa raiz: a variável de build `VITE_VAPID_PUBLIC_KEY` (referenciada em `webPush.ts`, `usePushNotificacao.ts`, `vite-env.d.ts`) não está definida em nenhum arquivo `.env*` do frontend neste ambiente. **Isso não é um bug** — é o comportamento correto de fallback para um ambiente sem a chave VAPID configurada. Por isso todo o teste funcional do fluxo push (seção 2) foi feito via API direta.

---

## 4. Achados críticos — gaps de implementação (não são bugs de regressão, são lacunas)

### 🔴 Achado crítico A — canal PUSH nunca é acionado por um alerta de negócio

O `NotificacaoAlertaListener` (`@TransactionalEventListener`, disparado por `AlertaCriadoEvent`) é o único ponto que transforma um alerta de negócio em uma linha na tabela `notificacao_outbox`. Lendo o diff staged desse arquivo, a única mudança é um rename de método (`onAlertacriado` → `onAlertaCriado`, correção de digitação) — **não existe nenhuma lógica nova para, a partir de um alerta, também gerar uma entrada de outbox por canal PUSH usando as `PushSubscription`s cadastradas.** Toda a infraestrutura de outbox/listener existente só produz entradas para o canal WHATSAPP.

**Efeito prático:** a experiência de ponta a ponta do canal push está incompleta. Um usuário pode:
1. Ativar o toggle (quando `VITE_VAPID_PUBLIC_KEY` estiver configurada em produção);
2. Ter sua subscription persistida com sucesso (confirmado na seção 2);
3. **Mas nunca receberá uma notificação push de verdade**, porque nenhum evento de negócio (alerta de estoque, alerta de pedido, etc.) gera uma entrada de outbox para esse canal.

Isso não é uma regressão de algo que funcionava — é uma lacuna de implementação em uma funcionalidade que, do ponto de vista do usuário final, parece pronta (o cadastro da subscription funciona sem erro) mas não entrega o resultado esperado.

### 🔴 Achado crítico B — `.gitignore` ignora silenciosamente o arquivo-fonte do cliente HTTP de notificações

`confectionery/.gitignore`, linha 41: `client/` — um padrão **sem barra inicial**, que no Git corresponde a qualquer diretório chamado `client` em qualquer profundidade da árvore, não apenas um `client/` na raiz do repositório.

Isso ignora silenciosamente `src/main/kotlin/br/com/confectionery/notificacao/infrastructure/client/NotificacoesApiClient.kt` — confirmado via `git check-ignore -v` apontando exatamente para essa regra, e via `git status`/`git diff --cached --stat`: o arquivo existe em disco (4909 bytes) mas **não está staged para o commit**, enquanto `NotificacoesApiClientTest.kt` (que importa e testa essa classe) **está** staged.

**Efeito prático:** se o commit for feito como está, qualquer clone limpo do repositório (incluindo CI) terá um teste (`NotificacoesApiClientTest.kt`) que referencia uma classe (`NotificacoesApiClient`) inexistente no repositório — **falha de compilação garantida**, não apenas falha de teste.

**Sugestão de correção:** revisar a intenção original da linha 41 do `.gitignore` (provavelmente pensada para ignorar um diretório de build de cliente em outro contexto do projeto) e ancorá-la ao caminho específico pretendido (ex.: `/algum-caminho/client/`), ou removê-la caso não haja mais um motivo válido para ignorar diretórios chamados `client` de forma genérica.

---

## 5. Fora do alcance de teste neste ambiente

- **Fluxo fim-a-fim do canal WHATSAPP** (outbox → `NotificacaoOutboxScheduler` → `ProcessarOutboxNotificacaoUseCase` → `NotificacoesApiClient` → microsserviço externo `confectionery-notificacoes`, porta 8082, que fala com a Evolution API): não testável aqui porque `app.notificacao.api.enabled=false` por padrão neste ambiente, o telefone da dona não está configurado, e o microsserviço `confectionery-notificacoes` não faz parte de nenhum dos dois repositórios analisados (não está rodando localmente). Testar isso exigiria mudança de configuração, o que está fora do escopo deste QA (só teste e documentação, sem alterar código/config).
- **Comportamento de retry/backoff quando a API de notificações está indisponível:** mesma limitação acima.
- **No-op quando o telefone da dona está em branco:** não verificado ao vivo (exigiria alterar dado de configuração da dona); confirmado apenas por leitura de código que o listener não grava outbox nesse caso.

---

## Conclusão

O CRUD de push subscription e o controle de acesso da tela/endpoint de outbox estão **corretos e bem protegidos** nos testes realizados — RBAC consistente em três camadas (API, rota, menu), validação de entrada limpa, comportamento de upsert correto, e nenhuma forma de um usuário ler ou apagar a subscription de outro sem ser ADMIN.

Dois gaps relevantes foram encontrados e documentados com causa raiz confirmada:
1. **Crítico** — o canal push não é acionado por nenhum alerta de negócio ainda (só a infraestrutura de cadastro da subscription existe; a "cola" com os alertas está faltando).
2. **Crítico** — um `.gitignore` mal ancorado deixaria o próximo commit com um teste órfão, quebrando a build em qualquer ambiente limpo.

Um terceiro achado, de severidade média, foi documentado com causa raiz precisa (handler de exceção ausente para parâmetro de enum inválido) e é facilmente corrigível seguindo um padrão já existente no próprio `GlobalExceptionHandler`.

Nenhuma regressão foi encontrada nas funcionalidades pré-existentes tocadas por essas mudanças.

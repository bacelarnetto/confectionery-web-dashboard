# Notificações no frontend (N1 e N2), 2026-09-25

Demanda da sessão de backend (confectionery-f2). Este documento cobre só o comportamento do frontend.
Endpoints, payloads, códigos de resposta e regras de permissão estão no guia do monólito:
`doc/guide/notificacoes.md` do repositório `confectionery` (fonte única do contrato).

## N1: tela ADMIN "Notificações enviadas" (concluída)

- Rota `/notificacoes-enviadas`, protegida por `RequireRole role="ADMIN"`. Item em
  **Administração → Notificações enviadas** no menu lateral, que só aparece para ADMIN.
- Consome a listagem do outbox (endpoint no guia do monólito); a página é normalizada por `normalizePage`.
- Colunas: criada em, título (texto completo no tooltip), canal, destinatário, status (badge), tentativas,
  último erro (truncado, texto completo no tooltip) e enviada em.
- Selo de modo de envio ao lado do status (`modoEnvio`, desde 2026-09-28): **Simulado** em âmbar, com
  tooltip "O canal está em modo de teste: nada foi entregue de verdade", quando o canal está em mock;
  nada quando o envio foi real; "—" discreto quando o modo é desconhecido e o status é Enviado. Assim,
  Enviado + Simulado nunca parece entrega real.
- Filtro de status com padrão **Todos** (sem parâmetro `status` na chamada): decisão do dono em
  2026-09-29, a tela abre com o histórico completo. As opções são Todos, Falhou, Pendente, Em envio e
  Enviado. Antes o padrão era Falhou, o que fazia a tela parecer vazia
  (`doc/melhoria-ux-filtro-notificacoes-enviadas-2026-09-28.md`).
- Datas em `America/Sao_Paulo`, formatadas por `formatDateTimeBR` (`src/lib/format.ts`).
- Estado vazio: "Nenhuma notificação registrada" em Todos (há uma mensagem própria para cada filtro).
- Ainda não tem ação de reenviar (não existe endpoint para isso).

Código: `src/modules/notificacao/` (types, services, hooks, pages).

## N2: "Notificações neste navegador" (Web Push)

- Fica no menu do usuário (clique no avatar/nome no header), não em Administração.
- A chave pública VAPID é buscada **em runtime** no backend, uma vez por sessão, com cache do TanStack
  Query (`staleTime: Infinity`, chave `['push-vapid-public-key']`). Não é mais variável de build: trocar
  ou configurar a chave no backend não exige rebuild do frontend.
- Comportamento:
  - **Navegador sem Push API** (Safari antigo, contexto não seguro): o item fica escondido, a chave nem
    é buscada e nada é registrado.
  - **Chave carregando**: toggle desabilitado, sem texto de ajuda.
  - **Backend sem chave VAPID** (resposta "não configurada"): o toggle aparece desabilitado com o texto
    "Notificações no navegador em breve". Nada é pedido ao navegador e não há toast de erro.
  - **Com chave**: ao ligar, pede permissão ao navegador, registra `/sw.js`, chama
    `pushManager.subscribe({ userVisibleOnly: true, applicationServerKey })` e grava a inscrição no
    backend. Se a gravação falhar, a inscrição local é desfeita. Ao desligar, remove no backend e depois
    chama `unsubscribe()`.
  - **Estado**: o toggle só aparece ligado se o `endpoint` da inscrição gravada no backend for o mesmo
    da inscrição local. Usuário sem inscrição é estado normal (sem toast). Se o usuário estiver inscrito
    em outro navegador, aparece "Ativas em outro navegador; ativar aqui substitui" (uma inscrição por
    usuário).
  - Permissão bloqueada no navegador: o toggle fica desabilitado e explica o motivo.
- `usuario` é o `getUsername(auth.user)` (preferred_username).
- Service Worker em `public/sw.js`. Ele não tem handler de `fetch`, então não intercepta nem guarda em
  cache nada do app. Só trata `push` e `notificationclick`.

Código: `src/modules/notificacao/lib/webPush.ts`, `services/pushSubscriptionService.ts`,
`hooks/usePushNotificacao.ts`, `components/PushNotificacaoToggle.tsx`, `public/sw.js`.

## Pendências

1. **Payload do push provisório.** O `sw.js` espera JSON no formato `{ title, body }` e chama
   `showNotification(title, { body })`. O contrato real vem da app `confectionery-notificacoes` (em
   implementação); se mudar, ajustar o `sw.js` (por exemplo, URL de destino no clique, ícone, tag).
2. ~~**Chave VAPID no build.**~~ Resolvida em 2026-09-27: a chave passou a vir do backend em runtime;
   `VITE_VAPID_PUBLIC_KEY` foi removida. Basta configurar a chave no backend.
3. **CSP.** O `nginx.conf` usa `script-src 'self'`, o que já cobre o `/sw.js` (mesma origem), e a
   inscrição no push service do navegador não passa por `connect-src`. Revisar se o payload real
   trouxer ícones externos.
4. **Reenviar notificação com falha.** Aguarda endpoint no backend.

## Guia in-app

Nova seção **Notificações** (`/guia/notificacoes`, `src/modules/guia/components/sections/Notificacoes.tsx`).

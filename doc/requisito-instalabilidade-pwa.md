# Requisito: Instalabilidade PWA (manifest.json faltando)

> **Status (2026-09-29): Tarefas 1–3 IMPLEMENTADAS (sem commit). Tarefa 4: Chrome desktop verificado
> por DevTools; celular depende de HTTPS (ver "Limite: HTTPS" abaixo).** Ficha escrita por
> QA/Homologação a pedido do dono.
>
> **O que foi entregue:**
> - `public/manifest.json`:
>   - `name` "Confectionery · Admin" (mesmo `<title>`) e `short_name` "Confectionery";
>   - `theme_color` `#f59e0b` (âmbar do tema padrão "laranja", `--color-primary-500`, o mesmo do
>     favicon);
>   - `background_color` `#f9fafb` (o `bg-gray-50` de fundo das telas);
>   - `display` standalone, `start_url`/`scope` `/`.
>   - O nginx já serve `.json` como `application/json` (sem mudança no `nginx.conf`); a CSP
>     (`default-src 'self'`) cobre manifest e ícones.
> - Ícones em `public/icons/`, gerados de `public/favicon.svg` com `sharp-cli` via `npx`, sem
>   dependência nova no `package.json`:
>   - `icon-192.png` e `icon-512.png`: o favicon como está, cantos arredondados, purpose `any`;
>   - `icon-512-maskable.png`: fundo âmbar sólido, desenho reduzido a 70%, dentro da zona segura de
>     80% central;
>   - `apple-touch-icon.png` 180×180: fundo sólido, porque o iOS arredonda sozinho.
> - `index.html`: `<link rel="manifest">`, `<meta name="theme-color">`, `apple-touch-icon` e as metas
>   `apple-mobile-web-app-capable`/`-title`/`-status-bar-style` (e `mobile-web-app-capable`).
> - `public/sw.js`: sem mudança de comportamento. O comentário do topo foi atualizado: o payload
>   `{title, body}` é do `PushEnvioAdapter` do monólito, e a app confectionery-notificacoes foi
>   abandonada.
>
> **Verificação (2026-09-29):** build de produção servido em `http://localhost` (vite preview) e
> Chrome headless via DevTools Protocol:
> - `Page.getAppManifest` → manifest encontrado, `errors: []`;
> - `Page.getInstallabilityErrors` → `[]` (nenhum impedimento para instalar).
>
> O Lighthouse não tem mais a categoria PWA (removida na v12); a checagem equivalente é essa do
> DevTools (Application → Manifest). O teste manual de instalar e abrir em janela própria, no Chrome
> desktop, fica para o dono/QA.

## Limite: HTTPS

Instalar como app (PWA) exige **HTTPS**, com uma única exceção: **`localhost`**.

- **Chrome desktop em `http://localhost`:** dá para testar agora. O ícone de instalar aparece na
  barra de endereço e o app abre em janela própria.
- **Celular (Android/iPhone) acessando pelo IP da rede** (ex.: `http://192.168.x.x`):
  - **não** instala como app (no máximo vira atalho de site);
  - no iPhone, também **não** recebe Web Push.

  Isso vale até existir TLS no ambiente (pendência de infraestrutura do backend, item #15). Não é
  falha da implementação: o manifest e os ícones já estão prontos para quando houver HTTPS.
>
> **Escopo: só `confectionery-web-dashboard` (frontend).** Nenhuma mudança de backend necessária —
> o `PushEnvioAdapter` e o endpoint `/push-subscription` já funcionam, confirmado ao vivo em
> `doc/homologacao-push-interno-e-exclusao-entrada-produto-2026-09-29.md` (`confectionery/doc/`).

## Origem

O dono tentou testar "instalar a app no dispositivo como uma janela webview" e não conseguiu.
Investigando o motivo: **essa funcionalidade nunca foi implementada**, mesmo tendo sido planejada.
A ficha original do push no frontend (`doc/requisito-notificacao-push-frontend.md`, "ficha C",
linhas 22-41 e checklist da linha 104) já prevía um `public/manifest.json` junto com o
`public/sw.js` — só o Service Worker foi entregue, o manifest nunca existiu no repositório.

## O que já existe (não mexer)

- `public/sw.js` — Service Worker funcionando, só trata `push`/`notificationclick`, sem cache
  (proposital). Confirmado ao vivo: recebe push real do backend (`PushEnvioAdapter`), mostra a
  notificação, clique foca/abre a aba certa.
- Fluxo de opt-in (`webPush.ts`, `PushNotificacaoToggle.tsx`, `usePushNotificacao.ts`): pede
  permissão do navegador, registra o SW, assina via `PushManager`, manda a inscrição pro backend
  (`POST /push-subscription`). **Já funciona e já foi testado ao vivo** — não é o que falta.

## O que falta (o motivo de não dar pra "instalar")

Sem manifest, o navegador não tem como saber que o site pode virar um app instalável — não existe
`public/manifest.json`, não existe `<link rel="manifest">` no `index.html`, e não existe nenhum
plugin PWA no `vite.config.ts` (`plugins: [react()]` só). Resultado: o Chrome não mostra o ícone de
instalar na barra de endereço, o Android não oferece "Adicionar à tela inicial" como app (só como
atalho genérico de site), e o iOS Safari também não trata como PWA.

**Por que isso importa além de estética:** a partir do iOS 16.4, o Safari só entrega Web Push para
sites que estão instalados como PWA na tela de início — uma aba comum do Safari não recebe push
nenhum, mesmo com inscrição válida. Ou seja, sem essa ficha, qualquer usuário em iPhone que ative
"Notificações neste navegador" não vai receber nada de verdade lá — o toggle vai parecer que
funcionou (a inscrição é salva normalmente), mas o push nunca vai chegar. Isso é uma limitação do
próprio iOS, não do código — mas só resolve instalando como PWA.

## Tarefa 1 — `public/manifest.json`

```json
{
  "name": "Confectionery · Admin",
  "short_name": "Confectionery",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#<cor de marca atual>",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

Ajustar `name`/`theme_color` pro padrão visual já usado no app. Os valores acima são só o
esqueleto mínimo que os navegadores exigem para considerar o site instalável.

## Tarefa 2 — Ícones PNG

Hoje só existe `public/favicon.svg`. Manifest de PWA precisa de PNG em pelo menos 192×192 e
512×512 (SVG sozinho não é aceito por todo navegador nessa função, e o ícone "maskable" — usado
pelo Android pra recortar em formatos diferentes — precisa ser PNG com margem de segurança).
Gerar a partir do SVG existente (qualquer ferramenta de export/rasterização resolve) ou pedir
arte nova, a critério do time.

## Tarefa 3 — Ligar no HTML

Em `index.html`, dentro de `<head>`:
```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#<mesma cor do manifest>" />
```

## Tarefa 4 — Teste de instalabilidade (depois de pronto)

- **Chrome desktop:** ícone de instalar aparece na barra de endereço; instalar e confirmar que
  abre em janela própria (sem abas/barra de endereço do navegador).
- **Android (Chrome):** "Adicionar à tela inicial" deve oferecer instalar como app (não só atalho),
  com o ícone/nome corretos.
- **iOS (Safari):** "Adicionar à Tela de Início" manualmente (iOS não tem prompt automático) e,
  **depois de instalado**, repetir o teste de push já documentado (ativar "Notificações neste
  navegador" dentro do app instalado, não numa aba comum) — esse é o teste que hoje não tem como
  passar, e é o motivo real desta ficha.

## Nota pequena, não bloqueante

O comentário no topo de `public/sw.js` ainda cita a app `confectionery-notificacoes` abandonada
como quem "vai definir o contrato real do payload". Na prática esse contrato já foi definido: o
`PushEnvioAdapter.kt` do monólito monta exatamente `{"title", "body"}` (linha ~95), que é o que o
`sw.js` já espera. Ou seja, o comentário só ficou desatualizado depois da migração — não é bug,
o comportamento bate, mas vale atualizar o texto do comentário quando alguém for mexer no arquivo
por outro motivo (não abrir uma tarefa só pra isso).

## Fora de escopo desta ficha

Nenhum wrapper nativo (Capacitor, Cordova, Electron, app de loja) — só PWA instalável via
navegador, que é o suficiente para o problema relatado (push funcionando em iOS + ícone próprio
no dispositivo).

## Ajuste visual (2026-10-01, decisão do dono) — barra superior preta

`theme_color` (manifest.json) e `<meta name="theme-color">` (index.html) passaram de âmbar
`#f59e0b` para **preto `#000000`**; no iOS, `apple-mobile-web-app-status-bar-style` passou de
`default` para **`black`** (fundo preto, texto branco — `black-translucent` foi descartado porque
sobrepõe o conteúdo ao topo). A cor do **texto** da barra não é configurável: Chrome/Android/Windows
escolhem branco automaticamente sobre fundo preto. Nada no código troca a theme-color dinamicamente
(conferido), então a barra fica preta independente do tema de cor escolhido dentro do app.
**Não mudou:** `background_color` (splash `#f9fafb`) e os ícones (o maskable segue com fundo âmbar —
é o ícone, não a barra).

**Para quem já instalou:** o Chrome relê o manifest de tempos em tempos; se a cor nova não aparecer,
desinstalar e instalar o app de novo.

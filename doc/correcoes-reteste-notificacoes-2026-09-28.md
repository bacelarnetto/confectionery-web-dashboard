# Correções do frontend: reteste de notificações, 2026-09-28

Resposta aos achados de frontend de `doc/reteste-homologacao-notificacoes-2026-09-28.md` (F1 a F5),
repassados pela sessão de backend (confectionery-f2).

## F1: tela branca intermitente (`RangeError: Invalid time value at Date.toISOString`)

### O que foi confirmado

1. **O ErrorBoundary não cobria a árvore toda.** Ele ficava dentro de `AuthProvider`,
   `QueryClientProvider` e `BrowserRouter`, e o `Toaster` estava fora dele. Além disso, por definição,
   ele não pega erro de handler, timer, callback ou promise sem `catch`. Qualquer erro nesses pontos
   terminava em tela branca muda.
2. **Havia `toISOString()` sem guarda executando durante o render.** São filtros de data que viram
   parâmetro de query: `AdicionarApoioModal` (ocupação do item no dia), `ApoioFestaListPage`
   (filtro de dia), `DisponibilidadeApoioPage` (locações do dia) e `MovimentacaoEstoquePage`
   (período). Um valor não vazio e inválido, como ano com 6 dígitos digitado num
   `<input type="date">` ou `datetime-local` (o Chrome aceita até 275760, mas `new Date` não
   interpreta), lança o RangeError no meio do render.
   - O stack do QA (`Q$` chamado direto pelas funções internas do React, na linha 931 do bundle
     `index-BZN3153g.js`) cai, no build com sourcemap, na região do bundle dos módulos de
     Pedido/Apoio de Festa, onde está o `AdicionarApoioModal`. É o candidato mais forte, mas o
     bundle exato do QA não existe mais (a imagem foi reconstruída), então o mapeamento é por
     proximidade, não exato.
3. **Havia renovação silenciosa duplicada do token (vazamento por aba).** `src/lib/auth.ts` criava
   uma segunda `UserManager` (usada pelo interceptor do axios) com `automaticSilentRenew: true`. No
   oidc-client-ts, cada `getUser()` dessa instância chama `events.load(user)` e arma um timer próprio
   de "token expirando". Isso deixava duas instâncias disparando `signinSilent` em paralelo (dois
   iframes, dois `state`) sobre o mesmo `sessionStorage`. Isso bate com o padrão "aba nova ok, aba
   muito usada falha".

### O que ficou como hipótese

Não foi possível reproduzir a tela branca localmente nem ligar com certeza o RangeError de rotas como
`/` e `/notificacoes-enviadas` a uma linha específica. Nenhum componente dessas rotas nem do layout
(`Header`, `Sidebar`, `PedidoAlertBanner`) chama `toISOString`, e o único `toISOString` de biblioteca no
bundle é o `toFormData` do axios, que não é usado. A combinação mais provável é:

- erro de render nas telas de Pedido/Apoio (item 2), num momento em que o boundary não mostrava o
  fallback; ou
- um erro assíncrono ligado à renovação duplicada (item 3), fora do alcance do boundary antigo.

Com as correções abaixo, se o erro voltar, ele aparece na tela de recuperação e o stack pode ser
mapeado pelo `.map` da imagem.

### Correções

- `src/lib/format.ts`: nova `isoOuUndefined()`, que nunca lança e devolve `undefined` para data
  inválida. Aplicada nos quatro pontos de render do item 2 e no submit do `AdicionarApoioModal`, que
  agora mostra mensagem de erro em vez de lançar.
- `src/components/ErrorBoundary.tsx`: também escuta `error` e `unhandledrejection` da janela, com
  remoção dos listeners no unmount. Erros de axios (já viram toast) e `AbortError`/`CanceledError`
  não derrubam a tela.
- `src/main.tsx`: o `ErrorBoundary` passou a envolver a árvore inteira, incluindo providers e
  `Toaster`.
- `src/lib/auth.ts`: a `UserManager` avulsa foi criada com `automaticSilentRenew: false`. Só o
  `<AuthProvider>` renova.
- `vite.config.ts`: `build.sourcemap: 'hidden'` (gera `.map` sem `sourceMappingURL` no `.js`).
  `nginx.conf` responde 404 para `*.map`, então o mapa fica na imagem para
  `docker cp frontend-confectionery:/usr/share/nginx/html/assets .` e não vai para o navegador.

## F2: botão "Sair" duplicado

Removido o ícone antigo (`title="Sair"`) do header. Fica só o item "Sair" do menu do avatar.

## F3: Nova Entrada manual sem Custo Unitário

A validação já existia via `required` nos inputs (Custo Unitário, Data Fabricação e Data Vencimento
quando a entrada é manual), e o formulário envia `0`, nunca `null`, para custo vazio. Então o `POST`
com custo nulo do QA provavelmente não saiu deste formulário. Como reforço, o `handleSubmit` agora
valida os três campos (e datas inválidas) antes de chamar a API e lista os itens pendentes. Entrada
via Compra não foi alterada.

## F4: sino não atualiza durante a sessão

- **Causa:** o header fica montado a sessão inteira. A contagem de alertas de estoque tinha polling,
  mas a lista do dropdown não. Os alertas de pedido não tinham polling nenhum. Mutations que criam
  alerta (entrada/saída, pedido) não invalidavam as queries de alerta.
- **Correção:**
  - `useAlertasRecentes` (lista do dropdown) e os hooks de alerta de pedido com
    `refetchInterval: 60_000` e `refetchOnWindowFocus`.
  - Refetch ao abrir cada dropdown.
  - `MutationCache` global em `main.tsx` que invalida `['alertas']`, `['alertas-pedido']` e
    `['alertas-produto']` depois de qualquer mutation bem-sucedida.
- **Sino de estoque (decisão do dono, 2026-09-28):** "No calendário temos pedidos na parte
  superior; o sino deveria abrir os outros alertas."
  - O sino nunca mostrou alertas de pedido. Eles já ficavam só no ícone de calendário do topo, que
    cobre todos os tipos (SEMANAL, TRES_DIAS, DOIS_DIAS, UM_DIA, NO_DIA, ATRASADO): a contagem vem de
    `count-ativos` e a lista de todos os ativos, sem filtro de tipo. Nada precisou ser removido.
  - O sino passou a reunir insumo e produto (`src/components/layout/useAlertasSino.ts`):
    - a contagem é a soma dos dois `count-ativos`;
    - a lista junta os mais recentes das duas origens, ordenados por data desc, com etiqueta
      Insumo/Produto;
    - o clique num alerta leva à tela de alertas da origem;
    - o rodapé tem um atalho para cada tela, com a contagem.
  - Mesma política de refresh do F4: `useAlertasProdutoRecentes` e `useAlertasProdutoCountAtivos` com
    polling de 60 s, `refetchOnWindowFocus`, refetch ao abrir e invalidação de `['alertas-produto']`
    pelo MutationCache.
  - As quatro queries são independentes. Se a origem de produto ou de insumo falhar, o sino segue com
    a outra (contagem e lista), sem quebrar o header.
  - Sem toast no polling. As queries de background (contagens usadas pelo sino e pelo menu lateral,
    e as listas do sino) usam a nova flag `silentError` do axios, que suprime o toast para qualquer
    status. O 401 continua levando ao login. A falha aparece discretamente dentro do dropdown aberto
    ("Não foi possível carregar alertas de insumo/produto"), e o "Nenhum alerta ativo" não aparece
    quando alguma origem falhou. As telas de Alertas continuam com o toast normal.
  - Guia in-app atualizado: "Alertas de Insumo" (sino = estoque, insumo + produto) e "Alertas de
    Pedido" (o indicador do topo é o calendário, não o sino).

## F5: selo "Simulado" em "Notificações enviadas"

Ver `doc/notificacoes-frontend-2026-09-25.md` (N1). O contrato de `modoEnvio` está no guia do monólito.

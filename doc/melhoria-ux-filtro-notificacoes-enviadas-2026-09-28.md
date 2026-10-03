# Solicitação de melhoria (UX) — filtro padrão em "Notificações enviadas"

> **RESOLVIDO em 2026-09-29.** Decisão do dono: a tela abre SEMPRE com o filtro **Todos** (opção 3,
> mas sem restringir à primeira visita). "Todos" passou a ser a primeira opção do select, e a chamada
> sai sem o parâmetro `status`. O contador por status (opção 2) ficou de fora: exigiria uma chamada
> extra por status, porque o backend não tem endpoint de contagem.

**Data:** 2026-09-28
**Origem:** dúvida do usuário ao abrir `http://localhost/notificacoes-enviadas` — "não tem nada?"
**Tipo:** melhoria de UX, não é bug — comportamento atual é intencional (ver código)
**Escopo mantido:** só documentação, nenhuma alteração de código feita por este QA.

---

## O que acontece hoje

A tela abre com o filtro **Status = "Falhou"** por padrão:

```tsx
// src/modules/notificacao/pages/NotificacaoOutboxListPage.tsx:50-51
// Padrão FALHOU: a tela existe pra ver o que não chegou.
const [status, setStatus] = useState<NotificacaoOutboxStatus | ''>('FALHOU')
```

Isso é uma decisão de produto deliberada (o comentário no código deixa claro) — a tela existe
principalmente para ver o que **não** foi entregue, então faz sentido abrir já filtrada nisso.

O problema é o resultado quando não há nenhuma falha (que é o cenário bom, e hoje é o cenário real
do ambiente): a tabela fica vazia, com só o texto discreto "Nenhuma notificação com falha" (mapa de
mensagens em `NotificacaoOutboxListPage.tsx:20-24`). Testando ao vivo, essa combinação — filtro
escondido no topo + tabela em branco — foi lida como "a tela não tem nada", quando na verdade há 7
notificações enviadas com sucesso, só não estão no filtro atual.

## Por que vale ajustar

O comportamento é opcional de melhorar. Ele não gera dado incorreto, não é uma falha funcional. Mas o
filtro padrão some visualmente com o histórico de envios reais assim que não há problema nenhum — que,
se o sistema estiver saudável, é o estado mais comum. Ou seja: no dia a dia normal (sem falhas), a
primeira impressão de quem abre a tela é de vazio/quebrado.

## Sugestões (para avaliação do time, não uma especificação fechada)

Sem mexer na decisão de produto de priorizar "Falhou" — algumas formas de deixar mais claro que a
tela **tem** dados, só filtrados:

1. Estado vazio mais assertivo quando `status === 'FALHOU'` e a lista vem vazia: em vez do texto
   neutro atual, algo que confirme "está tudo bem" (ex.: ícone de check + "Nenhuma falha — todas as
   notificações foram entregues") e, ao lado, um link/botão "Ver todas" que troca o filtro para
   `ENVIADO` ou vazio (`Todos`).
2. Um contador por status ao lado do próprio filtro (ex.: "Falhou (0) · Enviado (7)"), pra ficar
   visualmente óbvio que existe histórico mesmo com o filtro atual vazio.
3. Alternativa mais simples: trocar o default de `FALHOU` para `''` (Todos) só na primeira visita —
   mantendo a lógica de "falhas primeiro" apenas quando o usuário volta a essa tela numa mesma sessão
   (ex. via um estado em memória/sessionStorage), sem perder a intenção original do comentário do
   código.

Qualquer uma resolve o problema relatado; a escolha entre elas é do time — não há nada quebrado a
"corrigir", é puramente uma question de primeira impressão.

## Onde mexer (referência para quem for implementar)

- `confectionery-web-dashboard/src/modules/notificacao/pages/NotificacaoOutboxListPage.tsx`
  - Linha 51: default do filtro (`useState(... 'FALHOU')`)
  - Linhas 20-24: mapa de mensagens do estado vazio por status

---

## Conclusão

Não é uma pendência de homologação (nenhum achado F1-F5 ou correção anterior é afetado) — é uma
sugestão de melhoria incremental, registrada a pedido do usuário depois de uma dúvida real ao usar a
tela. Fica à disposição do time (e de quem/qual agente for implementar) decidir se e como aplicar.

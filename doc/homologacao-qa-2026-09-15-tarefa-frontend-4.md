# Homologação QA — Tarefa para o agente de Frontend (rodada 4)

**Origem:** auditoria de QA/homologação de 2026-09-15, addendum 4 (`doc/homologacao-qa-2026-09-15-addendum4.md` no repositório do backend) — achado 14.
**Repositório:** `confectionery-web-dashboard` (branch `hotfix/estoque-insumo`).
**Regra combinada com o dono do projeto: NÃO COMMITAR.** Deixe as alterações no working directory para revisão manual.
**Escopo:** só o achado abaixo.

---

## Achado 14 — BAIXO — Precificação de produto sem receita mostra toast de erro técnico numa resposta 400 esperada

**Arquivo:** `src/modules/estoqueProdutos/hooks/usePrecificacoes.ts`, hook `usePrecificacaoSimulada`.

**Reprodução:** abrir a tela de Precificação de um produto sem receita cadastrada (ex.: "Produto Sem Receita Precificacao") dispara `POST /precificacao-produto/simular`, que retorna 400 — uma resposta de regra de negócio esperada ("produto sem receita"), não uma falha real. Mesmo assim, o toast global de erro técnico aparece toda vez que a tela é visitada, o que é uma experiência ruim pra um estado normal do sistema.

**Causa raiz:** o próprio comentário do hook já reconhece que "um 400 aqui é uma regra de negócio (ex: produto sem receita), não uma falha transitória", e por isso já desativa o `retry` (`retry: false`). Mas a chamada ao service (`precificacaoProdutoService.simular()`, em `src/modules/estoqueProdutos/services/precificacaoProdutoService.ts` ou caminho equivalente) não passa a opção `{ skipErrorToast: true }` que já existe no cliente axios do projeto e que já é usada exatamente para esse mesmo tipo de cenário em `precificacaoProdutoService.getVigenteByProdutoId` (tratado com essa flag na rodada 1 desta auditoria, para um 404 análogo — "produto ainda sem precificação vigente").

**Fix sugerido:** adicionar `{ skipErrorToast: true }` na chamada de `simular()` dentro de `usePrecificacaoSimulada`, no mesmo padrão já usado em `getVigenteByProdutoId`. Conferir se `simular()` já aceita esse parâmetro de opções (deve aceitar, se `getVigenteByProdutoId` já usa o mesmo cliente axios) — só propagar a flag até a chamada HTTP.

**Verificação sugerida após o fix:** abrir a tela de Precificação de "Produto Sem Receita Precificacao" e confirmar que a mensagem "sem receita" continua aparecendo normalmente na própria tela (isso não deve mudar — é a UI já tratando o estado), mas o toast global de erro técnico não aparece mais.

## Não fazer nesta tarefa

- Achado 13 (Categoria de Insumo, erro 500 ao excluir) e achado 15 (`valor_custo_total` não persistido) são do backend — não tocar, ver `doc/homologacao-qa-2026-09-15-tarefa-backend-5.md` no repositório `confectionery`.
- Item 36 (estorno de cancelamento de pedido) foi testado e confirmado correto nesta rodada — nenhuma ação necessária.
- Não mexer no restante de `usePrecificacoes.ts` ou `PrecificacaoProdutoForm.tsx` — ambos já foram revisados/testados ao vivo nesta mesma sessão e estão corretos (formato dual receita/manual, simulação reativa debounced, preço final editável, etc.) — mudar só a chamada de `simular()` citada acima.

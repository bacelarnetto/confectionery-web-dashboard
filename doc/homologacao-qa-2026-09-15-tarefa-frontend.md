# Homologação QA — Tarefa para o agente de Frontend

**Origem:** auditoria de QA/homologação de 2026-09-15 (análise estática + testes E2E reais em deploy local, login via Keycloak).
**Repositório:** `confectionery-web-dashboard` (branch `hotfix/estoque-insumo`).
**Regra combinada com o dono do projeto: NÃO COMMITAR.** Deixe todas as alterações apenas no working directory para revisão manual antes de qualquer commit.

---

## 0. O que já foi corrigido nesta mesma rodada de homologação (não duplicar)

Já está no working directory, sem commit:

1. `src/modules/estoqueProdutos/services/precificacaoProdutoService.ts` — a chamada `getVigenteByProdutoId` ganhou `{ skipErrorToast: true }`, porque um 404 aí é estado de negócio normal (produto sem preço cadastrado ainda), não falha técnica. Afeta `PedidoFormPage.tsx`, `OrcamentoFormPage.tsx`, hook `usePrecificacaoVigente`.
2. `src/components/ui/Badge.tsx` — adicionada entrada `ESTORNO_CANCELAMENTO` em `statusStyles` (`bg-amber-100 text-amber-800`) e `statusLabels` ("Estorno Cancelamento"), grupo "Origem do lote de estoque de produto (F17)". Cobre o badge que faltava para o novo lote gerado pelo hotfix de cancelamento/estorno (item 36 do backend).

Se seu trabalho também tocar esses arquivos, confira o estado atual antes de sobrescrever.

---

## 1. Tarefa nova: mensagens de erro genéricas não mostram o detalhe do backend (item #8 do PROJECT_CONTEXT.md)

**Severidade no doc:** Baixo. **Arquivo principal:** `src/lib/axios.ts` (interceptor de resposta global).

### 1.1 O que foi confirmado nesta auditoria

O `GlobalExceptionHandler` do backend já devolve um `ErroResponseDTO` com campo `mensagem` **útil e específico** em vários casos — não só em 400:
- 404 (`NoSuchElementException`) → `mensagem = ex.message ?: "Recurso não encontrado"` (mensagem real, não genérica).
- 403 (`AccessDeniedException`) → `mensagem = "Você não tem permissão para realizar esta ação."`.
- 400 (`RegraDeNegocioException`, validação, payload inválido) → já usa `mensagem` do backend corretamente.
- 500 (genérico) → `mensagem` é **deliberadamente genérica por design** do backend ("Ocorreu um erro inesperado...") para nunca vazar detalhe de schema/query — isso é intencional e não deve mudar no frontend.

Mas o interceptor em `src/lib/axios.ts` (bloco `api.interceptors.response.use`, tratamento de erro) **ignora `data?.mensagem` para os status 404, 401 e 403**, usando texto hardcoded no lugar:

```ts
if (status === 500) {
  mensagem = `Erro interno do servidor (${url})`
} else if (status === 404) {
  mensagem = `Endpoint não encontrado (${url})`          // ignora data.mensagem, mesmo quando o backend manda algo útil
} else if (status === 401 || status === 403) {
  mensagem = 'Acesso não autorizado'                      // idem, ignora a mensagem específica do 403
} else if (status === 400) {
  mensagem = data?.mensagem || data?.message || 'Dados inválidos'   // já correto
} else {
  mensagem = data?.mensagem || data?.message || 'Erro de conexão. Tente novamente.'
}
```

Esse foi exatamente o padrão do bug 2.5 encontrado ao vivo nesta auditoria (toast cru "Endpoint não encontrado (/precificacao-produto/vigente/2) (ID: ...)" ao criar pedido com produto sem preço) — aquele caso específico já foi resolvido com `skipErrorToast` (ver seção 0.1), mas o padrão de fundo continua valendo pra qualquer outra chamada 404/403 do sistema que não tenha esse opt-out.

### 1.2 O que fazer

1. Em `src/lib/axios.ts`, nos ramos `404` e `401 || 403`, preferir `data?.mensagem ?? data?.message` quando presente, caindo no texto genérico atual apenas como fallback:
   ```ts
   } else if (status === 404) {
     mensagem = data?.mensagem || data?.message || `Endpoint não encontrado (${url})`
   } else if (status === 401 || status === 403) {
     mensagem = data?.mensagem || data?.message || 'Acesso não autorizado'
   }
   ```
2. **Não alterar o ramo `500`** — a mensagem genérica ali é intencional (comentário no próprio `GlobalExceptionHandler.kt` explica por quê: nunca expor detalhe de erro interno ao usuário final). Manter como está.
3. Confirmar que `parseApiError` em `src/lib/apiError.ts` (usado por formulários que fazem `skipErrorToast` e tratam o erro inline) não precisa de mudança — ele já lê `data?.mensagem ?? data?.message` genericamente.
4. Rodar `tsc --noEmit` depois da alteração (estava limpo antes, 0 erros).
5. Se possível, validar manualmente pelo menos um caso 404 real (ex.: acessar um recurso inexistente) e um 403 real (ex.: ação restrita a `ADMIN` com outro perfil) para confirmar que a mensagem específica do backend aparece no toast em vez do texto genérico.

### 1.3 Não fazer nesta tarefa

- Não tocar no ramo `500` (ver 1.2.2).
- Não expandir para outros itens do backlog de frontend — os demais itens da tabela "Problemas Conhecidos" (frontend) já estão resolvidos ou fora de escopo desta rodada.

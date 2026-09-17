# Homologação QA — Tarefa 2 para o agente de Frontend

**Origem:** continuação da homologação de 2026-09-15 — testes reais em navegador cobrindo Compras, Fabricação, Orçamento→Pedido, Financeiro e Relatórios (escopo de negócio, sem teste de acesso/perfil).
**Repositório:** `confectionery-web-dashboard` (branch `hotfix/estoque-insumo`).
**Regra combinada com o dono do projeto: NÃO COMMITAR.** Deixe as alterações apenas no working directory para revisão manual.

---

## 1. Tarefa nova — ALTO: cache do estoque de insumos não atualiza após confirmar recebimento de uma Compra

**Arquivo:** `src/modules/compras/hooks/useCompras.ts`, função `useGerarEntradaInsumoCompra()`:

```ts
export function useGerarEntradaInsumoCompra() {
  return useMutation({
    mutationFn: ({ compraId, payload }: { compraId: number; payload: EntradaInsumoInsertForm }) =>
      compraService.gerarEntradaInsumo(compraId, payload),
    onSuccess: () => {
      toast.success('Entrada de insumos gerada com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao gerar entrada no estoque.')
    },
  })
}
```

**Confirmado ao vivo:** criei uma Compra, marquei um item como comprado e cliquei em "Confirmar recebimento". O backend processou certo (estoque real subiu de 20,66 para 25,66 para o insumo em questão), mas a tela "Estoque de Insumos" (`/estoque-insumos/estoque`) continuou mostrando o valor antigo até eu recarregar a página manualmente — o `onSuccess` dessa mutation não invalida nenhuma query do TanStack Query, diferente de `useUpdateCompraStatus` (mesmo arquivo), que corretamente invalida `['compras']`.

**O que fazer:** adicionar `queryClient.invalidateQueries(...)` no `onSuccess`, cobrindo pelo menos as query keys do módulo de insumos que ficam desatualizadas:
- `['estoque-insumos']` e `['estoque-insumo']` (arquivo `src/modules/estoqueInsumos/hooks/useEstoqueInsumos.ts` — cobre a lista de saldo e o card "Capital imobilizado")
- `['insumos']` (`useInsumos.ts`)
- `['entradas-insumo']` (`useEntradasInsumo.ts`)

Seguir o mesmo padrão de `useCreateCompra`/`useUpdateCompra` no mesmo arquivo, que já usam `useQueryClient()` + `invalidateQueries`.

## 2. Tarefa nova — BAIXO/MÉDIO: data de validade do Orçamento aparece com 1 dia de diferença entre listagem e formulário de edição

**Arquivo:** `src/modules/vendas/pages/OrcamentoFormPage.tsx`, por volta da linha 102, ao carregar um orçamento existente para edição:

```ts
dataValidade: orcamento.dataValidade ? orcamento.dataValidade.slice(0, 10) : '',
```

**Confirmado ao vivo:** o Orçamento #17 aparece na listagem (`OrcamentoListPage.tsx`) com "Válido até: 14/09/2026", mas ao abrir para editar, o campo mostra "15/09/2026" — mesmo registro, datas diferentes.

**Causa:** `OrcamentoListPage.tsx` formata a data corretamente ajustando pro timezone local (`new Intl.DateTimeFormat('pt-BR', {...}).format(new Date(dataValidade))`). Já o formulário faz `.slice(0, 10)` direto na string ISO (que está em UTC), sem nenhuma conversão de timezone — perto da meia-noite isso desloca a data em 1 dia (o valor é originalmente salvo como `${data}T23:59:59` no horário local do navegador, ver linha ~200 do mesmo arquivo, então em UTC ele cai no dia seguinte de madrugada).

**O que fazer:** ao popular o campo do formulário, converter a data pro timezone local antes de extrair `YYYY-MM-DD`, em vez de usar `.slice(0,10)` na string UTC crua. Por exemplo, construir `new Date(orcamento.dataValidade)` e formatar year/month/day a partir dos getters locais (`getFullYear()`, `getMonth()`, `getDate()`), ou reaproveitar a mesma lógica de formatação já usada em `OrcamentoListPage.tsx` (extraída pra um helper compartilhado, se ainda não existir um).

## 3. Não é tarefa de código — decisão de produto pendente (mencionar ao dono, não implementar sozinho)

Confirmei que o botão "Aprovar" de um Orçamento (`OrcamentoFormPage.tsx`) converte o orçamento em Pedido mesmo quando a validade já passou (a marcação vermelha na listagem é só visual, `isVencida()` em `OrcamentoListPage.tsx`, sem nenhuma checagem equivalente no botão Aprovar nem no backend). Não é uma tarefa de fix — é uma pergunta de regra de negócio pro dono decidir (bloquear ou não). Só documentando o comportamento observado.

## 4. Não fazer nesta tarefa

Os 2 achados de BACKEND desta rodada (exclusão de conta avulsa já paga; relatório de movimentação com fonte de dados incompleta) estão na tarefa equivalente do repositório `confectionery` — não precisam ser replicados aqui. Os itens já fora de escopo da Tarefa 1 continuam fora de escopo.

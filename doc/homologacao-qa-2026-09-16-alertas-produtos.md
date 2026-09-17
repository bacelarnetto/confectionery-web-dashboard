# Homologação QA — Alertas de Produtos (2026-09-16)

## Origem

Item explicitamente marcado como não testado pelo dono do projeto: *"Alertas de Produtos... Monitore vencimentos e níveis de estoque de produtos - não fizemos testes para essa função"*.

Objetivo: testar ao vivo (via UI + API) a tela **Alertas de Produtos** (`/estoque-produtos/alertas`), alimentada pela **Parametrização de Alertas de Produtos** (`/estoque-produtos/parametrizacao-alertas`), cobrindo os dois tipos de alerta (Vencimento e Estoque Mínimo), o botão "Verificar Agora", deduplicação, e a ação manual "Resolver".

**Escopo:** só de negócio. Segurança e perfis de acesso não fazem parte deste teste.

## Massa de teste

- **Parametrização de Alertas de Produtos #2** — Produto "Bolo QA Estoque", Qtd Mínima **5**, Dias de antecedência para vencimento **10**. (Note: a tela de parametrização de Produto só tem QTD MÍNIMA e DIAS VENCIMENTO — diferente da parametrização de Alertas de Insumo, que também tem QTD MÁXIMA. Não é um achado, só uma diferença de modelo entre as duas telas, registrada por transparência.)
- Lotes de "Bolo QA Estoque" em Estoque de Produtos, criados via Fabricação real (débito automático de Farinha de Trigo QA Estoque, reabastecida via novas Entradas manuais quando necessário):
  - Lote #16 — 1 un., sem data de validade.
  - Lote #17 — 1 un., validade 20/09/2026 (dentro da janela de 10 dias parametrizada → deve gerar alerta de Vencimento).
  - Lote #18 — 3 un., validade 16/01/2027.
  - Lote #19 — 2 un., validade 16/01/2027.

## Passo 1 — Geração dos alertas (estoque baixo)

Com o estoque total do produto em **2 unidades** (lotes #16 + #17, abaixo da mínima parametrizada de 5) e o lote #17 vencendo em 4 dias (dentro da janela de 10 dias), cliquei em **"Verificar Agora"** (`POST /api/alerta-produto/verificar`).

✅ **Resultado: CORRETO.** Foram gerados os dois tipos de alerta, ambos "Ativo":

| ID | Tipo | Produto | Qtd Atual | Referência |
|---|---|---|---|---|
| #1 | Vencimento | Bolo QA Estoque | — | Vence: 20/09/2026 |
| #2 | Estoque Mínimo | Bolo QA Estoque | 2 | Mín: 5 |

## Passo 2 — Deduplicação

Cliquei em "Verificar Agora" repetidas vezes, sem alterar nenhum dado subjacente.

✅ **Resultado: CORRETO.** Nenhum alerta duplicado foi criado — a listagem permaneceu com exatamente os mesmos 2 registros (mesmo padrão de correção já observado na sessão anterior para Alertas de Pedido).

## Passo 3 — Achado: alerta de Estoque Mínimo não se resolve automaticamente

Para testar a resolução automática, reabasteci o insumo Farinha (nova Entrada manual) e registrei fabricações adicionais de "Bolo QA Estoque" em duas rodadas:

1. Estoque elevado para exatamente **5 unidades** (= mínima parametrizada). Cliquei "Verificar Agora" (confirmado `POST /api/alerta-produto/verificar` → 200 OK) — o alerta #2 continuou "Ativo".
2. Para eliminar qualquer ambiguidade de limite (5 == mínima poderia, em tese, ainda contar como "no mínimo, ainda precisa de atenção"), elevei o estoque para **7 unidades** (claramente acima da mínima de 5). Cliquei "Verificar Agora" novamente — confirmado via rede que a chamada `POST /api/alerta-produto/verificar` retornou 200 OK duas vezes seguidas.

❌ **Resultado inesperado.** Mesmo com o estoque real em 7 unidades (bem acima da mínima de 5) e "Verificar Agora" executado com sucesso múltiplas vezes, o alerta #2 permaneceu:

```json
{
  "id": 2,
  "ativo": true,
  "tipoDescricao": "Estoque abaixo do mínimo",
  "quantidadeAtualEstoque": 2,
  "quantidadeMinimaEstoque": 5,
  "resolvidoEm": null,
  "resolvidoPor": null
}
```

O campo `quantidadeAtualEstoque` ficou **congelado no valor 2** (o valor de quando o alerta foi criado), e o alerta nunca é automaticamente marcado como resolvido, mesmo a condição que o gerou (estoque < mínima) já não sendo mais verdadeira.

**Por que isso importa:** numa tela cujo próprio subtítulo diz *"Monitore vencimentos e níveis de estoque de produtos"* e que tem um botão dedicado "Verificar Agora" para reavaliar o estado, a expectativa razoável é que esse botão também *resolva* alertas cuja condição deixou de existir — não só crie novos. Do jeito que está, uma vez que o estoque cai abaixo do mínimo, o alerta fica "Ativo" para sempre, mesmo após repor o estoque, até que **alguém resolva manualmente cada alerta um por um**. Em operação real, isso pode: (a) acumular alertas "Ativo" defasados que não refletem mais a realidade do estoque, e (b) obrigar um passo manual extra a cada reposição, para cada produto/alerta.

Não sei se isso é intencional (ex.: alerta de reposição que só deve fechar por decisão humana, mesmo com estoque normalizado) ou uma lacuna de implementação — fica registrado para o time/dono do produto decidir.

## Passo 4 — Resolução manual funciona corretamente

Cliquei no ícone "Resolver" (✓) do alerta #2 → modal de confirmação "Confirma a resolução do alerta #2?" → confirmei.

✅ **Resultado: CORRETO.** `PUT /api/alerta-produto/2/resolver` retornou 200, e o status na listagem mudou imediatamente de "Ativo" para "Resolvido".

Repeti o mesmo fluxo para o alerta #1 (Vencimento) — mesmo padrão, resolvido com sucesso.

## Passo 5 — Alerta resolvido não é reativado indevidamente

Após resolver manualmente o alerta #2 (com o estoque real ainda em 7, acima da mínima), cliquei "Verificar Agora" mais uma vez.

✅ **Resultado: CORRETO.** O alerta #2 permaneceu "Resolvido" — não foi reaberto/duplicado, o que é o comportamento esperado já que a condição real (estoque < mínima) de fato não se verifica.

## Conclusão

| Comportamento testado | Resultado |
|---|---|
| Geração do alerta de Vencimento | ✅ Correto |
| Geração do alerta de Estoque Mínimo | ✅ Correto |
| Deduplicação em cliques repetidos de "Verificar Agora" | ✅ Correto |
| Resolução automática do alerta de Estoque Mínimo quando estoque volta ao normal | ❌ **Não ocorre** (achado) |
| Resolução manual via botão "Resolver" | ✅ Correto |
| Não reabertura de alerta já resolvido, com condição normalizada | ✅ Correto |

**Achado a levar ao time:** ausência de resolução automática do alerta "Estoque Mínimo" (e, por extensão não testada diretamente, possivelmente também do alerta "Vencimento") quando a condição que o originou deixa de existir. Fica como decisão de negócio se isso deve ser implementado (auto-resolver ao reverificar) ou se o fluxo manual atual é o desejado.

## Observação tangencial (não é achado, registrada por transparência)

A tela de Parametrização de Alertas de Produtos tem apenas os campos PRODUTO, QTD MÍNIMA e DIAS VENCIMENTO — sem um campo de "QTD MÁXIMA", presente na Parametrização de Alertas de Insumo. Diferença de modelo entre as duas features, não necessariamente um problema.

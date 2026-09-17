# Requisito de negócio — Campos obrigatórios em Nova Entrada / Editar Entrada (2026-09-16)

> **Natureza deste documento:** diferente dos relatórios anteriores (`homologacao-qa-*.md`), este não é um achado de bug — é o registro de uma **decisão de negócio do dono do projeto**, repassada em conversa, para servir de especificação ao time de frontend. Ainda não foi implementada ("ainda não fizemos").

## Regra de negócio (conforme repassado pelo dono do projeto)

Nas telas **Nova Entrada** e **Editar Entrada** (`/estoque-insumos/entradas/nova` e `/estoque-insumos/entradas/{id}/editar`), os campos por item:

- **Data Fabricação**
- **Data Vencimento**
- **Custo Unitário (R$)**

devem ser **obrigatórios — mas apenas quando a entrada é cadastrada manualmente** (não vinculada a uma Compra).

### Por que a distinção por origem

- Quando o insumo vem de uma **lista de Compra**, a lista se transforma depois em entrada de itens **antes** de esses dados existirem — a confeiteira só sabe o custo real, a data de fabricação e a validade quando o produto chega fisicamente. Ela completa esses dados depois, editando a entrada gerada pela compra.
- Portanto, para entradas com **origem "Via Compra"**, esses 3 campos devem continuar **opcionais** no momento da criação (mantendo o mecanismo já existente de "Preenchimento Pendente" para completar depois).
- Para entradas **cadastradas manualmente** (sem Compra vinculada — o usuário está registrando um item que já tem em mãos, com nota fiscal/custo já conhecidos), não há esse motivo para deixar em branco, então os 3 campos devem ser **obrigatórios**.

### Restrição explícita de implementação

> "Resumindo, não vamos mudar base, e nem código de backend para esse item."

- A validação deve ser feita **somente no Frontend** (client-side).
- **Nenhuma mudança de banco de dados ou de backend** deve ser feita para este item.

## Estado atual observado (evidência coletada em 2026-09-16)

Testado ao vivo nas duas variantes da tela, sem alterar nenhum dado de produção:

**1. Nova Entrada (fluxo manual)** — `/estoque-insumos/entradas/nova`: no formulário de item, apenas **Insumo** e **Quantidade** têm o indicador visual de obrigatório (`*`). **Data Fabricação**, **Data Vencimento** e **Custo Unitário (R$)** não têm indicador de obrigatório, e o formulário permite cadastrar a entrada com os três em branco — confirmado na rodada de teste anterior (entradas de teste #18/#19, cadastradas com "Custo Unitário" vazio, foram salvas normalmente com `valorCustoUnitario: 0` sem nenhum bloqueio).

**2. Editar Entrada de um item via Compra** (ex.: Entrada #17, origem "Compra #11") — `/estoque-insumos/entradas/17/editar`: mesmo padrão exato de campos — Insumo/Quantidade com `*`, Data Fabricação/Data Vencimento/Custo Unitário sem `*` e sem bloqueio ao salvar vazios.

**Conclusão do estado atual:** hoje o formulário **não diferencia a origem da entrada** — o comportamento de obrigatoriedade dos três campos é idêntico nos dois fluxos (nenhum dos dois exige preenchimento). O gap a implementar é exatamente essa diferenciação condicional.

## O que precisa ser implementado

No componente de formulário de Entrada (usado tanto em Nova Entrada quanto em Editar Entrada), adicionar validação client-side condicional por item:

- **Se a entrada NÃO tem Compra vinculada** (fluxo "Nova Entrada" / origem Manual): os campos **Data Fabricação**, **Data Vencimento** e **Custo Unitário (R$)** passam a ser obrigatórios — mesmo padrão visual (`*` + mensagem "Preencha este campo") já usado em Insumo/Quantidade — e bloqueiam o botão "Cadastrar entrada" / "Salvar alterações" enquanto vazios.
- **Se a entrada TEM Compra vinculada** (origem "Via Compra #N"): manter o comportamento atual — os três campos continuam opcionais, preservando o fluxo já existente de "Preenchimento Pendente" (pill de filtro na listagem de Entradas) para serem completados depois pela confeiteira.
- **Fora de escopo, por decisão explícita do dono do projeto:** qualquer alteração de schema de banco de dados ou de validação/regra no backend. A implementação deve ficar inteiramente no frontend.

## Observação relacionada

Este requisito resolve, pelo lado de regra de negócio, a observação registrada no relatório `homologacao-qa-2026-09-16-teste-estoque-fabricacao.md` (item 1 das "observações tangenciais"): o fato de uma entrada manual poder ser salva com Custo Unitário zerado, sem aviso, distorcendo o Valor Imobilizado do insumo sem que o usuário perceba. Com esta validação implementada, esse cenário não deve mais ser possível para entradas manuais.

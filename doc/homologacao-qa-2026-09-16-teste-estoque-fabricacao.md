# Homologação QA — Teste de cenário: consumo de insumo via Fabricação (2026-09-16)

## Origem

Pedido do dono do projeto: *"comprei 1kg de farinha, mas para fabricar um bolo uso 500 gramas, metade de 1kg, como vai se comportar o estoque, vai constar 0,5 kg?"*

Objetivo: validar, ao vivo (via UI + API), se o Estoque de Insumos debita corretamente a quantidade consumida por uma receita no momento do registro de uma Fabricação, e se o resultado numérico está certo (500g consumidos de uma entrada de 1000g deve deixar exatamente 500g / 0,5kg de saldo).

**Escopo:** só de negócio (fluxo de estoque/fabricação). Segurança e perfis de acesso não fazem parte deste teste.

## Massa de teste criada para o cenário

Para isolar o teste de qualquer dado pré-existente, foram criados do zero:

- **Insumo #13 — "Farinha de Trigo QA Estoque"**: unidade `g`, não perecível, valor de referência R$ 0,05/g.
- **Entrada de Insumo #21** (manual): 1000 g de Farinha de Trigo QA Estoque, Custo Unitário R$ 0,05, Custo Total R$ 50,00.
  - *Observação lateral:* duas tentativas anteriores de criar essa entrada (IDs #18 e #19) foram feitas deixando o campo "Custo Unitário" em branco, assumindo que ele seria calculado automaticamente a partir do Valor Total da entrada — o que **não é o comportamento do sistema para entradas manuais** (sem Compra vinculada): o campo é de preenchimento manual, não derivado. Essas duas entradas de teste, criadas com custo zerado, foram excluídas antes do teste principal para não distorcer o saldo (exclusão via botão "Remover" na tela de Entradas — ação permitida e sem impacto em dado de produção, pois eram registros de teste meus).
- **Produto #6 — "Bolo QA Estoque"** (sem categoria).
- **Receita #7** vinculada ao produto acima, com 1 ingrediente: Farinha de Trigo QA Estoque, quantidade **500 g** por unidade produzida.

## Estado do estoque de insumo ANTES da fabricação

Tela **Estoque Atual** (`/estoque-insumos/estoque`):

| ID | Insumo | Quantidade | Valor Imobilizado |
|---|---|---|---|
| #9 | Farinha de Trigo QA Estoque (13) | **1000.00** | R$ 50,00 |

## Ação testada

Tela **Fabricação → Nova Fabricação** (`/estoque-produtos/fabricacoes/nova`), que traz o aviso: *"Ao registrar a fabricação, os insumos da receita serão debitados do estoque automaticamente (FIFO), e o produto será creditado no estoque."*

Registrada a **Fabricação #13**: Receita "Bolo QA Estoque", Quantidade = 1 unidade.

## Estado do estoque de insumo DEPOIS da fabricação

Tela **Estoque Atual**, atualizada automaticamente após o registro:

| ID | Insumo | Quantidade | Valor Imobilizado | Última atualização |
|---|---|---|---|---|
| #9 | Farinha de Trigo QA Estoque (13) | **500.00** | **R$ 25,00** | 16/09/2026, 05:06 — admin |

✅ **Resultado: CORRETO.** 1000g − 500g (consumidos pela receita) = **500g (0,5 kg)**, exatamente o valor esperado pelo cenário descrito. O valor imobilizado também foi recalculado proporcionalmente (R$ 50,00 → R$ 25,00), consistente com o custo unitário de R$ 0,05/g da entrada original.

## Confirmação complementar — estoque do produto

Tela **Estoque de Produtos** (`/estoque-produtos/estoque`): novo lote **#16 — "Bolo QA Estoque"**, quantidade **1.00**, origem **"Fabricação"**, criado em 16/09/2026. Confirma que, além de debitar o insumo, a fabricação creditou corretamente 1 unidade do produto no estoque — comportamento simétrico e esperado (o mesmo evento gera as duas movimentações, débito de insumo e crédito de produto).

## Conclusão

O sistema se comporta exatamente como descrito no Guia do Usuário: a Fabricação é o momento em que o estoque de insumo da receita diminui, na proporção certa, e o estoque de produto aumenta na mesma operação. Não há achado/bug a reportar neste fluxo — **cenário homologado com sucesso.**

## Observações tangenciais (não fazem parte do bug do cenário, registradas por transparência)

Durante a montagem da massa de teste, três comportamentos foram notados e vale documentar para o time, embora nenhum deles tenha impedido o teste principal:

1. **Custo Unitário/Custo Total de item de Entrada manual não é derivado do Valor Total da entrada** — é um campo de preenchimento manual (ver acima). Não é um bug (não há Compra para derivar o custo), mas é um ponto de atenção de UX: se o usuário deixar o campo em branco, a entrada é salva com custo zerado sem aviso bloqueante, o que pode distorcer o Valor Imobilizado do insumo sem que o usuário perceba. Sugestão (fora do escopo deste teste, só um apontamento): considerar um aviso/validação exigindo Custo Unitário > 0 antes de salvar uma entrada manual.
2. **`GET /api/estoque-insumo/{id}`** (endpoint de busca por ID único) retorna **500 Erro Interno** de forma consistente, testado em mais de um ID válido. Como a tela de Estoque Atual usa apenas o endpoint de listagem (`GET /api/estoque-insumo`), isso não afeta a UI, mas parece ser um endpoint quebrado/não utilizado.
3. **`PUT /api/entrada-insumo/{id}`** (editar uma entrada já cadastrada) retornou **409 Conflict** ao tentar salvar uma correção de Custo Unitário em uma entrada já criada com o campo zerado (entrada de teste #18, já excluída). Não foi possível diagnosticar a regra de negócio exata por trás do conflito nesta sessão; não investiguei mais a fundo pois não bloqueava o teste principal (contornei criando uma nova entrada do zero com o custo já preenchido). Fica registrado para o time avaliar se é intencional (ex.: bloqueio de edição de entrada após algum estado) ou um bug.

Nenhuma dessas três observações bloqueia ou distorce o resultado do teste principal — são achados tangenciais que apareceram durante a preparação da massa de dados.

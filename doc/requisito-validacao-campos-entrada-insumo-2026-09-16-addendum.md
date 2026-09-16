# Addendum — Revalidação da regra de campos obrigatórios em Entrada (2026-09-16)

Complementa `requisito-validacao-campos-entrada-insumo-2026-09-16.md`.

## Ocorrência intermediária (não é achado, registrada por transparência)

Na primeira tentativa de revalidação, os cliques reais em "Cadastrar entrada"/"Salvar alterações" retornavam **400 "Corpo da requisição inválido ou campo obrigatório ausente"** — para qualquer entrada, manual ou via Compra. Investigação isolou a causa: o corpo enviado pelo axios precisa conter as chaves `createdBy` **e** `updatedBy` simultaneamente (o valor é sempre sobrescrito no servidor pelo usuário autenticado; só a presença da chave importa, por restrição do Jackson na desserialização). O POST de criação só mandava `createdBy`; o PUT de edição só mandava `updatedBy`. O time identificou e corrigiu isso no frontend antes desta revalidação. Não é um achado desta rodada — é o registro do que bloqueou a primeira tentativa e como foi contornado/corrigido.

## Revalidação, após o ajuste

Testado ao vivo, clicando de verdade nos botões reais da UI (não chamada direta à API):

**1. Fluxo manual (Nova Entrada, sem Compra vinculada):**
- Deixando Data Fabricação, Data Vencimento e Custo Unitário (R$) em branco (com Insumo, Quantidade e Valor Total preenchidos) e clicando "Cadastrar entrada": **bloqueado** — o formulário não submete, o foco vai para o primeiro campo obrigatório vazio ("Data Fabricação"), com o aviso "Entrada manual exige data de fabricação, data de vencimento e custo unitário em todos os itens." Nenhuma requisição chega a ser enviada.
- Preenchendo os 3 campos (Data Fabricação, Data Vencimento, Custo Unitário) e clicando "Cadastrar entrada": **cadastra com sucesso** (entrada de teste #26, depois removida).

✅ Comportamento conforme especificado.

**2. Fluxo via Compra (Editar Entrada de uma entrada com origem "Compra #N"):**
- Testado na Entrada #17 (origem Compra #11, já marcada "Preenchimento pendente"), sem preencher Data Fabricação/Data Vencimento, clicando "Salvar alterações": **salva normalmente**, sem bloqueio — os 3 campos continuam sem indicador de obrigatório (`*`) nesse fluxo, e a entrada permanece "Preenchimento pendente" como esperado, disponível para ser completada depois.

✅ Comportamento conforme especificado — nenhuma regressão no fluxo de Compra.

## Conclusão

A regra de negócio descrita em `requisito-validacao-campos-entrada-insumo-2026-09-16.md` está implementada e funcionando corretamente nos dois cenários (bloqueio em entrada manual, campos opcionais em entrada via Compra). **Requisito homologado.**

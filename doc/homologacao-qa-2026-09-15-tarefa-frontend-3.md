# Homologação QA — Tarefa para o agente de Frontend (rodada 3)

**Origem:** auditoria de QA/homologação de 2026-09-15, addendum 3 (Pedidos/Mural, Alertas de Pedido).
**Repositório:** `confectionery-web-dashboard` (branch `hotfix/estoque-insumo`).
**Regra combinada com o dono do projeto: NÃO COMMITAR.** Deixe todas as alterações apenas no working directory para revisão manual antes de qualquer commit.
**Escopo:** só os bugs novos abaixo (achados 8 e 10 do `doc/homologacao-qa-2026-09-15-addendum3.md` no repositório do backend). Há também uma tarefa **separada** de atualização do guia de usuário — ver `doc/homologacao-qa-2026-09-15-tarefa-frontend-guia-usuario.md`, tratar como outra frente de trabalho, não misturar.

---

## 1. Achado 8 — BAIXO — Desconto do item não aparece em "Detalhes do Pedido"

**Arquivo:** `src/modules/vendas/components/PedidoDetalheModal.tsx`.

A tabela de itens (por volta da linha 139-149) mostra só Produto, Qtd, Unit. e Total — o campo `item.desconto`, que já vem no DTO (`ItemPedidoViewDTO`, backend), nunca é lido nem mostrado. Resultado: quando um item tem desconto, `Unit. × Qtd` não bate com `Total` na tela, sem nenhuma explicação — confirmei ao vivo no Pedido #28 (Unit. R$ 229,90 × 1 = R$ 229,90, mas Total mostra R$ 179,90 por um desconto de R$ 50,00 que não aparece em lugar nenhum do modal).

**Fix sugerido:** quando `item.desconto` for maior que zero, mostrar essa informação na linha do item — pode ser uma coluna extra "Desconto", ou um texto pequeno abaixo do produto (ex.: "Desconto: R$ 50,00"). Não precisa de coluna se a maioria dos itens não tiver desconto — usar bom senso de layout pra não sobrecarregar a tabela quando `desconto` for `0`/`null`.

## 2. Achado 10 — MÉDIO — Alertas de Pedido sem botão "Verificar Agora"

**Arquivo:** `src/modules/vendas/pages/AlertaPedidoListPage.tsx`.

A tela de Alertas de Pedido só lê os alertas já existentes no banco — não tem nenhum botão pra forçar uma nova verificação, diferente da tela análoga de Alertas de Produto/Insumo (que já tem "Verificar Agora", e inclusive é citada como referência no próprio guia de usuário, seção "Alertas de Insumo"). A única forma de gerar alertas novos hoje é o job agendado do backend, que roda 1x por dia, às 8h — então qualquer pedido que atrase ou entre na janela de "3 dias antes" depois desse horário só vai gerar alerta no dia seguinte.

**Fix sugerido:** adicionar um botão "Verificar Agora" nessa tela, chamando `POST /api/alerta-pedido/verificar` (o endpoint já existe e funciona — testado ao vivo nesta auditoria), no mesmo padrão visual/de comportamento já usado na tela de Alertas de Produto. Depois da chamada, recarregar a lista de alertas (invalidar a query correspondente).

## 3. Não fazer nesta tarefa

- Achados 6, 7, 9 e 11 (addendum3) são do backend — não tocar.
- Backlog anterior (rodadas 1 e 2) fora do que já foi sinalizado — fora de escopo.
- A tarefa do guia de usuário é outra frente — ver arquivo separado citado acima.

## Addendum 2 — Frontend no ar, revalidação concluída (2026-09-16, mesmo dia)

**Origem:** dono do projeto avisou "no ar o front". Hard reload confirmou bundle novo (`assets/index-bJPQ66Pr.js`, hash diferente do anterior `index-BgJqghax.js`, contendo a string nova `"comanda de produção indisponível"`).

### Achado 16 (pills Origem × Preenchimento Pendente) — ✅ Confirmado corrigido

Reproduzi o mesmo passo a passo do achado original:
1. Cliquei em "Manuais" → 1 registro, badge "Filtros detalhados" = 1.
2. Cliquei em "Preenchimento Pendente" → agora a pill "Manuais" é **desmarcada de verdade** (some do estado, não só visualmente) e o resultado passa a mostrar os **7 registros pendentes de preenchimento** corretamente, badge continua em 1.
3. Testei o caminho inverso: com "Preenchimento Pendente" ativo, cliquei em "Manuais" → volta a mostrar só o 1 registro manual, badge = 1.

As duas pills agora se resetam mutuamente nos dois sentidos — comportamento simétrico e previsível, sem filtro escondido.

### Bônus 1 — Botão "Imprimir Comanda" desabilitado para pedido CANCELADO — ✅ Confirmado

No Pedido #36 (CANCELADO), o ícone de impressora na lista de Pedidos agora aparece acinzentado e o clique não abre o modal. No Pedido #35 (RASCUNHO), o mesmo ícone abre a "Comanda de Produção" normalmente. Comportamento correto e seletivo (só bloqueia quando cancelado).

### Bônus 2 — Parágrafo novo no Guia sobre "Imprimir Comanda" — ✅ Confirmado

A seção "Mural da Semana" do Guia do Usuário agora traz o parágrafo: *"O botão 'Imprimir Comanda', no mesmo modal (e também na lista de Pedidos), gera uma comanda pronta pra levar pra cozinha — cliente, itens, complementos, horário de entrega e observações, num formato pensado pra impressão. Fica desabilitado pra pedidos cancelados."* — cobre exatamente a funcionalidade e a nova regra de bloqueio pra cancelados.

---

## Status final de todos os achados da Rodada 6

| Achado | Status final |
|---|---|
| 16 — combinação de pills Origem + Preenchimento Pendente | ✅ Corrigido e confirmado ao vivo |
| 17 — "Verificar Agora" duplicava alertas de pedido | ✅ Corrigido e confirmado ao vivo |
| Observação — "Imprimir Comanda" disponível pra pedido cancelado | ✅ Resolvida (botão agora desabilitado) |
| Observação — Guia não mencionava a Comanda de Produção | ✅ Resolvida (parágrafo adicionado em "Mural da Semana") |

**Homologação da Rodada 6 encerrada — nenhum item pendente.** Os alertas duplicados/antigos que já existiam na base antes do fix do achado 17 (pedidos #23/#24/#25, um alerta extra cada, um deles ainda com data nula) continuam lá — não é regressão, é dado histórico; se quiserem a tela de Alertas de Pedidos limpa, basta clicar em "Reconhecer" nesses alertas duplicados manualmente.

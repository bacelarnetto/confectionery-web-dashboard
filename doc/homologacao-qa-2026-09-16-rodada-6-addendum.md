## Addendum — Revalidação dos achados 16 e 17 (2026-09-16, mesmo dia)

**Origem:** dono do projeto avisou "fizemos as alterações" pedindo revalidação dos achados 16 e 17 registrados na Rodada 6. Revisão de código (`git diff`, working directory ainda não commitado em nenhum dos dois repositórios) + reteste ao vivo.

### Achado 17 (backend — "Verificar Agora" duplicava alertas) — ✅ Confirmado corrigido

Diff em `AlertaPedidoService.kt`: as 3 checagens de duplicidade (`verificar()`, alerta semanal, alerta atrasado) trocaram `existsByPedidoIdAndTipoAndDataGeracao(pedidoId, tipo, hoje)` (só olhava o dia corrente) por `findAtivoByPedidoIdAndTipo(pedidoId, tipo) == null` — a mesma regra de deduplicação já usada em Alertas de Insumo, sem recorte de data.

**Testado ao vivo (via API, backend já está com o build atualizado):** chamei `POST /alerta-pedido/verificar` de novo com os pedidos #23/#24/#25 já tendo 2 alertas ATIVO cada (os duplicados da rodada anterior). Resultado: contagem total de alertas continuou em 7 antes e depois da chamada, e a contagem de ATIVO por pedido não mudou (2/2/2) — ou seja, a rotina **não criou nenhum alerta novo** para pedidos que já tinham um ATIVO do mesmo tipo. Isso confirma que o fix funciona daqui pra frente.

**Observação (não é regressão, é conta pendente da rodada anterior):** os 2 alertas duplicados por pedido que já existiam desde a Rodada 6 (um deles ainda com `dataEntregaPedido: null`, resquício do achado 9 antigo) continuam na base — o fix impede *novas* duplicatas, mas não limpa as que já foram criadas antes dele existir. Isso é esperado (a correção não tinha como saber reescrever histórico sozinha) — para sanear a tela de Alertas de Pedidos, alguém precisa clicar em "Reconhecer" nesses alertas duplicados/antigos manualmente. Não é um bloqueio, só um item de limpeza manual pontual.

### Achado 16 (frontend — pills de Origem x Preenchimento Pendente) — ⚠️ Não foi possível revalidar ao vivo — build do frontend está desatualizado no servidor local

O diff em `EntradaInsumoListPage.tsx` está correto e resolve o problema como eu tinha sugerido (opção "a", mais simples): tanto escolher uma origem quanto clicar em "Preenchimento Pendente" agora resetam o outro filtro, em vez de somar escondido.

Mas ao testar ao vivo (`/estoque-insumos/entradas`, com hard reload `ctrl+shift+r`), o comportamento do bug antigo **ainda ocorre**: cliquei em "Manuais" e depois em "Preenchimento Pendente" e o resultado continuou vazio, com o painel "Filtros detalhados" mostrando "Origem: Manual" ainda selecionado por baixo dos panos — exatamente o bug original, sem nenhuma mudança.

Investiguei se isso era um bug real ou só cache, e confirmei que é **cache/build desatualizado**, não uma regressão: o bundle JS que o navegador está carregando (`assets/index-BgJqghax.js`) não contém a string `"comanda de produção indisponível"` — um texto novo, introduzido no mesmo commit não commitado, que aparece no diff do `PedidoDetalheModal.tsx`/`PedidoListPage.tsx` (desabilitar "Imprimir Comanda" pra pedido cancelado). Ou seja, o servidor local do frontend ainda está servindo o build de antes de todas as mudanças de hoje — não é só o fix do achado 16 que está faltando, é o lote inteiro (achado 16, a desabilitação do botão de comanda pra pedido cancelado, e o novo parágrafo no Guia sobre "Imprimir Comanda").

**Preciso que vocês façam um novo build/deploy do frontend** (o mesmo passo que resolveu a mesma situação mais cedo nesta sessão) pra eu conseguir revalidar o achado 16, a desabilitação do botão de comanda e a atualização do Guia. Me avisem quando o build novo estiver no ar que eu retomo o teste imediatamente.

### Resumo da revalidação

| Achado | Status |
|---|---|
| 17 — "Verificar Agora" duplicava alertas (backend) | ✅ Confirmado corrigido |
| 16 — combinação de pills Origem + Preenchimento Pendente (frontend) | ⏸ Fix correto no código, mas **não está no ar** — build do frontend desatualizado. Aguardando novo deploy pra revalidar. |
| Bônus: botão "Imprimir Comanda" desabilitado pra pedido CANCELADO | ⏸ Mesma situação — código correto, não está no ar ainda |
| Bônus: parágrafo novo no Guia sobre "Imprimir Comanda" | ⏸ Mesma situação — não está no ar ainda |

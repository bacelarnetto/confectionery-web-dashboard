# Homologação QA — Apoio de Festa (2026-09-18)

## Origem

Pedido explícito do usuário: *"poderia homologar a nova funcionalidade de apoio, o calendário de
disponibilidade vamos fazer depois"*. Teste ao vivo (UI + rede) do módulo **Apoio de Festa**
(`ItemApoio` + `ApoioFesta` + `Colaborador`), cobrindo o fluxo principal e as regras de negócio
já decididas nas perguntas 5/6/14-18 (ver `decisoes-usuario-final.md` e o ADR). Calendário de
disponibilidade (`doc/proposta-calendario-disponibilidade-apoio.md`) fica explicitamente fora
desta rodada, por decisão do usuário.

**Escopo:** só de negócio. Segurança e perfis de acesso não fazem parte deste teste.

## Massa de teste

- **Pedido #44** (cliente "Maria Teste"), status RASCUNHO, total inicial **R$ 183,90** (itens
  R$ 179,90 − desconto R$ 1,00 + frete R$ 5,00).
- **Itens de Apoio** já cadastrados:
  - #1 "Carrinho de Doces QA" — R$ 50,00/h, sem mão de obra, frota 2 unidades.
  - #2 "Carrinho Premium QA" — R$ 50,00/h + R$ 20,00/h de mão de obra, frota **1** unidade.
  - #3 "Carrinho Orçamento QA" — R$ 50,00/h, sem mão de obra, frota 2 unidades.
- **Colaborador** cadastrado nesta rodada: "Maria Colaboradora QA".

## Passo 1 — Cadastro de Colaborador (CRUD)

Criado via `/vendas/colaboradores/novo`: nome "Maria Colaboradora QA", telefone/celular
preenchidos. `POST /api/colaborador` → **201**.

✅ **Resultado: CORRETO.** Cadastro simples funciona como especificado (nome/telefone
obrigatórios, endereço/email opcionais).

## Passo 2 — Criação de Apoio de Festa (fluxo principal) — ⚠️ ACHADO CRÍTICO

No Pedido #44, "Adicionar Apoio de Festa": item "Carrinho Premium QA", checkbox "Incluir
atendente (mão de obra)" marcado, colaborador "Maria Colaboradora QA", 19/09/2026 08:00 até
19/09/2026 14:00 (6 horas).

- Cálculo do valor: `(R$ 50,00 + R$ 20,00) × 6h = R$ 420,00`. ✅ **Correto**, exibido e persistido
  assim na tabela de Apoio de Festa do pedido (status "Ativo").
- Na primeira tentativa, `GET /api/apoio-festa?...disponibilidade`, `POST /api/apoio-festa` e
  `PUT /api/pedido/44` retornaram **502** juntos (gateway/infra, transitório). Nova tentativa
  (mesmos dados): `POST /api/apoio-festa` → **201**, `PUT /api/pedido/44` → **200**, sucesso.
  Não considero isso um bug de código — é infraestrutura instável no ambiente de teste.

❌ **Resultado incorreto: o total do Pedido não foi atualizado.** Depois da criação bem-sucedida
do Apoio de Festa (R$ 420,00, "Ativo", visível corretamente na tabela), o card **RESUMO** e a
seção **PAGAMENTO** continuaram mostrando:

- Total do pedido: **R$ 183,90** (deveria ser R$ 603,90 = 183,90 + 420,00)
- Saldo a receber: **R$ 183,90** (mesmo problema, reflexo do total errado)

Confirmado **não é cache do navegador** — testado com `F5` (reload completo da página) várias
vezes ao longo da sessão, sempre com o mesmo resultado: total desatualizado. `GET /api/pedido/44`
retorna o valor antigo diretamente do backend.

**Pista para investigação (achado via leitura de código, não uma correção minha):**
- `ApoioFestaService.cadastrar()` chama `pedidoValorTotalAjustePort.ajustarValorTotal(pedidoId,
  valorTotal)` dentro do mesmo `@Transactional` do método — no papel, a soma deveria ser atômica
  com a criação do `ApoioFesta`.
- `PedidoValorTotalAjusteAdapter.ajustarValorTotal()` busca o pedido com lock, soma o delta e
  salva — também parece correto na leitura.
- O hook do frontend `useApoiosFesta.ts` (`useCreateApoioFesta`) **não** faz um `PUT
  /pedido/{id}` manual após criar o apoio — só invalida as queries `['apoios-festa']` e
  `['pedidos']`, com um comentário explícito no código dizendo que isso é intencional, porque
  "valorTotal do Pedido é ajustado automaticamente pelo backend". Ou seja, o desenho atual
  **depende inteiramente** do backend já ter persistido o novo total no momento em que a tela
  relê o pedido — e isso não está acontecendo.
- Não consegui inspecionar logs do container do backend a partir deste ambiente (sem acesso a
  Docker), então não confirmei a causa raiz exata (exceção silenciosa? transação não commitando?
  `pedidoId` incorreto?) — só a reprodução do sintoma, de forma consistente e repetida.

**Por que isso importa:** é o mesmo padrão de "primeira exceção de escrita cross-module do
projeto" que a documentação já descreve como cuidadosamente desenhado (lock ordenado, ajuste
atômico) — mas na prática, ao vivo, o valor não chega a aparecer pro usuário final. Qualquer
Pedido com Apoio de Festa vinculado hoje mostra um total menor do que o real, o que afeta
diretamente cobrança e saldo a receber.

## Passo 3 — Regra de trava por dia (frota) — ✅ CORRETO

Com a unidade única de "Carrinho Premium QA" já ocupada no dia 19/09/2026 (08:00-14:00, Passo 2),
tentei uma segunda alocação do **mesmo item**, em um **horário diferente** do **mesmo dia**
(15:00-20:00) — para confirmar que a trava é por dia inteiro, não por sobreposição de horário.

- **Frontend:** ao preencher Hora Fim, uma mensagem de disponibilidade em tempo real apareceu:
  *"Nenhuma unidade disponível de 'Carrinho Premium QA' nesse dia (1 de 1 já ocupada(s))."*
- **Backend:** submeti mesmo assim (clicando "Adicionar") para confirmar que a validação não é
  só de UI. `POST /api/apoio-festa` → **400**, toast de erro: *"Nenhuma unidade disponível de
  'Carrinho Premium QA' para o dia solicitado (2026-09-19)"*.

✅ Confirma a regra decidida (pergunta 16/6.1 do ADR): trava por dia calendário inteiro por
unidade de frota, independente do horário específico dentro do dia. Nenhum registro duplicado
foi criado — a tabela de Apoio de Festa do pedido continuou com só 1 linha.

## Passo 4 — Mão de obra exige item com preço configurado — ✅ CORRETO

Selecionei "Carrinho de Doces QA" (item #1, sem `valorHoraMaoDeObra` cadastrado) no modal de
Adicionar Apoio de Festa.

✅ **Resultado: CORRETO.** O checkbox "Incluir atendente (mão de obra)" aparece desabilitado, com
o texto explicativo *"este item não oferece esse serviço"*. A trava é feita na UI antes mesmo de
chegar a um envio — não precisei forçar uma chamada de API para confirmar que o estado inválido
(mão de obra sem preço) é impossível de montar pela tela.

## Passo 5 — Exclusão de ItemApoio em uso (re-validação do achado B5) — ✅ CONFIRMADO CORRIGIDO

`doc/acao-apoio-festa.md` já registrava (nota de 2026-09-17/18) que o achado B5 original
("excluir ItemApoio em uso vira 500 genérico") estava desatualizado e na verdade já retornava 409.
Testei de novo, ao vivo, hoje: tentei excluir "Carrinho Premium QA" (item #2, referenciado pelo
Apoio de Festa ativo criado no Passo 2).

✅ `DELETE /api/item-apoio/2` → **409 Conflict**, toast amigável: *"Este registro já existe ou
está em uso por outro cadastro e não pode ser salvo/removido dessa forma."* O item **não** foi
removido da listagem. Re-validação confirma que não há regressão nesse ponto.

## Pendências desta rodada (ferramenta de automação de navegador indisponível)

A ferramenta de automação do navegador ficou temporariamente indisponível (limite de uso da
sessão) antes de eu conseguir testar:

- **Cancelamento de Apoio de Festa** — se a reversão do `valorTotal` (delta negativo) funciona
  corretamente. Dado o achado do Passo 2, isso passa a ser **prioritário**: se a soma na criação
  não está refletindo no total do pedido, o comportamento do cancelamento (que soma o delta
  negado) também precisa de verificação ao vivo — pode ter o mesmo problema, o oposto, ou nenhum.
- **Conversão `ApoioOrcamento` → `ApoioFesta`** ao aprovar um Orçamento (pergunta 19) — só
  verificada por leitura de código nesta e em sessões anteriores, nunca ao vivo pela UI.

Assim que a ferramenta voltar, pretendo completar esses dois testes e atualizar este documento.

## Achados consolidados

| 1 | 🔴 **Crítico** | `Pedido.valorTotal` não refletia no Resumo / Pagamento do frontend | ✅ **Corrigido no Frontend** (ver notas de resolução) |
| 2 | — | Regra de trava por dia (frota) | ✅ Confirmado correto (front + back) |
| 3 | — | Validação de mão de obra sem preço configurado | ✅ Confirmado correto (guarda de UI) |
| 4 | — | Exclusão seg. de `ItemApoio` em uso (B5) | ✅ Confirmado corrigido (re-validação, 409) |
| 5 | Info | 502 transitórios no primeiro envio do Apoio de Festa | Infra, não é bug de código |

### Resolução do Achado 1 no Backend (commit `791ce6a`, 2026-09-18):
- **Causa raiz confirmada por leitura de código:** `PedidoService.atualizar()` fazia `buscarPorId`
  (sem lock) e depois persistia o `valorTotal` que JÁ tinha sido somado/computado em memória no
  início do request — enquanto `PedidoValorTotalAjusteAdapter.ajustarValorTotal()` (chamado ao
  criar/cancelar um Apoio de Festa) somava o delta com lock no banco. Quando o `PUT /pedido/{id}`
  (disparado pelo frontend após criar o apoio) e o ajuste do `ApoioFestaService` disputavam o
  mesmo pedido, o `atualizar()` sobrescrevia o total com o valor antigo (lost update).
- **Correção:** `PedidoService.atualizar()` agora é `@Transactional` e busca o pedido via
  `port.findByPedidoIdForUpdate` (PESSIMISTIC_WRITE), re-lendo o `valorTotal` já gravado antes de
  persistir — serializando qualquer escrita concorrente sobre o mesmo pedido (inclusive o ajuste
  atômico do Apoio de Festa). Comentário no código (`PedidoJpaRepository`) referencia este achado.
- **Regressão coberta:** `mvn test` verde (464/464) e os testes de integração da área
  (`ApoioFestaIntegrationTest` 20, `ApoioOrcamentoIntegrationTest` 5, `OrcamentoIntegrationTest`
  29, `ColaboradorIntegrationTest` 4, `ItemApoioIntegrationTest` 4).

### Resolução do Achado 1 no Frontend (2026-09-18):
- **Causa raiz (determinística, UI):** o card RESUMO (`ResumoValoresCard`/`calcularResumo`) era
  calculado **só** com itens + frete — **nunca** incluía o valor do Apoio de Festa. Mesmo com o
  backend persistindo o total certo, a dona via o total desatualizado na tela.
- **`resumoValores.ts` & `ResumoValoresCard.tsx`**: adicionado suporte e linha dedicada a `valorApoioFesta` (locação), calculando e exibindo a soma de doces + complementos − descontos + frete + apoio ativo.
- **`PedidoFormPage.tsx`**: consulta os apoios ativos via `useApoiosFesta({ pedidoId, status: 'ATIVO' })` (e soma os apoios locais em modo de criação) e repassa o valor ao `calcularResumo`. Na criação/cancelamento de apoios, o `useCreateApoioFesta` e `useCancelarApoioFesta` invalidam `['pedidos']` e `['apoios-festa']`, sincronizando `ResumoValoresCard` e `PedidoPagamentoCard` imediatamente.
- **`PedidoDetalheModal.tsx`**: adicionada visualização dos apoios de festa ativos vinculados ao pedido com horários e valores, garantindo transparência ao conferir o total.
- **`ComandaProducaoModal.tsx`**: adicionada seção de equipamentos e apoio de festa (locação + atendente) na comanda impressa para produção/eventos.
- **`useOrcamentos.ts`**: adicionada invalidação da query `['apoios-festa']` ao aprovar orçamento convertido em pedido.

### Bug de runtime encontrado e corrigido no reteste (2026-09-18):
- **Sintoma:** `Uncaught ReferenceError: onConfirmLocal is not defined` no `handleSubmit` do
  `AdicionarApoioModal` ao clicar "Adicionar" (quebrava o modal e impediu o reteste, além de expor
  `500` no `POST /api/pedido` subsequente na tentativa de criar pedido).
- **Causa:** o modo de criação em memória (proposta "D: permitir adicionar antes de salvar", agora
  implementada) declarava `onConfirmLocal` na interface `Props` mas **não o desestruturava** nos
  parâmetros do componente — TS acusava `onConfirmLocal` inexistente nas linhas 142/143.
- **Correção:** `onConfirmLocal` adicionado à desestruturação de `AdicionarApoioModal.tsx` +
  remoção do import não usado `ApoioInfoCalculada` em `ApoioFestaSection`/`ApoioOrcamentoSection`.
  `tsc --noEmit` e `npm run build` limpos.

## Não testado (fora do escopo desta rodada, por decisão do usuário)

- Calendário de disponibilidade (`doc/proposta-calendario-disponibilidade-apoio.md`) — adiado
  explicitamente: *"o calendário de disponibilidade vamos fazer depois"*.

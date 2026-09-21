# Ação — "Apoio de Festa" / Item de Apoio (Despacho Backend × Frontend)

> **🔴 DEMANDA ATIVA (2026-09-17) — prioridade imediata:** implementar o cadastro `Colaborador`
> (CRUD completo, backend **B1-B3** + frontend **F1-F3**, seção 4 e 5) e vinculá-lo como campo
> **selecionável** no fluxo de mão de obra do Apoio de Festa (dentro da tela de Pedido). Time
> backend e frontend: tratar essas 6 tasks como a próxima entrega deste módulo.
>
> **Status (2026-09-17):** Backend **em grande parte implementado, não testado ao vivo, sem
> commit** — `ItemApoio` + `ApoioFesta` completos, incluindo mão de obra opcional (pergunta 17).
> Frontend **também já tem módulo próprio** (`src/modules/apoioFesta/`), integrado na tela de
> Pedido. **Pendências reais:** cadastro `Colaborador` (pergunta 18, back + front) e o alerta de
> devolução com responsabilidade por tipo de entrega (pergunta 6) — nenhum dos dois foi
> encontrado no código ainda. Ver `doc/adr-generalizacao-locacao-item-locavel-2026-09-16.md` e
> `doc/decisoes-usuario-final.md` (perguntas 1-18) pra todo o histórico de decisão.

---

## 1. Status de execução — Backend (já no código, não comitado)

| Item | Onde | Situação |
|---|---|---|
| Migration `item_apoio` + `apoio_festa` | `V50__create_item_apoio_apoio_festa.sql` | ✅ |
| Migration mão de obra (pergunta 17) | `V51__add_mao_de_obra_apoio_festa.sql` | ✅ |
| Módulo `apoioFesta` (hexagonal completo) | `src/main/kotlin/br/com/confectionery/apoioFesta/` | ✅ domain/application/infrastructure |
| `ItemApoio` CRUD | `ItemApoioController` (`/item-apoio`) | ✅ list/get/post/put/delete |
| `ApoioFesta` — cadastrar/listar/buscar/cancelar | `ApoioFestaController` (`/apoio-festa`) | ✅ (sem PUT de edição — coerente, não existe "editar locação já feita" nas decisões) |
| Trava de disponibilidade por dia inteiro (seção 6.1 do ADR) | `ApoioFestaService.cadastrar` (`countAtivoPorItemApoioEDia`) | ✅ — dia calculado no fuso da confeitaria (`FusoHorarioNegocio`), não UTC |
| Locação contida em 1 dia só (pergunta 5) | `ApoioFestaService.cadastrar` (valida `dia(horaInicio) == dia(horaFim)`) | ✅ |
| Cobrança hora × valor + mão de obra opcional (perguntas 1/5/17) | `ApoioFestaService.cadastrar` (`custoHora × horas`, `incluiMaoDeObra`) | ✅ — rejeita `incluiMaoDeObra=true` se o item não tem `valorHoraMaoDeObra` cadastrado |
| Cobrança independente do doce do Pedido (pergunta 1/2) | Produção/preço de doce não tocados por este módulo | ✅ |
| `ApoioFesta` soma automaticamente em `Pedido.valorTotal` | `PedidoValorTotalAjustePort`/`Adapter` (escrita cross-module, lock pessimista, ordem item→pedido documentada) | ✅ — inclui e desfaz (cancelamento) |
| `PUT /pedido/{id}` não apaga o valor da locação | `PedidoCalculoLogic.calcularValorTotalPedido` + `ApoioFestaValorAtivoReferenciaPort` (leitura cross-module, sem lock) | ✅ — achado evitado proativamente pelo próprio time |
| Pagamento do Apoio de Festa (pergunta 15) | Nenhum código novo — `PagamentoPedido` já cobre, `ApoioFesta` não tem entidade de pagamento própria | ✅ por design |
| Testes de integração | `ItemApoioIntegrationTest` (5 casos) + `ApoioFestaIntegrationTest` (16 casos) | ✅ existem — **não executados de forma independente nesta sessão** (`mvn` não disponível neste ambiente de análise; pendente rodar `mvn test` no ambiente de dev) |
| `Colaborador` (pergunta 18) | — | ❌ **não encontrado em nenhum lugar do código** |
| Alerta de devolução com responsabilidade por tipo de entrega (pergunta 6) | — | ❌ **não encontrado** (sem scheduler, sem enum de tipo/status pra `ApoioFesta`) |

---

## 2. Status de execução — Frontend (repositório `confectionery-web-dashboard`, já no código)

| Item | Onde | Situação |
|---|---|---|
| Módulo `apoioFesta` | `src/modules/apoioFesta/` (types, services, hooks, components, pages) | ✅ |
| Tipos `ItemApoio`/`ApoioFesta` (incl. mão de obra) | `types/itemApoio.ts`, `types/apoioFesta.ts` | ✅ — já espelha `valorHoraMaoDeObra`/`incluiMaoDeObra` do backend |
| Tela "Item de Apoio" (cadastro/lista) | `pages/ItemApoioListPage.tsx`, `pages/ItemApoioFormPage.tsx` | ✅ |
| Tela "Apoio de Festa" (lista) | `pages/ApoioFestaListPage.tsx` | ✅ |
| Adicionar Apoio de Festa a um Pedido | `components/AdicionarApoioFestaModal.tsx` + `components/ApoioFestaSection.tsx`, integrado em `modules/vendas/pages/PedidoFormPage.tsx` | ✅ |
| Seleção de `Colaborador` no modal (pergunta 18) | — | ❌ não existe ainda (depende do backend) |
| Alerta de devolução na UI (pergunta 6) | — | ❌ não existe ainda (depende do backend) |

---

## 3. Decisões consolidadas (roteiro `doc/decisoes-usuario-final.md`, perguntas 1-18)

| # | Decisão da dona | Efeito no desenho |
|---|---|---|
| 1 | Sem bundling carrinho+doce — `ApoioFesta` cobra por hora, doce segue preço normal | `valorHora × horas`, independente do Pedido |
| 2 | Mesmo preço de tabela pro doce no evento (sem "preço de evento") | Produção/preço de doce sem mudança nenhuma |
| 3 | Não existe motor de "doce por pessoa" | Deixou de se aplicar — item de produto normal no Pedido |
| 4 | 2 carrinhos hoje são do mesmo `tipo`, campo já extensível | `ItemApoio.tipo` (enum extensível) |
| 5 | Duração = turno dentro de 1 dia, nunca multi-dias; cobrança por hora efetiva | Validação de dia único + `valorHora × horas` |
| 6 | Alertas + regra de responsabilidade pela devolução por tipo de entrega (`Pedido.retirar`) | **Pendente de implementar** (ver seção 5) |
| 7 | Terceirizado já resolvido de forma geral (`EntradaProduto origem=TERCEIRIZADO`) | Não se aplica a `ApoioFesta` |
| 8-12 | Finanças (resumo mensal, gastos recorrentes, regime caixa, só vendas pagas, categorias dinâmicas) | Módulo `financeiro`, já concluído (ver `doc/acao-financeiro-simples.md`) — sem relação direta com `ApoioFesta` |
| 13 | Contas a receber cobertas por `PagamentoPedido` existente (saldo por pedido); caso avulso sem pedido fica fora de escopo | Sem entidade nova |
| 14 | `ApoioFesta` sempre tem `pedidoId` (`Long`, não nullable); Pedido pode não ter `ApoioFesta` | `pedidoId: Long` sempre preenchido, referência lógica |
| 15 | Pagamento reaproveita `PagamentoPedido` | Sem entidade de pagamento própria |
| 16 | Todo `ItemApoio` tem `quantidade` (frota); trava por dia inteiro, não por faixa de horário | `countAtivoPorItemApoioEDia >= quantidade` → recusa |
| 17 | Mão de obra é componente de preço separado e **opcional por locação** | `ItemApoio.valorHoraMaoDeObra` + `ApoioFesta.incluiMaoDeObra` |
| 18 | Novo cadastro simples `Colaborador` (nome + telefone obrigatórios; endereço + email opcionais); **não obrigatório** nem no Pedido nem na locação | **Pendente de implementar** (ver seção 4) |

---

## 4. Backend — tasks pendentes

| # | Task | Detalhes |
|---|---|---|
| 🔴 **B1** | Migration `V52__create_colaborador.sql` | `colaborador`: `id` BIGINT AI PK, `nome` VARCHAR(150) NOT NULL, `telefone_celular` VARCHAR(20) NOT NULL, `endereco` VARCHAR(255) NULL (texto simples, não reaproveitar `Endereco` estruturado de Pedido — é sobre entrega/frete, conceito diferente), `email` VARCHAR(150) NULL, auditoria padrão (`created_by/on`, `updated_by/on`). `ALTER TABLE apoio_festa ADD COLUMN colaborador_id BIGINT NULL, ADD CONSTRAINT fk_apoio_festa_colaborador FOREIGN KEY (colaborador_id) REFERENCES colaborador(id) ON DELETE SET NULL;` — `ON DELETE SET NULL` (não `RESTRICT`) porque excluir um colaborador não deve travar a exclusão nem apagar o histórico de locações já feitas com ele; considerar guardar `colaborador_nome` snapshot em `apoio_festa` no momento da locação, mesmo padrão já usado em `item_pedido_complemento` (B29, `PROJECT_CONTEXT.md`), pra manter o nome legível mesmo se o colaborador for excluído depois. |
| 🔴 **B2** | Módulo `Colaborador` (nested em `apoioFesta`, mesmo padrão de `vendas.alertaPedido`: `apoioFesta.colaborador.*`) — CRUD completo | domain/model + port, infrastructure/entity+repository+adapter, application/dto+mapper+service/usecase+controller — mesma estrutura hexagonal do resto do projeto. Endpoints: `GET /colaborador` (pageable + filtro `nome`), `GET /colaborador/{id}`, `POST /colaborador` (201, valida `nome`/`telefoneCelular` obrigatórios via `@Valid`), `PUT /colaborador/{id}`, `DELETE /colaborador/{id}` (204). |
| 🔴 **B3** | `ApoioFesta` ganha `colaboradorId: Long?` | Campo **opcional mesmo quando `incluiMaoDeObra = true`** (decisão confirmada pelo dono, pergunta 18 — não travar a locação por falta de colaborador definido). Adicionar em `domain/model/ApoioFesta.kt`, `ApoioFestaEntity`, `ApoioFestaInsertFormDTO`, `ApoioFestaViewDTO`, mapper. Como `Colaborador` vive no mesmo módulo, a referência pode ser `@ManyToOne` física normal (não precisa do padrão de referência lógica cross-module usado pra `pedidoId`). |
| **B4** | Alerta de devolução do Apoio de Festa (pergunta 6) | Novo submódulo `apoioFesta.alertaApoioFesta` (mesmo padrão de `vendas.alertaPedido`/`estoqueProdutos` alerta de produto: enum de tipo, status ATIVO/RESOLVIDO, scheduler diário, endpoint `PUT /{id}/resolver`). Tipos: `AGENDAMENTO_PROXIMO` (locação se aproximando), `DEVOLUCAO_ATRASADA`. **Regra de responsabilidade (confirmada pelo dono):** ler `Pedido.retirar` (já existe, `Boolean`, sem campo novo) via leitura cross-module — se `retirar = true`, o alerta é sobre o **cliente** não ter devolvido; se `retirar = false` (entrega) **e** existe `ApoioFesta` ativo, o alerta é um lembrete operacional pra **confeiteira ir buscar** o item, não uma cobrança do cliente. O texto/destinatário do alerta muda conforme esse campo — não é o mesmo alerta genérico nos dois casos. |
| **B5** | Corrigir gap de exclusão de `ItemApoio` em uso | **Achado de QA (2026-09-17):** `ItemApoioService.excluir()` (linha ~61) não verifica se existe `ApoioFesta` referenciando o item antes de deletar — a FK física em `apoio_festa.item_apoio_id` (V50, sem `ON DELETE` explícito → `RESTRICT` no MySQL) vai lançar `DataIntegrityViolationException` sem handler dedicado, virando 500 genérico. Mesma classe de lacuna já catalogada no projeto pra `TipoGastoService`/`CategoriaProdutoService` (`PROJECT_CONTEXT.md`, item 29). Sugestão: validar no `excluir()` se há `ApoioFesta` vinculado (qualquer status, ou só `ATIVO`? — a decidir) e lançar `RegraDeNegocioException` (400) com mensagem clara, em vez de deixar estourar a constraint. |
| **B6** | Testes | `ColaboradorIntegrationTest` (CRUD completo, incl. validação nome/telefone obrigatórios). Atualizar `ApoioFestaIntegrationTest` pra cobrir `colaboradorId` opcional (com e sem). Teste de regressão pro achado B5 (excluir `ItemApoio` referenciado por `ApoioFesta` → 400, não 500). **Rodar a suite completa (`mvn test`) de forma independente antes de reportar como concluído — não constava no escopo desta análise rodar o Maven neste ambiente.** |

**DoD backend:** `mvn test` completo verde; migration V52 criada; V1-V51 intocadas; sem commit (padrão do projeto).

---

## 5. Frontend — tasks pendentes (repositório `confectionery-web-dashboard`)

| # | Task | Detalhes |
|---|---|---|
| 🔴 **F1** | Módulo `Colaborador` | `src/modules/apoioFesta/types/colaborador.ts` + `services/colaboradorService.ts` + `hooks/useColaboradores.ts`, cobrindo o contrato do backend B2. |
| 🔴 **F2** | Tela "Colaboradores" (CRUD) | Listar/criar/editar/excluir, mesmo padrão das outras telas de cadastro simples (ex.: `ItemApoioListPage`/`ItemApoioFormPage`). Campos: nome*, telefone/celular*, endereço, email (* obrigatórios). |
| 🔴 **F3** | Seletor de Colaborador no modal de Apoio de Festa | Em `AdicionarApoioFestaModal.tsx`: quando o usuário marcar "incluir mão de obra", exibir um select de `Colaborador` (busca/paginado) — **opcional**, pode ficar em branco mesmo com mão de obra marcada (decisão confirmada). |
| **F4** | Exibir colaborador na listagem | `ApoioFestaListPage.tsx`/`ApoioFestaSection.tsx`: mostrar nome do colaborador quando houver, e indicar "sem colaborador definido" quando `incluiMaoDeObra=true` e `colaboradorId` nulo (pra dona lembrar de definir depois). |
| **F5** | UI do alerta de devolução (depende de B4) | Nova seção/lista de alertas de Apoio de Festa (mesmo padrão visual dos alertas de produto/pedido já existentes), com texto que já reflete a responsabilidade (cliente vs confeiteira) vinda do backend. |
| **F6** | Rotas/menu | Registrar rota/menu da tela de Colaboradores. |

**DoD frontend:** `npm run build` (tsc + vite) verde; sem commit.

---

## 6. Fora de escopo (para não derivar)

- Cálculo de "doce por pessoa" — não existe mais como funcionalidade (pergunta 3).
- Conta a receber avulsa sem pedido (ex.: funcionário que quebrou algo) — fora de escopo (pergunta 13).
- Qualquer FK física ou cascade entre `ApoioFesta` e `Pedido` — a referência é sempre lógica (`pedidoId: Long`, sem import cross-module).
- Reabertura/edição de uma locação já criada (não existe `PUT /apoio-festa/{id}` de edição, só cancelamento) — coerente com o desenho atual; se precisar, é uma decisão nova, não coberta aqui.

---

## 7. Referência

| Arquivo | Uso |
|---|---|
| `doc/adr-generalizacao-locacao-item-locavel-2026-09-16.md` | Design completo, seções 1-8, todas as decisões técnicas |
| `doc/decisoes-usuario-final.md` | Roteiro respondido pela dona (perguntas 1-18) |
| `doc/PROJECT_CONTEXT.md` | Estado do projeto |
| `src/main/kotlin/br/com/confectionery/apoioFesta/` | Módulo já implementado (backend) |
| `src/main/kotlin/br/com/confectionery/vendas/alertaPedido/` | Padrão de módulo de alerta a seguir na task B4 |
| `src/main/kotlin/br/com/confectionery/vendas/domain/service/PedidoCalculoLogic.kt` | Onde `ApoioFesta` já entra no cálculo do total do Pedido |
| `src/main/kotlin/br/com/confectionery/vendas/domain/model/Pedido.kt` | Campo `retirar: Boolean` — usar direto na task B4, sem campo novo |
| `confectionery-web-dashboard/src/modules/apoioFesta/` | Módulo já implementado (frontend) |
| `confectionery-web-dashboard/src/modules/vendas/pages/PedidoFormPage.tsx` | Onde o `ApoioFestaSection` já está integrado |

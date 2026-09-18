# Proposta — Calendário de disponibilidade do Item de Apoio (consulta antes do Pedido)

> **Status:** Análise + proposta (2026-09-18). Nenhuma implementação foi feita.
> **Escopo:** Backend (novo endpoint agregado, leitura) + Frontend (nova tela standalone).
> **Motivação da dona:** conseguir consultar a disponibilidade de um item (carrinho, tacho...)
> **antes** de tirar o pedido — ex.: cliente pergunta por telefone "tem carrinho livre no dia
> 20?" e ela precisa responder na hora, sem precisar já ter um Pedido/Orçamento aberto.

---

## 1. Fluxo atual — como funciona hoje

Não existe uma visão agregada de disponibilidade. O que existe:

- `ApoioFestaListPage.tsx` — lista/tabela com filtro por **um dia específico** por vez (date
  picker), dentro do menu de Apoio de Festa. Mostra os `ApoioFesta` já cadastrados naquele dia,
  não "quantas unidades restam".
- A única checagem real de "sobrou vaga" acontece **dentro do fluxo de criar um Apoio de
  Festa** (`ApoioFestaService.cadastrar`, contagem `countAtivoPorItemApoioEDia`), ou seja, só se
  descobre que não tem disponibilidade **depois de já estar tentando cadastrar**, dentro de um
  Pedido ou Orçamento em edição.
- Não existe endpoint de "disponibilidade" dedicado (documentado explicitamente no código —
  `ApoioFestaRepositoryPort`/`ApoioFestaService`, comentário: *"sem endpoint de disponibilidade
  dedicado"*).

### Dor

Pra responder "tem carrinho livre dia 20?" hoje, a dona precisaria: abrir a lista de Apoio de
Festa → filtrar por dia 20 → contar manualmente quantos `ApoioFesta` ativos existem naquele dia
→ comparar de cabeça com a `quantidade` cadastrada do item. Repetir dia a dia se o cliente for
flexível ("e dia 21? e 22?"). Não dá pra ver o mês de uma vez, e não dá pra consultar sem entrar
no menu de Apoio de Festa (que hoje só é alcançado de dentro de um Pedido/Orçamento já criado,
ou pela lista geral).

---

## 2. Proposta recomendada — Calendário mensal por Item de Apoio

### Conceito

Nova tela standalone (menu próprio, ex.: "Disponibilidade" dentro de Apoio de Festa), acessível
sem precisar de um Pedido/Orçamento aberto:

1. Seletor: escolher **um Item de Apoio** (ex.: "Carrinho").
2. Calendário mensal (navegável: mês anterior/próximo), com cada dia marcado:
   - 🟢 **Disponível** — nenhuma unidade ocupada, ou ainda sobra pelo menos 1.
   - 🔴 **Esgotado** — todas as unidades da frota (`quantidade`) já alocadas naquele dia.
   - (opcional) mostrar o número tipo "1/2" no dia, pra já indicar quantas estão ocupadas sem
     precisar clicar.
3. Clicar num dia mostra o detalhe (reaproveita o filtro já existente: `GET
   /apoio-festa?itemApoioId=X&dia=YYYY-MM-DD`) — quais `ApoioFesta` estão lá, de qual Pedido,
   horário.

### Por que funciona

- **Consulta rápida, sem abrir Pedido nenhum** — resolve a motivação original.
- **Visão do mês inteiro de uma vez** — em vez de checar dia a dia.
- **Reaproveita 100% da regra de negócio já existente** (trava por dia inteiro, `quantidade` da
  frota) — só expõe o que já é calculado internamente, de forma agregada.

---

## 3. Escopo de implementação (quando decidido)

### Backend — 1 endpoint novo (leitura, sem mudança de regra de negócio)

| Item | Detalhe |
|---|---|
| Endpoint | `GET /item-apoio/{id}/disponibilidade?mes=YYYY-MM` |
| Resposta | `List<DisponibilidadeDiaDTO>` — um item por dia do mês: `{ dia: "YYYY-MM-DD", quantidadeTotal, quantidadeOcupada, quantidadeLivre }` |
| Implementação | Nova query agregada no `ApoioFestaRepositoryPort`/`ApoioFestaJpaRepository` — `GROUP BY` do dia calendário (fuso `FusoHorarioNegocio`, mesmo padrão de `countAtivoPorItemApoioEDia`) contando `ApoioFesta` com `status = 'ATIVO'` no intervalo do mês, de uma vez só (não fazer 28-31 chamadas de `countAtivoPorItemApoioEDia`, uma por dia — isso seria N+1 e lento). `quantidadeTotal` vem do `ItemApoio.quantidade` (mesma consulta, sem lock — isso é só leitura informativa, não precisa do lock pessimista usado no cadastro). |
| Regra de negócio | **Nenhuma nova** — só agrega o que `ApoioFestaService.cadastrar` já calcula dia a dia. |

### Frontend

| Item | Detalhe |
|---|---|
| Nova página | `DisponibilidadeApoioPage.tsx` (`src/modules/apoioFesta/pages/`), rota própria no menu de Apoio de Festa (não depende de Pedido/Orçamento aberto) |
| Componente | Seletor de `ItemApoio` (reaproveita `useItensApoio`) + grade de calendário mensal (bibliotecas já usadas no projeto, ou grade simples com CSS grid — não há lib de calendário no `package.json` hoje, então checar se vale adicionar uma ou fazer a grade na mão) |
| Detalhe do dia | Modal/painel lateral ao clicar num dia, reaproveitando `useApoiosFesta` com filtro `itemApoioId` + `dia` |

**DoD:** `mvn test` (novo teste do endpoint agregado) + `npm run build` verdes; sem commit.

---

## 4. Alternativas consideradas

| Alternativa | Prós | Contras | Recomendação |
|---|---|---|---|
| **A: Endpoint agregado + calendário mensal por item** (acima) | 1 chamada por mês, visão completa, reaproveita regra existente | Precisa de 1 endpoint novo (pequeno) + componente de calendário no frontend | ✅ Recomendada |
| **B: Reaproveitar só o filtro por dia já existente, sem endpoint novo** | Zero backend | Frontend precisaria de até 31 chamadas (uma por dia do mês) pra montar o calendário — lento, N+1 | ❌ Contra-indicada |
| **C: Lista textual "próximos dias ocupados" (sem grade visual)** | Mais simples de implementar | Menos intuitivo pra consulta rápida com cliente no telefone ("e o dia 20? e a semana que vem?") — o ponto todo é visão rápida do mês | ⚠️ Só se a grade de calendário for cara demais de fazer agora |
| **D: Todos os Itens de Apoio juntos na mesma tela** | Visão geral de tudo de uma vez | Mais poluído; a consulta real da dona é sempre sobre 1 item específico que o cliente pediu | ❌ Decidido contra (confirmado 2026-09-18 — um item por vez, mês inteiro) |

---

## 5. Fora de escopo

- Reserva/bloqueio preventivo de uma data sem criar um `ApoioFesta` de verdade (esta tela é só
  **consulta**, não cria nem reserva nada).
- Disponibilidade por faixa de horário (o sistema já decidiu que a trava é por dia inteiro —
  seção 6.1 do ADR — o calendário só reflete essa mesma regra, não muda ela).
- Visão combinada de vários meses/ano — só navegação mês a mês, uma tela por vez.

---

## 6. Referência

| Arquivo | Uso |
|---|---|
| `doc/adr-generalizacao-locacao-item-locavel-2026-09-16.md` (seção 6.1) | Regra de trava por dia inteiro — base de todo o cálculo de disponibilidade |
| `src/main/kotlin/br/com/confectionery/apoioFesta/application/service/ApoioFestaService.kt` | `cadastrar()` — lógica de contagem por dia a reaproveitar/agregar |
| `src/main/kotlin/br/com/confectionery/apoioFesta/domain/port/ApoioFestaRepositoryPort.kt` | `countAtivoPorItemApoioEDia` — padrão de query por dia, base pra query agregada por mês |
| `src/main/kotlin/br/com/confectionery/shared/util/FusoHorarioNegocio.kt` | Fuso de negócio (`America/Sao_Paulo`) a usar no agrupamento por dia |
| `confectionery-web-dashboard/src/modules/apoioFesta/pages/ApoioFestaListPage.tsx` | Filtro por dia já existente, reaproveitável no detalhe ao clicar num dia do calendário |

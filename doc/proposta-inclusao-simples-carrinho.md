# Proposta — Incluir carrinho de doces no pedido de forma mais simples

> **Status:** Análise + proposta (2026-09-18). Nenhuma implementação foi feita.
> **Escopo:** Frontend apenas (`confectionery-web-dashboard`). Nenhuma mudança de backend necessária.

---

## 1. Fluxo atual — como funciona hoje

### Caminho do usuário

1. Usuário cria/edita um **Pedido** (`PedidoFormPage.tsx`), adiciona itens de doce, preenche data de entrega e salva.
2. Após salvar, a seção **Apoio de Festa** (`ApoioFestaSection.tsx`) aparece na edição do pedido.
3. Usuário clica **"Adicionar Apoio de Festa"** → abre `AdicionarApoioModal.tsx`.
4. Modal pede **5 campos** (3 obrigatórios):

| Campo | Obrigatório | Tipo |
|---|---|---|
| Item de Apoio | ✅ | select (itens cadastrados) |
| Hora Início | ✅ | datetime-local |
| Hora Fim | ✅ | datetime-local |
| Incluir atendente (mão de obra) | ☐ | checkbox |
| Colaborador | ☐ | select |

5. Checagem de disponibilidade aparece em tempo real (quantas unidades restam pro dia escolhido).

### Restrições do backend (imutáveis, não são dor)

- `validarMesmoDia(inicio, fim)` → início e fim no mesmo dia calendário
- Disponibilidade trava por **dia inteiro** (frota), não por faixa de horário
- `valorTotal = valorHora × horas` + mão de obra opcional

### ⚠️ Correção (2026-09-18, QA): "≥1 item de doce" NÃO é validação de backend

A versão anterior deste documento listava *"Apoio de Festa exige ≥1 item de doce no Pedido (400
caso contrário)"* como restrição do backend. **Conferido no código e isso está errado.**
`ApoioFestaService.cadastrar` não faz essa checagem — o `400` nunca é lançado pelo backend por
esse motivo. O que existe é só a prop `podeAdicionar={buildItens().length > 0}` no
`PedidoFormPage`, que **desabilita o botão na tela**. Ou seja, é uma trava de UI, não uma regra
de negócio protegida pela API: uma chamada direta a `POST /apoio-festa` (ou um bug futuro no
front) consegue criar um Apoio de Festa num Pedido sem nenhum item de doce. Não invalida a
proposta deste documento (que é só frontend), mas quem for implementar B/F não deve assumir que
o backend cobre esse caso — se essa garantia for importante, é uma task de backend separada,
fora do escopo aqui.

### Arquivos envolvidos

| Arquivo | Papel |
|---|---|
| `PedidoFormPage.tsx:599` | Renderiza `ApoioFestaSection` só em edição (`isEditing && pedido`) |
| `ApoioFestaSection.tsx` | Botão + tabela + modal de cancelamento |
| `AdicionarApoioModal.tsx` | Modal de criação (5 campos, inline availability check) |
| `ApoioFestaService.ts` (backend) | Valida dia único, disponibilidade, soma ao total do Pedido |
| `FusoHorarioNegocio.kt` | Define dia calendário no fuso da confeitaria |

---

## 2. Dores identificadas

### Dor 1 — Quantidade de campos para o caso mais comum
A dona costuma adicionar **carrinho de doces no dia inteiro do evento**. Hoje, precisa preencher 3 campos obrigatórios (item + hora início + hora fim) e lembrar que precisa converter mentalmente a `dataEntrega` do pedido para horas.

### Dor 2 — dataEntrega não alimenta o modal
O `PedidoFormPage` já tem o campo `dataEntrega` (datetime-local, linha 369), mas o modal ignora completamente — o usuário precisa redigitar a data.

### Dor 3 — Só disponível em edição
A seção de Apoio de Festa só aparece quando o pedido já foi salvo (`isEditing`). Se a dona sabe que vai levar carrinho, precisa: criar pedido → salvar → editar → adicionar apoio. Não há atalho durante a criação.

---

## 3. Proposta recomendada — Quick-add com horário automático

### Conceito

Adicionar um botão de atalho na seção `ApoioFestaSection`:

> **"Carrinho / equipamento (dia inteiro)"**

Ao clicar, o modal abre **com os campos já preenchidos**:

| Campo | Valor automático | Editável? |
|---|---|---|
| Item de Apoio | Vazio (usuário escolhe) | — |
| Hora Início | `dataEntrega` do pedido → 08:00 | ✅ |
| Hora Fim | `dataEntrega` do pedido → 22:00 | ✅ |
| Mão de obra | false | ✅ |
| Colaborador | vazio | ✅ |

### Como ficaria o UX

```
┌──────────────────────────────────────────────────────────┐
│ Apoio de Festa                                          │
│ Locação de carrinho, tacho, decoração...                │
│                                                          │
│ [Carrinho (dia inteiro)]  [Adicionar Apoio de Festa]    │  ← dois botões
└──────────────────────────────────────────────────────────┘
```

- Botão esquerdo: quick-add (abre modal pré-preenchido com 08:00–22:00 do dia de dataEntrega)
- Botão direito: fluxo atual (modal aberto, campos vazios)

### Por que funciona

1. **Não quebra regras de negócio** — o backend recebe exatamente o mesmo payload (`ApoioFestaInsertForm`), só que com horários default. Não há mudança de API.
2. **Data correta automaticamente** — `dataEntrega` já está disponível no `PedidoFormPage` e pode ser passada como prop para `ApoioFestaSection` e de lá para o modal.
3. **Editável** — se o evento for só pela manhã (08:00–14:00), a dona ajusta os campos de hora. O preenchimento é só um atalho, não uma imposição. Intervalo padrão de 08:00–22:00 (14h), confirmado pela dona (decidido em 2026-09-18).
4. **Zero mudança backend** — reutiliza o contrato `ApoioFestaInsertForm` existente.

---

## 4. Escopo de implementação (quando decidido)

### Frontend — arquivos a tocar

| Arquivo | Mudança |
|---|---|
| `ApoioFestaSection.tsx` | Nova prop `dataEntrega?: string`; novo botão **"Carrinho (dia inteiro)"** que abre o modal com defaults |
| `AdicionarApoioModal.tsx` | Nova prop `defaults?: { horaInicio?: string; horaFim?: string }`; `useEffect` aplica defaults ao abrir |
| `PedidoFormPage.tsx:599` | Passar `dataEntrega={form.dataEntrega}` para `ApoioFestaSection` |
| `ApoioOrcamentoSection.tsx` | Mesma melhoria para o orçamento (confirmado pela dona, 2026-09-18) |
| `OrcamentoFormPage.tsx` | Passar `dataEntrega` (ou campo equivalente do orçamento) para `ApoioOrcamentoSection` |

### Backend — nenhuma mudança
O `ApoioFestaService.cadastrar` (e o equivalente de orçamento `ApoioOrcamentoService`) recebe `horaInicio`/`horaFim` como Instant — o fato de virem de um prefill automático não muda nada. Intervalo de 08:00–22:00 respeita `validarMesmoDia` (mesmo dia) sem problema.

### ⚠️ Pontos de atenção pro frontend implementar (QA, 2026-09-18)

Dois casos de borda que este documento não cobria — não bloqueiam a proposta, mas quem
implementar B/F precisa decidir o comportamento, pra não deixar como bug depois:

1. **`dataEntrega` vazio quando o botão "Carrinho (dia inteiro)" é clicado.** Se a dona ainda
   não preencheu a data de entrega do Pedido/Orçamento, o prefill de horário fica sem base (data
   inválida/undefined). Decidir: desabilitar o botão quando `dataEntrega` estiver vazio (mesmo
   padrão do `podeAdicionar`), ou cair num fallback (ex.: hoje).
2. **Fuso horário do prefill.** O 08:00/22:00 vai ser calculado a partir de `dataEntrega` **no
   fuso do navegador de quem está usando o sistema**, não explicitamente no fuso da confeitaria
   (`America/Sao_Paulo`, o mesmo que `FusoHorarioNegocio.kt` usa no backend pra definir "dia
   calendário"). Na prática só importa se alguém acessar de fuso diferente — mas esse projeto já
   foi mordido por essa exata categoria de bug antes (ver comentário em `FusoHorarioNegocio.kt`
   sobre o achado de fuso ao planejar deploy remoto). Sugestão: construir os horários de forma
   explícita no fuso da confeitaria no frontend (ou documentar a suposição, se for aceitável
   manter implícito).

---

## 5. Alternativas consideradas

| Alternativa | Prós | Contras | Recomendação |
|---|---|---|---|
| **A: Quick-add com prefill** (acima) | Simples, zero backend, editável | Só ajuda no caso "dia inteiro" | ✅ Recomendada |
| **B: Adicionar como item normal do pedido** | Fluxo unificado, 1 formulário só | Contradiz o design (doce ≠ locação); quebra separação de billing (hora × valor vs. unitário × quantidade) | ❌ Contra-indicada |
| **C: Botão 1 clique (carrinho padrão)** | Ultra-rápido | Só funciona se sempre é o mesmo item; não serve pra tacho/decoração | ❌ Muito restritiva |
| **D: Permitir adicionar antes de salvar** | Criação em 1 passo | Exige criar pedido antes (draft) ou reescrever lógica de `pedidoId` nullable no backend — mudança grande | ⚠️ Futuro, não agora |

---

## 6. Decisões da dona (registradas 2026-09-18)

1. **Horário padrão:** 08:00–22:00 ✅
2. **Rótulo do botão:** "Carrinho (dia inteiro)" ✅
3. **Aplicar também no orçamento** (`ApoioOrcamentoSection`) ✅
4. **Futuro: permitir antes de salvar?** — em aberto. Se a dona quiser, exige criar pedido em 2 etapas (salvar rascunho → adicionar apoio → finalizar), ou aceitar `pedidoId` nullable no backend (fora de escopo agora)

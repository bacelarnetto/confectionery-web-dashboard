# Proposta de Melhorias — Compartilhamento via WhatsApp & Padronização de Estoque

> **Status:** Proposta de Produto & Arquitetura Frontend (18/09/2026).
> **Escopo:** Frontend (Módulo de Vendas & Módulo de Estoque de Insumos).
> **Objetivo:** Acelerar o fechamento comercial de encomendas pelo WhatsApp e padronizar a experiência de seleção de insumos em todas as telas de estoque.

---

## 1. Proposta 1: Compartilhamento Ágil de Orçamentos e Pedidos via WhatsApp

### 1.1 Contexto e a Dor do Negócio
Na rotina de uma confeitaria sob encomenda, a imensa maioria dos orçamentos é solicitada e negociada por canais digitais (WhatsApp e Instagram Direct).

Atualmente, o fluxo operacional apresenta fricção:
1. A confeiteira preenche e calcula o orçamento no sistema (`OrcamentoFormPage.tsx`);
2. O sistema gera o cálculo preciso com itens, complementos, itens de apoio e frete;
3. **Gargalo:** Para enviar ao cliente, a confeiteira precisa alternar para o WhatsApp e redigir manualmente o resumo, copiar valores item por item, ou tirar um print da tela (que pode conter dados internos indesejados).
4. **Risco:** Erros manuais na digitação de valores, esquecimento de dados de pagamento (ex: cobrança do sinal de 50% ou chave PIX) e demora na resposta enquanto o cliente aguarda.

---

### 1.2 Solução Proposta

Implementar o recurso **"Enviar pelo WhatsApp"** e **"Copiar Resumo"** nas telas de Orçamento e Pedido (`OrcamentoFormPage`, `OrcamentoListPage`, `PedidoDetalheModal` e `PedidoListPage`).

#### A. Ação Rápida no Front
- Adição de um botão de ação com ícone do WhatsApp (ou `MessageCircle` do Lucide):
  - Em orçamentos: **"Enviar Orçamento"**
  - Em pedidos: **"Enviar Confirmação / Cobrança"**
- Abertura de modal leve de conferência ou acionamento direto via URL scheme:
  ```text
  https://wa.me/55{telefoneCliente}?text={mensagemCodificada}
  ```
- Botão complementar **"Copiar para Área de Transferência"** (Clipboard API) para atender clientes que negociam pelo Instagram Direct ou e-mail.

#### B. Modelo de Mensagem Gerada para Orçamento
```text
🎂 *Orçamento #{id} — Doce Arte Confeitaria*
Olá, {nomeCliente}! Segue o detalhamento da sua encomenda:

📋 *Itens:*
• 1x Bolo Red Velvet (2kg) — R$ 180,00
  _Complementos: Topo de Bolo Personalizado_
• 50x Brigadeiro Belga Tradicional — R$ 90,00

🎈 *Apoio de Festa:*
• 1x Suporte para Bolo Dourado — R$ 25,00 (Caução: R$ 50,00)

🚚 *Entrega:* {dataEntrega} às {horario}
📍 *Endereço:* {enderecoFormatado} (Frete: R$ 15,00)

💰 *Valor Total:* R$ 310,00
💳 *Sinal para Confirmação (50%):* R$ 155,00
🔑 *Chave PIX:* contato@docearte.com.br (Banco X / Titular Y)

_Orçamento válido até {dataValidade}._
```

#### C. Modelo de Mensagem Gerada para Pedido Confirmado / Cobrança de Saldo
```text
🎉 *Pedido #{id} Confirmado — Doce Arte Confeitaria*
Olá, {nomeCliente}! Sua encomenda está confirmada e agendada para produção.

📅 *Data de Entrega:* {dataEntrega}
📦 *Status Atual:* {statusFormatado}
💵 *Saldo Restante a Pagar na Entrega:* R$ 155,00

Qualquer dúvida, estamos à disposição! 💕
```

---

### 1.3 Benefícios Imediatos
- **Conversão mais rápida:** Redução do tempo de resposta de ~5 minutos para menos de 5 segundos.
- **Profissionalismo:** O cliente recebe uma mensagem padronizada, organizada, elegante e com todas as regras claras (validade, sinal de 50%, caução e chave Pix).
- **Sem erros de cobrança:** Elimina divergências entre o valor cadastrado no sistema e o valor informado na conversa.

---

## 2. Proposta 2: Padronização do `InsumoField` em Entradas e Saídas de Insumos

### 2.1 Contexto e a Dor Atual
Recentemente desenvolvemos o componente [`InsumoField.tsx`](file:///Users/josebacelarnetto/work-node/confectionery-web-dashboard/src/modules/estoqueInsumos/components/InsumoField.tsx) com busca em tempo real (*debounce* de 300ms contra o backend paginado), suporte a modo compacto e visualização de unidades e perecibilidade.

Porém, duas telas essenciais de movimentação física de insumos ainda utilizam o `<select>` nativo estático com limitação fixa de 100 registros:
1. **Entrada de Insumos** (`/estoque-insumos/entradas/nova` — [`EntradaInsumoFormPage.tsx`](file:///Users/josebacelarnetto/work-node/confectionery-web-dashboard/src/modules/estoqueInsumos/pages/EntradaInsumoFormPage.tsx));
2. **Saída de Insumos** (`/estoque-insumos/saidas/nova` — [`SaidaInsumoFormPage.tsx`](file:///Users/josebacelarnetto/work-node/confectionery-web-dashboard/src/modules/estoqueInsumos/pages/SaidaInsumoFormPage.tsx)).

#### Dores Identificadas:
- **Limite de 100 itens:** Se a confeitaria cadastrar mais de 100 insumos, os itens mais novos não aparecem no select.
- **Rolagem cansativa:** Encontrar insumos específicos (ex: "Chocolate Meio Amargo 70% Callebaut") exige rolar uma lista extensa manualmente.
- **Falta de visibilidade da unidade:** O operador digita um número no campo de quantidade sem ver claramente se a entrada está sendo lançada em gramas (`g`), quilos (`kg`), caixas ou litros (`L`).

---

### 2.2 Solução Proposta

Reaproveitar o `InsumoField` com a prop `compact` nas listas dinâmicas de itens de entrada e saída.

#### A. Em `EntradaInsumoFormPage.tsx`:
- Substituir o `<select>` no loop dos insumos recebidos pelo `<InsumoField compact />`.
- Atualizar dinamicamente o rótulo do campo de quantidade com a unidade de medida oficial do insumo selecionado:
  - *Exemplo:* `Quantidade (KG) *` ou `Quantidade (L) *`.
- Exibir badge destacado se o insumo for marcado como `perecível` (`🌡️ Perecível`), alertando imediatamente o estoquista sobre a obrigatoriedade de preenchimento dos campos de **Data de Validade**, **Data de Fabricação** e **Lote**.

#### B. Em `SaidaInsumoFormPage.tsx`:
- Substituir o `<select>` de insumos de descarte/baixa avulsa pelo `<InsumoField compact />`.
- Mostrar a unidade de medida para garantir que baixas por perda ou consumo interno sejam debitadas na proporção correta.

---

### 2.3 Benefícios Imediatos
- **100% de consistência de design:** O operador encontra a mesma experiência moderna de busca em todas as telas de estoque (Fabricação, Compras, Alertas, Entradas e Saídas).
- **Sem limite de catálogo:** Suporta milhares de insumos sem perda de desempenho.
- **Redução de falhas em conferência física:** Facilita a identificação de perecíveis durante o recebimento de mercadorias.

---

## 3. Matriz de Esforço x Impacto

| Proposta | Esforço Técnico | Impacto no Negócio | Prioridade Sugerida |
| :--- | :---: | :---: | :---: |
| **1. Compartilhamento via WhatsApp / Clipboard** | Baixo (1 a 2 horas) | **Muito Alto** (Vendas diretas e conversão) | 🥇 Prioridade 1 |
| **2. Padronização `InsumoField` (Entradas & Saídas)** | Baixo (1 hora) | **Alto** (Operação e integridade do estoque) | 🥈 Prioridade 2 |

---

## 4. Plano de Execução Recomendado

1. **Fase 1 (Comercial):**
   - Criar utilitário `formatarMensagemWhatsApp(orcamento, dadosConfeitaria)` em `src/modules/vendas/lib/whatsapp.ts`.
   - Adicionar o botão de envio no modal e no formulário de orçamento.
   - Adicionar o botão de confirmação na listagem e detalhe de pedidos.

2. **Fase 2 (Estoque):**
   - Refatorar a seleção de insumos em `EntradaInsumoFormPage.tsx` e `SaidaInsumoFormPage.tsx` para usar `<InsumoField compact />`.
   - Validar a compilação com `npm run build` e testes de fluxo.


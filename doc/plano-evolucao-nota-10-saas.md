# Plano Estratégico de Evolução — Rumo à Nota 10 e Comercialização SaaS

> **Objetivo:** Mapear de forma prática e priorizada todas as lacunas identificadas na avaliação do sistema, transformando-o de um excelente sistema de gestão (Nota 9,0) em um **produto SaaS comercializável de ponta a ponta (Nota 10,0)** pronto para ser vendido em escala para ateliês e confeitarias.
>
> **Data:** 18/09/2026  
> **Status:** Diagnóstico & Roadmap de Ação

---

## 1. Diagnóstico Geral das Pontuações

```text
[==================== 9.0 / 10.0 (Média Geral Atual) ====================]

1. Regras de Negócio & Utilidade:   [███████████████████░] 9.8 / 10.0 (Excelente)
2. Qualidade Técnica & Código:       [██████████████████░░] 9.2 / 10.0 (Muito Bom)
3. Usabilidade & Interface (UI/UX):  [█████████████████░░░] 8.8 / 10.0 (Bom)
4. Prontidão Comercial (SaaS):       [███████████████░░░░░] 7.5 / 10.0 (Ponto de Atenção)
```

---

## 2. Pilares de Ação para Alcançar a Nota 10,0

---

### PILAR 1: Prontidão Comercial como SaaS (7,5 $\rightarrow$ 10,0)
*Este é o pilar que transforma o software em uma empresa lucrativa e escalável.*

#### 🎯 Meta 1.1: Isolamento Multi-inquilino (*Multi-Tenancy*)
* **Situação Atual:** As chamadas de API usam usuário padrão ou contexto único compartilhado.
* **O que atacar:**
  1. Garantir isolamento de dados por `tenantId` / `empresaId` em todas as requisições;
  2. Cada confeitaria cadastrada deve enxergar exclusivamente seus próprios clientes, receitas, insumos, pedidos e locações;
  3. Suporte a múltiplos usuários por confeitaria (ex: Perfil *Dona/Administradora*, *Confeiteira/Cozinha*, *Atendente/Vendas*).

#### 🎯 Meta 1.2: Onboarding Self-Service ("Primeiros 5 Minutos")
* **Situação Atual:** Uma confeitaria nova entra no sistema e se depara com todas as tabelas vazias, sem saber por onde começar.
* **O que atacar:**
  1. **Wizard de Boas-Vindas:** Guia interativo em 3 passos:
     - Passo 1: Dados da Confeitaria (Nome, Telefone, Chave PIX padrão);
     - Passo 2: Cadastro do Primeiro Insumo ou carga de lista básica sugerida (leite condensado, farinha, ovos);
     - Passo 3: Criação da Primeira Receita.
  2. **Opção "Carregar Dados de Exemplo":** Permite testar o sistema com dados simulados para entender o fluxo antes de preencher a operação real.

#### 🎯 Meta 1.3: Checkout, Assinaturas & Cobrança Recorrente
* **Situação Atual:** Não existe camada de cobrança ou gestão de planos de assinatura.
* **O que atacar:**
  1. Integração com gateway de pagamentos recorrentes (ex: Asaas, Stripe ou Pagar.me);
  2. Definição de planos comerciais claros:
     - **Plano Doce Início:** Até 30 pedidos/mês (R$ 59/mês);
     - **Plano Ateliê Pro:** Pedidos ilimitados + Apoio de Festa + WhatsApp (R$ 99/mês);
     - **Plano Confeitaria Escala:** Múltiplos usuários + Suporte prioritário (R$ 149/mês).
  3. Trial gratuito de 14 dias com bloqueio gracioso após o período de teste.

#### 🎯 Meta 1.4: Personalização de Marca (*Branding* da Confeitaria)
* **O que atacar:**
  - Permitir que a confeiteira faça upload do seu próprio logotipo;
  - O logotipo deve aparecer no cabeçalho, nas comandas impressas e no rodapé dos orçamentos gerados.

---

### PILAR 2: Usabilidade & Experiência do Usuário — UI/UX (8,8 $\rightarrow$ 10,0)
*Este pilar garante que a confeiteira economize tempo todos os dias e ame usar o sistema.*

#### 🎯 Meta 2.1: Envio Ágil de Orçamento e Pedido via WhatsApp
* **Situação Atual:** A confeiteira precisa copiar manualmente os dados ou tirar prints para enviar ao cliente.
* **O que atacar:** *(Conforme detalhado no `proposta-melhorias-comercial-e-estoque-2026-09-18.md`)*
  - Botão de 1 clique **"Enviar no WhatsApp"** gerando a mensagem formatada com emojis, itens, sinal de 50%, chave PIX e regras de entrega;
  - Botão **"Copiar Resumo"** para colar no Instagram Direct ou e-mail.

#### 🎯 Meta 2.2: Painel Kanban de Produção (KDS — Kitchen Display System)
* **Situação Atual:** A lista de pedidos é uma tabela densa (`PedidoListPage.tsx`).
* **O que atacar:**
  - Criar uma aba ou rota alternativa em formato de **Mural Visual de Produção**:
    - Colunas: *Confirmados do Dia* $\rightarrow$ *Em Produção* $\rightarrow$ *Prontos* $\rightarrow$ *Entregues*;
    - Cartões com tamanho otimizado para toque em tablets de cozinha;
    - Horário de entrega em destaque e botão de 1 clique para imprimir a comanda ou avançar status.

#### 🎯 Meta 2.3: Central de Alertas no Header (Sininho de Notificações)
* **Situação Atual:** Alertas de estoque e vencimento exigem navegar até as telas internas de relatórios.
* **O que atacar:**
  - Adicionar um ícone de sininho no topo (`Header.tsx`) com contador numérico de alertas ativos;
  - Dropdown rápido exibindo: *"2 insumos vencendo em 5 dias"* e *"1 insumo abaixo do estoque mínimo"*.

#### 🎯 Meta 2.4: Padronização Completa de Busca Dinâmica
* **O que atacar:**
  - Aplicar o novo componente `<InsumoField compact />` nas telas de **Entrada de Insumos** e **Saída de Insumos**, garantindo que 100% dos seletores do sistema sejam rápidos, paginados e pesquisáveis.

---

### PILAR 3: Qualidade Técnica & Arquitetura (9,2 $\rightarrow$ 10,0)
*Garante confiabilidade absoluta, estabilidade sob carga e manutenção sustentável.*

#### 🎯 Meta 3.1: Divisão de Código e Otimização do Bundle (*Code Splitting*)
* **Situação Atual:** O Vite alerta que módulos grandes (Recharts, formulários complexos) ultrapassam 500 kB após minificação.
* **O que atacar:**
  - Adicionar `React.lazy()` com `Suspense` nas páginas menos frequentes (relatórios, faturamento mensal, configurações e guia);
  - Ajustar o `rollupOptions.output.manualChunks` para separar vendor de charts e tabelas.

#### 🎯 Meta 3.2: Testes Automatizados nos Fluxos Críticos
* **Situação Atual:** A verificação atual é baseada no compilador TypeScript (`tsc`) e testes manuais de QA.
* **O que atacar:**
  - Criar suíte de testes E2E (Playwright ou Cypress) para os 3 fluxos que nunca podem quebrar:
    1. **Fluxo Vendas:** Criação de Orçamento $\rightarrow$ Conversão em Pedido $\rightarrow$ Registro de Pagamento 50%;
    2. **Fluxo Produção:** Mudança para `EM_PRODUCAO` $\rightarrow$ Validação de Débito Automático FIFO no estoque;
    3. **Fluxo Apoio de Festa:** Reserva de item com caução $\rightarrow$ Bloqueio de data no calendário de disponibilidade.

#### 🎯 Meta 3.3: Modo PWA & Resiliência Offline
* **O que atacar:**
  - Adicionar manifesto PWA básico permitindo "Instalar como aplicativo" no iPad / celular da cozinha;
  - Cache local dos pedidos do dia para permitir consulta da comanda mesmo se o Wi-Fi oscilar temporariamente.

---

### PILAR 4: Regras de Negócio & Utilidade (9,8 $\rightarrow$ 10,0)
*Transformar o sistema de "controlador de dados" em "consultor de lucro".*

#### 🎯 Meta 4.1: Formação de Preço & Custo Real da Receita (CPV Automático)
* **O que atacar:**
  - Na ficha técnica da receita, calcular automaticamente em tempo real a soma dos custos unitários dos ingredientes;
  - Sugerir o preço de venda ideal com base na margem de lucro desejada pela confeiteira (ex: Custo R$ 20,00 + Margem 200% = Venda R$ 60,00).

#### 🎯 Meta 4.2: Impressão Térmica de Bobina (80mm)
* **O que atacar:**
  - Estilização CSS `@media print` para impressoras térmicas de cupom (mini-impressoras USB/Bluetooth), facilitando colar a comanda direto na embalagem da encomenda.

---

## 3. Cronograma de Execução Priorizado (Roadmap)

```mermaid
timeline
    title Roadmap de Evolução do Produto
    section Fase 1 : Quick Wins (1 a 2 semanas)
        Envio pelo WhatsApp : Botão e mensagens prontas
        Padronização InsumoField : Telas de Entrada e Saída
        Sininho de Notificações : Alertas rápidos no Header
    section Fase 2 : Cozinha & Lucro (3 a 4 semanas)
        Kanban de Produção (KDS) : Mural touch para tablet
        Custo Automático da Receita : CPV e margem sugerida
        Impressão Térmica 80mm : Comanda em bobina
    section Fase 3 : Comercialização SaaS (5 a 8 semanas)
        Multi-tenancy : Isolamento de contas
        Checkout & Assinaturas : Asaas / Stripe
        Wizard de Onboarding : Configuração guiada inicial
        Lançamento Comercial : Captação dos primeiros 20 clientes
```

---

## 4. Métricas de Sucesso do Projeto

Ao atacar este plano, o sistema atingirá os seguintes indicadores de excelência:

1. **Nota Global:** **9,9+ / 10,0** (padrão de produto comercial maduro).
2. **Tempo de Atendimento da Confeiteira:** Redução de 70% no fechamento de pedidos.
3. **Erros de Produção:** Zero falhas de recheio ou data por conta de comandas e Kanban integrados.
4. **Potencial de Negócio:** Capacidade imediata de operar como um negócio SaaS recorrente com alto índice de retenção (*LTV alto / Churn baixo*).


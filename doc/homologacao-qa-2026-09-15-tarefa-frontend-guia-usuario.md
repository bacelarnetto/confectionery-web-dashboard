# Tarefa para o agente de Frontend — Atualizar o Guia de Usuário

**Origem:** pedido direto do dono do produto (15/09/2026), depois da rodada de homologação do sistema como um todo. Não é um achado de bug — é uma melhoria de conteúdo/documentação.
**Repositório:** `confectionery-web-dashboard` (branch `hotfix/estoque-insumo`).
**Regra combinada com o dono do projeto: NÃO COMMITAR.** Deixe as alterações no working directory para revisão manual.
**Onde fica o guia:** `src/modules/guia/` — cada seção é um componente em `src/modules/guia/components/sections/*.tsx`, registrado em `src/modules/guia/guiaSections.tsx` (array `guiaSections`, com `id`, `titulo`, `descricao`, `icone` e `Component`). Use qualquer seção existente (ex.: `Vendas.tsx`, `AlertasPedido.tsx`, `Compras.tsx`) como referência de estilo — o guia já está com um padrão visual e de tom bem consistente (linguagem direta, sem jargão técnico, exemplos práticos, o bloco verde "por que isso importa" no fim de cada seção, `GuiaCard` numerado por `step`, `GuiaTooltip` pra detalhe secundário, badges coloridos pra status/tipo). Mantenha esse padrão — não é pra reescrever o que já existe, é pra completar o que falta.

**Pedido do dono, nas palavras dele:** "atualizar o guia de usuário final no frontend. pode melhorar, acrescentar, fique à vontade." — ou seja, há liberdade de julgamento aqui, isto é só um ponto de partida, não uma lista fechada.

---

## O que já está bem coberto (não precisa retrabalhar)

Todos os 11 módulos abaixo já têm seção própria e o conteúdo está correto e alinhado com o comportamento real do sistema (confirmado nesta e nas rodadas anteriores de homologação): Acesso e Usuários (login, perfis, Administração → Usuários e Dados da Empresa), Primeiros Passos, Compras, Alertas de Insumo, Gestão de Custos, Precificação, Vendas (que já cobre Clientes, Complementos, Orçamentos, Pedidos e pagamento/recibo dentro do fluxo), Mural da Semana, Alertas de Pedido, Relatórios, Histórico e Segurança.

## O que falta — sugestões de conteúdo novo

### 1. Uma seção (ou um card dentro de "Primeiros Passos") sobre o Dashboard

Hoje nenhuma seção explica a tela inicial (`/`) — que é a primeira coisa que qualquer pessoa vê ao logar. Vale explicar o que cada card do Dashboard mostra: Valor em Estoque, Gastos (Mês Atual), Produtos em Baixa, Fornecedores Ativos, Pedidos (Mês Atual), Receita (Mês Atual), Pedidos em Aberto, Ticket Médio, e o bloco "Financeiro — Resumo do Mês" (Receita, Gastos, Custo dos Doces/COGS, Lucro Real, gráfico de Gastos por Categoria, A Receber). Não precisa ser uma seção enorme — pode ser um card rápido tipo "seu painel de controle: os números que mais importam, de relance, sem precisar abrir relatório nenhum".

### 2. Uma seção nova para Financeiro (Gastos + Contas a Receber)

Esse é o maior buraco: não existe seção nenhuma sobre `Financeiro → Gastos`, `Financeiro → Tipos de Gasto` e `Financeiro → Contas a Receber`. A seção "Vendas" só menciona de passagem "use Financeiro → Contas a Receber" pra ver saldo pendente — mas não explica:
- Como lançar um **Gasto** (valor, data, tipo de gasto, fornecedor opcional) e como cadastrar/organizar os **Tipos de Gasto** (categorias livres, tipo "Aluguel", "Energia", "Marketing" — são essas categorias que alimentam o gráfico "Gastos por Categoria" do Dashboard).
- Que **Contas a Receber** junta, numa lista só, tanto o saldo pendente de Pedidos quanto **Contas Avulsas** — e o que é uma conta avulsa: um recebimento que não veio de um Pedido do sistema (ex.: uma venda combinada por fora, um adiantamento). Como criar uma (`Financeiro → Contas a Receber → Nova Conta Avulsa`: descrição, valor, cliente opcional) e como registrar o recebimento (parcial ou total, com status Aberto/Parcial/Pago).

**Atenção antes de escrever esta parte — leia primeiro:** existe um achado de bug ainda **não corrigido** sobre exatamente essa tela (`doc/homologacao-qa-2026-09-15-addendum2.md`, achado 4, no repositório do backend): hoje é possível excluir uma conta avulsa já paga e isso apaga retroativamente a receita do mês no resumo financeiro, sem aviso. **Não descreva a exclusão de conta avulsa como uma ação segura/sem consequência** enquanto esse achado não for corrigido pelo backend — ou escreva de forma genérica ("uma conta avulsa pode ser excluída da lista", sem detalhar o que acontece com o valor já recebido), ou espere o fix antes de detalhar esse ponto. O resto do fluxo (criar conta, registrar recebimento) pode ser documentado normalmente, já que funciona corretamente.

### 3. Cadastro de Fornecedor, dentro da seção "Compras"

A seção "Compras" já assume que o fornecedor existe ("Escolha um fornecedor (opcional)") mas não explica onde/como cadastrar um. Vale um `GuiaCard` (step 0, ou uma nota antes do step 1 atual) explicando `Compras → Fornecedores → Novo Fornecedor` — nome, contato, e o que for relevante do formulário atual.

## Como validar antes de considerar pronto

- Ler o formulário/tela real de cada fluxo novo (Gastos, Tipos de Gasto, Contas a Receber Avulsa, Fornecedores, Dashboard) antes de escrever — o guia é preciso hoje justamente porque descreve o comportamento real, não o que "deveria" ser. Não adivinhar campo/nome de botão.
- Manter o mesmo tom das seções existentes — direto, sem jargão, com exemplo prático quando fizer sentido.
- Não é necessário (nem desejável) documentar bugs — se algo parecer quebrado ou ambíguo enquanto for escrever, é melhor perguntar ou pular essa parte do que documentar um comportamento errado como se fosse a regra.

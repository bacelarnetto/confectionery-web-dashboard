# Confectionery Web (Frontend)

Este é o frontend do projeto **ConfectioneryEase**, responsável pela interface de usuário (UI) para gerenciamento do sistema.

## 🛠 Tecnologias

O projeto utiliza as seguintes tecnologias e bibliotecas no frontend:

- **[React 19](https://react.dev/)** (`react`, `react-dom`): Biblioteca principal para a construção da interface do usuário.
- **[TypeScript](https://www.typescriptlang.org/)**: Superset do JavaScript que adiciona tipagem estática ao código.
- **[Vite](https://vitejs.dev/)**: Ferramenta de build extremamente rápida e moderna, utilizada como empacotador e servidor de desenvolvimento.
- **[Tailwind CSS](https://tailwindcss.com/)**: Framework de CSS utilitário "utility-first" para estilização rápida, consistente e responsiva.
- **[React Router](https://reactrouter.com/)** (`v8`): Gerenciamento de rotas e navegação no lado do cliente (SPA).
- **[TanStack Query](https://tanstack.com/query/latest)** (`v5`): Gerenciamento robusto de estado do servidor, abrangendo data fetching, caching, sincronização e atualizações (mutations).
- **[Axios](https://axios-http.com/)**: Cliente HTTP baseado em Promises focado na comunicação com a API RESTful do backend (Spring Boot).
- **[Lucide React](https://lucide.dev/)**: Biblioteca moderna e consistente de ícones SVG.
- **[React Hot Toast](https://react-hot-toast.com/)**: Biblioteca otimizada para exibição de notificações não obstrutivas (toasts) como feedback em tela.

## 🗂 Visão Geral da Arquitetura

O código-fonte base da aplicação web se concentra dentro da pasta `src/`.
Em alinhamento às regras arquiteturais definidas para o ecossistema do **ConfectioneryEase**:

- O frontend comunica-se com as APIs de cada módulo do backend (`compras`, `estoqueInsumos`, `shared`, `vendas`, `estoqueProdutos`, `financeiro`).
- **Clients HTTP:** A comunicação via API é centralizada em funções focadas que utilizam o Axios, mantidas em serviços e custom hooks (`useQuery` / `useMutation` do TanStack Query).
- **Integração Desacoplada:** Assim como a regra seguida pelo backend, a comunicação de módulos feita na UI sempre passa propriedades refenciadas por **IDs base**, preservando o isolamento entre contextos (ex.: um Insumo se liga a uma Compra exclusivamente por `compraId`).

## 💰 Finanças

O módulo de Finanças permite acompanhar gastos, receitas e contas a receber da confeitaria de forma simples e objetiva.

### Resumo do Mês (Dashboard)

Ao acessar a tela principal (Dashboard), a seção **"Financeiro — Resumo do Mês"** mostra, de um relance:

- **Receita** total do mês.
- **Gastos** totais do mês.
- **Custo dos Doces (COGS)** — quanto custou a matéria-prima dos pedidos entregues.
- **Lucro Real** — receita menos gastos e custo dos doces.
- **Gráfico de pizza** com a distribuição dos gastos por categoria.
- **A Receber** — total e quantidade de pedidos/contas ainda não quitados.

### Lançar um Gasto

1. Acesse **Financeiro → Gastos** no menu lateral.
2. Clique em **Novo Gasto**.
3. Preencha:
   - **Tipo de Gasto** — escolha entre as categorias cadastradas (ex.: aluguel, energia, embalagens…).
   - **Valor** — valor em reais.
   - **Data do Pagamento** — data em que o pagamento foi (ou será) efetuado.
   - **Descrição** — detalhe opcional sobre o gasto.
   - **Documento** — campo opcional para referência (nota fiscal, comprovante, etc.).
4. Marque **Recorrente** se for um gasto fixo que se repete todo mês (ex.: aluguel, internet).
5. Salve. O gasto aparecerá automaticamente no resumo do mês.

> **Dica:** Use o botão **"Repetir Próximo Mês"** em um gasto já lançado para duplicá-lo automaticamente no mês seguinte, sem precisar preencher tudo de novo.

### Categorias de Gasto (Tipos de Gasto)

1. Acesse **Financeiro → Tipos de Gasto** no menu lateral.
2. Aqui você cria, edita e remove as categorias usadas ao lançar gastos (ex.: Aluguel, Energia, Água, Embalagens, Ingredientes, Marketing…).

### Contas a Receber

Acesse **Financeiro → Contas a Receber** para acompanhar tudo que ainda falta receber:

- **Pedidos pendentes** — pedidos já entregues que ainda não foram quitados. Cada pedido mostra o valor, o cliente e um *motivo de pendência* que você pode editar (ex.: "aguardando pagamento via Pix", "cliente solicitou prazo").
- **Contas avulsas** — receitas que não vêm de pedidos (ex.: funcionário que quebrou algo, aluguel de espaço, venda avulsa). Você pode cadastrar, editar e excluir essas contas.

Para registrar o recebimento de um pedido ou conta avulsa, clique em **Receber**, informe o valor e a data, e confirme.

### Pagamento na Tela de Pedido

Na tela de edição de um pedido (**Vendas → Pedidos → Editar**), há um card **"Pagamento"** que exibe:

- O saldo pendente (valor total do pedido menos o total já pago).
- Um botão para **registrar pagamento** (valor + data).
- Campo para editar o **motivo de pendência**, caso o pedido ainda não tenha sido quitado integralmente.

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js instalado (versão suportada atual para o uso do Vite).
- Gerenciador de pacotes da sua preferência (o padronizado é o `npm`).

### Passos

1. **Instale todas as dependências do projeto:**
   ```bash
   npm install
   ```

2. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   *Por padrão, a aplicação estará disponível localmente em `http://localhost:5173` (ou outra porta livre indicada no terminal pelo Vite).*

## 🛠 Todos os Scripts/Comandos

Os comandos disponíveis, definidos pelo arquivo `package.json`, são:

- `npm run dev`
  > Inicia o servidor Vite para ambiente de desenvolvimento local (com Hot Module Replacement - HMR).

- `npm run build`
  > Valida os tipos via TypeScript (`tsc`) e compila/empacota o projeto usando o Vite para ser servido em ambiente de Produção. O resultado é despejado na pasta `dist/`.

- `npm run preview`
  > Levanta um servidor web estático local servindo a pasta `dist/` gerada, ideal para antever e testar exatamente a versão que subirá para Produção antes de um eventual processo de deploy.

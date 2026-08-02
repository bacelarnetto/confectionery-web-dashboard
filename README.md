# Confectionery Web (Frontend)

Este é o frontend do projeto **ConfectioneryEase**, responsável pela interface de usuário (UI) para gerenciamento do sistema.

## 🛠 Tecnologias

O projeto utiliza as seguintes tecnologias e bibliotecas no frontend:

- **[React 18](https://react.dev/)** (`react`, `react-dom`): Biblioteca principal para a construção da interface do usuário.
- **[TypeScript](https://www.typescriptlang.org/)**: Superset do JavaScript que adiciona tipagem estática ao código.
- **[Vite](https://vitejs.dev/)**: Ferramenta de build extremamente rápida e moderna, utilizada como empacotador e servidor de desenvolvimento.
- **[Tailwind CSS](https://tailwindcss.com/)**: Framework de CSS utilitário "utility-first" para estilização rápida, consistente e responsiva.
- **[React Router DOM](https://reactrouter.com/)** (`v6`): Gerenciamento de rotas e navegação no lado do cliente (SPA).
- **[TanStack Query](https://tanstack.com/query/latest)** (`v5`): Gerenciamento robusto de estado do servidor, abrangendo data fetching, caching, sincronização e atualizações (mutations).
- **[Axios](https://axios-http.com/)**: Cliente HTTP baseado em Promises focado na comunicação com a API RESTful do backend (Spring Boot).
- **[Lucide React](https://lucide.dev/)**: Biblioteca moderna e consistente de ícones SVG.
- **[React Hot Toast](https://react-hot-toast.com/)**: Biblioteca otimizada para exibição de notificações não obstrutivas (toasts) como feedback em tela.

## 🗂 Visão Geral da Arquitetura

O código-fonte base da aplicação web se concentra dentro da pasta `src/`.
Em alinhamento às regras arquiteturais definidas para o ecossistema do **ConfectioneryEase**:

- O frontend comunica-se com as APIs de cada módulo do backend (`compras`, `estoqueInsumos`, `shared`, `vendas`, `estoqueProdutos`).
- **Clients HTTP:** A comunicação via API é centralizada em funções focadas que utilizam o Axios, mantidas em serviços e custom hooks (`useQuery` / `useMutation` do TanStack Query).
- **Integração Desacoplada:** Assim como a regra seguida pelo backend, a comunicação de módulos feita na UI sempre passa propriedades refenciadas por **IDs base**, preservando o isolamento entre contextos (ex.: um Insumo se liga a uma Compra exclusivamente por `compraId`).

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

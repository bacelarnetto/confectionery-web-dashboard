import type { ComponentType, ReactNode } from 'react'
import { LogIn, Sprout, ShoppingCart, Bell, Wallet, Sparkles, Store, KanbanSquare, CalendarClock, History, BarChart3 } from 'lucide-react'
import AcessoUsuarios from './components/sections/AcessoUsuarios'
import PrimeirosPassos from './components/sections/PrimeirosPassos'
import Compras from './components/sections/Compras'
import AlertasInsumo from './components/sections/AlertasInsumo'
import GestaoCustos from './components/sections/GestaoCustos'
import Precificacao from './components/sections/Precificacao'
import Vendas from './components/sections/Vendas'
import Mural from './components/sections/Mural'
import AlertasPedido from './components/sections/AlertasPedido'
import Relatorios from './components/sections/Relatorios'
import Historico from './components/sections/Historico'

export interface GuiaSecao {
  id: string
  titulo: string
  descricao: string
  icone: ReactNode
  Component: ComponentType
}

export const guiaSections: GuiaSecao[] = [
  {
    id: 'acesso-usuarios',
    titulo: 'Acesso e Usuários',
    descricao: 'Login, sua sessão e os perfis de acesso',
    icone: <LogIn size={16} />,
    Component: AcessoUsuarios,
  },
  {
    id: 'primeiros-passos',
    titulo: 'Primeiros Passos',
    descricao: 'Cadastre insumos e receitas para começar',
    icone: <Sprout size={16} />,
    Component: PrimeirosPassos,
  },
  {
    id: 'compras',
    titulo: 'Compras',
    descricao: 'Da lista de compras ao estoque atualizado',
    icone: <ShoppingCart size={16} />,
    Component: Compras,
  },
  {
    id: 'alertas-insumo',
    titulo: 'Alertas de Insumo',
    descricao: 'O sistema de olho na validade e no estoque',
    icone: <Bell size={16} />,
    Component: AlertasInsumo,
  },
  {
    id: 'gestao-custos',
    titulo: 'Gestão de Custos',
    descricao: 'Entenda os dois tipos de custo do seu bolso',
    icone: <Wallet size={16} />,
    Component: GestaoCustos,
  },
  {
    id: 'precificacao',
    titulo: 'Precificação Inteligente',
    descricao: 'Como o sistema calcula o preço de venda ideal',
    icone: <Sparkles size={16} />,
    Component: Precificacao,
  },
  {
    id: 'vendas',
    titulo: 'Vendas',
    descricao: 'Do cliente ao pedido pronto pra produção',
    icone: <Store size={16} />,
    Component: Vendas,
  },
  {
    id: 'mural',
    titulo: 'Mural da Semana',
    descricao: 'O post-it operacional da sua cozinha',
    icone: <KanbanSquare size={16} />,
    Component: Mural,
  },
  {
    id: 'alertas-pedido',
    titulo: 'Alertas de Pedido',
    descricao: 'Prazos de entrega, sem surpresa',
    icone: <CalendarClock size={16} />,
    Component: AlertasPedido,
  },
  {
    id: 'relatorios',
    titulo: 'Relatórios',
    descricao: 'Faturamento, custo e estoque prontos pra exportar',
    icone: <BarChart3 size={16} />,
    Component: Relatorios,
  },
  {
    id: 'historico',
    titulo: 'Histórico e Segurança',
    descricao: 'A foto dos seus custos, sempre à mão',
    icone: <History size={16} />,
    Component: Historico,
  },
]

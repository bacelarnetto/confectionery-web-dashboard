import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router'
import { useAuth } from 'react-oidc-context'
import { Truck, ShoppingCart, Cookie, Package, PackagePlus, ArrowDownToLine, ArrowUpFromLine, Archive, Activity, LayoutDashboard, Users, Bell, Settings, ChevronDown, Store, UtensilsCrossed, FlaskConical, Layers, KanbanSquare, CalendarClock, BookOpen, TrendingUp, PiggyBank, FileText, X } from 'lucide-react'
import { useAlertasCountAtivos } from '../../modules/estoqueInsumos/hooks/useAlertas'
import { useCountAlertasPedidoAtivos } from '../../modules/vendas/hooks/useAlertasPedido'
import { useAlertasProdutoCountAtivos } from '../../modules/estoqueProdutos/hooks/useAlertasProduto'
import { hasRole } from '../../lib/auth'

interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
  badge?: () => React.ReactNode
}

interface NavSection {
  title: string
  key: string
  items: NavItem[]
  // Rota UI-only (o backend não bloqueia por role no MVP, ver doc/defesa-arquitetura-autenticacao.md
  // D4) — sem essa role, a seção inteira some do menu, mas a API continuaria aceitando a chamada
  // se alguém acessasse a rota direto.
  requiresRole?: string
}

function AlertaBadge() {
  const { data: count } = useAlertasCountAtivos()
  if (!count || count === 0) return null
  return (
    <span className="ml-auto px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full leading-none min-w-[18px] text-center">
      {count > 99 ? '99+' : count}
    </span>
  )
}

function AlertaProdutoBadge() {
  const { data: count } = useAlertasProdutoCountAtivos()
  if (!count || count === 0) return null
  return (
    <span className="ml-auto px-1.5 py-0.5 text-xs bg-orange-500 text-white rounded-full leading-none min-w-[18px] text-center">
      {count > 99 ? '99+' : count}
    </span>
  )
}

function AlertaPedidoBadge() {
  const { data: count } = useCountAlertasPedidoAtivos()
  if (!count || count === 0) return null
  return (
    <span className="ml-auto px-1.5 py-0.5 text-xs bg-red-600 text-white rounded-full leading-none min-w-[18px] text-center">
      {count > 99 ? '99+' : count}
    </span>
  )
}

const navigation: NavSection[] = [
  {
    title: 'Geral',
    key: 'geral',
    items: [
      { label: 'Dashboard', to: '/', icon: <LayoutDashboard size={18} /> },
    ],
  },
  {
    title: 'Compras',
    key: 'compras',
    items: [
      { label: 'Fornecedores', to: '/compras/fornecedores', icon: <Truck size={18} /> },
      { label: 'Compras', to: '/compras/compras', icon: <ShoppingCart size={18} /> },
    ],
  },
  {
    title: 'Estoque Insumos',
    key: 'estoque-insumos',
    items: [
      { label: 'Categorias', to: '/estoque-insumos/categorias', icon: <Package size={18} /> },
      { label: 'Insumos', to: '/estoque-insumos/insumos', icon: <FlaskConical size={18} /> },
      { label: 'Entradas', to: '/estoque-insumos/entradas', icon: <ArrowDownToLine size={18} /> },
      { label: 'Saídas', to: '/estoque-insumos/saidas', icon: <ArrowUpFromLine size={18} /> },
      { label: 'Estoque Atual', to: '/estoque-insumos/estoque', icon: <Archive size={18} /> },
      { label: 'Movimentações', to: '/estoque-insumos/movimentacoes', icon: <Activity size={18} /> },
      { label: 'Alertas', to: '/estoque-insumos/alertas', icon: <Bell size={18} />, badge: () => <AlertaBadge /> },
      { label: 'Parametrização', to: '/estoque-insumos/parametrizacao-alertas', icon: <Settings size={18} /> },
    ],
  },
  {
    title: 'Estoque Produtos',
    key: 'estoque-produtos',
    items: [
      { label: 'Categorias', to: '/estoque-produtos/categorias', icon: <Package size={18} /> },
      { label: 'Produtos', to: '/estoque-produtos/produtos', icon: <UtensilsCrossed size={18} /> },
      { label: 'Receitas', to: '/estoque-produtos/receitas', icon: <FlaskConical size={18} /> },
      { label: 'Fabricação', to: '/estoque-produtos/fabricacoes', icon: <Layers size={18} /> },
      { label: 'Entradas', to: '/estoque-produtos/entradas', icon: <PackagePlus size={18} /> },
      { label: 'Estoque Atual', to: '/estoque-produtos/estoque', icon: <Archive size={18} /> },
      { label: 'Alertas', to: '/estoque-produtos/alertas', icon: <Bell size={18} />, badge: () => <AlertaProdutoBadge /> },
      { label: 'Parametrização', to: '/estoque-produtos/parametrizacao-alertas', icon: <Settings size={18} /> },
    ],
  },
  {
    title: 'Vendas',
    key: 'vendas',
    items: [
      { label: 'Clientes', to: '/vendas/clientes', icon: <Users size={18} /> },
      { label: 'Complementos', to: '/vendas/complementos', icon: <Package size={18} /> },
      { label: 'Orçamentos', to: '/vendas/orcamentos', icon: <FileText size={18} /> },
      { label: 'Pedidos', to: '/vendas/pedidos', icon: <Store size={18} /> },
      { label: 'Mural da Semana', to: '/vendas/mural', icon: <KanbanSquare size={18} /> },
      { label: 'Alertas de Pedidos', to: '/alertas-pedido', icon: <CalendarClock size={18} />, badge: () => <AlertaPedidoBadge /> },
    ],
  },
  {
    title: 'Relatórios',
    key: 'relatorios',
    items: [
      { label: 'Faturamento Mensal', to: '/relatorios/faturamento-mensal', icon: <TrendingUp size={18} /> },
      { label: 'Custo de Produção', to: '/relatorios/custo-producao', icon: <PiggyBank size={18} /> },
      { label: 'Movimentação de Estoque', to: '/relatorios/movimentacao-estoque', icon: <Activity size={18} /> },
    ],
  },
  {
    title: 'Administração',
    key: 'admin',
    requiresRole: 'ADMIN',
    items: [
      { label: 'Usuários', to: '/usuarios', icon: <Users size={18} /> },
    ],
  },
  {
    title: 'Ajuda',
    key: 'ajuda',
    items: [
      { label: 'Guia do Usuário', to: '/guia', icon: <BookOpen size={18} /> },
    ],
  },
]

const STORAGE_KEY = 'sidebar_collapsed_sections'

function getInitialCollapsed(sections: NavSection[], activeKeys: Set<string>): Set<string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return new Set(JSON.parse(stored))
  } catch {}
  // default: collapse all except the one with active route
  return new Set(sections.map((s) => s.key).filter((k) => !activeKeys.has(k)))
}

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()
  const auth = useAuth()
  const visibleNavigation = navigation.filter((s) => !s.requiresRole || hasRole(auth.user, s.requiresRole))

  const activeSection = visibleNavigation.find((s) =>
    s.items.some((item) => {
      if (item.to === '/') return location.pathname === '/'
      return location.pathname.startsWith(item.to)
    }),
  )

  const [collapsed, setCollapsed] = useState<Set<string>>(() =>
    getInitialCollapsed(visibleNavigation, new Set(activeSection ? [activeSection.key] : [])),
  )

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(collapsed)))
    } catch {}
  }, [collapsed])

  // Auto-expand section when navigating into it
  useEffect(() => {
    if (activeSection && collapsed.has(activeSection.key)) {
      setCollapsed((prev) => {
        const next = new Set(prev)
        next.delete(activeSection.key)
        return next
      })
    }
  }, [location.pathname])

  // No mobile o menu é um drawer sobreposto (ver Header/AppLayout) -- fecha sozinho ao navegar,
  // já que senão a tela de destino fica escondida atrás dele.
  useEffect(() => {
    onClose()
  }, [location.pathname])

  function toggleSection(key: string) {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <>
      {/* Backdrop: só existe (e captura clique) enquanto o drawer mobile está aberto */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`w-64 flex-shrink-0 bg-sidebar text-white flex flex-col h-full fixed inset-y-0 left-0 z-40 transition-transform duration-200 ease-out lg:static lg:z-auto lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Cookie size={18} className="text-white" />
          </div>
          <span className="font-semibold text-base tracking-tight flex-1">Confectionery</span>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded-md lg:hidden"
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        {visibleNavigation.map((section) => {
          const isCollapsed = collapsed.has(section.key)
          return (
            <div key={section.key} className="mb-1">
              <button
                onClick={() => toggleSection(section.key)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-200 transition-colors rounded-md hover:bg-sidebar-hover"
              >
                <span>{section.title}</span>
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
                />
              </button>

              {!isCollapsed && (
                <ul className="mt-0.5 space-y-0.5">
                  {section.items.map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.to === '/'}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                            isActive
                              ? 'bg-sidebar-active text-white font-medium'
                              : 'text-gray-300 hover:bg-sidebar-hover hover:text-white'
                          }`
                        }
                      >
                        <span className="flex-shrink-0">{item.icon}</span>
                        <span>{item.label}</span>
                        {item.badge && item.badge()}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-sidebar-border">
          <p className="text-xs text-gray-500">v0.1.0 · Admin</p>
        </div>
      </aside>
    </>
  )
}

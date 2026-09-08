import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router'
import { Truck, ShoppingCart, Cookie, Package, ArrowDownToLine, ArrowUpFromLine, Archive, Activity, LayoutDashboard, Users, Bell, Settings, ChevronDown, Store, UtensilsCrossed, FlaskConical, Layers, KanbanSquare, CalendarClock, BookOpen, TrendingUp, PiggyBank } from 'lucide-react'
import { useAlertasCountAtivos } from '../../modules/estoqueInsumos/hooks/useAlertas'
import { useCountAlertasPedidoAtivos } from '../../modules/vendas/hooks/useAlertasPedido'
import { useAlertasProdutoCountAtivos } from '../../modules/estoqueProdutos/hooks/useAlertasProduto'

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

export default function Sidebar() {
  const location = useLocation()

  const activeSection = navigation.find((s) =>
    s.items.some((item) => {
      if (item.to === '/') return location.pathname === '/'
      return location.pathname.startsWith(item.to)
    }),
  )

  const [collapsed, setCollapsed] = useState<Set<string>>(() =>
    getInitialCollapsed(navigation, new Set(activeSection ? [activeSection.key] : [])),
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

  function toggleSection(key: string) {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <aside className="w-60 flex-shrink-0 bg-gray-900 text-white flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-700">
        <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Cookie size={18} className="text-white" />
        </div>
        <span className="font-semibold text-base tracking-tight">Confectionery</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        {navigation.map((section) => {
          const isCollapsed = collapsed.has(section.key)
          return (
            <div key={section.key} className="mb-1">
              <button
                onClick={() => toggleSection(section.key)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-200 transition-colors rounded-md hover:bg-gray-800"
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
                              ? 'bg-gray-700 text-white font-medium'
                              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
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
      <div className="px-5 py-4 border-t border-gray-700">
        <p className="text-xs text-gray-500">v0.1.0 · Admin</p>
      </div>
    </aside>
  )
}

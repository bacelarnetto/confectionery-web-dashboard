import { useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { ChevronRight, User, Bell, AlertTriangle, CalendarClock, LogOut, Menu, Palette, Check } from 'lucide-react'
import { useAuth } from 'react-oidc-context'
import { getUsername } from '../../lib/auth'
import { useAlertasCountAtivos, useAlertas } from '../../modules/estoqueInsumos/hooks/useAlertas'
import { useCountAlertasPedidoAtivos, useAlertasPedidoAtivos } from '../../modules/vendas/hooks/useAlertasPedido'
import { THEMES, ThemeName, applyTheme, getStoredTheme } from '../../lib/theme'

const THEME_SWATCHES: Record<ThemeName, string> = {
  laranja: '#f59e0b',
  rosa: '#c96a82',
}

const routeNames: Record<string, { section: string; title: string }> = {
  '/': { section: 'Dashboard', title: 'Visão Geral' },
  '/compras/fornecedores': { section: 'Compras', title: 'Fornecedores' },
  '/compras/compras': { section: 'Compras', title: 'Pedidos de Compra' },
  '/estoque-insumos/categorias': { section: 'Estoque', title: 'Categorias' },
  '/estoque-insumos/insumos': { section: 'Estoque', title: 'Insumos' },
  '/estoque-insumos/entradas': { section: 'Estoque', title: 'Entradas' },
  '/estoque-insumos/saidas': { section: 'Estoque', title: 'Saídas' },
  '/estoque-insumos/estoque': { section: 'Estoque', title: 'Saldo de Estoque' },
  '/estoque-insumos/movimentacoes': { section: 'Estoque', title: 'Movimentações' },
  '/estoque-insumos/alertas': { section: 'Estoque', title: 'Alertas' },
  '/estoque-insumos/parametrizacao-alertas': { section: 'Estoque', title: 'Parâmetros de Alerta' },
  '/estoque-produtos/entradas': { section: 'Estoque Produtos', title: 'Entradas de Produto' },
  '/relatorios/faturamento-mensal': { section: 'Relatórios', title: 'Faturamento Mensal' },
  '/relatorios/custo-producao': { section: 'Relatórios', title: 'Custo de Produção' },
  '/relatorios/movimentacao-estoque': { section: 'Relatórios', title: 'Movimentação de Estoque' },
  '/guia': { section: 'Ajuda', title: 'Guia do Usuário' },
  '/usuarios': { section: 'Configurações', title: 'Usuários' },
  '/dados-emissor': { section: 'Configurações', title: 'Dados da Empresa' },
  '/vendas/orcamentos': { section: 'Vendas', title: 'Orçamentos' },
  '/vendas/formas-pagamento': { section: 'Vendas', title: 'Formas de Pagamento' },
  '/financeiro/tipos-gasto': { section: 'Financeiro', title: 'Tipos de Gasto' },
  '/financeiro/gastos': { section: 'Financeiro', title: 'Gastos' },
  '/financeiro/contas-receber': { section: 'Financeiro', title: 'Contas a Receber' },
}

function formatDate(dateStr: string) {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const auth = useAuth()
  
  // Encontra a rota base (remove /novo ou /editar) para exibir o título correto
  const baseRoute = Object.keys(routeNames).find((route) => location.pathname.startsWith(route) && route !== '/')
  const currentRoute = location.pathname === '/' ? routeNames['/'] : routeNames[baseRoute || '/']
  
  const { section, title } = currentRoute || { section: 'Confectionery', title: 'Admin' }
  const showBreadcrumb = title !== section

  const { data: countAtivos } = useAlertasCountAtivos()
  const { data: alertData } = useAlertas(0, 5, { ativo: true })
  const ultimosAlertas = alertData?.content ?? []

  const { data: countPedidoAtivos } = useCountAlertasPedidoAtivos()
  const { data: alertasPedidoData } = useAlertasPedidoAtivos()
  const temAtrasadoPedido = alertasPedidoData?.content.some((a) => a.tipo === 'ATRASADO') ?? false

  const [showPopover, setShowPopover] = useState(false)
  const [showPedidoPopover, setShowPedidoPopover] = useState(false)
  const [showThemePopover, setShowThemePopover] = useState(false)
  const [theme, setTheme] = useState<ThemeName>(getStoredTheme)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pedidoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleThemeChange(next: ThemeName) {
    applyTheme(next)
    setTheme(next)
    setShowThemePopover(false)
  }

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setShowPopover(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowPopover(false)
    }, 200)
  }

  return (
    <header className="h-14 flex-shrink-0 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-3 sm:px-6 gap-2 z-20">
      <div className="flex items-center gap-2 min-w-0">
        {/* Menu hambúrguer: só no mobile -- o menu lateral fica escondido abaixo do breakpoint lg */}
        <button
          onClick={onMenuClick}
          className="p-2 -ml-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors lg:hidden flex-shrink-0"
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm min-w-0 truncate">
          <span className="text-gray-400 font-medium truncate">{section}</span>
          {showBreadcrumb && (
            <>
              <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
              <span className="text-gray-700 font-semibold truncate">{title}</span>
            </>
          )}
          {!showBreadcrumb && (
            <span className="text-gray-700 font-semibold sr-only">{title}</span>
          )}
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        {/* Notificações */}
        <div 
          className="relative flex items-center h-full"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button 
            onClick={() => navigate('/estoque-insumos/alertas')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors relative"
            title="Alertas de Estoque"
          >
            <Bell size={20} />
            {countAtivos ? (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                {countAtivos > 9 ? '9+' : countAtivos}
              </span>
            ) : null}
          </button>

          {/* Popover */}
          {showPopover && (
            <div className="absolute top-12 right-0 w-80 max-w-[calc(100vw-1.5rem)] bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Alertas Recentes</h3>
                <span className="text-xs font-medium px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                  {countAtivos || 0} ativos
                </span>
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {ultimosAlertas.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-gray-500">
                    Nenhum alerta ativo no momento.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {ultimosAlertas.map((alerta) => {
                      const isHighPriority = alerta.tipoId === 1 || alerta.tipoId === 2
                      
                      let mensagem = ''
                      if (alerta.tipoId === 1) mensagem = `Vence em: ${formatDate(alerta.dataValidade || '')}`
                      else if (alerta.tipoId === 2) mensagem = `Abaixo do mínimo (${alerta.quantidadeMinimaEstoque})`
                      else if (alerta.tipoId === 3) mensagem = `Acima do máximo (${alerta.quantidadeMaximaEstoque})`

                      return (
                        <div key={alerta.id} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex gap-3">
                            <div className="mt-0.5">
                              <AlertTriangle size={16} className={isHighPriority ? 'text-red-500' : 'text-amber-500'} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {alerta.insumoNome ?? `Insumo #${alerta.insumoId}`}
                              </p>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {mensagem}
                              </p>
                              <p className="text-xs text-gray-400 mt-2 font-mono">
                                {formatDate(alerta.data)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="p-2 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => {
                    setShowPopover(false)
                    navigate('/estoque-insumos/alertas')
                  }}
                  className="w-full text-center px-4 py-2 text-sm font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                >
                  Ver todos os alertas
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Alertas de Pedidos */}
        <div
          className="relative flex items-center h-full"
          onMouseEnter={() => { if (pedidoTimeoutRef.current) clearTimeout(pedidoTimeoutRef.current); setShowPedidoPopover(true) }}
          onMouseLeave={() => { pedidoTimeoutRef.current = setTimeout(() => setShowPedidoPopover(false), 200) }}
        >
          <button
            onClick={() => navigate('/alertas-pedido')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors relative"
            title="Alertas de Pedidos"
          >
            <CalendarClock size={20} />
            {countPedidoAtivos ? (
              <span className={`absolute top-1 right-1 w-4 h-4 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-bold text-white ${temAtrasadoPedido ? 'bg-red-600' : 'bg-orange-500'}`}>
                {countPedidoAtivos > 9 ? '9+' : countPedidoAtivos}
              </span>
            ) : null}
          </button>

          {showPedidoPopover && (
            <div className="absolute top-12 right-0 w-72 max-w-[calc(100vw-1.5rem)] bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Alertas de Pedidos</h3>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${temAtrasadoPedido ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                  {countPedidoAtivos || 0} ativos
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                {(alertasPedidoData?.content ?? []).length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-gray-500">
                    Nenhum alerta ativo no momento.
                  </div>
                ) : (
                  (alertasPedidoData?.content ?? []).slice(0, 5).map((alerta) => (
                    <div key={alerta.id} className="p-3 hover:bg-gray-50 transition-colors flex gap-3">
                      <AlertTriangle size={15} className={alerta.tipo === 'ATRASADO' ? 'text-red-500 mt-0.5 shrink-0' : 'text-orange-400 mt-0.5 shrink-0'} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{alerta.clienteNome ?? `Pedido #${alerta.pedidoId}`}</p>
                        <p className="text-xs text-gray-500">{alerta.tipo.replace('_', ' ')} — {alerta.dataEntregaPedido ? new Date(alerta.dataEntregaPedido).toLocaleDateString('pt-BR') : '—'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => { setShowPedidoPopover(false); navigate('/alertas-pedido') }}
                  className="w-full text-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Ver todos os alertas
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tema */}
        <div className="relative flex items-center h-full">
          <button
            onClick={() => setShowThemePopover((v) => !v)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            title="Tema"
          >
            <Palette size={20} />
          </button>

          {showThemePopover && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowThemePopover(false)} />
              <div className="absolute top-12 right-0 w-48 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden z-50">
                <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-900">Tema</h3>
                </div>
                <div className="p-1.5">
                  {THEMES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => handleThemeChange(t.value)}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span
                        className="w-4 h-4 rounded-full flex-shrink-0 border border-black/10"
                        style={{ backgroundColor: THEME_SWATCHES[t.value] }}
                      />
                      <span className="flex-1 text-left">{t.label}</span>
                      {theme === t.value && <Check size={15} className="text-gray-400" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-gray-200 hidden sm:block" />

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <User size={16} className="text-amber-700" />
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:inline">{getUsername(auth.user)}</span>
          <button
            onClick={() => auth.signoutRedirect()}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}
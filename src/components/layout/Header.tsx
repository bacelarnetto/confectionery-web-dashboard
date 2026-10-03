import { useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { ChevronRight, ChevronDown, User, Bell, AlertTriangle, CalendarClock, LogOut, Menu, Palette, Check } from 'lucide-react'
import { useAuth } from 'react-oidc-context'
import { getUsername } from '../../lib/auth'
import { useAlertasSino, ROTA_ALERTAS } from './useAlertasSino'
import { useCountAlertasPedidoAtivos, useAlertasPedidoAtivos } from '../../modules/vendas/hooks/useAlertasPedido'
import { THEMES, ThemeName, applyTheme, getStoredTheme } from '../../lib/theme'
import PushNotificacaoToggle from '../../modules/notificacao/components/PushNotificacaoToggle'

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
  '/notificacoes-enviadas': { section: 'Configurações', title: 'Notificações enviadas' },
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

  // Sino = alertas de insumo + produto (pedidos ficam no calendário, decisão do dono 2026-09-28).
  const sino = useAlertasSino(5)
  const countAtivos = sino.count
  const ultimosAlertas = sino.alertas
  // Clique no sino: vai para a tela da origem com alertas (insumo tem prioridade se as duas tiverem).
  const rotaSino = sino.countInsumo === 0 && sino.countProduto > 0 ? ROTA_ALERTAS.PRODUTO : ROTA_ALERTAS.INSUMO

  const countPedidoQuery = useCountAlertasPedidoAtivos()
  const alertasPedidoQuery = useAlertasPedidoAtivos()
  const countPedidoAtivos = countPedidoQuery.data
  const alertasPedidoData = alertasPedidoQuery.data
  const temAtrasadoPedido = alertasPedidoData?.content.some((a) => a.tipo === 'ATRASADO') ?? false

  const [showPopover, setShowPopover] = useState(false)
  const [showPedidoPopover, setShowPedidoPopover] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showThemePopover, setShowThemePopover] = useState(false)
  const [theme, setTheme] = useState<ThemeName>(getStoredTheme)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pedidoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleThemeChange(next: ThemeName) {
    applyTheme(next)
    setTheme(next)
    setShowThemePopover(false)
  }

  // Refetch ao abrir o dropdown (F4): o que aparece aberto é sempre o estado atual do backend.
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (!showPopover) sino.refetch()
    setShowPopover(true)
  }

  const handlePedidoMouseEnter = () => {
    if (pedidoTimeoutRef.current) clearTimeout(pedidoTimeoutRef.current)
    if (!showPedidoPopover) {
      countPedidoQuery.refetch()
      alertasPedidoQuery.refetch()
    }
    setShowPedidoPopover(true)
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
            onClick={() => navigate(rotaSino)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors relative"
            title="Alertas de Estoque (insumos e produtos)"
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
              
              {(sino.erroInsumo || sino.erroProduto) && (
                <div className="px-4 py-2 border-b border-gray-100 text-xs text-gray-500 space-y-0.5">
                  {sino.erroInsumo && <p>Não foi possível carregar alertas de insumo.</p>}
                  {sino.erroProduto && <p>Não foi possível carregar alertas de produto.</p>}
                </div>
              )}

              <div className="max-h-80 overflow-y-auto">
                {ultimosAlertas.length === 0 ? (
                  // Com falha em alguma origem, "nenhum alerta" poderia ser falso -- só o aviso acima.
                  !(sino.erroInsumo || sino.erroProduto) && (
                    <div className="px-4 py-6 text-center text-sm text-gray-500">
                      Nenhum alerta ativo no momento.
                    </div>
                  )
                ) : (
                  <div className="divide-y divide-gray-100">
                    {ultimosAlertas.map((alerta) => {
                      const isHighPriority = alerta.tipoId === 1 || alerta.tipoId === 2
                      const mensagem = alerta.tipoId === 1 ? `Vence em: ${formatDate(alerta.dataValidade || '')}` : alerta.mensagem

                      return (
                        <button
                          key={alerta.key}
                          type="button"
                          onClick={() => {
                            setShowPopover(false)
                            navigate(alerta.rota)
                          }}
                          className="block w-full text-left p-4 hover:bg-gray-50 transition-colors"
                        >
                          <span className="flex gap-3">
                            <span className="mt-0.5">
                              <AlertTriangle size={16} className={isHighPriority ? 'text-red-500' : 'text-amber-500'} />
                            </span>
                            <span className="block flex-1 min-w-0">
                              <span className="flex items-center gap-2 min-w-0">
                                <span
                                  className={`flex-shrink-0 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                                    alerta.origem === 'PRODUTO' ? 'bg-purple-100 text-purple-700' : 'bg-sky-100 text-sky-700'
                                  }`}
                                >
                                  {alerta.origem === 'PRODUTO' ? 'Produto' : 'Insumo'}
                                </span>
                                <span className="block text-sm font-medium text-gray-900 truncate">{alerta.nome}</span>
                              </span>
                              <span className="block text-xs text-gray-500 mt-1 line-clamp-2">
                                {mensagem}
                              </span>
                              <span className="block text-xs text-gray-400 mt-2 font-mono">
                                {formatDate(alerta.data)}
                              </span>
                            </span>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="p-2 border-t border-gray-100 bg-gray-50">
                <div className="flex gap-1">
                  {(['INSUMO', 'PRODUTO'] as const).map((origem) => (
                    <button
                      key={origem}
                      onClick={() => {
                        setShowPopover(false)
                        navigate(ROTA_ALERTAS[origem])
                      }}
                      className="flex-1 text-center px-2 py-2 text-sm font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      {origem === 'INSUMO' ? `Insumos (${sino.countInsumo})` : `Produtos (${sino.countProduto})`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Alertas de Pedidos */}
        <div
          className="relative flex items-center h-full"
          onMouseEnter={handlePedidoMouseEnter}
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
        <div className="relative flex items-center gap-2">
          <button
            onClick={() => setShowUserMenu((v) => !v)}
            className="flex items-center gap-2 rounded-full pr-1 hover:bg-gray-100 transition-colors"
            title="Menu do usuário"
          >
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <User size={16} className="text-amber-700" />
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:inline">{getUsername(auth.user)}</span>
            <ChevronDown size={14} className="text-gray-400 hidden sm:inline" />
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute top-12 right-0 w-72 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden z-50">
                <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{getUsername(auth.user)}</h3>
                </div>
                <div className="p-1.5">
                  <PushNotificacaoToggle usuario={getUsername(auth.user)} />
                  <button
                    onClick={() => auth.signoutRedirect()}
                    className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <LogOut size={16} className="text-gray-400" />
                    Sair
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
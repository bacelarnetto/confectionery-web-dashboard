import { ShoppingBag, Package, DollarSign, Sparkles } from 'lucide-react'

interface QuickNavProps {
  pedidosAbertosCount?: number
  itensEmBaixaCount?: number
  contasPendentesCount?: number
}

export default function DashboardQuickNav({
  pedidosAbertosCount = 0,
  itensEmBaixaCount = 0,
  contasPendentesCount = 0,
}: QuickNavProps) {
  function scrollTo(id: string) {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs font-medium text-gray-600">
      <span className="text-gray-400 uppercase tracking-wider text-[11px] mr-1 hidden sm:inline">
        Ir para:
      </span>

      <button
        type="button"
        onClick={() => scrollTo('secao-resumo')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-xs shrink-0 cursor-pointer"
      >
        <Sparkles size={14} className="text-amber-500" />
        <span>Destaques</span>
      </button>

      <button
        type="button"
        onClick={() => scrollTo('secao-vendas')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-xs shrink-0 cursor-pointer"
      >
        <ShoppingBag size={14} className="text-blue-500" />
        <span>Vendas</span>
        {pedidosAbertosCount > 0 && (
          <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-amber-100 text-amber-800 rounded-full">
            {pedidosAbertosCount}
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={() => scrollTo('secao-estoque')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-xs shrink-0 cursor-pointer"
      >
        <Package size={14} className="text-emerald-500" />
        <span>Estoque</span>
        {itensEmBaixaCount > 0 && (
          <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-red-100 text-red-700 rounded-full">
            {itensEmBaixaCount}
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={() => scrollTo('secao-financeiro')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-xs shrink-0 cursor-pointer"
      >
        <DollarSign size={14} className="text-purple-500" />
        <span>Financeiro</span>
        {contasPendentesCount > 0 && (
          <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-full">
            {contasPendentesCount}
          </span>
        )}
      </button>
    </div>
  )
}


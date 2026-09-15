import { Link } from 'react-router'
import { ChevronRight } from 'lucide-react'

export interface KpiCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  subtitle?: string
  to?: string
  isLoading?: boolean
  variant?: 'default' | 'emerald' | 'rose' | 'amber' | 'blue' | 'purple'
}

const VARIANT_STYLES = {
  default: {
    border: 'border-gray-200',
    iconBg: 'bg-gray-100 text-gray-600',
    hoverBorder: 'hover:border-gray-300',
  },
  emerald: {
    border: 'border-emerald-200 bg-emerald-50/20',
    iconBg: 'bg-emerald-100 text-emerald-700',
    hoverBorder: 'hover:border-emerald-300',
  },
  rose: {
    border: 'border-red-200 bg-red-50/20',
    iconBg: 'bg-red-100 text-red-600',
    hoverBorder: 'hover:border-red-300',
  },
  amber: {
    border: 'border-amber-200 bg-amber-50/20',
    iconBg: 'bg-amber-100 text-amber-700',
    hoverBorder: 'hover:border-amber-300',
  },
  blue: {
    border: 'border-blue-200 bg-blue-50/20',
    iconBg: 'bg-blue-100 text-blue-700',
    hoverBorder: 'hover:border-blue-300',
  },
  purple: {
    border: 'border-purple-200 bg-purple-50/20',
    iconBg: 'bg-purple-100 text-purple-700',
    hoverBorder: 'hover:border-purple-300',
  },
}

export default function KpiCard({
  title,
  value,
  icon,
  subtitle,
  to,
  isLoading,
  variant = 'default',
}: KpiCardProps) {
  const styles = VARIANT_STYLES[variant] ?? VARIANT_STYLES.default

  const content = (
    <div
      className={`relative bg-white rounded-xl border p-5 shadow-xs transition-all ${styles.border} ${
        to ? `${styles.hoverBorder} hover:shadow-md cursor-pointer group` : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</h3>
        <div className={`p-2 rounded-lg transition-transform group-hover:scale-105 ${styles.iconBg}`}>
          {icon}
        </div>
      </div>
      <div>
        {isLoading ? (
          <div className="h-8 bg-gray-200 rounded animate-pulse w-32 my-1" />
        ) : (
          <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
        )}
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {to && (
        <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-medium text-amber-600 group-hover:text-amber-700">
          <span>Ver detalhes</span>
          <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </div>
      )}
    </div>
  )

  if (to) {
    return <Link to={to} className="block">{content}</Link>
  }

  return content
}


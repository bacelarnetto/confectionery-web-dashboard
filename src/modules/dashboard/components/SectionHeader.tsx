import { Link } from 'react-router'

export interface ActionLink {
  label: string
  to: string
  primary?: boolean
  icon?: React.ReactNode
}

interface SectionHeaderProps {
  id?: string
  title: string
  subtitle?: string
  icon: React.ReactNode
  badge?: string | number
  actions?: ActionLink[]
}

export default function SectionHeader({
  id,
  title,
  subtitle,
  icon,
  badge,
  actions = [],
}: SectionHeaderProps) {
  return (
    <div id={id} className="scroll-mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-200">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 shrink-0">
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h2>
            {badge !== undefined && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>

      {actions.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {actions.map((act) =>
            act.primary ? (
              <Link
                key={act.to}
                to={act.to}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white text-xs font-medium rounded-lg hover:bg-amber-600 transition-colors shadow-xs"
              >
                {act.icon}
                {act.label}
              </Link>
            ) : (
              <Link
                key={act.to}
                to={act.to}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-xs"
              >
                {act.icon}
                {act.label}
              </Link>
            )
          )}
        </div>
      )}
    </div>
  )
}


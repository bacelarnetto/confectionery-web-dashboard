import { AlertTriangle, CheckCircle, Info, Loader2, XCircle } from 'lucide-react'

type AlertVariant = 'info' | 'warning' | 'danger' | 'success'

interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string | React.ReactNode
  variant?: AlertVariant
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void
  isPending?: boolean
}

const variantConfig: Record<AlertVariant, {
  icon: React.ReactNode
  iconBg: string
  confirmClass: string
}> = {
  info: {
    icon: <Info size={22} />,
    iconBg: 'bg-blue-100 text-blue-600',
    confirmClass: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  warning: {
    icon: <AlertTriangle size={22} />,
    iconBg: 'bg-amber-100 text-amber-600',
    confirmClass: 'bg-amber-500 hover:bg-amber-600 text-white',
  },
  danger: {
    icon: <XCircle size={22} />,
    iconBg: 'bg-red-100 text-red-600',
    confirmClass: 'bg-red-600 hover:bg-red-700 text-white',
  },
  success: {
    icon: <CheckCircle size={22} />,
    iconBg: 'bg-emerald-100 text-emerald-600',
    confirmClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
}

export default function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  variant = 'info',
  confirmLabel,
  cancelLabel = 'Fechar',
  onConfirm,
  isPending = false,
}: AlertModalProps) {
  if (!isOpen) return null

  const { icon, iconBg, confirmClass } = variantConfig[variant]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="p-6">
          <div className="flex gap-4">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${iconBg}`}>
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
              <div className="text-sm text-gray-600 leading-relaxed">{message}</div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          {confirmLabel && onConfirm && (
            <button
              onClick={onConfirm}
              disabled={isPending}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-60 ${confirmClass}`}
            >
              {isPending && <Loader2 size={15} className="animate-spin" />}
              {confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

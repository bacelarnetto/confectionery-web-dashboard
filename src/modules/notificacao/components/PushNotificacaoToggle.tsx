import { BellRing } from 'lucide-react'
import { usePushNotificacao } from '../hooks/usePushNotificacao'

interface PushNotificacaoToggleProps {
  usuario: string
}

function Switch({ ligado, disabled, onClick }: { ligado: boolean; disabled?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ligado}
      disabled={disabled}
      onClick={onClick}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        ligado ? 'bg-amber-500' : 'bg-gray-300'
      }`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${ligado ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  )
}

export default function PushNotificacaoToggle({ usuario }: PushNotificacaoToggleProps) {
  const { suportado, habilitado, carregandoChave, estado, ativar, desativar } = usePushNotificacao(usuario)

  // Navegador sem Push API: o item some, nada é registrado.
  if (!suportado) return null

  const bloqueado = habilitado && Notification.permission === 'denied'
  const ligado = !!estado.data?.ativoNesteNavegador
  const ocupado = estado.isLoading || ativar.isPending || desativar.isPending

  let ajuda: string | null = null
  if (carregandoChave) ajuda = null
  else if (!habilitado) ajuda = 'Notificações no navegador em breve'
  else if (bloqueado) ajuda = 'Bloqueadas nas configurações do navegador'
  else if (estado.data?.ativoEmOutroNavegador) ajuda = 'Ativas em outro navegador; ativar aqui substitui'

  return (
    <div className="flex items-start gap-3 px-2.5 py-2">
      <BellRing size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700">Notificações neste navegador</p>
        {ajuda && <p className="text-xs text-gray-500 mt-0.5">{ajuda}</p>}
      </div>
      <Switch
        ligado={ligado}
        disabled={!habilitado || bloqueado || ocupado}
        onClick={() => (ligado ? desativar.mutate() : ativar.mutate())}
      />
    </div>
  )
}

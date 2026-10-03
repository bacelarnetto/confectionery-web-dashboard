// Web Push no navegador (N2). A chave pública VAPID vem do backend em runtime
// (GET /push-subscription/vapid-public-key, ver usePushNotificacao) -- sem chave configurada, o recurso
// fica desligado ("em breve"), sem pedir permissão nenhuma ao navegador.

const SW_URL = '/sw.js'

// Safari antigo, navegadores sem Push API ou contexto não seguro (http fora de localhost): o toggle
// some, nada é registrado.
export function isPushSuportado(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.isSecureContext &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(padded)
  const bytes = new Uint8Array(new ArrayBuffer(raw.length))
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i)
  return bytes
}

// Não registra o SW só pra consultar -- se nunca foi registrado, não há inscrição local.
export async function getInscricaoLocal(): Promise<PushSubscription | null> {
  const reg = await navigator.serviceWorker.getRegistration(SW_URL)
  return (await reg?.pushManager.getSubscription()) ?? null
}

export async function inscrever(vapidPublicKey: string): Promise<PushSubscription> {
  const permissao = await Notification.requestPermission()
  if (permissao !== 'granted') throw new Error('PERMISSAO_NEGADA')
  await navigator.serviceWorker.register(SW_URL)
  const reg = await navigator.serviceWorker.ready
  const existente = await reg.pushManager.getSubscription()
  if (existente) return existente
  return reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  })
}

export async function desinscreverLocal(): Promise<void> {
  const sub = await getInscricaoLocal()
  await sub?.unsubscribe()
}

export function endpointDe(subscriptionJson: string | null | undefined): string | null {
  if (!subscriptionJson) return null
  try {
    return (JSON.parse(subscriptionJson) as { endpoint?: string }).endpoint ?? null
  } catch {
    return null
  }
}

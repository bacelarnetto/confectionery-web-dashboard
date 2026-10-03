// Service Worker do Web Push (N2). Registrado só quando o usuário ativa "Notificações neste
// navegador" (e só se o backend tiver chave VAPID configurada). Sem handler de fetch de propósito: não
// intercepta nem faz cache de nada da aplicação.
//
// Payload: JSON {title, body}, montado pelo PushEnvioAdapter do monólito (quem envia o push via
// VAPID). A app separada confectionery-notificacoes foi abandonada; o contrato é o do monólito.
// Instalabilidade (PWA) não depende deste arquivo ter handler de fetch -- ver public/manifest.json.

self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { body: event.data ? event.data.text() : '' }
  }
  const title = data.title || 'Confectionery'
  event.waitUntil(self.registration.showNotification(title, { body: data.body || '' }))
})

// Clique na notificação: foca uma aba já aberta do app ou abre uma nova.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((abas) => {
      const aba = abas.find((c) => c.url.startsWith(self.location.origin))
      return aba ? aba.focus() : self.clients.openWindow('/')
    }),
  )
})

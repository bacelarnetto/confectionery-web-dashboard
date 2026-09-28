// Espelho de PushSubscriptionViewDTO (backend, /push-subscription). subscriptionJson é o
// JSON.stringify(PushSubscription) que o navegador gerou -- 1 por usuário.
export interface PushSubscriptionView {
  id: number
  usuario: string
  subscriptionJson: string
  criadoEm: string
}

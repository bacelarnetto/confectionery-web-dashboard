import axios from 'axios'
import api from '../../../lib/axios'
import { PushSubscriptionView } from '../types/pushSubscription'

// POST grava sempre para o usuário autenticado (JWT); GET/DELETE por {usuario} = preferred_username,
// restritos ao próprio usuário ou ADMIN.
const pushSubscriptionService = {
  // Chave pública VAPID do Web Push. 404 = chave não configurada no backend -- recurso "em breve",
  // sem toast.
  getVapidPublicKey(): Promise<string | null> {
    return api
      .get<{ vapidPublicKey: string }>('/push-subscription/vapid-public-key', { skipErrorToast: true })
      .then((res) => res.data.vapidPublicKey || null)
      .catch((err) => {
        if (axios.isAxiosError(err) && err.response?.status === 404) return null
        throw err
      })
  },

  // 404 = usuário sem inscrição -- estado normal, não é erro pra mostrar em toast.
  get(usuario: string): Promise<PushSubscriptionView | null> {
    return api
      .get<PushSubscriptionView>(`/push-subscription/${encodeURIComponent(usuario)}`, { skipErrorToast: true })
      .then((res) => res.data)
      .catch((err) => {
        if (axios.isAxiosError(err) && err.response?.status === 404) return null
        throw err
      })
  },

  registrar(subscription: PushSubscription): Promise<PushSubscriptionView> {
    return api
      .post<PushSubscriptionView>('/push-subscription', { subscriptionJson: JSON.stringify(subscription) })
      .then((res) => res.data)
  },

  remover(usuario: string): Promise<void> {
    return api.delete(`/push-subscription/${encodeURIComponent(usuario)}`).then(() => undefined)
  },
}

export default pushSubscriptionService

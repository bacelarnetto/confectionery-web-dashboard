export type NotificacaoOutboxStatus = 'PENDENTE' | 'EM_ENVIO' | 'ENVIADO' | 'FALHOU'

// SIMULADO = a app de notificações aceitou, mas o canal está em mock (nada foi entregue);
// REAL = entregue ao serviço externo; null = registro anterior ao campo ou ainda não enviado.
export type ModoEnvio = 'SIMULADO' | 'REAL'

// Espelho de NotificacaoOutboxViewDTO (backend, GET /notificacao/outbox). Datas são Instant ISO.
export interface NotificacaoOutbox {
  id: number
  chaveIdempotencia: string
  origem: string
  canal: string
  destinatario: string
  titulo: string
  texto: string
  status: NotificacaoOutboxStatus
  tentativas: number
  proximoEnvio: string
  ultimoErro: string | null
  mensagemExternaId: string | null
  enviadoEm: string | null
  modoEnvio: ModoEnvio | null
  createdOn: string
}

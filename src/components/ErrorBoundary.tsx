import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import Button from './ui/Button'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

// Achado da homologação 2026-09-19: um erro não tratado durante o render (ex.: RangeError de
// `Date.toISOString()` com valor inválido) derrubava a SPA inteira pra tela branca, sem
// nenhuma UI de recuperação -- só um F5 "descobria" o problema. Error Boundary de nível de
// aplicação: pega qualquer erro de render dos componentes abaixo dele e mostra uma tela de
// fallback em vez de tela branca. NÃO pega erro de event handler (ex.: onClick/onSubmit) --
// esses precisam de try/catch no próprio handler (ver `datetimeLocalParaIso` em
// modules/apoioFesta/lib/horarioBrasilia.ts).
//
// Reteste 2026-09-28 (F1): tela branca muda com o mesmo RangeError, sem este fallback aparecer.
// Duas mudanças: (1) o boundary passou a envolver a árvore inteira em main.tsx (antes ficava
// dentro do AuthProvider/QueryClientProvider, e o Toaster estava fora dele); (2) também escuta
// `error` e `unhandledrejection` da janela -- erro de handler, timer, callback ou promise sem
// catch agora mostra a mesma tela de recuperação em vez de sumir só no console.
function deveMostrarFallback(erro: unknown): erro is Error {
  if (!(erro instanceof Error)) return false
  // Erro HTTP já vira toast no interceptor do axios; não é motivo pra derrubar a tela.
  if ((erro as { isAxiosError?: boolean }).isAxiosError) return false
  // Navegação cancelada / fetch abortado: não é falha da aplicação.
  if (erro.name === 'AbortError' || erro.name === 'CanceledError') return false
  return true
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  private onWindowError = (event: ErrorEvent) => {
    // event.error null = erro de script de outra origem ou o aviso benigno do ResizeObserver.
    if (!deveMostrarFallback(event.error)) return
    console.error('Erro não tratado (window.onerror) capturado pelo ErrorBoundary:', event.error)
    this.setState({ error: event.error })
  }

  private onUnhandledRejection = (event: PromiseRejectionEvent) => {
    if (!deveMostrarFallback(event.reason)) return
    console.error('Promise rejeitada sem tratamento capturada pelo ErrorBoundary:', event.reason)
    this.setState({ error: event.reason })
  }

  componentDidMount() {
    window.addEventListener('error', this.onWindowError)
    window.addEventListener('unhandledrejection', this.onUnhandledRejection)
  }

  componentWillUnmount() {
    window.removeEventListener('error', this.onWindowError)
    window.removeEventListener('unhandledrejection', this.onUnhandledRejection)
  }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erro não tratado capturado pelo ErrorBoundary:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">Algo deu errado</h1>
            <p className="mt-2 text-sm text-gray-600">
              Ocorreu um erro inesperado nesta tela. Nenhum dado salvo foi perdido — recarregue a
              página para continuar.
            </p>
            <Button className="mt-6" onClick={() => window.location.reload()}>
              Recarregar página
            </Button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

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
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

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

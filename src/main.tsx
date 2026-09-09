import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from 'react-oidc-context'
import App from './App'
import AuthGate from './components/auth/AuthGate'
import SilentRenewPage from './pages/SilentRenewPage'
import { oidcConfig } from './lib/auth'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

// O iframe oculto do renew silencioso carrega a app inteira nessa mesma URL -- atalho pra não
// passar pelo AuthProvider/AuthGate/rotas nesse caso, só a página que fecha o handshake.
const isSilentRenew = window.location.pathname === '/silent-renew'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isSilentRenew ? (
      <SilentRenewPage />
    ) : (
      <AuthProvider
        {...oidcConfig}
        onSigninCallback={() => {
          // Remove ?code=&state= da URL depois do redirect de volta do Keycloak
          window.history.replaceState({}, document.title, window.location.pathname)
        }}
      >
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthGate>
              <App />
            </AuthGate>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  borderRadius: '8px',
                  fontSize: '14px',
                },
              }}
            />
          </BrowserRouter>
        </QueryClientProvider>
      </AuthProvider>
    )}
  </React.StrictMode>,
)

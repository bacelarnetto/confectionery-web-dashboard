import { Outlet } from 'react-router'
import Sidebar from './Sidebar'
import Header from './Header'
import PedidoAlertBanner from './PedidoAlertBanner'

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <PedidoAlertBanner />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
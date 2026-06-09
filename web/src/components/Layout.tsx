import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import FloatingAddButton from './FloatingAddButton'

export default function Layout() {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
        <Outlet />
      </main>
      <FloatingAddButton />
    </div>
  )
}

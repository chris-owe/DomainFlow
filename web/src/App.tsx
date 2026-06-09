import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import TodayView from './pages/TodayView'
import AllView from './pages/AllView'
import DomainView from './pages/DomainView'
import InboxView from './pages/InboxView'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<TodayView />} />
        <Route path="/all" element={<AllView />} />
        <Route path="/domain/:id" element={<DomainView />} />
        <Route path="/inbox" element={<InboxView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

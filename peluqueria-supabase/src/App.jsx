import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Agenda from './pages/Agenda.jsx'
import Clientes from './pages/Clientes.jsx'
import NuevoTurno from './pages/NuevoTurno.jsx'
import Recordatorios from './pages/Recordatorios.jsx'
import Reservar from './pages/Reservar.jsx'

export default function App() {
  return (
    <Routes>
      {/* Página pública para clientes */}
      <Route path="/reservar" element={<Reservar />} />

      {/* Panel del barbero */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/agenda" replace />} />
        <Route path="agenda"        element={<Agenda />} />
        <Route path="clientes"      element={<Clientes />} />
        <Route path="nuevo"         element={<NuevoTurno />} />
        <Route path="recordatorios" element={<Recordatorios />} />
      </Route>
    </Routes>
  )
}

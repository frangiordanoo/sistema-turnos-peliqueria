import { NavLink, Outlet } from 'react-router-dom'

const NAV = [
  { to: '/agenda',        icon: '📅', label: 'Agenda' },
  { to: '/clientes',      icon: '👥', label: 'Clientes' },
  { to: '/nuevo',         icon: '➕', label: 'Nuevo turno' },
  { to: '/recordatorios', icon: '🔔', label: 'Recordatorios' },
]

export default function Layout() {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">✂</div>
          <h1>La Barbería</h1>
          <p>Sistema de turnos</p>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span>{icon}</span> {label}
            </NavLink>
          ))}

          {/* Link para copiar y mandar a clientes */}
          <div style={{ padding: '12px 20px', marginTop: 8 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              Link para clientes
            </div>
            <button
              className="btn btn-outline"
              style={{ width: '100%', fontSize: 11, color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center' }}
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/reservar`)
                alert('¡Link copiado! Mandáselo a tus clientes.')
              }}
            >
              📋 Copiar link
            </button>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="barber-badge">
            <div className="avatar" style={{ background: '#db0000', color: '#1A1410', fontSize: 12 }}>MG</div>
            <div>
              <p>Francisco Giordano </p>
              <span>Barbero</span>
            </div>
          </div>
        </div>
      </aside>

      <main>
        <Outlet />
      </main>
    </div>
  )
}

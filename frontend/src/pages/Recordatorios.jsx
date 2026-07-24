import { useState, useEffect } from 'react'
import { api } from '../api.js'
import Toast from '../components/Toast.jsx'

export default function Recordatorios() {
  const [turnos, setTurnos] = useState([])
  const [toast, setToast]   = useState(null)
  const hoy = new Date().toISOString().split('T')[0]

  useEffect(() => {
    api.getTurnos(hoy).then(data =>
      setTurnos(data.filter(t => t.estado === 'pendiente' || t.estado === 'confirmado'))
    )
  }, [])

  const confirmar = async (id) => {
    await api.actualizarEstado(id, 'confirmado')
    setTurnos(ts => ts.map(t => t.id === id ? { ...t, estado: 'confirmado' } : t))
    setToast('Turno confirmado')
  }

  const copiarMensaje = (t) => {
    const msg = `Hola ${t.cliente_nombre}! 💈 Te recuerdo que tenés turno hoy a las ${t.hora} hs para ${t.servicio}. ¡Te esperamos!`
    navigator.clipboard.writeText(msg)
    setToast('Mensaje copiado al portapapeles')
  }

  const pendientes  = turnos.filter(t => t.estado === 'pendiente')
  const confirmados = turnos.filter(t => t.estado === 'confirmado')

  return (
    <>
      <div className="topbar">
        <div>
          <h2>Recordatorios</h2>
          <div className="topbar-sub">Turnos de hoy que necesitan atención</div>
        </div>
      </div>

      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 560 }}>

        {pendientes.length > 0 && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Sin confirmar</span>
              <span className="badge badge-amber">{pendientes.length}</span>
            </div>
            <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pendientes.map(t => (
                <div key={t.id} style={{ background: 'var(--cream)', borderRadius: 10, padding: 14, borderLeft: '3px solid var(--gold)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{t.cliente_nombre} — {t.hora} hs</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{t.servicio} · {t.cliente_telefono}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <button className="btn btn-sm btn-outline" onClick={() => copiarMensaje(t)}>📋 Copiar msg</button>
                      <button className="btn btn-sm btn-gold" onClick={() => confirmar(t.id)}>Confirmar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {confirmados.length > 0 && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Confirmados hoy</span>
              <span className="badge badge-green">{confirmados.length}</span>
            </div>
            <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {confirmados.map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 500, fontSize: 13 }}>{t.cliente_nombre}</span>
                    <span style={{ color: 'var(--muted)', fontSize: 12, marginLeft: 8 }}>{t.hora} · {t.servicio}</span>
                  </div>
                  <button className="btn btn-sm btn-outline" onClick={() => copiarMensaje(t)}>📋 Copiar msg</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {turnos.length === 0 && (
          <div className="card">
            <div className="empty" style={{ padding: 40 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🎉</div>
              <div style={{ fontWeight: 500 }}>Todo en orden</div>
              <div style={{ marginTop: 4, fontSize: 13, color: 'var(--muted)' }}>No hay turnos pendientes hoy</div>
            </div>
          </div>
        )}

        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--dark)' }}>💡 Tip:</strong> Usá el botón "Copiar msg" para pegar el recordatorio directo en WhatsApp. En el futuro podés integrar la API de WhatsApp Business para enviarlos automáticamente.
          </div>
        </div>
      </div>

      {toast && <Toast mensaje={toast} onClose={() => setToast(null)} />}
    </>
  )
}

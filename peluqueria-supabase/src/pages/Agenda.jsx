import { useState, useEffect, useCallback } from 'react'
import { getTurnos, actualizarEstado, suscribirTurnos } from '../api.js'
import ModalNuevoTurno from '../components/ModalNuevoTurno.jsx'
import Toast from '../components/Toast.jsx'

const HORARIOS = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00']
const ESTADO_BADGE = {
  pendiente:  { cls:'badge-amber', label:'Pendiente' },
  confirmado: { cls:'badge-green', label:'Confirmado' },
  completado: { cls:'badge-gray',  label:'Completado' },
  cancelado:  { cls:'badge-red',   label:'Cancelado'  },
}
const hoyISO = () => new Date().toISOString().split('T')[0]
const hoyStr = () => new Date().toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })

export default function Agenda() {
  const [turnos, setTurnos]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [toast, setToast]     = useState(null)
  const [fecha, setFecha]     = useState(hoyISO())

  const cargar = useCallback(async () => {
    try {
      const data = await getTurnos(fecha)
      setTurnos(data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [fecha])

  useEffect(() => {
    cargar()
    // Realtime — se actualiza instantáneamente cuando un cliente reserva
    const canal = suscribirTurnos(fecha, () => cargar())
    return () => canal.unsubscribe()
  }, [cargar, fecha])

  const cambiarEstado = async (id, estado) => {
    try {
      await actualizarEstado(id, estado)
      setToast(`Estado actualizado a "${estado}"`)
      cargar()
    } catch (e) { setToast(e.message) }
  }

  const turnoEnHora   = h => turnos.find(t => t.hora === h && t.estado !== 'cancelado')
  const confirmados   = turnos.filter(t => t.estado === 'confirmado').length
  const pendientes    = turnos.filter(t => t.estado === 'pendiente').length
  const recaudacion   = turnos.filter(t => t.estado !== 'cancelado').reduce((s,t) => s + t.precio, 0)
  const proximo       = turnos.filter(t => ['pendiente','confirmado'].includes(t.estado)).sort((a,b) => a.hora.localeCompare(b.hora))[0]

  if (loading) return <div className="loading">Cargando agenda...</div>

  return (
    <>
      <div className="topbar">
        <div>
          <h2>Agenda</h2>
          <div className="topbar-sub" style={{ textTransform:'capitalize', display:'flex', alignItems:'center', gap:6 }}>
            <span className="realtime-dot" title="Actualización en tiempo real activa" />
            {hoyStr()}
          </div>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
            style={{ padding:'8px 12px', border:'1px solid var(--border)', borderRadius:8, fontFamily:'var(--font-sans)', fontSize:13 }} />
          <button className="btn btn-gold" onClick={() => setModal(true)}>+ Nuevo turno</button>
        </div>
      </div>

      <div className="page-content">
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Turnos</div>
            <div className="stat-value">{turnos.filter(t => t.estado !== 'cancelado').length}</div>
            <div className="stat-sub">en esta fecha</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Confirmados</div>
            <div className="stat-value">{confirmados}</div>
            <div className="stat-sub">{pendientes} pendientes</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Próximo</div>
            <div className="stat-value" style={{ fontSize:20 }}>{proximo?.hora ?? '—'}</div>
            <div className="stat-sub">{proximo?.cliente_nombre ?? 'Sin turnos'}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Recaudación</div>
            <div className="stat-value" style={{ fontSize:18 }}>${recaudacion.toLocaleString()}</div>
            <div className="stat-sub">estimado del día</div>
          </div>
        </div>

        <div className="agenda-grid">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Horarios</span>
              <div style={{ display:'flex', gap:6 }}>
                {confirmados > 0 && <span className="badge badge-green">{confirmados} confirmados</span>}
                {pendientes  > 0 && <span className="badge badge-amber">{pendientes} pendientes</span>}
              </div>
            </div>
            <div className="time-slots">
              {HORARIOS.map(hora => {
                const t = turnoEnHora(hora)
                const estado = t ? ESTADO_BADGE[t.estado] : null
                return (
                  <div className="slot" key={hora}>
                    <div className="slot-time">{hora}</div>
                    {t ? (
                      <div className="slot-bar occupied">
                        <div className="slot-client">
                          {t.cliente_nombre}{' '}
                          <span className={`badge ${estado.cls}`} style={{ marginLeft:6 }}>{estado.label}</span>
                          {t.origen === 'cliente' && <span className="badge badge-gray" style={{ marginLeft:4 }}>online</span>}
                        </div>
                        <div className="slot-service">{t.servicio}</div>
                        <div className="slot-price">${t.precio.toLocaleString()}</div>
                        <div style={{ marginTop:6, display:'flex', gap:6, flexWrap:'wrap' }}>
  {t.estado === 'pendiente' && (
    <button className="btn btn-sm btn-gold" onClick={async () => {
      await cambiarEstado(t.id, 'confirmado')
      const msg = encodeURIComponent(`Hola ${t.cliente_nombre}! 💈 Tu turno del ${t.fecha} a las ${t.hora} hs para ${t.servicio} está *confirmado*. ¡Te esperamos!`)
      const tel = t.cliente_telefono.replace(/\D/g,'')
      window.open(`https://wa.me/549${tel}?text=${msg}`, '_blank')
    }}>✅ Confirmar y avisar</button>
  )}
  {!['completado','cancelado'].includes(t.estado) && (
    <button className="btn btn-sm btn-outline" onClick={() => cambiarEstado(t.id, 'completado')}>Completar</button>
  )}
  <button className="btn btn-sm btn-danger" onClick={() => cambiarEstado(t.id, 'cancelado')}>Cancelar</button>
</div>
                      </div>
                    ) : (
                      <div className="slot-bar free"><span>— Libre —</span></div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="card side-panel">
            <div className="panel-section">
              <div className="panel-title">Próximos clientes</div>
              {turnos.filter(t => ['pendiente','confirmado'].includes(t.estado)).slice(0,4).map(t => (
                <div className="client-row" key={t.id}>
                  <div className="avatar" style={{ background:'var(--cream)', color:'var(--muted)' }}>
                    {t.cliente_nombre.slice(0,2).toUpperCase()}
                  </div>
                  <div className="client-info">
                    <div className="client-name">{t.cliente_nombre}</div>
                    <div className="client-detail">{t.servicio}</div>
                  </div>
                  <div className="client-time">{t.hora}</div>
                </div>
              ))}
              {turnos.filter(t => ['pendiente','confirmado'].includes(t.estado)).length === 0 && (
                <div className="empty" style={{ padding:'12px 0' }}>Sin turnos próximos</div>
              )}
            </div>
            <div className="panel-section">
              <div className="panel-title">Turnos online</div>
              {turnos.filter(t => t.origen === 'cliente').length === 0
                ? <div style={{ fontSize:12, color:'var(--muted)' }}>Ninguno hoy</div>
                : turnos.filter(t => t.origen === 'cliente').map(t => (
                    <div className="reminder-item" key={t.id}>
                      <div className="reminder-dot" style={{ background: t.estado === 'pendiente' ? 'var(--gold)' : 'var(--success)' }} />
                      <div className="reminder-text">
                        <strong>{t.cliente_nombre}</strong> — {t.hora} · {t.servicio}
                      </div>
                    </div>
                  ))
              }
            </div>
          </div>
        </div>
      </div>

      {modal && <ModalNuevoTurno onClose={() => setModal(false)} onCreado={() => { cargar(); setToast('Turno creado') }} />}
      {toast && <Toast mensaje={toast} onClose={() => setToast(null)} />}
    </>
  )
}

import { useState, useEffect } from 'react'
import { api } from '../api.js'

const hoy = () => new Date().toISOString().split('T')[0]

export default function Reservar() {
  const [paso, setPaso] = useState(1)   // 1: datos, 2: fecha/hora, 3: éxito
  const [form, setForm] = useState({ cliente_nombre: '', cliente_telefono: '', fecha: hoy(), hora: '', servicio: '' })
  const [servicios, setServicios]     = useState([])
  const [disponibles, setDisponibles] = useState([])
  const [ocupados, setOcupados]       = useState([])
  const [error, setError]             = useState('')
  const [loading, setLoading]         = useState(false)

  useEffect(() => { api.getServicios().then(setServicios) }, [])

  useEffect(() => {
    if (form.fecha) {
      api.getDisponibles(form.fecha).then(d => {
        setDisponibles(d.disponibles)
        setOcupados(d.ocupados)
        setForm(f => ({ ...f, hora: '' }))
      })
    }
  }, [form.fecha])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const HORARIOS_TOTALES = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00']

  const irPaso2 = () => {
    if (!form.cliente_nombre.trim() || !form.cliente_telefono.trim() || !form.servicio) {
      setError('Completá todos los campos'); return
    }
    setError('')
    setPaso(2)
  }

  const confirmar = async () => {
    if (!form.hora) { setError('Elegí un horario'); return }
    setLoading(true)
    try {
      await api.crearTurno({ ...form, origen: 'cliente' })
      setPaso(3)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const servicioSeleccionado = servicios.find(s => s.id === form.servicio)

  return (
    <div className="public-page">
      <div className="reserva-card">
        {/* Header */}
        <div className="reserva-header">
          <div className="reserva-logo">✂</div>
          <h1>La Barbería</h1>
          <p>Reservá tu turno online, fácil y rápido</p>
        </div>

        {/* Paso 1: Datos personales */}
        {paso === 1 && (
          <>
            <div className="form-group">
              <label>Tu nombre</label>
              <input value={form.cliente_nombre} onChange={e => set('cliente_nombre', e.target.value)} placeholder="Juan Pérez" />
            </div>
            <div className="form-group">
              <label>Tu teléfono (WhatsApp)</label>
              <input value={form.cliente_telefono} onChange={e => set('cliente_telefono', e.target.value)} placeholder="261 555-0000" />
            </div>
            <div className="form-group">
              <label>¿Qué servicio querés?</label>
              <select value={form.servicio} onChange={e => set('servicio', e.target.value)}>
                <option value="">Elegí un servicio</option>
                {servicios.map(s => (
                  <option key={s.id} value={s.id}>{s.nombre} — ${s.precio.toLocaleString()}</option>
                ))}
              </select>
            </div>

            {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{error}</p>}

            <button className="btn btn-gold" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} onClick={irPaso2}>
              Siguiente → Elegir día y hora
            </button>
          </>
        )}

        {/* Paso 2: Fecha y horario */}
        {paso === 2 && (
          <>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>Servicio elegido</div>
              <div style={{ fontWeight: 500 }}>{servicioSeleccionado?.nombre} — ${servicioSeleccionado?.precio.toLocaleString()}</div>
            </div>

            <div className="form-group">
              <label>¿Qué día querés venir?</label>
              <input
                type="date"
                value={form.fecha}
                min={hoy()}
                onChange={e => set('fecha', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Elegí un horario</label>
              <div className="horarios-grid">
                {HORARIOS_TOTALES.map(h => {
                  const libre   = disponibles.includes(h)
                  const selected = form.hora === h
                  return (
                    <button
                      key={h}
                      className={`horario-btn ${!libre ? 'ocupado' : ''} ${selected ? 'selected' : ''}`}
                      onClick={() => libre && set('hora', h)}
                      disabled={!libre}
                    >
                      {h}
                    </button>
                  )
                })}
              </div>
            </div>

            {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{error}</p>}

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn btn-outline" onClick={() => { setPaso(1); setError('') }}>← Volver</button>
              <button className="btn btn-gold" style={{ flex: 1, justifyContent: 'center' }} onClick={confirmar} disabled={loading}>
                {loading ? 'Reservando...' : 'Confirmar turno'}
              </button>
            </div>
          </>
        )}

        {/* Paso 3: Éxito */}
        {paso === 3 && (
          <div className="success-box">
            <div className="success-icon">✅</div>
            <h3>¡Turno reservado!</h3>
            <p style={{ marginTop: 8 }}>
              <strong>{form.cliente_nombre}</strong>, tu turno fue reservado para el <strong>{form.fecha}</strong> a las <strong>{form.hora} hs</strong>.
            </p>
            <p style={{ marginTop: 8 }}>Servicio: <strong>{servicioSeleccionado?.nombre}</strong></p>
            <p style={{ marginTop: 16, fontSize: 13, color: 'var(--muted)' }}>
              El barbero va a confirmar tu turno en breve. ¡Hasta pronto! 💈
            </p>
            <button
              className="btn btn-outline"
              style={{ marginTop: 24, width: '100%', justifyContent: 'center' }}
              onClick={() => { setPaso(1); setForm({ cliente_nombre: '', cliente_telefono: '', fecha: hoy(), hora: '', servicio: '' }) }}
            >
              Reservar otro turno
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { crearTurno, getDisponibles, SERVICIOS } from '../api.js'

const hoy = () => new Date().toISOString().split('T')[0]

export default function NuevoTurno() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ cliente_nombre:'', cliente_telefono:'', fecha:hoy(), hora:'', servicio:'', notas:'', pago: '' })
  const [disponibles, setDisponibles] = useState([])
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (form.fecha) getDisponibles(form.fecha).then(d => { setDisponibles(d.disponibles); setForm(f => ({ ...f, hora:'' })) })
  }, [form.fecha])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.cliente_nombre || !form.cliente_telefono || !form.hora || !form.servicio) {
      setError('Completá todos los campos obligatorios'); return
    }
    setLoading(true)
    try { await crearTurno({ ...form, origen:'barbero' }); navigate('/agenda') }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <>
      <div className="topbar">
        <div><h2>Nuevo turno</h2><div className="topbar-sub">Cargá manualmente un turno</div></div>
      </div>
      <div className="page-content">
        <div className="card" style={{ maxWidth:500, padding:28 }}>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre *</label>
              <input value={form.cliente_nombre} onChange={e => set('cliente_nombre', e.target.value)} placeholder="Juan Pérez" />
            </div>
            <div className="form-group">
              <label>Teléfono *</label>
              <input value={form.cliente_telefono} onChange={e => set('cliente_telefono', e.target.value)} placeholder="261 555-0000" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Fecha *</label>
              <input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Hora *</label>
              <select value={form.hora} onChange={e => set('hora', e.target.value)}>
                <option value="">Elegir hora</option>
                {disponibles.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Servicio *</label>
            <select value={form.servicio} onChange={e => set('servicio', e.target.value)}>
              <option value="">Elegir servicio</option>
              {SERVICIOS.map(s => <option key={s.id} value={s.id}>{s.nombre} — ${s.precio.toLocaleString()}</option>)}
            </select>
          </div>

                 <div className="form-group">
          <label>Método de pago</label>
          <select value={form.pago} onChange={e => set('pago', e.target.value)}>
            <option value="">Sin especificar</option>
            <option value="efectivo">💵 Efectivo</option>
            <option value="transferencia">📲 Transferencia</option>
          </select>
        </div>
          <div className="form-group">
            <label>Notas (opcional)</label>
            <textarea value={form.notas} onChange={e => set('notas', e.target.value)} rows={3} placeholder="Preferencias del cliente..." />
          </div>
          {error && <p style={{ color:'var(--danger)', fontSize:13, marginBottom:12 }}>{error}</p>}
          <div style={{ display:'flex', gap:10 }}>
            <button className="btn btn-outline" onClick={() => navigate('/agenda')}>Cancelar</button>
            <button className="btn btn-gold" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Guardando...' : 'Confirmar turno'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

import { useState, useEffect } from 'react'
import { api } from '../api.js'
import Toast from '../components/Toast.jsx'

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading]   = useState(true)
  const [toast, setToast]       = useState(null)
  const [busqueda, setBusqueda] = useState('')

  const cargar = () => {
    api.getClientes()
      .then(setClientes)
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  const eliminar = async (id, nombre) => {
    if (!confirm(`¿Eliminar a ${nombre}?`)) return
    try {
      await api.eliminarCliente(id)
      setToast(`${nombre} eliminado`)
      cargar()
    } catch (e) {
      setToast(e.message)
    }
  }

  const filtrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.telefono.includes(busqueda)
  )

  if (loading) return <div className="loading">Cargando clientes...</div>

  return (
    <>
      <div className="topbar">
        <div>
          <h2>Clientes</h2>
          <div className="topbar-sub">{clientes.length} registrados</div>
        </div>
        <input
          placeholder="Buscar por nombre o teléfono..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ padding: '9px 14px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--font-sans)', fontSize: 13, width: 240 }}
        />
      </div>

      <div className="page-content">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Todos los clientes</span>
            <span className="badge badge-green">{filtrados.length} resultados</span>
          </div>
          {filtrados.length === 0
            ? <div className="empty">No se encontraron clientes</div>
            : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Teléfono</th>
                    <th>Visitas</th>
                    <th>Último turno</th>
                    <th>Registrado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 500 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar" style={{ background: 'var(--cream)', color: 'var(--muted)' }}>
                            {c.nombre.slice(0,2).toUpperCase()}
                          </div>
                          {c.nombre}
                        </div>
                      </td>
                      <td style={{ color: 'var(--muted)' }}>{c.telefono}</td>
                      <td>
                        <span className={`badge ${c.total_visitas >= 5 ? 'badge-green' : c.total_visitas >= 2 ? 'badge-amber' : 'badge-red'}`}>
                          {c.total_visitas}
                        </span>
                      </td>
                      <td style={{ color: 'var(--muted)' }}>{c.ultimo_turno ?? 'Sin turnos'}</td>
                      <td style={{ color: 'var(--muted)' }}>{new Date(c.creado_en).toLocaleDateString('es-AR')}</td>
                      <td>
                        <button className="btn btn-sm btn-danger" onClick={() => eliminar(c.id, c.nombre)}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>
      </div>

      {toast && <Toast mensaje={toast} onClose={() => setToast(null)} />}
    </>
  )
}

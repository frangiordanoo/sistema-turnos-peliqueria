const BASE = 'http://localhost:8000'

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Error desconocido' }))
    throw new Error(err.detail || 'Error del servidor')
  }
  return res.json()
}

export const api = {
  // Turnos
  getTurnosHoy:          ()             => req('GET',    '/turnos/hoy'),
  getTurnos:             (fecha)        => req('GET',    `/turnos${fecha ? `?fecha=${fecha}` : ''}`),
  getDisponibles:        (fecha)        => req('GET',    `/turnos/disponibles/${fecha}`),
  getServicios:          ()             => req('GET',    '/turnos/servicios'),
  crearTurno:            (data)         => req('POST',   '/turnos', data),
  actualizarEstado:      (id, estado)   => req('PATCH',  `/turnos/${id}`, { estado }),
  eliminarTurno:         (id)           => req('DELETE', `/turnos/${id}`),

  // Clientes
  getClientes:           ()             => req('GET',    '/clientes'),
  crearCliente:          (data)         => req('POST',   '/clientes', data),
  eliminarCliente:       (id)           => req('DELETE', `/clientes/${id}`),
}

import { supabase } from './supabase.js'

const HORARIOS = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00']

export const SERVICIOS = [
  { id: 'corte_clasico', nombre: 'Corte clásico',  precio: 1800 },
  { id: 'corte_barba',   nombre: 'Corte + barba',  precio: 2200 },
  { id: 'barba',         nombre: 'Barba',           precio: 1200 },
  { id: 'corte_diseno',  nombre: 'Corte + diseño',  precio: 2000 },
]

// ── Turnos ─────────────────────────────────────────────────────────────────

export async function getTurnos(fecha) {
  const q = supabase.from('turnos').select('*').order('hora')
  if (fecha) q.eq('fecha', fecha)
  const { data, error } = await q
  if (error) throw new Error(error.message)
  return data
}

export async function getTurnosHoy() {
  const hoy = new Date().toISOString().split('T')[0]
  return getTurnos(hoy)
}

export async function getDisponibles(fecha) {
  const { data, error } = await supabase
    .from('turnos')
    .select('hora')
    .eq('fecha', fecha)
    .neq('estado', 'cancelado')
  if (error) throw new Error(error.message)
  const ocupados = data.map(t => t.hora)
  return {
    disponibles: HORARIOS.filter(h => !ocupados.includes(h)),
    ocupados,
  }
}

export async function crearTurno({ cliente_nombre, cliente_telefono, fecha, hora, servicio, notas, origen = 'cliente' }) {
  // Verificar que no esté ocupado
  const { data: existe } = await supabase
    .from('turnos')
    .select('id')
    .eq('fecha', fecha)
    .eq('hora', hora)
    .neq('estado', 'cancelado')
    .single()

  if (existe) throw new Error('Ese horario ya está ocupado')

  const srv = SERVICIOS.find(s => s.id === servicio)
  if (!srv) throw new Error('Servicio inválido')

  const { data, error } = await supabase.from('turnos').insert({
    cliente_nombre,
    cliente_telefono,
    fecha,
    hora,
    servicio: srv.nombre,
    precio: srv.precio,
    origen,
    notas,
    estado: 'pendiente',
  }).select().single()

  if (error) throw new Error(error.message)

  // Guardar cliente si no existe
  const { data: clienteExiste } = await supabase
    .from('clientes')
    .select('id')
    .eq('telefono', cliente_telefono)
    .single()

  if (!clienteExiste) {
    await supabase.from('clientes').insert({ nombre: cliente_nombre, telefono: cliente_telefono })
  }

  return data
}

export async function actualizarEstado(id, estado) {
  const { error } = await supabase
    .from('turnos')
    .update({ estado })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function eliminarTurno(id) {
  const { error } = await supabase.from('turnos').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ── Clientes ───────────────────────────────────────────────────────────────

export async function getClientes() {
  const { data, error } = await supabase
    .from('clientes')
    .select('*, turnos(count)')
    .order('nombre')
  if (error) throw new Error(error.message)
  return data
}

export async function eliminarCliente(id) {
  const { error } = await supabase.from('clientes').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ── Realtime ───────────────────────────────────────────────────────────────
// Suscripción en tiempo real — el panel del barbero se actualiza
// automáticamente cuando un cliente reserva un turno

export function suscribirTurnos(fecha, callback) {
  return supabase
    .channel('turnos-realtime')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'turnos',
      filter: `fecha=eq.${fecha}`,
    }, callback)
    .subscribe()
}

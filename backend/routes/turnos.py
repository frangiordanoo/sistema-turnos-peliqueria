from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import get_db

router = APIRouter()

SERVICIOS = {
    "corte_clasico":    {"nombre": "Corte clásico",    "precio": 10000},
    "corte_barba":      {"nombre": "Corte + barba",    "precio": 12000},
    "barba":            {"nombre": "Barba",             "precio":2200},
    "corte_diseno":     {"nombre": "Corte + diseño",   "precio": 15000}
}

class TurnoNuevo(BaseModel):
    cliente_nombre: str
    cliente_telefono: str
    fecha: str          # formato: "2026-04-28"
    hora: str           # formato: "10:00"
    servicio: str       # clave del diccionario SERVICIOS
    notas: Optional[str] = None
    origen: Optional[str] = "cliente"  # "cliente" o "barbero"

class TurnoUpdate(BaseModel):
    estado: str  # pendiente | confirmado | completado | cancelado

# ── Listar turnos (con filtro opcional por fecha) ──────────────────────────
@router.get("/")
def listar_turnos(fecha: Optional[str] = None):
    with get_db() as conn:
        if fecha:
            rows = conn.execute(
                "SELECT * FROM turnos WHERE fecha = ? ORDER BY hora", (fecha,)
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM turnos ORDER BY fecha, hora"
            ).fetchall()
    return [dict(r) for r in rows]

# ── Turnos de hoy ──────────────────────────────────────────────────────────
@router.get("/hoy")
def turnos_hoy():
    from datetime import date
    hoy = date.today().isoformat()
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM turnos WHERE fecha = ? ORDER BY hora", (hoy,)
        ).fetchall()
    return [dict(r) for r in rows]

# ── Horarios disponibles para una fecha ───────────────────────────────────
@router.get("/disponibles/{fecha}")
def horarios_disponibles(fecha: str):
    horarios_totales = [
        "09:00","10:00","11:00","12:00","13:00",
        "14:00","15:00","16:00","17:00","18:00"
    ]
    with get_db() as conn:
        ocupados = conn.execute(
            "SELECT hora FROM turnos WHERE fecha = ? AND estado != 'cancelado'",
            (fecha,)
        ).fetchall()
    horas_ocupadas = {r["hora"] for r in ocupados}
    return {
        "fecha": fecha,
        "disponibles": [h for h in horarios_totales if h not in horas_ocupadas],
        "ocupados": list(horas_ocupadas),
    }

# ── Servicios disponibles ─────────────────────────────────────────────────
@router.get("/servicios")
def listar_servicios():
    return [{"id": k, **v} for k, v in SERVICIOS.items()]

# ── Crear turno (cliente o barbero) ───────────────────────────────────────
@router.post("/", status_code=201)
def crear_turno(turno: TurnoNuevo):
    if turno.servicio not in SERVICIOS:
        raise HTTPException(400, f"Servicio inválido. Opciones: {list(SERVICIOS.keys())}")

    # Verificar que el horario esté libre
    with get_db() as conn:
        ocupado = conn.execute(
            "SELECT id FROM turnos WHERE fecha = ? AND hora = ? AND estado != 'cancelado'",
            (turno.fecha, turno.hora)
        ).fetchone()
        if ocupado:
            raise HTTPException(409, "Ese horario ya está ocupado")

        servicio_info = SERVICIOS[turno.servicio]
        cursor = conn.execute(
            """INSERT INTO turnos
               (cliente_nombre, cliente_telefono, fecha, hora, servicio, precio, origen, notas)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                turno.cliente_nombre,
                turno.cliente_telefono,
                turno.fecha,
                turno.hora,
                servicio_info["nombre"],
                servicio_info["precio"],
                turno.origen,
                turno.notas,
            )
        )
        nuevo_id = cursor.lastrowid

        # Guardar/actualizar cliente
        existente = conn.execute(
            "SELECT id FROM clientes WHERE telefono = ?", (turno.cliente_telefono,)
        ).fetchone()
        if not existente:
            conn.execute(
                "INSERT INTO clientes (nombre, telefono) VALUES (?, ?)",
                (turno.cliente_nombre, turno.cliente_telefono)
            )

    return {"id": nuevo_id, "mensaje": "Turno creado", "servicio": servicio_info}

# ── Actualizar estado ──────────────────────────────────────────────────────
@router.patch("/{turno_id}")
def actualizar_estado(turno_id: int, update: TurnoUpdate):
    estados_validos = {"pendiente", "confirmado", "completado", "cancelado"}
    if update.estado not in estados_validos:
        raise HTTPException(400, f"Estado inválido. Opciones: {estados_validos}")

    with get_db() as conn:
        result = conn.execute(
            "UPDATE turnos SET estado = ? WHERE id = ?", (update.estado, turno_id)
        )
        if result.rowcount == 0:
            raise HTTPException(404, "Turno no encontrado")
    return {"mensaje": f"Estado actualizado a '{update.estado}'"}

# ── Eliminar turno ─────────────────────────────────────────────────────────
@router.delete("/{turno_id}")
def eliminar_turno(turno_id: int):
    with get_db() as conn:
        result = conn.execute("DELETE FROM turnos WHERE id = ?", (turno_id,))
        if result.rowcount == 0:
            raise HTTPException(404, "Turno no encontrado")
    return {"mensaje": "Turno eliminado"}

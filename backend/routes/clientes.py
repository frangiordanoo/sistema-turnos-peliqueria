from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import get_db

router = APIRouter()

class ClienteNuevo(BaseModel):
    nombre: str
    telefono: str

@router.get("/")
def listar_clientes():
    with get_db() as conn:
        rows = conn.execute(
            """SELECT c.*, COUNT(t.id) as total_visitas,
               MAX(t.fecha) as ultimo_turno
               FROM clientes c
               LEFT JOIN turnos t ON t.cliente_telefono = c.telefono
               GROUP BY c.id ORDER BY c.nombre"""
        ).fetchall()
    return [dict(r) for r in rows]

@router.post("/", status_code=201)
def crear_cliente(cliente: ClienteNuevo):
    with get_db() as conn:
        existente = conn.execute(
            "SELECT id FROM clientes WHERE telefono = ?", (cliente.telefono,)
        ).fetchone()
        if existente:
            raise HTTPException(409, "Ya existe un cliente con ese teléfono")
        cursor = conn.execute(
            "INSERT INTO clientes (nombre, telefono) VALUES (?, ?)",
            (cliente.nombre, cliente.telefono)
        )
    return {"id": cursor.lastrowid, "mensaje": "Cliente creado"}

@router.delete("/{cliente_id}")
def eliminar_cliente(cliente_id: int):
    with get_db() as conn:
        result = conn.execute("DELETE FROM clientes WHERE id = ?", (cliente_id,))
        if result.rowcount == 0:
            raise HTTPException(404, "Cliente no encontrado")
    return {"mensaje": "Cliente eliminado"}

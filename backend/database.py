import sqlite3
from contextlib import contextmanager
import os

# Ruta absoluta para evitar archivos duplicados
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "peluqueria.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # permite acceder columnas por nombre
    return conn

@contextmanager
def get_db():
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    with get_db() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS clientes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                telefono TEXT NOT NULL,
                creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS turnos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cliente_nombre TEXT NOT NULL,
                cliente_telefono TEXT NOT NULL,
                cliente_id INTEGER REFERENCES clientes(id),
                fecha TEXT NOT NULL,
                hora TEXT NOT NULL,
                servicio TEXT NOT NULL,
                precio REAL NOT NULL,
                estado TEXT DEFAULT 'pendiente',
                origen TEXT DEFAULT 'cliente',
                notas TEXT,
                creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
    print("✅ Base de datos lista")

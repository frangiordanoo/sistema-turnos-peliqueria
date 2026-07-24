# ✂️ Sistema de Turnos — La Barbería

Sistema completo para gestionar turnos: panel del barbero + página pública para clientes.

---

## 📁 Estructura

```
peluqueria/
├── backend/          ← Python (FastAPI)
│   ├── main.py
│   ├── database.py
│   ├── requirements.txt
│   └── routes/
│       ├── turnos.py
│       └── clientes.py
└── frontend/         ← React (Vite)
    └── src/
        ├── pages/
        │   ├── Agenda.jsx         ← Panel principal del barbero
        │   ├── Clientes.jsx       ← Lista de clientes
        │   ├── NuevoTurno.jsx     ← Carga manual
        │   ├── Recordatorios.jsx  ← Recordatorios del día
        │   └── Reservar.jsx       ← Página PÚBLICA para clientes
        └── components/
```

---

## 🚀 Instalación y arranque

### 1. Backend (Python)

```bash
cd peluqueria/backend

# Crear entorno virtual (recomendado)
python -m venv venv
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows

# Instalar dependencias
pip install -r requirements.txt

# Arrancar el servidor
uvicorn main:app --reload
```

El backend corre en: http://localhost:8000
Documentación automática: http://localhost:8000/docs

---

### 2. Frontend (React)

```bash
cd peluqueria/frontend

# Instalar dependencias (necesitás Node.js instalado)
npm install

# Arrancar en desarrollo
npm run dev
```

El frontend corre en: http://localhost:5173

---

## 🔗 URLs importantes

| URL | Descripción |
|-----|-------------|
| `http://localhost:5173/agenda` | Panel del barbero — Agenda |
| `http://localhost:5173/clientes` | Panel — Clientes |
| `http://localhost:5173/nuevo` | Panel — Cargar turno manual |
| `http://localhost:5173/recordatorios` | Panel — Recordatorios |
| `http://localhost:5173/reservar` | **Página pública para clientes** |
| `http://localhost:8000/docs` | Documentación API |

---

## 📱 ¿Cómo comparten la página de reservas con los clientes?

1. El barbero entra al panel
2. En el sidebar hay un botón **"Copiar link"**
3. Ese link (`.../reservar`) se lo manda a los clientes por WhatsApp o Instagram
4. El cliente abre el link, elige servicio, día y hora, y confirma
5. El turno aparece **automáticamente** en la agenda del barbero (se actualiza cada 5 segundos)

---

## ⚙️ Personalización

### Cambiar nombre de la barbería
Buscar "La Barbería" en `Layout.jsx`, `Reservar.jsx` y `index.html`.

### Cambiar servicios y precios
Editar el diccionario `SERVICIOS` en `backend/routes/turnos.py`:

```python
SERVICIOS = {
    "corte_clasico": {"nombre": "Corte clásico", "precio": 1800},
    "corte_barba":   {"nombre": "Corte + barba", "precio": 2200},
    # agregá los que quieras...
}
```

### Cambiar horarios disponibles
En `backend/routes/turnos.py` modificar la lista `horarios_totales`.

### Cambiar nombre del barbero
En `frontend/src/components/Layout.jsx`, buscar "Marcos García".

---

## 🛠️ Tecnologías

- **Backend**: Python 3.10+, FastAPI, SQLite
- **Frontend**: React 18, Vite, React Router
- **Base de datos**: SQLite (archivo `peluqueria.db` — se crea solo al iniciar)

---

## 📦 Requisitos del sistema

- Python 3.10 o superior
- Node.js 18 o superior
- npm

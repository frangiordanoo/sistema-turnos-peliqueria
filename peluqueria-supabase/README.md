# ✂️ Sistema de Turnos — La Barbería

Sistema completo de gestión de turnos con página pública para clientes y panel en tiempo real para el barbero.

**Stack:** React + Vite · Supabase (PostgreSQL + Realtime) · Vercel

---

## 🗄️ Paso 1 — Crear las tablas en Supabase

1. Entrá a [supabase.com](https://supabase.com) → tu proyecto
2. Andá a **SQL Editor** → **New query**
3. Pegá y ejecutá este SQL:

```sql
-- Tabla clientes
create table clientes (
  id         bigint primary key generated always as identity,
  nombre     text not null,
  telefono   text not null unique,
  creado_en  timestamp with time zone default now()
);

-- Tabla turnos
create table turnos (
  id                 bigint primary key generated always as identity,
  cliente_nombre     text not null,
  cliente_telefono   text not null,
  fecha              text not null,
  hora               text not null,
  servicio           text not null,
  precio             numeric not null,
  estado             text default 'pendiente',
  origen             text default 'cliente',
  notas              text,
  creado_en          timestamp with time zone default now()
);

-- Habilitar lectura pública (para que los clientes puedan reservar sin login)
alter table turnos  enable row level security;
alter table clientes enable row level security;

create policy "Acceso público a turnos"   on turnos   for all using (true) with check (true);
create policy "Acceso público a clientes" on clientes for all using (true) with check (true);

-- Habilitar Realtime (para que el panel se actualice en tiempo real)
alter publication supabase_realtime add table turnos;
```

---

## 💻 Paso 2 — Correr el proyecto localmente

```bash
# Instalar dependencias
npm install

# Crear archivo de variables de entorno
cp .env.example .env.local
# Editá .env.local con tu URL y clave de Supabase

# Correr en desarrollo
npm run dev
```

Entrá a:
- `http://localhost:5173/agenda` — panel del barbero
- `http://localhost:5173/reservar` — página pública de clientes

---

## 🐙 Paso 3 — Subir a GitHub

```bash
git init
git add .
git commit -m "feat: sistema de turnos peluquería"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

> ⚠️ El `.gitignore` ya excluye `.env.local` — tus claves nunca se suben a GitHub.

---

## ▲ Paso 4 — Deploy en Vercel

1. Entrá a [vercel.com](https://vercel.com) → **Add New Project**
2. Importá tu repositorio de GitHub
3. En **Environment Variables** agregá estas dos variables:

| Variable | Valor |
|---|---|
| `VITE_SUPABASE_URL` | `https://tu-proyecto.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `tu-anon-key` |

4. Clic en **Deploy** — listo ✅

A partir de ahora, cada `git push` actualiza el sitio automáticamente.

---

## 🔗 URLs del sistema en producción

| URL | Para quién |
|---|---|
| `tuapp.vercel.app/agenda` | Barbero — panel principal |
| `tuapp.vercel.app/clientes` | Barbero — gestión de clientes |
| `tuapp.vercel.app/nuevo` | Barbero — carga manual |
| `tuapp.vercel.app/recordatorios` | Barbero — recordatorios del día |
| `tuapp.vercel.app/reservar` | **Clientes** — reservar turno online |

---

## ⚡ Funcionalidades

- **Tiempo real** — cuando un cliente reserva, el barbero lo ve al instante (Supabase Realtime)
- **Reserva online** — los clientes entran al link y reservan solos en 2 pasos
- **Carga manual** — el barbero puede agregar turnos desde el panel
- **Control de estados** — pendiente → confirmado → completado / cancelado
- **Recordatorios** — copia mensajes de WhatsApp listos para mandar
- **Gestión de clientes** — historial de visitas automático

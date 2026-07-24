from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routes import turnos, clientes

app = FastAPI(title="Sistema Peluquería")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción: ["http://localhost:5173"]
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()

app.include_router(turnos.router, prefix="/turnos", tags=["turnos"])
app.include_router(clientes.router, prefix="/clientes", tags=["clientes"])

@app.get("/")
def root():
    return {"mensaje": "API Peluquería funcionando ✂️"}

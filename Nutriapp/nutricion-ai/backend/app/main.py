# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
#from .database import engine, Base
from .routers import users, diet

# Importar modelos para que SQLAlchemy los conozca
#import app.models  

# Crear tablas (si no existen)
# ⚠️ En producción se usan migraciones (Alembic). En dev puedes activarlo si quieres.
# Base.metadata.create_all(bind=engine)


app = FastAPI(title="Nutricion AI API")

# ✅ Permitir llamadas desde el frontend (Next.js)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.1.145:3000",  # tu Network URL (la que te sale en consola)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(diet.router, prefix="/diet", tags=["diet"])

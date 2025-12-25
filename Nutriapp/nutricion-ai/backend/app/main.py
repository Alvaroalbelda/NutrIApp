# backend/app/main.py
from fastapi import FastAPI
from .database import engine, Base
from .routers import users, diet

# Importar modelos para que SQLAlchemy los conozca
import app.models  

# Crear tablas (si no existen)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Nutricion AI API")

app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(diet.router, prefix="/diet", tags=["diet"])

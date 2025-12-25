# backend/app/routers/users.py
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from .. import models, database
import bcrypt
import uuid

router = APIRouter()

class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest, db: Session = Depends(database.get_db)):
    # Verificar email único
    existing = db.query(models.User).filter(models.User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El email ya está en uso")

    # Hashear contraseña
    password_hash = bcrypt.hashpw(req.password.encode(), bcrypt.gensalt()).decode()

    # Crear token de verificación
    verification_token = str(uuid.uuid4())

    user = models.User(
        full_name=req.full_name,
        email=req.email,
        password_hash=password_hash,
        is_verified=False,
        verification_token=verification_token
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # TODO: enviar email con verificación usando verification_token

    return {"message": "Usuario creado, revise su correo para verificar", "user_id": str(user.id)}

@router.get("/verify/{token}")
def verify_email(token: str, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.verification_token == token).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token inválido")
    if user.is_verified:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cuenta ya verificada")

    user.is_verified = True
    user.verification_token = None
    db.commit()
    db.refresh(user)

    return {"message": "Cuenta verificada"}

class CompleteProfileRequest(BaseModel):
    user_id: str
    weight: float
    height: float
    diet_type: str
    goal: str
    favorites: list[str]  # preferible lista

@router.post("/complete-profile")
def complete_profile(req: CompleteProfileRequest, db: Session = Depends(database.get_db)):
    # Verificar que el usuario existe y esté verificado
    user = db.query(models.User).filter(models.User.id == req.user_id).first()
    if not user or not user.is_verified:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no autorizado")

    # Crear o actualizar perfil
    profile = db.query(models.Profile).filter(models.Profile.user_id == req.user_id).first()
    if not profile:
        profile = models.Profile(user_id=req.user_id)
    profile.weight = req.weight
    profile.height = req.height
    profile.diet_type = req.diet_type
    profile.goal = req.goal
    profile.favorites = ",".join(req.favorites)

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return {"message": "Perfil completado"}

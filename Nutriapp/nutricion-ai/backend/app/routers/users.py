# backend/app/routers/users.py
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import uuid

from app.database import get_db
from app import models

router = APIRouter()

# ✅ Cambiamos bcrypt -> argon2 (evita límite 72 bytes y el error detect_wrap_bug)
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


# ---------- Helpers ----------
def hash_password(password: str) -> str:
    # Argon2 acepta passwords largas y es el estándar moderno
    return pwd_context.hash(password)


# ---------- Schemas ----------
class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=80)
    email: EmailStr
    # Ajusta aquí si quieres 6..30 o 8..30
    password: str = Field(..., min_length=8, max_length=30)


class RegisterResponse(BaseModel):
    message: str
    user_id: uuid.UUID
    verification_token: uuid.UUID


class CompleteProfileRequest(BaseModel):
    user_id: uuid.UUID
    gender: str | None = None
    weight_kg: float | None = None
    height_cm: int | None = None
    diet_type: str | None = None
    goal: str | None = None
    favorites: list[str] = Field(default_factory=list)


# ---------- Endpoints ----------
@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    # 1) ¿email ya existe?
    existing = db.query(models.User).filter(models.User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="El email ya está registrado")

    # 2) Crear usuario
    password_hash = hash_password(req.password)
    verification_token = uuid.uuid4()

    user = models.User(
        full_name=req.full_name,
        email=req.email,
        password_hash=password_hash,
        is_verified=False,
        verification_token=verification_token,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    # De momento devolvemos el token para test (luego lo enviaremos por email)
    return {
        "message": "Usuario creado. Verifica tu cuenta.",
        "user_id": user.id,
        "verification_token": verification_token,
    }


@router.get("/verify/{token}")
def verify_email(token: uuid.UUID, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.verification_token == token).first()
    if not user:
        raise HTTPException(status_code=404, detail="Token inválido")

    user.is_verified = True
    user.verification_token = None
    db.commit()

    return {"message": "Cuenta verificada"}


@router.post("/complete-profile")
def complete_profile(req: CompleteProfileRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == req.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Usuario no verificado")

    # upsert profile
    profile = db.query(models.Profile).filter(models.Profile.user_id == req.user_id).first()
    if not profile:
        profile = models.Profile(user_id=req.user_id)
        db.add(profile)

    profile.gender = req.gender
    profile.weight_kg = req.weight_kg
    profile.height_cm = req.height_cm
    profile.diet_type = req.diet_type
    profile.goal = req.goal
    profile.favorites = req.favorites

    db.commit()
    return {"message": "Perfil completado"}

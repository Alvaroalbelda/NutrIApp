# backend/app/routers/diet.py
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from .. import models, database

router = APIRouter()

class DietRequest(BaseModel):
    user_id: str
    preferences: dict  # Puedes definir mejor este esquema

class DietResponse(BaseModel):
    diet_plan: dict

@router.post("/generate", response_model=DietResponse)
def generate_diet(req: DietRequest, db: Session = Depends(database.get_db)):
    # Verificar usuario y perfil completado
    user = db.query(models.User).filter(models.User.id == req.user_id).first()
    profile = db.query(models.Profile).filter(models.Profile.user_id == req.user_id).first()
    if not user or not user.is_verified or not profile:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Usuario no autorizado o perfil incompleto")

    # Aquí iría la lógica RAG: recuperar datos, generar dieta
    # Por ahora devolvemos algo vacío o por defecto
    return {"diet_plan": {"week": [], "macros": {}}}

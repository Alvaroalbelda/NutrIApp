# backend/app/models.py
from sqlalchemy import Column, String, Boolean, Float, Text
from sqlalchemy.dialects.postgresql import UUID
import uuid
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True, index=True)
    password_hash = Column(String, nullable=False)
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String, nullable=True)

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)  # podría ser ForeignKey si quieres
    weight = Column(Float, nullable=True)
    height = Column(Float, nullable=True)
    diet_type = Column(String, nullable=True)
    goal = Column(String, nullable=True)
    favorites = Column(Text, nullable=True)  # podrías guardar como JSON o texto

# backend/app/models.py
import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.sql import func

from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)

    is_verified = Column(Boolean, nullable=False, server_default="false")
    verification_token = Column(UUID(as_uuid=True), nullable=True)

    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())


class Profile(Base):
    __tablename__ = "profiles"

    # Tu tabla tiene id como PK
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # user_id UNIQUE + FK
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True
    )

    gender = Column(String, nullable=True)  # (check en DB: male/female/other)
    weight_kg = Column(Numeric(5, 2), nullable=True)
    height_cm = Column(Integer, nullable=True)

    diet_type = Column(String, nullable=True)
    goal = Column(String, nullable=True)

    favorites = Column(ARRAY(String), nullable=False, server_default="{}")

    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

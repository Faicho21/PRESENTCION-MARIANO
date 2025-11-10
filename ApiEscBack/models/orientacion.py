from config.db import Base
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from pydantic import BaseModel
from typing import Optional, List

# ORM - Tabla Orientacion
class Orientacion(Base):
    __tablename__ = "orientaciones"

    id = Column(Integer, primary_key=True)
    nombre = Column(String(100), nullable=False, unique=True)
    estado = Column(String(20), default="activa")  # activa / inactiva

    usuarios = relationship("UserDetail", back_populates="orientacion")
    materias = relationship("Materia", back_populates="orientacion")
    pagos = relationship("Pago", back_populates="orientacion")


    def __init__(self, nombre, estado="activa"):
        self.nombre = nombre
        self.estado = estado

# Pydantic Schemas
class InputOrientacion(BaseModel):
    nombre: str
    estado: Optional[str] = "activa"

class OrientacionUpdate(BaseModel):
    nombre: Optional[str] = None
    estado: Optional[str] = None

class OrientacionOut(BaseModel):
    id: int
    nombre: str
    estado: str

    class Config:
        orm_mode = True

from config.db import Base
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from pydantic import BaseModel
from typing import Optional


class Materia(Base):
    __tablename__ = "materias"

    id = Column(Integer, primary_key=True)
    nombre = Column(String, nullable=False)
    orientacion_id = Column(Integer, ForeignKey("orientaciones.id"))
    orientacion = relationship("Orientacion", back_populates="materias")
    alumnos = relationship("AlumnoMateria", back_populates="materia")
    anio = Column(Integer, nullable=False)



# schemas/materia.py

# 📥 Para crear materia
class InputMateria(BaseModel):
    nombre: str
    orientacion_id: int
    anio: int

# 🔄 Para actualizar materia
class MateriaUpdate(BaseModel):
    nombre: Optional[str] = None
    orientacion_id: Optional[int] = None
    anio: Optional[int] = None

# 📤 Para devolver materia (sin relaciones)
class MateriaOut(BaseModel):
    id: int
    nombre: str
    orientacion_id: int
    anio: int

    class Config:
        from_attributes = True

class OrientacionBase(BaseModel):
    id: int
    nombre: str

    class Config:
        from_attributes = True

class MateriaDetailOut(BaseModel):
    id: int
    nombre: str
    orientacion: OrientacionBase  # 👈 relación anidada
    anio: int

    class Config:
        from_attributes = True


class AlumnoMateriaBase(BaseModel):
    id: int
    user_id: int
    estado: str
    nota: Optional[float]
    fecha_inscripcion: Optional[str]

    class Config:
        from_attributes = True


class MateriaWithAlumnos(BaseModel):
    id: int
    nombre: str
    anio: int
    orientacion: OrientacionBase
    alumnos: list[AlumnoMateriaBase]

    class Config:
        from_attributes = True
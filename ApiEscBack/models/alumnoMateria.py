from config.db import Base
from sqlalchemy import Column, Integer, String, ForeignKey, Date
from sqlalchemy.orm import relationship
from pydantic import BaseModel
from models.user import UserDetailOut
from models.materia import MateriaDetailOut
from typing import Optional
from datetime import date


class AlumnoMateria(Base):
    __tablename__ = "alumno_materia"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("usuarios.id"))
    materia_id = Column(Integer, ForeignKey("materias.id"))
    estado = Column(String, default="cursando")
    nota = Column(Integer, nullable=True)
    fecha_inscripcion = Column(Date, default=date.today())
    anio_cursado = Column(Integer, nullable=False) 

    alumno = relationship("User", back_populates="materias")
    materia = relationship("Materia", back_populates="alumnos")

# schemas/alumno_materia.py

# 📥 Para inscribir alumno a una materia
class InputAlumnoMateria(BaseModel):
    user_id: int
    materia_id: int
    estado: Optional[str] = "cursando"
    nota: Optional[int] = None
    anio_cursado: int
    fecha_inscripcion: Optional[date] = None

# 🔄 Para actualizar estado o nota
class AlumnoMateriaUpdate(BaseModel):
    estado: Optional[str] = None
    nota: Optional[int] = None

# 📤 Para devolver inscripción
class AlumnoMateriaOut(BaseModel):
    id: int
    user_id: int
    materia_id: int
    estado: Optional[str] = "cursando"
    nota: Optional[int] = None
    anio_cursado: int
    fecha_inscripcion: Optional[date] = None

    class Config:
        from_attributes = True

class AlumnoMateriaDetailOut(BaseModel):
    id: int
    alumno: UserDetailOut
    materia: MateriaDetailOut
    estado: str
    nota: Optional[int]
    anio_cursado: int
    fecha_inscripcion: date

    class Config:
        from_attributes = True

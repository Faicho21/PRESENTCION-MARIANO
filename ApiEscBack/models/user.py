from config.db import Base
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from pydantic import BaseModel
from typing import Optional, List, Literal

#region USER
class User(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True)
    username = Column(String)
    password = Column(String)

    userdetail = relationship("UserDetail", back_populates="user", uselist=False)
    materias = relationship("AlumnoMateria", back_populates="alumno")
    pago = relationship("Pago", back_populates="user", uselist=True)

    def __init__(self, username, password):
        self.username = username
        self.password = password
#endregion

#region USERDETAIL
class UserDetail(Base):
    __tablename__ = "userdetails"

    id = Column(Integer, primary_key=True)
    dni = Column(Integer)
    firstName = Column(String)
    lastName = Column(String)
    type = Column(String(50))
    email = Column(String(80), nullable=False, unique=True)

    orientacion_id = Column(Integer, ForeignKey("orientaciones.id"), nullable=True)
    anio_lectivo = Column(Integer, nullable=True)
    estado_academico = Column(String(30), nullable=True)
    
    user = relationship("User", back_populates="userdetail", uselist=False)
    orientacion = relationship("Orientacion", back_populates="usuarios")

    def __init__(self, dni, firstName, lastName, type, email):
        self.dni = dni
        self.firstName = firstName
        self.lastName = lastName
        self.type = type
        self.email = email
#endregion

#region PYDANTIC

class InputUser(BaseModel):
    username: str
    password: str
    email: str
    dni: int
    firstName: str
    lastName: str
    type: Literal["Alumno", "Admin", "Preceptor"]

class InputLogin(BaseModel):
    username: str
    password: str

class InputUserDetail(BaseModel):
    dni: int
    firstName: str
    lastName: str
    type: Literal["Alumno", "Admin", "Preceptor"]
    email: str
    orientacion_id: Optional[int] = None
    anio_lectivo: Optional[int] = None
    estado_academico: Optional[str] = None

class UserDetailUpdate(BaseModel):
    dni: Optional[int] = None
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    type: Optional[Literal["Alumno", "Admin", "Preceptor"]] = None
    email: Optional[str] = None
    orientacion_id: Optional[int] = None
    anio_lectivo: Optional[int] = None
    estado_academico: Optional[str] = None

class UserDetailOut(BaseModel):
    email: str
    dni: int
    firstName: str
    lastName: str
    type: str
    orientacion_id: Optional[int] = None
    anio_lectivo: Optional[int] = None
    estado_academico: Optional[str] = None

    class Config:
        orm_mode = True

class UserOut(BaseModel):
    id: int
    username: str
    userdetail: UserDetailOut

    class Config:
        orm_mode = True

# Paginación filtrada para Admin
class PaginatedFilteredBody(BaseModel):
    limit: Optional[int] = 20
    last_seen_id: Optional[int] = 0
    search: Optional[str] = None

class PaginatedUsersOut(BaseModel):
    users: List[UserOut]
    next_cursor: Optional[int] = None
#endregion

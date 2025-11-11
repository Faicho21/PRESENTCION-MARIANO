from config.db import Base
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)

    # Relaciones
    userdetail = relationship("UserDetail", back_populates="user", uselist=False)
    cuotas = relationship("Cuota", back_populates="alumno", cascade="all, delete-orphan")
    pagos = relationship("Pago", back_populates="alumno", cascade="all, delete-orphan")
    tarifas_creadas = relationship("Tarifa", back_populates="creador", cascade="all, delete-orphan")

    def __init__(self, username, password):
        self.username = username
        self.password = password
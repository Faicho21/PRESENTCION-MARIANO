from config.db import Base
from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List
from datetime import date


# ──────────────────────────────────────────────────────────────
# 📦 Modelo SQLAlchemy
# ──────────────────────────────────────────────────────────────
class Pago(Base):
    __tablename__ = "pagos"

    id = Column(Integer, primary_key=True)
    carrera_id = Column(ForeignKey("carreras.id"))
    user_id = Column(ForeignKey("usuarios.id"))
    monto = Column(Integer)
    mes = Column(DateTime)
    creado_en = Column(DateTime, default=datetime.now)

    user = relationship("User", back_populates="pago", uselist=False)
    carrera = relationship("Carrera", uselist=False)

    def __init__(self, carrera_id, user_id, monto, mes):
        self.carrera_id = carrera_id
        self.user_id = user_id
        self.monto = monto
        self.mes = mes


# ──────────────────────────────────────────────────────────────
# 📌 Esquemas Pydantic
# ──────────────────────────────────────────────────────────────

class NuevoPago(BaseModel):
    carrera_id: int
    user_id: int
    monto: int
    mes: date


class EditarPago(BaseModel):
    carrera_id: Optional[int]
    user_id: Optional[int]
    monto: Optional[int]
    mes: Optional[date]


class PagoOut(BaseModel):
    id: int
    user_id: int
    carrera_id: int
    monto: int
    mes: str  # ya formateado en la ruta como "%Y-%m"
    carrera: Optional[dict]  # {id, nombre}

    class Config:
        orm_mode = True


class PaginatedPagosBody(BaseModel):
    limit: Optional[int] = 20
    last_seen_id: Optional[int] = 0
    user_id: Optional[int] = None
    carrera_id: Optional[int] = None
    fecha_desde: Optional[date] = None
    fecha_hasta: Optional[date] = None


class PaginatedPagosOut(BaseModel):
    pagos: List[PagoOut]
    next_cursor: Optional[int]

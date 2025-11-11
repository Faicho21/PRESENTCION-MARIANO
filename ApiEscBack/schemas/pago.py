# schemas/pago.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PagoBase(BaseModel):
    alumno_id: int
    cuota_id: int
    monto_pagado: float
    metodo: str
    comprobante: Optional[str] = None

class PagoOut(PagoBase):
    id: int
    fecha_pago: datetime

    class Config:
        from_attributes = True

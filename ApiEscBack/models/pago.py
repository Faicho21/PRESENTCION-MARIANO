# models/pago.py
from config.db import Base
from sqlalchemy import Column, Integer, Numeric, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import datetime

class Pago(Base):
    __tablename__ = "pagos"

    id = Column(Integer, primary_key=True, index=True)
    alumno_id = Column(ForeignKey("usuarios.id"), nullable=False)
    cuota_id = Column(ForeignKey("cuotas.id"), nullable=False)
    fecha_pago = Column(DateTime, default=datetime.datetime.now)
    monto_pagado = Column(Numeric(10, 2), nullable=False)
    metodo = Column(String(30), nullable=False)  # efectivo, transferencia, mercado_pago
    comprobante = Column(String(255), nullable=True)
    registrado_por = Column(ForeignKey("usuarios.id"))

    # Relaciones
    alumno = relationship("User", back_populates="pagos", foreign_keys=[alumno_id])
    cuota = relationship("Cuota", back_populates="pagos")
    admin = relationship("User", foreign_keys=[registrado_por])

    def __init__(self, alumno_id, cuota_id, monto_pagado, metodo, comprobante=None, registrado_por=None):
        self.alumno_id = alumno_id
        self.cuota_id = cuota_id
        self.monto_pagado = monto_pagado
        self.metodo = metodo
        self.comprobante = comprobante
        self.registrado_por = registrado_por

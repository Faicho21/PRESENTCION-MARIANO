# schemas/notificacion_pago.py
from pydantic import BaseModel
from datetime import datetime

class NotificacionPagoBase(BaseModel):
    alumno_id: int
    cuota_id: int
    tipo: str
    destinatario: str
    mensaje: str

class NotificacionPagoOut(NotificacionPagoBase):
    id: int
    fecha_envio: datetime

    class Config:
        from_attributes = True

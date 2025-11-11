# routes/notificaciones.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, timedelta
from config.db import get_db
from models.cuota import Cuota
from models.notificacionPago import NotificacionPago
from schemas.notificacionPago import NotificacionPagoOut
from typing import List

notificaciones = APIRouter(prefix="/notificaciones", tags=["Notificaciones"])

@notificaciones.post("/recordatorios", response_model=List[NotificacionPagoOut])
def generar_recordatorios(db: Session = Depends(get_db)):
    hoy = date.today()
    cuotas_proximas = (
        db.query(Cuota)
        .filter(Cuota.fecha_vencimiento == hoy + timedelta(days=7))
        .filter(Cuota.notificada == False)
        .all()
    )

    notifs = []
    for c in cuotas_proximas:
        mensaje_alumno = (
            f"Tu cuota del período {c.periodo} vence el {c.fecha_vencimiento}. "
            f"Monto a pagar: ${float(c.monto_a_pagar):,.2f}"
        )
        mensaje_admin = (
            f"El alumno ID {c.alumno_id} tiene una cuota próxima a vencer el {c.fecha_vencimiento}."
        )

        notif1 = NotificacionPago(alumno_id=c.alumno_id, cuota_id=c.id,
                                  tipo="recordatorio_vencimiento", destinatario="alumno", mensaje=mensaje_alumno)
        notif2 = NotificacionPago(alumno_id=c.alumno_id, cuota_id=c.id,
                                  tipo="recordatorio_vencimiento", destinatario="admin", mensaje=mensaje_admin)

        db.add_all([notif1, notif2])
        c.notificada = True
        notifs.extend([notif1, notif2])

    db.commit()
    return notifs

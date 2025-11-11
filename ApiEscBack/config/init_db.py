from config.db import engine, Base
from models.user import User
from models.userDetail import UserDetail
from models.tarifa import Tarifa
from models.cuota import Cuota
from models.pago import Pago
from models.notificacionPago import NotificacionPago


def init_db():
    """
    Crea todas las tablas de la base de datos si no existen.
    Se ejecuta al iniciar FastAPI (desde main.py).
    """
    Base.metadata.create_all(bind=engine, tables=[
        User.__table__,
        UserDetail.__table__,
        Tarifa.__table__,
        Cuota.__table__,
        Pago.__table__,
        NotificacionPago.__table__,
    ])
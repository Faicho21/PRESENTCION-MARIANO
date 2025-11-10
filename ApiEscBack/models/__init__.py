from config.db import engine, Base
from models.user import User, UserDetail
from models.materia import Materia
from models.alumnoMateria import AlumnoMateria
from models.orientacion import Orientacion
from models.pago import Pago

# Crear todas las tablas en el orden correcto
def init_db():
    # Primero creamos las tablas base
    Base.metadata.create_all(bind=engine, tables=[
        User.__table__,
        UserDetail.__table__,
        Orientacion.__table__,
        Materia.__table__,
        AlumnoMateria.__table__,
        Pago.__table__,
    ]) 
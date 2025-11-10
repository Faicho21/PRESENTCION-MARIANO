from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Routers activos
from routes.user import user
from routes.pago import pago
from routes.orientacion import orientacion
from routes.materia import materia
from routes.alumnoMateria import alumno_materia

from models import init_db

# Crear instancia FastAPI
api_escu = FastAPI()

# Middleware CORS
api_escu.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # o ["http://localhost:5173"] si querés restringir
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar la base de datos
init_db()

# Incluir routers
api_escu.include_router(user)
api_escu.include_router(pago)
api_escu.include_router(orientacion)
api_escu.include_router(materia)
api_escu.include_router(alumno_materia)
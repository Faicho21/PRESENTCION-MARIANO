from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from config.db import get_db
from models.orientacion import Orientacion, InputOrientacion, OrientacionUpdate, OrientacionOut
from auth.seguridad import obtener_usuario_desde_token

orientacion = APIRouter()

# ─────────────────────────────────────────────
# 👤 ADMIN - Crear nueva orientación
# ─────────────────────────────────────────────
@orientacion.post("/orientaciones/crear")
def crear_orientacion(
    body: InputOrientacion,
    db: Session = Depends(get_db),
    payload: dict = Depends(obtener_usuario_desde_token)
):
    if payload["type"] != "Admin":
        raise HTTPException(status_code=403, detail="No autorizado")

    nueva = Orientacion(nombre=body.nombre, estado=body.estado)
    try:
        db.add(nueva)
        db.commit()
        return {"message": "Orientación creada exitosamente"}
    except Exception as e:
        db.rollback()
        print("Error al crear orientación:", e)
        raise HTTPException(status_code=500, detail="Error al crear orientación")


# ─────────────────────────────────────────────
# 👤 ADMIN - Editar orientación existente
# ─────────────────────────────────────────────
@orientacion.patch("/orientaciones/editar/{id}")
def editar_orientacion(
    id: int,
    body: OrientacionUpdate,
    db: Session = Depends(get_db),
    payload: dict = Depends(obtener_usuario_desde_token)
):
    if payload["type"] != "Admin":
        raise HTTPException(status_code=403, detail="No autorizado")

    try:
        ori = db.query(Orientacion).filter_by(id=id).first()
        if not ori:
            raise HTTPException(status_code=404, detail="Orientación no encontrada")

        if body.nombre is not None:
            ori.nombre = body.nombre
        if body.estado is not None:
            ori.estado = body.estado

        db.commit()
        return {"message": "Orientación actualizada correctamente"}

    except Exception as e:
        db.rollback()
        print("Error al editar orientación:", e)
        raise HTTPException(status_code=500, detail="Error al editar orientación")


# ─────────────────────────────────────────────
# 👤 ADMIN - Eliminar orientación (lógico)
# ─────────────────────────────────────────────
@orientacion.delete("/orientaciones/eliminar/{id}")
def eliminar_orientacion(
    id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(obtener_usuario_desde_token)
):
    if payload["type"] != "Admin":
        raise HTTPException(status_code=403, detail="No autorizado")

    try:
        ori = db.query(Orientacion).filter_by(id=id).first()
        if not ori:
            raise HTTPException(status_code=404, detail="Orientación no encontrada")

        ori.estado = "inactiva"  # eliminación lógica
        db.commit()
        return {"message": "Orientación desactivada correctamente"}

    except Exception as e:
        db.rollback()
        print("Error al eliminar orientación:", e)
        raise HTTPException(status_code=500, detail="Error al eliminar orientación")


# ─────────────────────────────────────────────
# 👤 TODOS - Obtener todas las orientaciones activas
# ─────────────────────────────────────────────
@orientacion.get("/orientaciones", response_model=list[OrientacionOut])
def listar_orientaciones(
    db: Session = Depends(get_db),
    payload: dict = Depends(obtener_usuario_desde_token)
):
    orientaciones = db.query(Orientacion).filter_by(estado="activa").all()
    return orientaciones


# ─────────────────────────────────────────────
# 👤 TODOS - Obtener orientación por ID
# ─────────────────────────────────────────────
@orientacion.get("/orientaciones/{id}", response_model=OrientacionOut)
def obtener_orientacion(
    id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(obtener_usuario_desde_token)
):
    ori = db.query(Orientacion).filter_by(id=id).first()
    if not ori:
        raise HTTPException(status_code=404, detail="Orientación no encontrada")
    return ori

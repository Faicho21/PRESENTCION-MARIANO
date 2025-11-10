from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List

from config.db import get_db
from models.materia import Materia, InputMateria, MateriaOut, MateriaUpdate, MateriaDetailOut
from auth.seguridad import solo_admin, admin_o_preceptor

materia = APIRouter()

# ───────────────────────────────────────────────
# 📌 ADMIN: Crear nueva materia
# ───────────────────────────────────────────────
@materia.post("/materias", response_model=MateriaOut)
def crear_materia(m: InputMateria, db: Session = Depends(get_db), user=Depends(solo_admin)):
    existe = db.query(Materia).filter_by(nombre=m.nombre, orientacion_id=m.orientacion_id, anio=m.anio).first()
    if existe:
        raise HTTPException(status_code=400, detail="Ya existe una materia con ese nombre, orientación y año")

    nueva = Materia(nombre=m.nombre, orientacion_id=m.orientacion_id, anio=m.anio)
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva


# ───────────────────────────────────────────────
# 📌 ADMIN o PRECEPTOR: Listar todas las materias
# ───────────────────────────────────────────────
@materia.get("/materias", response_model=List[MateriaOut])
def listar_materias(db: Session = Depends(get_db), user=Depends(admin_o_preceptor)):
    return db.query(Materia).all()


# ───────────────────────────────────────────────
# 📌 ADMIN o PRECEPTOR: Detalle con relación
# ───────────────────────────────────────────────
@materia.get("/materias/detalle", response_model=List[MateriaDetailOut])
def listar_detalle_materias(db: Session = Depends(get_db), user=Depends(admin_o_preceptor)):
    return db.query(Materia).options(joinedload(Materia.orientacion)).all()


# ───────────────────────────────────────────────
# 📌 ADMIN o PRECEPTOR: Obtener por ID
# ───────────────────────────────────────────────
@materia.get("/materias/{materia_id}", response_model=MateriaDetailOut)
def obtener_materia(materia_id: int, db: Session = Depends(get_db), user=Depends(admin_o_preceptor)):
    materia = db.query(Materia).options(joinedload(Materia.orientacion)).filter_by(id=materia_id).first()
    if not materia:
        raise HTTPException(status_code=404, detail="Materia no encontrada")
    return materia


# ───────────────────────────────────────────────
# 📌 ADMIN: Editar una materia
# ───────────────────────────────────────────────
@materia.put("/materias/{materia_id}")
def actualizar_materia(
    materia_id: int,
    actualizacion: MateriaUpdate,
    db: Session = Depends(get_db),
    user=Depends(solo_admin)
):
    materia = db.query(Materia).filter_by(id=materia_id).first()
    if not materia:
        raise HTTPException(status_code=404, detail="Materia no encontrada")

    if actualizacion.nombre is not None:
        materia.nombre = actualizacion.nombre
    if actualizacion.orientacion_id is not None:
        materia.orientacion_id = actualizacion.orientacion_id
    if actualizacion.anio is not None:
        materia.anio = actualizacion.anio

    db.commit()
    return {"message": "Materia actualizada correctamente"}


# ───────────────────────────────────────────────
# 📌 ADMIN: Eliminar materia
# ───────────────────────────────────────────────
@materia.delete("/materias/{materia_id}")
def eliminar_materia(materia_id: int, db: Session = Depends(get_db), user=Depends(solo_admin)):
    materia = db.query(Materia).filter_by(id=materia_id).first()
    if not materia:
        raise HTTPException(status_code=404, detail="Materia no encontrada")

    db.delete(materia)
    db.commit()
    return {"message": "Materia eliminada correctamente"}

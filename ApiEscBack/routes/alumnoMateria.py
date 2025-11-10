from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import date
from config.db import get_db
from auth.seguridad import admin_o_preceptor, solo_alumno
from models.alumnoMateria import (
    AlumnoMateria,
    InputAlumnoMateria,
    AlumnoMateriaUpdate,
    AlumnoMateriaOut,
    AlumnoMateriaDetailOut
)
from models.user import User
from models.materia import Materia





alumno_materia = APIRouter()

# ──────────────────────────────────────────────────────────────
# 📌 INSCRIBIR alumno a materia
# ──────────────────────────────────────────────────────────────
@alumno_materia.post("/inscribir-alumno-materia")
def inscribir_alumno_materia(
    datos: InputAlumnoMateria,
    db: Session = Depends(get_db),
    payload: dict = Depends(admin_o_preceptor)
):
    ya_existe = db.query(AlumnoMateria).filter_by(user_id=datos.user_id, materia_id=datos.materia_id).first()
    if ya_existe:
        return JSONResponse(status_code=400, content={"detail": "El alumno ya está inscripto en esa materia"})

    nueva = AlumnoMateria(
        user_id=datos.user_id,
        materia_id=datos.materia_id,
        estado=datos.estado,
        nota=datos.nota,
        fecha_inscripcion=datos.fecha_inscripcion or date.today(),
        anio_cursado=datos.anio_cursado
    )
    db.add(nueva)
    db.commit()
    return {"message": "Alumno inscripto a la materia exitosamente"}

# ──────────────────────────────────────────────────────────────
# ✏️ EDITAR estado, nota o fecha
# ──────────────────────────────────────────────────────────────
@alumno_materia.patch("/actualizar-estado-nota")
def actualizar_datos_inscripcion(
    datos: AlumnoMateriaUpdate,
    db: Session = Depends(get_db),
    payload: dict = Depends(admin_o_preceptor)
):
    relacion = db.query(AlumnoMateria).filter_by(user_id=datos.user_id, materia_id=datos.materia_id).first()
    if not relacion:
        return JSONResponse(status_code=404, content={"detail": "Inscripción no encontrada"})

    if datos.estado is not None:
        relacion.estado = datos.estado
    if datos.nota is not None:
        relacion.nota = datos.nota
    if datos.fecha_inscripcion is not None:
        relacion.fecha_inscripcion = datos.fecha_inscripcion

    db.commit()
    return {"message": "Inscripción actualizada correctamente"}



# ──────────────────────────────────────────────────────────────
# 👤 VER materias de un alumno
# ──────────────────────────────────────────────────────────────
@alumno_materia.get("/alumno/{user_id}/materias", response_model=List[AlumnoMateriaOut])
def materias_de_alumno(user_id: int, db: Session = Depends(get_db), payload: dict = Depends(admin_o_preceptor)):
    relaciones = db.query(AlumnoMateria).filter_by(user_id=user_id).all()
    return relaciones


# ──────────────────────────────────────────────────────────────
# 📚 VER alumnos inscriptos a una materia
# ──────────────────────────────────────────────────────────────
@alumno_materia.get("/materia/{materia_id}/alumnos", response_model=List[AlumnoMateriaOut])
def alumnos_de_materia(materia_id: int, db: Session = Depends(get_db), payload: dict = Depends(admin_o_preceptor)):
    relaciones = db.query(AlumnoMateria).filter_by(materia_id=materia_id).all()
    return relaciones


# ──────────────────────────────────────────────────────────────
# 👨‍🎓 ALUMNO ve sus materias y notas
# ──────────────────────────────────────────────────────────────
@alumno_materia.get("/alumno/{user_id}/materias/detalle", response_model=List[AlumnoMateriaOut])
def materias_con_notas(user_id: int, db: Session = Depends(get_db), payload: dict = Depends(solo_alumno)):
    if int(payload["sub"]) != user_id:
        raise HTTPException(status_code=403, detail="Acceso denegado")

    relaciones = db.query(AlumnoMateria).filter_by(user_id=user_id).all()
    return relaciones

# ──────────────────────────────────────────────────────────────
# 📄 VER TODAS LAS INSCRIPCIONES (paginadas)
# ──────────────────────────────────────────────────────────────
@alumno_materia.get("/inscripciones", response_model=list[AlumnoMateriaDetailOut])
def ver_inscripciones(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, le=100),
    db: Session = Depends(get_db),
    payload: dict = Depends(admin_o_preceptor)
):
    inscripciones = db.query(AlumnoMateria).offset(skip).limit(limit).all()
    return inscripciones

# ──────────────────────────────────────────────────────────────
# 📄 VER INSCRIPCIONES POR ORIENTACIÓN (paginado)
# ──────────────────────────────────────────────────────────────
@alumno_materia.get("/inscripciones/orientacion/{orientacion_id}", response_model=list[AlumnoMateriaDetailOut])
def ver_inscripciones_por_orientacion(
    orientacion_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, le=100),
    db: Session = Depends(get_db),
    payload: dict = Depends(admin_o_preceptor)
):
    inscripciones = (
        db.query(AlumnoMateria)
        .join(Materia)
        .filter(Materia.orientacion_id == orientacion_id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return inscripciones

# ──────────────────────────────────────────────────────────────
# 🔍 VER MATERIAS DE UN ALUMNO
# ──────────────────────────────────────────────────────────────
@alumno_materia.get("/alumno/{alumno_id}/materias", response_model=list[AlumnoMateriaDetailOut])
def ver_materias_de_alumno(
    alumno_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(admin_o_preceptor)
):
    relaciones = db.query(AlumnoMateria).filter_by(user_id=alumno_id).all()
    if not relaciones:
        raise HTTPException(status_code=404, detail="El alumno no está inscripto en ninguna materia")
    return relaciones

# ──────────────────────────────────────────────────────────────
# ❌ ELIMINAR INSCRIPCIÓN A UNA MATERIA
# ──────────────────────────────────────────────────────────────
@alumno_materia.delete("/eliminar-inscripcion")
def eliminar_inscripcion(
    user_id: int,
    materia_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(admin_o_preceptor)
):
    relacion = db.query(AlumnoMateria).filter_by(user_id=user_id, materia_id=materia_id).first()
    if not relacion:
        raise HTTPException(status_code=404, detail="Inscripción no encontrada")

    db.delete(relacion)
    db.commit()
    return {"message": "Inscripción eliminada correctamente"}
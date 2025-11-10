from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session, joinedload
from typing import List
from config.db import get_db
from models.pago import (
    Pago, NuevoPago, PagoOut, EditarPago,
    PaginatedPagosBody, PaginatedPagosOut
)
from models.user import User
from auth.seguridad import obtener_usuario_desde_token, solo_admin, admin_o_preceptor
from psycopg2 import IntegrityError

pago = APIRouter()

# ──────────────────────────────────────────────────────────────
# 📌 ADMIN: Crear nuevo pago
# ──────────────────────────────────────────────────────────────
@pago.post("/nuevoPago")
def nuevo_pago(pago: NuevoPago, db: Session = Depends(get_db), payload: dict = Depends(solo_admin)):
    try:
        nuevo = Pago(
            carrera_id=pago.carrera_id,
            user_id=pago.user_id,
            monto=pago.monto,
            mes=pago.mes
        )
        db.add(nuevo)
        db.commit()
        return JSONResponse(status_code=200, content={"message": "Pago creado exitosamente"})
    except IntegrityError:
        db.rollback()
        return JSONResponse(status_code=400, content={"message": "Error al crear el pago"})


# ──────────────────────────────────────────────────────────────
# 📌 ADMIN: Eliminar pago
# ──────────────────────────────────────────────────────────────
@pago.delete("/eliminarPago/{pago_id}")
def eliminar_pago(pago_id: int, db: Session = Depends(get_db), payload: dict = Depends(solo_admin)):
    pago_obj = db.query(Pago).filter_by(id=pago_id).first()
    if not pago_obj:
        return JSONResponse(status_code=404, content={"message": "Pago no encontrado"})

    db.delete(pago_obj)
    db.commit()
    return {"message": "Pago eliminado"}


# ──────────────────────────────────────────────────────────────
# 📌 ADMIN: Ver último pago
# ──────────────────────────────────────────────────────────────
@pago.get("/pago/ultimo")
def obtener_ultimo_pago(db: Session = Depends(get_db), payload: dict = Depends(solo_admin)):
    ultimo = (
        db.query(Pago)
        .options(joinedload(Pago.user).joinedload(User.userdetail))
        .order_by(Pago.id.desc())
        .first()
    )
    if not ultimo:
        return JSONResponse(status_code=404, content={"message": "No hay pagos registrados"})

    return {
        "alumno": f"{ultimo.user.userdetail.firstName} {ultimo.user.userdetail.lastName}"
        if ultimo.user and ultimo.user.userdetail else "Alumno desconocido",
        "monto": ultimo.monto,
        "mes": ultimo.mes
    }


# ──────────────────────────────────────────────────────────────
# 📌 ADMIN: Ver pagos con filtros y cursor
# ──────────────────────────────────────────────────────────────
@pago.post("/pago/paginated/filtered-sync", response_model=PaginatedPagosOut)
def get_pagos_paginated_filtered_sync(
    body: PaginatedPagosBody,
    db: Session = Depends(get_db),
    payload: dict = Depends(solo_admin),  # 👈 Si querés permitir preceptor, usar admin_o_preceptor
):
    limit = body.limit or 20
    last_seen_id = body.last_seen_id or 0

    try:
        q = (
            db.query(Pago)
            .options(
                joinedload(Pago.user).joinedload("userdetail"),
                joinedload(Pago.carrera)
            )
        )

        if body.user_id:
            q = q.filter(Pago.user_id == body.user_id)
        if body.carrera_id:
            q = q.filter(Pago.carrera_id == body.carrera_id)
        if body.fecha_desde:
            q = q.filter(Pago.mes >= body.fecha_desde)
        if body.fecha_hasta:
            q = q.filter(Pago.mes <= body.fecha_hasta)
        if last_seen_id > 0:
            q = q.filter(Pago.id > last_seen_id)

        q = q.order_by(Pago.id.asc()).limit(limit)

        pagos_db = q.all()
        next_cursor = pagos_db[-1].id if pagos_db else None

        pagos_out = [
            PagoOut(
                id=p.id,
                user_id=p.user_id,
                carrera_id=p.carrera_id,
                monto=p.monto,
                mes=p.mes.strftime("%Y-%m") if p.mes else "",
                carrera={
                    "id": p.carrera.id,
                    "nombre": p.carrera.nombre
                } if p.carrera else None
            ) for p in pagos_db
        ]

        return {
            "pagos": pagos_out,
            "next_cursor": next_cursor
        }

    except Exception as e:
        print("Error en paginación de pagos:", e)
        raise HTTPException(status_code=500, detail="Error al obtener pagos")


# ──────────────────────────────────────────────────────────────
# 👤 ALUMNO: Ver sus propios pagos
# ──────────────────────────────────────────────────────────────
@pago.get("/pago/mis_pagos", response_model=List[PagoOut])
def ver_mis_pagos(db: Session = Depends(get_db), payload: dict = Depends(obtener_usuario_desde_token)):
    if payload["type"] != "Alumno":
        raise HTTPException(status_code=403, detail="Solo los alumnos pueden ver estos pagos")

    pagos = (
        db.query(Pago)
        .options(joinedload(Pago.carrera))
        .filter(Pago.user_id == payload["sub"])
        .all()
    )

    return [
        {
            "id": p.id,
            "user_id": p.user_id,
            "carrera_id": p.carrera_id,
            "monto": p.monto,
            "mes": p.mes.strftime("%Y-%m") if p.mes else "",
            "carrera": {
                "id": p.carrera.id,
                "nombre": p.carrera.nombre
            } if p.carrera else None
        }
        for p in pagos
    ]


# ──────────────────────────────────────────────────────────────
# 📌 ADMIN: Editar pago parcialmente
# ──────────────────────────────────────────────────────────────
@pago.patch("/editarPago/{pago_id}")
def editar_pago_parcial(
    pago_id: int,
    datos_actualizados: EditarPago,
    db: Session = Depends(get_db),
    payload: dict = Depends(solo_admin)
):
    pago_existente = db.query(Pago).filter_by(id=pago_id).first()
    if not pago_existente:
        return JSONResponse(status_code=404, content={"message": "Pago no encontrado"})

    if datos_actualizados.user_id is not None:
        pago_existente.user_id = datos_actualizados.user_id
    if datos_actualizados.carrera_id is not None:
        pago_existente.carrera_id = datos_actualizados.carrera_id
    if datos_actualizados.monto is not None:
        pago_existente.monto = datos_actualizados.monto
    if datos_actualizados.mes is not None:
        pago_existente.mes = datos_actualizados.mes

    db.commit()
    return {"message": "Pago modificado parcialmente"}

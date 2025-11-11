# routes/pagos.py
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session, joinedload
from typing import List
from config.db import get_db
from models.pago import Pago
from models.cuota import Cuota
from models.user import User
from schemas.pago import PagoBase, PagoOut
from auth.seguridad import obtener_usuario_desde_token, solo_admin
from psycopg2 import IntegrityError
from datetime import datetime

pagos = APIRouter(tags=["Pagos"])

# ──────────────────────────────────────────────────────────────
# 📌 ADMIN: Crear nuevo pago
# ──────────────────────────────────────────────────────────────
@pagos.post("/nuevoPago")
def nuevo_pago(data: PagoBase, db: Session = Depends(get_db), payload: dict = Depends(solo_admin)):
    try:
        cuota = db.query(Cuota).filter_by(id=data.cuota_id).first()
        if not cuota:
            return JSONResponse(status_code=404, content={"message": "Cuota no encontrada"})

        nuevo = Pago(
            alumno_id=data.alumno_id,
            cuota_id=data.cuota_id,
            monto_pagado=data.monto_pagado,
            metodo=data.metodo,
            comprobante=data.comprobante,
            registrado_por=payload["sub"]
        )

        cuota.monto_pagado += data.monto_pagado
        cuota.saldo_pendiente = cuota.monto_a_pagar - cuota.monto_pagado
        cuota.estado = "pagada" if cuota.saldo_pendiente <= 0 else "parcial"

        db.add(nuevo)
        db.commit()
        return JSONResponse(status_code=200, content={"message": "Pago registrado correctamente"})

    except IntegrityError:
        db.rollback()
        return JSONResponse(status_code=400, content={"message": "Error al registrar el pago"})


# ──────────────────────────────────────────────────────────────
# 📌 ADMIN: Eliminar pago
# ──────────────────────────────────────────────────────────────
@pagos.delete("/eliminarPago/{pago_id}")
def eliminar_pago(pago_id: int, db: Session = Depends(get_db), payload: dict = Depends(solo_admin)):
    pago_obj = db.query(Pago).filter_by(id=pago_id).first()
    if not pago_obj:
        return JSONResponse(status_code=404, content={"message": "Pago no encontrado"})

    # Restaurar saldo de la cuota si se elimina el pago
    cuota = db.query(Cuota).filter_by(id=pago_obj.cuota_id).first()
    if cuota:
        cuota.monto_pagado -= pago_obj.monto_pagado
        cuota.saldo_pendiente = cuota.monto_a_pagar - cuota.monto_pagado
        cuota.estado = "pendiente" if cuota.monto_pagado == 0 else "parcial"

    db.delete(pago_obj)
    db.commit()
    return {"message": "Pago eliminado correctamente"}


# ──────────────────────────────────────────────────────────────
# 📌 ADMIN: Ver último pago
# ──────────────────────────────────────────────────────────────
@pagos.get("/pago/ultimo")
def obtener_ultimo_pago(db: Session = Depends(get_db), payload: dict = Depends(solo_admin)):
    ultimo = (
        db.query(Pago)
        .options(joinedload(Pago.alumno).joinedload(User.userdetail))
        .order_by(Pago.id.desc())
        .first()
    )

    if not ultimo:
        return JSONResponse(status_code=404, content={"message": "No hay pagos registrados"})

    alumno = (
        f"{ultimo.alumno.userdetail.firstName} {ultimo.alumno.userdetail.lastName}"
        if ultimo.alumno and ultimo.alumno.userdetail else "Alumno desconocido"
    )

    return {
        "alumno": alumno,
        "monto_pagado": float(ultimo.monto_pagado),
        "fecha_pago": ultimo.fecha_pago.strftime("%Y-%m-%d %H:%M"),
        "metodo": ultimo.metodo,
    }


# ──────────────────────────────────────────────────────────────
# 📌 ADMIN: Ver pagos con filtros y cursor
# ──────────────────────────────────────────────────────────────
@pagos.post("/pago/paginated/filtered-sync")
def get_pagos_paginated_filtered_sync(
    body: dict,
    db: Session = Depends(get_db),
    payload: dict = Depends(solo_admin),
):
    limit = body.get("limit", 20)
    last_seen_id = body.get("last_seen_id", 0)
    alumno_id = body.get("alumno_id")
    fecha_desde = body.get("fecha_desde")
    fecha_hasta = body.get("fecha_hasta")

    try:
        q = (
            db.query(Pago)
            .options(joinedload(Pago.alumno).joinedload("userdetail"))
        )

        if alumno_id:
            q = q.filter(Pago.alumno_id == alumno_id)
        if fecha_desde:
            q = q.filter(Pago.fecha_pago >= fecha_desde)
        if fecha_hasta:
            q = q.filter(Pago.fecha_pago <= fecha_hasta)
        if last_seen_id > 0:
            q = q.filter(Pago.id > last_seen_id)

        pagos_db = q.order_by(Pago.id.asc()).limit(limit).all()
        next_cursor = pagos_db[-1].id if pagos_db else None

        pagos_out = [
            {
                "id": p.id,
                "alumno": f"{p.alumno.userdetail.firstName} {p.alumno.userdetail.lastName}" if p.alumno and p.alumno.userdetail else "Desconocido",
                "monto_pagado": float(p.monto_pagado),
                "fecha_pago": p.fecha_pago.strftime("%Y-%m-%d"),
                "metodo": p.metodo,
            }
            for p in pagos_db
        ]

        return {"pagos": pagos_out, "next_cursor": next_cursor}

    except Exception as e:
        print("Error en paginación de pagos:", e)
        raise HTTPException(status_code=500, detail="Error al obtener pagos")


# ──────────────────────────────────────────────────────────────
# 👤 ALUMNO: Ver sus propios pagos
# ──────────────────────────────────────────────────────────────
@pagos.get("/pago/mis_pagos", response_model=List[PagoOut])
def ver_mis_pagos(db: Session = Depends(get_db), payload: dict = Depends(obtener_usuario_desde_token)):
    if payload["type"] != "Alumno":
        raise HTTPException(status_code=403, detail="Solo los alumnos pueden ver sus pagos")

    pagos_alumno = (
        db.query(Pago)
        .options(joinedload(Pago.cuota))
        .filter(Pago.alumno_id == payload["sub"])
        .order_by(Pago.fecha_pago.desc())
        .all()
    )

    return [
        {
            "id": p.id,
            "monto_pagado": float(p.monto_pagado),
            "fecha_pago": p.fecha_pago.strftime("%Y-%m-%d"),
            "metodo": p.metodo,
            "periodo": p.cuota.periodo if p.cuota else "Sin período"
        }
        for p in pagos_alumno
    ]


# ──────────────────────────────────────────────────────────────
# 📌 ADMIN: Editar pago parcialmente
# ──────────────────────────────────────────────────────────────
@pagos.patch("/editarPago/{pago_id}")
def editar_pago_parcial(
    pago_id: int,
    datos_actualizados: dict,
    db: Session = Depends(get_db),
    payload: dict = Depends(solo_admin)
):
    pago_existente = db.query(Pago).filter_by(id=pago_id).first()
    if not pago_existente:
        return JSONResponse(status_code=404, content={"message": "Pago no encontrado"})

    if "monto_pagado" in datos_actualizados:
        pago_existente.monto_pagado = datos_actualizados["monto_pagado"]
    if "metodo" in datos_actualizados:
        pago_existente.metodo = datos_actualizados["metodo"]
    if "comprobante" in datos_actualizados:
        pago_existente.comprobante = datos_actualizados["comprobante"]

    db.commit()
    return {"message": "Pago modificado parcialmente"}

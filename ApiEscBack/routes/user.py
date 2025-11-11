from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import joinedload, Session
from config.db import get_db
from auth.seguridad import obtener_usuario_desde_token, Seguridad, solo_admin
from models.user import User
from models.userDetail import UserDetail
from models.pago import Pago
from schemas.user import (InputLogin,InputUser, UserOut, PaginatedUsersOut, PaginatedFilteredBody)
from schemas.userDetail import (InputUserDetail, UserDetailUpdate, UserDetailOut)
from typing import Dict, Any
from typing import List, Optional

user = APIRouter()

#Ver el perfil propio
@user.get("/user/profile", response_model=UserOut)
def get_own_profile(payload: dict = Depends(obtener_usuario_desde_token), db: Session = Depends(get_db)):
    try:
        user_id = int(payload.get("sub"))  # ✅ ahora correctamente usamos el campo 'sub'
        db_user = (
            db.query(User)
            .options(joinedload(User.userdetail))
            .filter(User.id == user_id)
            .first()
        )
        if not db_user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        return db_user
    except Exception as e:
        print("Error:", e)
        raise HTTPException(status_code=500, detail="Error al obtener perfil")

#Alumnos paginados y filtrados
@user.post("/user/paginated/filtered-sync", response_model=PaginatedUsersOut)
def get_users_paginated_filtered_sync(
    body: PaginatedFilteredBody,
    payload: dict = Depends(solo_admin),  # ✅ también puede acceder Preceptor
    db: Session = Depends(get_db)
):
    limit = body.limit or 20
    last_seen_id = body.last_seen_id or 0
    search = (body.search or "").strip()

    try:
        q = (
            db.query(User)
            .outerjoin(User.userdetail)
            .options(joinedload(User.userdetail))
        )

        if search:
            like = f"%{search}%"
            q = q.filter(
                (User.username.ilike(like)) |
                (UserDetail.email.ilike(like)) |
                (UserDetail.firstName.ilike(like)) |
                (UserDetail.lastName.ilike(like))
            )

        if last_seen_id > 0:
            q = q.filter(User.id > last_seen_id)

        q = q.order_by(User.id.asc()).limit(limit)

        users_db = q.all()
        next_cursor = users_db[-1].id if users_db else None

        return {
            "users": users_db,
            "next_cursor": next_cursor
        }

    except Exception as e:
        print("Error:", e)
        raise HTTPException(status_code=500, detail="Error al obtener usuarios")

@user.post("/users/register/full")
def crear_usuario_completo(
    user: InputUser,
    payload: dict = Depends(obtener_usuario_desde_token),
    db: Session = Depends(get_db)
):
    if payload["type"] not in ["Admin"]:
        raise HTTPException(status_code=403, detail="No tienes permiso para registrar usuarios")
    try:
        existing_username = db.query(User).filter(User.username == user.username).first()
        existing_email = db.query(UserDetail).filter(UserDetail.email == user.email).first()

        if existing_username:
            return "El usuario ya existe"
        if existing_email:
            return "El email ya existe"

        new_user = User(username=user.username, password=user.password)
        new_detail = UserDetail(
            dni=user.dni,
            firstName=user.firstName,
            lastName=user.lastName,
            type=user.type,
            email=user.email
        )

        db.add(new_detail)
        db.flush()

        new_user.id_userdetail = new_detail.id
        db.add(new_user)
        db.commit()
        return "Usuario registrado correctamente"

    except Exception as e:
        db.rollback()
        return JSONResponse(status_code=500, content={"detail": f"Error inesperado: {str(e)}"})

#Login de usuario
@user.post("/users/loginUser")
def login_post(userIn: InputLogin, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.username == userIn.username).first()
        if not user or user.password != userIn.password:
            return JSONResponse(status_code=401, content={"success": False, "message": "Usuario y/o password incorrectos!"})

        token = Seguridad.generar_token(user)
        if not token:
            return JSONResponse(status_code=401, content={"success": False, "message": "Error de generación de token!"})

        return JSONResponse(status_code=200, content={"success": True, "token": token})

    except Exception as e:
        print(e)
        return JSONResponse(status_code=500, content={"success": False, "message": "Error interno del servidor"})

#Editar detalles de usuario parcialmente
@user.patch("/users/{user_id}/details", response_model=dict)
def actualizar_parcial_userdetail(
    user_id: int,
    cambios: UserDetailUpdate,
    payload: dict = Depends(solo_admin),  # ✅ también lo puede hacer el preceptor
    db: Session = Depends(get_db)
):
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        if payload["type"] != "Admin" and int(payload["sub"]) != user_id:
            raise HTTPException(status_code=403, detail="No autorizado")

        if not user.userdetail:
            raise HTTPException(status_code=404, detail="Este usuario no tiene detalles aún")

        datos_a_actualizar = cambios.dict(exclude_unset=True)

        # El preceptor no puede cambiar el tipo
        if payload["type"] != "Admin":
            datos_a_actualizar.pop("type", None)

        for campo, valor in datos_a_actualizar.items():
            setattr(user.userdetail, campo, valor)

        db.commit()
        return {"msg": "Actualizado correctamente"}

    except Exception as e:
        db.rollback()
        print("Error:", e)
        raise HTTPException(status_code=500, detail="Error interno del servidor")


#Ver todos los alumnos
@user.get("/user/alumnos")
def obtener_alumnos(payload: dict = Depends(solo_admin), db: Session = Depends(get_db)):  # ✅ Preceptor puede ver
    try:
        alumnos = (
            db.query(User)
            .join(UserDetail)
            .filter(UserDetail.type == "Alumno")
            .all()
        )
        return [
            {
                "id": a.id,
                "username": a.username,
                "userdetail": {
                    "firstName": a.userdetail.firstName,
                    "lastName": a.userdetail.lastName
                }
            }
            for a in alumnos
        ]
    except Exception as e:
        print("Error al obtener alumnos:", e)
        return JSONResponse(status_code=500, content={"detail": "Error al obtener alumnos"})

#ruta para obtener el último usuario registrado
@user.get("/users/ultimo")
def obtener_ultimo_usuario(
    payload: dict = Depends(obtener_usuario_desde_token),
    db: Session = Depends(get_db)
):
    if payload["type"] != "Admin":
        raise HTTPException(status_code=403, detail="No autorizado")

    try:
        ultimo = (
            db.query(User)
            .options(joinedload(User.userdetail))
            .order_by(User.id.desc())
            .first()
        )

        if not ultimo or not ultimo.userdetail:
            return JSONResponse(
                status_code=404,
                content={"message": "No hay usuarios registrados"}
            )

        return {
            "firstName": ultimo.userdetail.firstName,
            "lastName": ultimo.userdetail.lastName
        }

    except Exception as e:
        print("Error al obtener el último usuario:", e)
        raise HTTPException(status_code=500, detail="Error interno del servidor")

#ruta para eliminar un usuario y sus datos asociados
@user.delete("/users/{user_id}", response_model=dict)
def eliminar_usuario(user_id: int, payload: dict = Depends(solo_admin), db: Session = Depends(get_db)):
    if payload["type"] != "Admin":
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar usuarios")
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        pagos = db.query(Pago).filter(Pago.user_id == user_id).all()
        for pago in pagos:
            db.delete(pago)

        if user.id_userdetail:
            detalle = db.query(UserDetail).filter(UserDetail.id == user.id_userdetail).first()
            if detalle:
                db.delete(detalle)

        db.delete(user)
        db.commit()

        return {"msg": "Usuario y datos asociados eliminados correctamente"}

    except Exception as e:
        db.rollback()
        print("Error al eliminar usuario:", e)
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

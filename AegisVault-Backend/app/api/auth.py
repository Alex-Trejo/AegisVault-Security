from datetime import timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db import models
from app.schemas import user as user_schema
from app.schemas.audit import AuditLogOut
from app.core import security
from app.services.crypto_engine import crypto_engine

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


@router.post("/register", response_model=user_schema.UserPublic)
def register(user_in: user_schema.UserCreate, db: Session = Depends(get_db)):
    # 1. Verificar si el usuario ya existe
    user = db.query(models.User).filter(models.User.username == user_in.username).first()
    if user:
        raise HTTPException(status_code=400, detail="El nombre de usuario ya está registrado.")
    
    # 2. Generar par de llaves RSA para el usuario
    priv_pem, pub_pem = crypto_engine.generate_rsa_key_pair()
    
    # 3. Cifrar la llave privada con la contraseña del usuario (Zero-Knowledge approach)
    enc_priv_key = crypto_engine.encrypt_rsa_private_key(priv_pem, user_in.password.get_secret_value())
    
    # 4. Crear el registro en la BD
    db_user = models.User(
        username=user_in.username,
        password_hash=security.get_password_hash(user_in.password.get_secret_value()),
        public_key=pub_pem.decode('utf-8'),
        encrypted_private_key=enc_priv_key
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login")
def login(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Usuario o contraseña incorrectos.")
    
    access_token = security.create_access_token(data={"sub": user.username})
    return {
        "access_token": security.create_access_token({"sub": user.username}),
        "token_type": "bearer",
        "user_id": str(user.id), 
        "username": user.username 
    }

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> models.User:
    username = security.decode_token(token)
    if username is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no encontrado")
    return user


@router.get("/audit", response_model=List[AuditLogOut]) 
def get_my_audit_logs(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """
    Retorna los logs de actividad del usuario actual de forma validada.
    """
    logs = db.query(models.AuditLog).filter(
        models.AuditLog.user_id == current_user.id
    ).order_by(models.AuditLog.timestamp.desc()).all()
    
    return logs

@router.get("/users", response_model=List[user_schema.UserPublic])
def get_all_users(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    """
    Retorna la lista de todos los usuarios registrados, 
    excluyendo al usuario actual.
    """
    # Filtramos para no aparecer nosotros mismos en la lista
    users = db.query(models.User).filter(models.User.id != current_user.id).all()
    return users
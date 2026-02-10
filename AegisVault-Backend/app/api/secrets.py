from typing import List
from fastapi import APIRouter, Depends, HTTPException, Header,status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db import models
from app.schemas import secret as secret_schema
from app.services.crypto_engine import crypto_engine
from app.api.auth import get_current_user # Asumiendo que implementas la lógica de JWT

router = APIRouter()

# --- CREATE ---
@router.post("/", response_model=secret_schema.SecretPublic)
def create_secret(
    secret_in: secret_schema.SecretCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    aes_key = crypto_engine.generate_aes_key()
    enc = crypto_engine.encrypt_aes_gcm(secret_in.content.encode(), aes_key)
    wrapped_key = crypto_engine.wrap_aes_key(aes_key, current_user.public_key)
    
    new_secret = models.Secret(name=secret_in.name, description=secret_in.description, owner_id=current_user.id)
    db.add(new_secret)
    db.commit()
    db.refresh(new_secret)
    
    db.add(models.SecretVersion(secret_id=new_secret.id, version_number=1, encrypted_data=enc["ciphertext"], nonce_iv=enc["nonce"], auth_tag=enc["tag"]))
    db.add(models.SecretKey(secret_id=new_secret.id, user_id=current_user.id, encrypted_aes_key=wrapped_key))
    
    # Auditoría
    db.add(models.AuditLog(user_id=current_user.id, action="CREATE_SECRET", resource_id=new_secret.id))
    db.commit()
    return new_secret

# --- READ (LIST) - ACTUALIZADO PARA MOSTRAR COMPARTIDOS ---
@router.get("/", response_model=List[secret_schema.SecretPublic])
def list_my_secrets(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """
    Retorna los secretos donde el usuario es dueño O tiene una llave compartida.
    """
    return db.query(models.Secret).join(models.SecretKey).filter(
        models.SecretKey.user_id == current_user.id, 
        models.Secret.is_deleted == False
    ).all()

# --- READ (DETAIL) - ACTUALIZADO PARA PERMITIR ACCESO A RECEPTORES ---
@router.get("/{secret_id}", response_model=secret_schema.SecretDetailPublic)
def get_secret(
    secret_id: str, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    x_user_password: str = Header(..., description="Tu contraseña de usuario para descifrar")
):
    # 1. Buscar el secreto
    secret = db.query(models.Secret).filter(models.Secret.id == secret_id, models.Secret.is_deleted == False).first()
    if not secret:
        raise HTTPException(status_code=404, detail="No encontrado")

    # 2. Verificar si el usuario tiene una llave para este secreto (sea dueño o receptor)
    sec_key = db.query(models.SecretKey).filter(
        models.SecretKey.secret_id == secret.id, 
        models.SecretKey.user_id == current_user.id
    ).first()
    
    if not sec_key:
        raise HTTPException(status_code=403, detail="No tienes permiso para acceder a este secreto")

    try:
        # 3. Proceso de descifrado con la llave propia del usuario (Juan usa SU clave para SU llave RSA)
        priv_pem = crypto_engine.decrypt_rsa_private_key(current_user.encrypted_private_key, x_user_password)
        aes_key = crypto_engine.unwrap_aes_key(sec_key.encrypted_aes_key, priv_pem)
        
        version = secret.versions[-1]
        decrypted = crypto_engine.decrypt_aes_gcm({
            "ciphertext": version.encrypted_data,
            "nonce": version.nonce_iv,
            "tag": version.auth_tag
        }, aes_key)
        
        db.add(models.AuditLog(user_id=current_user.id, action="READ_SECRET", resource_id=secret.id))
        db.commit()

        return {
            "id": secret.id,
            "name": secret.name,
            "description": secret.description,
            "owner_id": secret.owner_id,
            "created_at": secret.created_at,
            "content": decrypted.decode()
        }
    except Exception:
        raise HTTPException(status_code=401, detail="Contraseña incorrecta o error de llave")
    
# --- UPDATE ---
@router.put("/{secret_id}", response_model=secret_schema.SecretPublic)
def update_secret(
    secret_id: str,
    secret_in: secret_schema.SecretCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    secret = db.query(models.Secret).filter(models.Secret.id == secret_id, models.Secret.owner_id == current_user.id).first()
    if not secret: raise HTTPException(status_code=404, detail="Secreto no encontrado")
    
    secret.name = secret_in.name
    secret.description = secret_in.description
    
    # Aquí podrías agregar una nueva versión (SecretVersion) si el contenido cambió.
    db.add(models.AuditLog(user_id=current_user.id, action="UPDATE_SECRET", resource_id=secret.id))
    db.commit()
    return secret

# --- DELETE (SOFT DELETE) ---
@router.delete("/{secret_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_secret(secret_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    secret = db.query(models.Secret).filter(models.Secret.id == secret_id, models.Secret.owner_id == current_user.id).first()
    if not secret: raise HTTPException(status_code=404, detail="No encontrado")
    
    secret.is_deleted = True # Borrado lógico por seguridad
    db.add(models.AuditLog(user_id=current_user.id, action="DELETE_SECRET", resource_id=secret.id))
    db.commit()
    return None


# -- compartir
@router.post("/{secret_id}/share", status_code=status.HTTP_201_CREATED)
def share_secret(
    secret_id: str,
    share_in: secret_schema.SecretShare,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    x_user_password: str = Header(..., description="Tu contraseña para autorizar el re-cifrado")
):
    """
    IMPLEMENTACIÓN DE CIFRADO HÍBRIDO:
    Permite compartir un secreto con otro usuario sin revelar el contenido al servidor.
    1. Descifra la llave AES usando la llave privada del emisor.
    2. Re-cifra la llave AES usando la llave pública del receptor.
    """
    
    # 1. Verificar que el secreto existe y el emisor tiene acceso
    secret = db.query(models.Secret).filter(models.Secret.id == secret_id, models.Secret.is_deleted == False).first()
    if not secret:
        raise HTTPException(status_code=404, detail="Secreto no encontrado")
        
    # 2. Buscar al usuario destinatario
    recipient = db.query(models.User).filter(models.User.username == share_in.username_to_share_with).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="El usuario destinatario no existe")

    # 3. Evitar duplicados (si ya tiene acceso)
    existing_key = db.query(models.SecretKey).filter(
        models.SecretKey.secret_id == secret.id, 
        models.SecretKey.user_id == recipient.id
    ).first()
    if existing_key:
        raise HTTPException(status_code=400, detail="Este usuario ya tiene acceso al secreto")

    try:
        # --- PROCESO CRIPTOGRÁFICO HÍBRIDO ---
        
        # A. Descifrar la llave privada del emisor (Alex) para poder leer la llave AES
        priv_pem = crypto_engine.decrypt_rsa_private_key(current_user.encrypted_private_key, x_user_password)
        
        # B. Obtener la llave AES que Alex tiene para este secreto
        owner_sec_key = db.query(models.SecretKey).filter(
            models.SecretKey.secret_id == secret.id, 
            models.SecretKey.user_id == current_user.id
        ).first()
        
        # C. Descomponer (Unwrap) la llave AES con la privada de Alex
        aes_key = crypto_engine.unwrap_aes_key(owner_sec_key.encrypted_aes_key, priv_pem)
        
        # D. Envolver (Wrap) la MISMA llave AES con la pública de Juan (el receptor)
        wrapped_key_for_recipient = crypto_engine.wrap_aes_key(aes_key, recipient.public_key)
        
        # --- FIN DEL PROCESO CRIPTOGRÁFICO ---

        # 4. Guardar el nuevo acceso en la base de datos
        new_access = models.SecretKey(
            secret_id=secret.id,
            user_id=recipient.id,
            encrypted_aes_key=wrapped_key_for_recipient
        )
        db.add(new_access)
        
        # 5. Registrar en Auditoría
        db.add(models.AuditLog(
            user_id=current_user.id, 
            action="SHARE_SECRET", 
            resource_id=secret.id
        ))
        
        db.commit()
        return {"message": f"Secreto compartido exitosamente con {recipient.username}"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=401, detail="Error en el intercambio de llaves. Verifica tu contraseña.")
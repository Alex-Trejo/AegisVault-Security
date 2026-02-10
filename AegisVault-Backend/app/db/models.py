#### **Archivo: `AegisVault-Backend/app/db/models.py`**
##Propósito: Este es el archivo más importante de la capa de persistencia. Define la estructura de nuestras tablas de la base de datos como clases de Python. SQLAlchemy usará estas clases para generar las sentencias SQL correspondientes y para mapear los resultados de las consultas a objetos de Python.

#Nota: El código es una traducción directa y completa de tu diagrama ERD, incluyendo todas las relaciones (`relationships`) para que SQLAlchemy pueda gestionar las uniones (JOINs) de forma eficiente.


import uuid
from sqlalchemy import (
    Column, String, Text, DateTime, Boolean, ForeignKey, Integer, LargeBinary
)
from sqlalchemy.dialects.postgresql import UUID, INET
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    
    # Llaves criptográficas del usuario
    public_key = Column(Text, nullable=False, comment="Clave pública RSA en formato PEM")
    encrypted_private_key = Column(Text, nullable=False, comment="Clave privada RSA cifrada con la contraseña del usuario")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relaciones
    secrets_owned = relationship("Secret", back_populates="owner")
    secret_keys = relationship("SecretKey", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")


class Secret(Base):
    __tablename__ = "secrets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), index=True, nullable=False)
    description = Column(Text, nullable=True)
    is_deleted = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # Relaciones
    owner = relationship("User", back_populates="secrets_owned")
    versions = relationship("SecretVersion", back_populates="secret", cascade="all, delete-orphan")
    keys = relationship("SecretKey", back_populates="secret", cascade="all, delete-orphan")


class SecretVersion(Base):
    __tablename__ = "secret_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    version_number = Column(Integer, nullable=False)
    
    # Payload cifrado con AES-256-GCM
    encrypted_data = Column(LargeBinary, nullable=False, comment="El contenido del secreto, cifrado")
    nonce_iv = Column(LargeBinary, nullable=False, comment="Vector de inicialización para el cifrado AES-GCM")
    auth_tag = Column(LargeBinary, nullable=False, comment="Tag de autenticación para el cifrado AES-GCM")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    secret_id = Column(UUID(as_uuid=True), ForeignKey("secrets.id"), nullable=False)
    
    # Relaciones
    secret = relationship("Secret", back_populates="versions")


class SecretKey(Base):
    __tablename__ = "secret_keys"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # La llave AES del secreto, cifrada con la llave pública RSA del usuario
    encrypted_aes_key = Column(LargeBinary, nullable=False, comment="Llave AES envuelta con la llave pública RSA del usuario")
    
    granted_at = Column(DateTime(timezone=True), server_default=func.now())
    
    secret_id = Column(UUID(as_uuid=True), ForeignKey("secrets.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # Relaciones
    secret = relationship("Secret", back_populates="keys")
    user = relationship("User", back_populates="secret_keys")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    action = Column(String(50), nullable=False, comment="Ej: 'USER_LOGIN', 'SECRET_CREATE', 'SECRET_READ'")
    resource_id = Column(UUID(as_uuid=True), nullable=True, comment="ID del recurso afectado (ej: secret_id)")
    ip_address = Column(INET, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # Relaciones
    user = relationship("User", back_populates="audit_logs")
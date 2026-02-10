import uuid
from datetime import datetime
from pydantic import BaseModel, Field, constr

# Pydantic's SecretStr se usa para manejar datos sensibles como contraseñas.
# No se mostrará en logs o representaciones de texto.
from pydantic import SecretStr

# --- Esquemas Base ---

class UserBase(BaseModel):
    """Esquema base con campos comunes para un usuario."""
    username: constr(strip_whitespace=True, min_length=3, max_length=50)


# --- Esquemas para la Creación (Entrada de API) ---

class UserCreate(UserBase):
    """Esquema para la creación de un nuevo usuario."""
    password: SecretStr = Field(..., min_length=8)


# --- Esquemas para Respuestas (Salida de API) ---

class UserPublic(UserBase):
    """
    Esquema público para un usuario.
    Expone solo la información segura para ser devuelta por la API.
    """
    id: uuid.UUID
    created_at: datetime

    class Config:
        # Habilita el modo ORM para que Pydantic pueda leer datos
        # directamente desde los modelos de SQLAlchemy.
        from_attributes = True


# --- Esquemas para la Base de Datos ---

class UserInDBBase(UserBase):
    """Esquema base para un usuario tal como se almacena en la BD."""
    id: uuid.UUID
    password_hash: str
    public_key: str
    encrypted_private_key: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserInDB(UserInDBBase):
    """Esquema completo de un usuario en la BD."""
    pass
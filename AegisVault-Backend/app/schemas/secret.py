import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

from .user import UserPublic

# --- Esquemas para Secretos ---

class SecretBase(BaseModel):
    
    """Esquema base para un secreto."""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None


class SecretCreate(BaseModel):
    """
    Esquema para crear un nuevo secreto.
    Recibe el contenido en texto plano desde el cliente.
    """
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    # El contenido del secreto que será cifrado
    content: str


class SecretPublic(SecretBase):
    """Esquema para devolver los metadatos de un secreto."""
    id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True


class SecretDetailPublic(SecretPublic):
    """
    Esquema para devolver un secreto con su contenido descifrado.
    """
    content: str # El contenido descifrado del secreto
    shared_with: List[UserPublic] = []


class SecretShare(BaseModel):
    """Esquema para la petición de compartir un secreto."""
    username_to_share_with: str


# --- Esquemas para Tokens JWT ---

class Token(BaseModel):
    """Esquema para la respuesta del token de acceso."""
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """Esquema para los datos contenidos dentro de un token JWT."""
    sub: str # Subject (generalmente el username o user_id)
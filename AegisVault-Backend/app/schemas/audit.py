# AegisVault-Backend/app/schemas/audit.py
import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class AuditLogOut(BaseModel):
    id: uuid.UUID
    action: str
    resource_id: Optional[uuid.UUID] = None
    ip_address: Optional[str] = None
    timestamp: datetime

    class Config:
        # Esto permite que Pydantic lea los datos de los modelos de SQLAlchemy
        from_attributes = True
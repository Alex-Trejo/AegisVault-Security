import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """
    Configuraciones de la aplicación cargadas desde variables de entorno.
    """
    # Base de Datos
    DATABASE_URL: str

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        # Pydantic-settings buscará un archivo .env para cargar las variables
        env_file = ".env"

# Instancia única de la configuración que será usada en toda la aplicación
settings = Settings()
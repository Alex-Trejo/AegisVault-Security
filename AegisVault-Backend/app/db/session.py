from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

from app.core.config import settings

# Crea el motor de SQLAlchemy usando la URL de la base de datos desde la configuración.
# pool_pre_ping=True verifica las conexiones antes de usarlas, lo que previene errores
# con conexiones que han sido cerradas por la base de datos.
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)

# Crea una fábrica de sesiones configurada.
# autocommit=False y autoflush=False son las configuraciones estándar para
# usar sesiones de base de datos dentro de un framework web como FastAPI.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base declarativa. Nuestras clases de modelos ORM heredarán de esta clase.
Base = declarative_base()

# --- Dependencia para FastAPI ---
def get_db():
    """
    Generador de sesión de base de datos para ser usado como dependencia en los endpoints de FastAPI.
    Asegura que la sesión de la base de datos se cierre siempre después de que la petición
    haya sido completada.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


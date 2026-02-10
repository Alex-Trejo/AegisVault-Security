from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import engine, Base
from app.api import auth, secrets, lab

# Crear tablas (Desarrollo)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="🛡️ AegisVault - Professional Secure API",
    description="""
    AegisVault es una API de seguridad avanzada con Cifrado Híbrido.
    
    **Instrucciones de Swagger:**
    1. Ve a **Authentication** -> `/api/auth/login`.
    2. Usa el usuario y clave que registraste.
    3. Copia el `access_token`.
    4. Haz clic en el botón **Authorize** (arriba a la derecha) y pega el token.
    """,
    version="1.0.0",
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir Rutas
app.include_router(auth.router, prefix="/api/auth", tags=["🛡️ Authentication"])
app.include_router(secrets.router, prefix="/api/secrets", tags=["🔑 Secrets Management"])
app.include_router(lab.router, prefix="/api/lab", tags=["🧪 Educational Lab"])

@app.get("/", include_in_schema=False)
def root():
    return {"message": "API is active. Go to /docs"}
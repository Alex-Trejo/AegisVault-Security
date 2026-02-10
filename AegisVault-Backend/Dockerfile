# --- ETAPA 1: Builder ---
# Usamos una imagen completa de Python para instalar dependencias.
FROM python:3.11-slim as builder

# Configuramos el entorno
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Instalamos dependencias
COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt


# --- ETAPA 2: Final ---
# Usamos una imagen base mínima y creamos un usuario no-root por seguridad.
FROM python:3.11-slim

WORKDIR /app

# Creamos un usuario y grupo sin privilegios para ejecutar la aplicación
RUN addgroup --system appgroup && adduser --system --group appuser

# Copiamos las dependencias pre-compiladas de la etapa anterior
COPY --from=builder /app/wheels /wheels
COPY --from=builder /app/requirements.txt .
RUN pip install --no-cache /wheels/*

# Copiamos el código de nuestra aplicación
COPY ./app /app/app

# Cambiamos el propietario de los archivos y cambiamos al usuario sin privilegios
RUN chown -R appuser:appgroup /app
USER appuser

# Exponemos el puerto y definimos el comando de ejecución
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
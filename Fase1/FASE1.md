---

# 📁 FASE 1: Planificación y Marco Teórico
**Entregable:** Propuesta del Proyecto

A continuación, tienes el texto estructurado profesionalmente para el documento de propuesta. Puedes copiarlo y pegarlo en tu formato oficial (membrete de la ESPE, si aplica).

---

## TÍTULO DEL PROYECTO: AegisVault – Sistema de Gestión de Activos Digitales con Cifrado Híbrido

### 1. Descripción del Problema
En el entorno empresarial actual, la transferencia de credenciales (tokens, contraseñas, claves SSH) y documentos confidenciales sigue realizándose a través de canales inseguros como correo electrónico, Slack o WhatsApp. Estos medios no garantizan la confidencialidad persistente ni la integridad de los datos. Además, los sistemas de almacenamiento convencionales suelen carecer de mecanismos criptográficos robustos, dejando la información vulnerable ante ataques de *dumping* de base de datos o interceptación *Man-in-the-Middle*.

### 2. Solución Propuesta (El "Pitch")
**AegisVault** es una plataforma web de "Bóveda Digital" diseñada bajo los principios de *Security by Design*. Permite a las organizaciones almacenar, gestionar y compartir secretos utilizando una arquitectura de **Cifrado Híbrido**. A diferencia de un gestor documental común, AegisVault asegura que la información sensible se cifre antes de persistir en la base de datos y que el intercambio de información entre usuarios se realice mediante criptografía asimétrica, garantizando que solo el destinatario legítimo pueda acceder al contenido.

Adicionalmente, el sistema incluye un módulo educativo ("Crypto-Lab") que permite visualizar en tiempo real la diferencia entre cifrados clásicos inseguros y los estándares modernos.

### 3. Implementación Criptográfica (Cumplimiento Académico)
El sistema integra cuatro capas de seguridad criptográfica, superando el requerimiento mínimo:

1.  **Cifrado Simétrico (AES-256-GCM):** Utilizado para el cifrado del *payload* (el contenido real de los secretos). Garantiza confidencialidad y velocidad.
2.  **Cifrado Asimétrico (RSA-2048):** Utilizado para el intercambio de llaves (Key Exchange). La llave simétrica que descifra el archivo es encriptada con la Llave Pública del usuario destino.
3.  **Hashing Seguro (Bcrypt + Salting):** Para el almacenamiento irreversible de contraseñas de usuarios y verificación de integridad.
4.  **Cifrado Clásico (Vigenère - Módulo Didáctico):** Implementación interactiva en el panel de administración para demostrar vulnerabilidades históricas frente a métodos modernos.

### 4. Objetivos del Proyecto
*   **General:** Desarrollar una aplicación web segura para la gestión de secretos que implemente una arquitectura de cifrado híbrido y cumpla con los estándares de usabilidad (UX) modernos.
*   **Específicos:**
    *   Implementar una API REST en Python (FastAPI) que maneje las operaciones criptográficas.
    *   Diseñar una interfaz moderna (Next.js + Tailwind) que brinde feedback visual sobre el estado de seguridad de los datos.
    *   Gestionar el ciclo de vida de los datos (CRUD) asegurando que la información sensible nunca se almacene en texto plano.

### 5. Alcance y Stack Tecnológico
El proyecto se desarrollará en 6 semanas abarcando Backend, Frontend y Base de Datos.

*   **Frontend (UX/UI):** Next.js 14 (React), Tailwind CSS, Framer Motion (para animaciones). Interfaz estilo "Dark Mode Enterprise" enfocada en la confianza del usuario.
*   **Backend (API & Security):** Python 3.11 con **FastAPI**. Librerías: `cryptography`, `bcrypt`, `pydantic`.
*   **Base de Datos:** PostgreSQL (Relacional).
*   **Infraestructura:** Docker (opcional para despliegue).

---
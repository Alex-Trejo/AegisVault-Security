import os
import base64
from typing import Tuple, Dict

from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.scrypt import Scrypt
from passlib.context import CryptContext

class CryptoEngine:
    """
    Clase que encapsula toda la lógica criptográfica de AegisVault.
    Provee una interfaz unificada para hashing, cifrado simétrico/asimétrico
    y el esquema de cifrado híbrido.
    """

    def __init__(self):
        # 1. Contexto de Passlib para hashing de contraseñas de usuario.
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    # --- Hashing de Contraseñas ---

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verifica una contraseña plana contra su hash bcrypt."""
        return self.pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        """Genera el hash bcrypt para una contraseña."""
        return self.pwd_context.hash(password)

    # --- Gestión de Claves RSA ---

    def generate_rsa_key_pair(self) -> Tuple[bytes, bytes]:
        """
        Genera un nuevo par de claves RSA de 2048 bits.

        Returns:
            Tuple[bytes, bytes]: (private_key_pem, public_key_pem)
        """
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
        )
        private_key_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        public_key = private_key.public_key()
        public_key_pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        return private_key_pem, public_key_pem

    # --- Protección de la Clave Privada del Usuario ---

    def encrypt_rsa_private_key(self, private_key_pem: bytes, user_password: str) -> str:
        """
        Cifra la clave privada del usuario usando una clave derivada de su contraseña.
        Utiliza Scrypt como KDF y AES-GCM para el cifrado.

        Returns:
            str: Una cadena codificada que contiene todos los componentes necesarios
                 para el descifrado (salt, nonce, tag, ciphertext).
        """
        salt = os.urandom(16)
        kdf = Scrypt(salt=salt, length=32, n=2**14, r=8, p=1)
        key = kdf.derive(user_password.encode())
        
        aesgcm = AESGCM(key)
        nonce = os.urandom(12)
        ciphertext_with_tag = aesgcm.encrypt(nonce, private_key_pem, None)
        
        # Separar el tag del ciphertext (los últimos 16 bytes)
        ciphertext = ciphertext_with_tag[:-16]
        tag = ciphertext_with_tag[-16:]

        # Codificar todo en base64 y unirlo para fácil almacenamiento
        return (f"{base64.b64encode(salt).decode('utf-8')}:"
                f"{base64.b64encode(nonce).decode('utf-8')}:"
                f"{base64.b64encode(tag).decode('utf-8')}:"
                f"{base64.b64encode(ciphertext).decode('utf-8')}")

    def decrypt_rsa_private_key(self, encrypted_bundle: str, user_password: str) -> bytes:
        """Descifra la clave privada del usuario usando su contraseña."""
        try:
            salt_b64, nonce_b64, tag_b64, ciphertext_b64 = encrypted_bundle.split(':')
            
            salt = base64.b64decode(salt_b64)
            nonce = base64.b64decode(nonce_b64)
            tag = base64.b64decode(tag_b64)
            ciphertext = base64.b64decode(ciphertext_b64)
            
            kdf = Scrypt(salt=salt, length=32, n=2**14, r=8, p=1)
            key = kdf.derive(user_password.encode())
            
            aesgcm = AESGCM(key)
            
            # Unir ciphertext y tag para el descifrado
            ciphertext_with_tag = ciphertext + tag

            return aesgcm.decrypt(nonce, ciphertext_with_tag, None)
        except Exception as e:
            # Captura errores de padding, autenticación (tag inválido), etc.
            raise ValueError("No se pudo descifrar la clave privada. Contraseña incorrecta o datos corruptos.") from e

    # --- Cifrado de Datos (Secretos) ---

    def generate_aes_key(self) -> bytes:
        """Genera una clave AES-256 segura y aleatoria (32 bytes)."""
        return AESGCM.generate_key(bit_length=256)

    def encrypt_aes_gcm(self, data: bytes, key: bytes) -> Dict[str, bytes]:
        """Cifra datos usando AES-256-GCM."""
        aesgcm = AESGCM(key)
        nonce = os.urandom(12)
        ciphertext_with_tag = aesgcm.encrypt(nonce, data, None)
        
        return {
            "ciphertext": ciphertext_with_tag[:-16],
            "nonce": nonce,
            "tag": ciphertext_with_tag[-16:]
        }

    def decrypt_aes_gcm(self, encrypted_parts: Dict[str, bytes], key: bytes) -> bytes:
        """Descifra datos usando AES-256-GCM."""
        aesgcm = AESGCM(key)
        ciphertext_with_tag = encrypted_parts["ciphertext"] + encrypted_parts["tag"]
        return aesgcm.decrypt(encrypted_parts["nonce"], ciphertext_with_tag, None)

    # --- Cifrado Híbrido (Key Wrapping) ---

    def wrap_aes_key(self, aes_key: bytes, public_key_pem: str) -> bytes:
        """
        Envuelve (cifra) una clave AES con una clave pública RSA.
        Esto es para compartir el secreto de forma segura.
        """
        public_key = serialization.load_pem_public_key(public_key_pem.encode())
        
        wrapped_key = public_key.encrypt(
            aes_key,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        return wrapped_key

    def unwrap_aes_key(self, wrapped_key: bytes, private_key_pem: bytes) -> bytes:
        """
        Desenvuelve (descifra) una clave AES con una clave privada RSA.
        """
        private_key = serialization.load_pem_private_key(
            private_key_pem,
            password=None # La clave ya debe estar descifrada en este punto
        )
        
        aes_key = private_key.decrypt(
            wrapped_key,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        return aes_key

# --- Instancia Singleton ---
# Creamos una única instancia del motor para ser importada y usada en toda la app.
crypto_engine = CryptoEngine()
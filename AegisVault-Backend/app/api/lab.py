from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class VigenereRequest(BaseModel):
    text: str
    key: str

@router.post("/vigenere")
def vigenere_lab(data: VigenereRequest):
    text = data.text.upper()
    key = data.key.upper()
    result = ""
    key_indexed = 0
    
    for char in text:
        if char.isalpha():
            # (P + K) mod 26
            shift = ord(key[key_indexed % len(key)]) - ord('A')
            encrypted_char = chr((ord(char) - ord('A') + shift) % 26 + ord('A'))
            result += encrypted_char
            key_indexed += 1
        else:
            result += char
            
    return {
        "original": data.text,
        "ciphered": result,
        "method": "Vigenère Classic",
        "security_note": "Inseguro: Vulnerable al análisis de frecuencias y ataques de Kasiski. No usar en producción."
    }
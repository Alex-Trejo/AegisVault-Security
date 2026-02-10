import api from '@/lib/api';
import { Secret, SecretDetail, CreateSecretParams } from '@/types/secret';

export const SecretService = {
  /**
   * Obtiene la lista de secretos (Propios y Compartidos)
   */
  async getAll(): Promise<Secret[]> {
    const { data } = await api.get<Secret[]>('/api/secrets/');
    return data;
  },

  /**
   * Obtiene un secreto específico y lo descifra (Requiere contraseña en Header)
   * HCI: El password se envía en header 'x-user-password' (Zero-Knowledge)
   */
  async getById(id: string, userPassword: string): Promise<SecretDetail> {
    const { data } = await api.get<SecretDetail>(`/api/secrets/${id}`, {
      headers: {
        'x-user-password': userPassword
      }
    });
    return data;
  },

  /**
   * Crea un nuevo secreto (Cifrado Híbrido ocurre en Backend)
   * HCI: El password se envía para poder firmar/envolver la llave con RSA
   */
  async create(params: CreateSecretParams, userPassword: string): Promise<Secret> {
    const { data } = await api.post<Secret>('/api/secrets/', params, {
      headers: {
        'x-user-password': userPassword
      }
    });
    return data;
  },

  /**
   * Borrado lógico de un secreto
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/api/secrets/${id}`);
  },
    /**
     * Comparte un secreto con otro usuario (Requiere contraseña para verificar identidad)
     * HCI: El password se envía en header 'x-user-password' para verificar que el usuario es legítimo
     */
    
    async share(secretId: string, usernameToShareWith: string, userPassword: string): Promise<void> {
        await api.post(`/api/secrets/${secretId}/share`, 
            { username_to_share_with: usernameToShareWith },
            { headers: { 'x-user-password': userPassword } }
        );
    },

    

    /**
     * Solves a Vigenere cipher by sending text and key to the backend API.
     * @param text - The plaintext or ciphertext to be processed
     * @param key - The Vigenere cipher key used for encryption/decryption
     * @returns A promise resolving to an object containing:
     *   - original: The original text
     *   - ciphered: The resulting ciphered text
     *   - security_note: A security note related to the operation
     */
    async solveVigenere(text: string, key: string): Promise<{ original: string; ciphered: string; security_note: string }> {
        const { data } = await api.post('/api/lab/vigenere', { text, key });
        return data;
    },
};
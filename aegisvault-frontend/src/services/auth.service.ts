// src/services/auth.service.ts
import api from '@/lib/api';
import { AuthResponse, User } from '@/types/auth';

export const AuthService = {
  /**
   * Registra un nuevo usuario y genera sus llaves RSA en el backend.
   */
  async register(username: string, password: string): Promise<User> {
    const response = await api.post<User>('/api/auth/register', {
      username,
      password,
    });
    return response.data;
  },

  /**
   * Autentica al usuario y guarda el token JWT.
   * HCI: Usamos FormData para cumplir con el estándar OAuth2 de FastAPI.
   */
  async login(username: string, password: string): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await api.post<AuthResponse>('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('username', username);
      localStorage.setItem('user_id', response.data.user_id);
    }

    return response.data;
  },

  /**
   * Cierra la sesión limpiando el almacenamiento local.
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('user_keys'); // Limpieza de llaves temporales si existieran
    window.location.href = '/login';
  },

  /**
   * Verifica si hay una sesión activa.
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  },

/**
 * Retrieves all users from the authentication API.
 *
 * @returns A promise that resolves to an array of users.
 */
  async getAllUsers(): Promise<User[]> {
    const response = await api.get<User[]>('/api/auth/users');
    return response.data;
  },
};
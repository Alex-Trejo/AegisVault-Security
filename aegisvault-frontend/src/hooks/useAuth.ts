// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';

// Definimos qué va a devolver este hook para tener autocompletado en los componentes
interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  username: string | null;
  userId: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  
  // Estado local para manejar la UI
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Empieza cargando para verificar sesión
  const [username, setUsername] = useState<string | null>(null);

  // EFECTO: Verificar sesión al cargar la página (Persistencia)
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('username');
      const savedId = localStorage.getItem('user_id');

      if (token && savedUser) {
        setIsAuthenticated(true);
        setUsername(savedUser);
        setUserId(savedId);
      } else {
        setIsAuthenticated(false);
        setUsername(null);
        setUserId(null);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // ACCIÓN: Iniciar Sesión
  const login = async (u: string, p: string) => {
    setIsLoading(true);
    try {
      await AuthService.login(u, p);
      setIsAuthenticated(true);
      setUsername(u);
      router.push('/vault'); // Redirección automática al Dashboard (HCI: Eficiencia)
    } catch (error) {
      throw error; // Re-lanzamos el error para que el formulario muestre la alerta
    } finally {
      setIsLoading(false);
    }
  };

  // ACCIÓN: Registrarse
  const register = async (u: string, p: string) => {
    setIsLoading(true);
    try {
      await AuthService.register(u, p);
      // Opcional: Auto-login después de registro o redirigir a login
      // Por seguridad (Security by Design), mejor pedimos que se loguee manualmente
      router.push('/login?registered=true'); 
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ACCIÓN: Cerrar Sesión
  const logout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
    setUsername(null);
    setUserId(null);
    localStorage.removeItem('user_id');
    router.push('/login');
  };

  return {
    isAuthenticated,
    isLoading,
    username,
    userId,
    login,
    register,
    logout
  };
}
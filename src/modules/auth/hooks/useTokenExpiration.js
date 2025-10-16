import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { message } from 'antd';

// Hook para manejar la expiración de tokens
export const useTokenExpiration = () => {
  const { token, refreshToken, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!token || !isAuthenticated) return;

    // Función para decodificar JWT y obtener tiempo de expiración
    const getTokenExpiration = (token) => {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000; // Convertir a millisegundos
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    };

    const tokenExpiration = getTokenExpiration(token);
    if (!tokenExpiration) return;

    const now = Date.now();
    const timeUntilExpiration = tokenExpiration - now;

    // Si el token ya expiró
    if (timeUntilExpiration <= 0) {
      message.warning('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      logout();
      return;
    }

    // Mostrar advertencia 5 minutos antes de expirar
    const warningTime = timeUntilExpiration - (5 * 60 * 1000);
    
    let warningTimer;
    let logoutTimer;

    if (warningTime > 0) {
      warningTimer = setTimeout(() => {
        message.warning({
          content: 'Tu sesión expirará en 5 minutos. ¿Deseas renovarla?',
          duration: 10,
          onClick: () => {
            refreshToken().then((success) => {
              if (success) {
                message.success('Sesión renovada exitosamente');
              } else {
                message.error('Error al renovar sesión');
              }
            });
          }
        });
      }, warningTime);
    }

    // Logout automático cuando expire
    logoutTimer = setTimeout(() => {
      message.error('Tu sesión ha expirado. Serás redirigido al login.');
      logout();
    }, timeUntilExpiration);

    return () => {
      if (warningTimer) clearTimeout(warningTimer);
      if (logoutTimer) clearTimeout(logoutTimer);
    };
  }, [token, refreshToken, logout, isAuthenticated]);
};

export default useTokenExpiration;

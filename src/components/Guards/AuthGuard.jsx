import { useEffect } from 'react';
// Cambiamos la importación para usar react-router
import * as ReactRouter from 'react-router';
const { useNavigate, useLocation } = ReactRouter;
import { useAuth } from '../../modules/auth/contexts/AuthContext.jsx';
import LoadingScreen from '../common/LoadingScreen';
import { resolveLoginRoute } from '../../modules/auth/hooks/resolveLoginRoute.js';

const AuthGuard = ({ children }) => {
  const { token, isInitialized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isInitialized && !token) {
      const loginPath = resolveLoginRoute();
      navigate(loginPath, {
        state: { from: location.pathname },
        replace: true
      });
    }
  }, [isInitialized, token, navigate, location]);

  // Mostrar loading mientras se inicializa la autenticación
  if (!isInitialized) {
    return <LoadingScreen />;
  }

  // Si hay token, renderizar el contenido protegido
  return token ? children : null;
};

export default AuthGuard;
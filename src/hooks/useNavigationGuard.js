import * as ReactRouter from 'react-router';
const { useLocation, useNavigate } = ReactRouter;
import { useEffect, useCallback } from 'react';

export const useNavigationGuard = (shouldBlock, message) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Manejar la navegación dentro de la app
  useEffect(() => {
    if (!shouldBlock) return;

    // Almacenar la ubicación actual
    const currentPath = location.pathname;

    // Función para manejar clicks en links
    const handleClick = (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      // Solo interceptar links internos
      const url = link?.getAttribute('href');
      if (!url || url.startsWith('http') || url.startsWith('mailto:')) return;

      if (shouldBlock && !window.confirm(message)) {
        e.preventDefault();
      }
    };

    // Agregar listener global para clicks
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, [shouldBlock, message, location]);

  // Manejar intentos de cerrar/recargar la ventana
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (shouldBlock) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [shouldBlock, message]);

  // Retornar una función para comprobar si se puede navegar
  return useCallback(
    (to) => {
      if (!shouldBlock) return true;
      return window.confirm(message);
    },
    [shouldBlock, message]
  );
};
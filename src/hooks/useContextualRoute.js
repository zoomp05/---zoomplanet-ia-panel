// hooks/useContextualRoute.js
import { useLocation } from 'react-router';

/**
 * Hook para generar rutas contextuales basadas en la ubicación actual
 * Soporta jerarquía de módulos (ej: /zoomy/admin/auth)
 * @param {string} context - 'current', 'parent', 'site', 'module', 'root'
 * @returns {Function} - Función que transforma una ruta según el contexto
 */
export const useContextualRoute = (context = 'current') => {
  const location = useLocation();
  
  /**
   * Transforma una ruta según el contexto actual
   * @param {string} to - La ruta destino (puede ser absoluta o relativa)
   * @returns {string} - La ruta transformada
   */
  const getContextualRoute = (to) => {
    // Si ya es una ruta absoluta completa, devolverla tal cual
    if (to.startsWith('/')) {
      const toSegments = to.split('/').filter(Boolean);
      // Si tiene siteName, es ruta absoluta completa
      if (toSegments.length >= 1) {
        return to;
      }
    }
    
    // Si es una ruta relativa, quitamos la barra inicial si existe
    const relativePath = to.startsWith('/') ? to.substring(1) : to;
    
    const currentPath = location.pathname;
    const pathSegments = currentPath.split('/').filter(Boolean);
    
    // Detectar contexto del módulo actual
    // pathSegments = ['zoomy', 'admin'] o ['zoomy', 'admin', 'auth', 'login']
    const siteName = pathSegments[0];
    const firstModule = pathSegments[1];
    const secondSegment = pathSegments[2];
    
    // Determinar si estamos en un submódulo
    // Si secondSegment es 'auth' o similar, entonces firstModule es el padre
    const isInSubmodule = secondSegment === 'auth' || (pathSegments.length > 2 && firstModule !== 'auth');
    
    // Determinar ruta según el contexto solicitado
    switch (context) {
      case 'current': // Mantener toda la ruta actual
        return `${currentPath.endsWith('/') ? currentPath : `${currentPath}/`}${relativePath}`;
        
      case 'parent': // Subir un nivel
        if (pathSegments.length >= 2) {
          const parentPath = `/${pathSegments.slice(0, -1).join('/')}`;
          return `${parentPath}/${relativePath}`;
        }
        break;
        
      case 'site': // Primer segmento (sitio)
        if (pathSegments.length >= 1) {
          return `/${pathSegments[0]}/${relativePath}`;
        }
        break;
        
      case 'module': {
        // Detectar el módulo raíz actual (puede ser módulo padre si estamos en submódulo)
        // Si estamos en /zoomy/admin o /zoomy/admin/auth/login -> usar 'admin'
        // Si estamos en /zoomy/auth/login -> usar 'auth'
        if (pathSegments.length >= 2) {
          // Si estamos en un submódulo, usar el módulo padre
          if (isInSubmodule && pathSegments.length >= 3) {
            // /zoomy/admin/auth/login -> /zoomy/admin/{relativePath}
            return `/${pathSegments.slice(0, 2).join('/')}/${relativePath}`;
          }
          // Si estamos en módulo raíz, usar ese
          // /zoomy/admin -> /zoomy/admin/{relativePath}
          return `/${pathSegments.slice(0, 2).join('/')}/${relativePath}`;
        }
        break;
      }
      
      case 'root': {
        // Construir ruta desde la raíz del sitio
        if (siteName) {
          return `/${siteName}/${relativePath}`;
        }
        break;
      }
    }
    
    // Fallback
    return `/${relativePath}`;
  };
  
  return getContextualRoute;
};
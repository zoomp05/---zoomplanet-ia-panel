import { useContextualRoute } from './useContextualRoute';

/**
 * Hook para obtener rutas de redirección de autenticación basadas en la configuración del módulo
 * Permite que auth sea agnóstico del módulo que lo incorpora
 */
export const useAuthRedirect = () => {
  const getModuleRoute = useContextualRoute("module");

  /**
   * Obtiene la ruta de redirección después del login exitoso
   * Busca en la configuración del módulo actual por homeRoute o defaultRedirect
   */
  const getPostLoginRedirect = () => {
    try {
      // Intentar obtener la configuración del módulo actual
      const currentPath = window.location.pathname;
      
      // Detectar si estamos en un módulo específico analizando la ruta
      let moduleConfig = null;
      
      // Si la ruta contiene /admin/, buscar configuración de admin
      if (currentPath.includes('/admin/')) {
        try {
          // Intentar importar la configuración de admin dinámicamente
          import('../modules/admin/config/authConfig.js')
            .then(({ adminAuthConfig }) => {
              moduleConfig = adminAuthConfig;
            })
            .catch(() => {
              console.log('No se encontró configuración de admin');
            });
        } catch (error) {
          console.log('Error importando configuración de admin:', error);
        }
      }
      
      // Si tenemos configuración del módulo, usar su homeRoute
      if (moduleConfig?.auth?.homeRoute) {
        return getModuleRoute(moduleConfig.auth.homeRoute.replace(/^\//, ''));
      }
      
      // Si tenemos defaultRedirect, usarlo
      if (moduleConfig?.auth?.defaultRedirect) {
        return getModuleRoute(moduleConfig.auth.defaultRedirect.replace(/^\//, ''));
      }
      
      // Fallback: intentar construir ruta basada en el módulo actual
      if (currentPath.includes('/admin/')) {
        return getModuleRoute('dashboard'); // Esto generará /[site]/admin/dashboard
      }
      
      // Fallback final
      return '/dashboard';
      
    } catch (error) {
      console.error('Error obteniendo ruta de redirección:', error);
      return '/dashboard';
    }
  };

  /**
   * Obtiene la ruta de login basada en la configuración del módulo
   */
  const getLoginRoute = () => {
    try {
      const currentPath = window.location.pathname;
      
      if (currentPath.includes('/admin/')) {
        return getModuleRoute('auth/login');
      }
      
      return '/auth/login';
    } catch (error) {
      console.error('Error obteniendo ruta de login:', error);
      return '/auth/login';
    }
  };

  /**
   * Obtiene la ruta de registro basada en la configuración del módulo
   */
  const getRegisterRoute = () => {
    try {
      const currentPath = window.location.pathname;
      
      if (currentPath.includes('/admin/')) {
        return getModuleRoute('auth/register');
      }
      
      return '/auth/register';
    } catch (error) {
      console.error('Error obteniendo ruta de registro:', error);
      return '/auth/register';
    }
  };

  return {
    getPostLoginRedirect,
    getLoginRoute,
    getRegisterRoute
  };
};

export default useAuthRedirect;

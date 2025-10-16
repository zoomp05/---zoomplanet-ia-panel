import { useLocation } from 'react-router';
import { policyProcessor } from '../../../zoom/security/policyProcessor.js';

/**
 * Hook para obtener rutas de redirección basadas en la configuración jerárquica de authConfig
 * Utiliza el PolicyProcessor para resolver rutas según la jerarquía de módulos
 */
export const useAuthRedirect = () => {
  const location = useLocation();

  /**
   * Extrae información del contexto actual de la URL
   * @returns {Object} - Contexto con siteName, moduleName y relativePath
   */
  const getCurrentContext = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const siteName = pathSegments[0] || null;
    const first = pathSegments[1] || null; // puede ser 'auth' o un módulo padre (ej. 'admin')
    const second = pathSegments[2] || null; // si first es módulo, puede ser 'auth'

    let moduleName = null;
    let relativePath = '';

    if (!siteName) return { siteName: null, moduleName: null, relativePath: '', fullPath: location.pathname };

    if (first === 'auth') {
      // Uso directo: /site/auth/...
      moduleName = 'auth';
      relativePath = pathSegments.slice(2).join('/') || '';
    } else if (second === 'auth') {
      // Auth como submódulo de un módulo padre: /site/{parent}/auth/...
      moduleName = first; // módulo padre (admin, etc.)
      relativePath = pathSegments.slice(3).join('/') ? `auth/${pathSegments.slice(3).join('/')}` : 'auth/';
    } else {
      // Otras rutas dentro del módulo
      moduleName = first;
      relativePath = pathSegments.slice(2).join('/') || '';
    }

    return {
      siteName,
      moduleName,
      relativePath,
      fullPath: location.pathname
    };
  };

  /**
   * Obtiene la ruta de redirección post-login desde la configuración jerárquica
   * Detecta si auth está siendo usado como submódulo y usa la configuración del módulo padre
   * @returns {string} - Ruta de redirección para después del login exitoso
   */
  const getPostLoginRedirect = () => {
    const { siteName, moduleName, relativePath } = getCurrentContext();
    
    console.log('[useAuthRedirect] 🔄 getPostLoginRedirect - Context:', { siteName, moduleName, relativePath });
    
    if (!siteName) {
      console.warn('[useAuthRedirect] ⚠️ No se pudo determinar siteName del path actual');
      return '/dashboard'; // Fallback
    }

    const resolved = policyProcessor.getPostLoginRedirect(
      siteName,
      moduleName,
      relativePath
    );
    console.log('[useAuthRedirect] ✅ HomeRoute resuelta por PolicyProcessor:', resolved);
    return resolved;
  };

  /**
   * Obtiene la ruta de login del módulo actual
   * Considera la jerarquía: si estamos en /zoomy/admin, debe retornar /zoomy/admin/auth/login
   * @returns {string} - Ruta de login
   */
  const getLoginRoute = () => {
    const { siteName, moduleName, relativePath } = getCurrentContext();
    
    console.log('🔍 getLoginRoute - Context:', { siteName, moduleName, relativePath });
    
    if (!siteName) {
      return '/auth/login'; // Fallback
    }

    // Si no hay moduleName, estamos en la raíz del site
    if (!moduleName) {
      return `/${siteName}/auth/login`;
    }

    try {
      // Si moduleName no es 'auth', entonces necesitamos auth como submódulo
      // Ejemplo: moduleName='admin' -> /zoomy/admin/auth/login
      if (moduleName !== 'auth') {
        // Verificar si este módulo tiene auth como submódulo registrado
        const hasAuthSubmodule = policyProcessor.hierarchy[siteName]?.modules?.[moduleName]?.children?.auth;
        
        if (hasAuthSubmodule) {
          console.log(`✅ Usando Auth submódulo de ${moduleName}`);
          return `/${siteName}/${moduleName}/auth/login`;
        }
        
        // Si no tiene auth como submódulo, usar el auth del site
        console.log(`⚠️ ${moduleName} no tiene Auth submódulo, usando Auth del site`);
        return `/${siteName}/auth/login`;
      }
      
      // Si estamos en auth directamente, usar policyProcessor
      return policyProcessor.getRedirectRoute(
        moduleName, 
        'login', 
        siteName, 
        { location, timestamp: Date.now() }
      );
    } catch (error) {
      console.error('❌ Error obteniendo ruta de login:', error);
      // Fallback inteligente basado en el contexto
      if (moduleName !== 'auth') {
        return `/${siteName}/${moduleName}/auth/login`;
      }
      return `/${siteName}/auth/login`;
    }
  };

  /**
   * Obtiene la ruta de registro del módulo actual
   * @returns {string} - Ruta de registro
   */
  const getRegisterRoute = () => {
    const { siteName, moduleName } = getCurrentContext();
    
    if (!siteName || !moduleName) {
      return '/auth/register'; // Fallback
    }

    try {
      return policyProcessor.getRedirectRoute(
        moduleName, 
        'register', 
        siteName, 
        { location, timestamp: Date.now() }
      );
    } catch (error) {
      console.error('❌ Error obteniendo ruta de registro:', error);
      return `/${siteName}/${moduleName}/auth/register`;
    }
  };

  /**
   * Obtiene la ruta de no autorizado del módulo actual
   * @returns {string} - Ruta de unauthorized
   */
  const getUnauthorizedRoute = () => {
    const { siteName, moduleName } = getCurrentContext();
    
    if (!siteName || !moduleName) {
      return '/auth/unauthorized'; // Fallback
    }

    try {
      return policyProcessor.getRedirectRoute(
        moduleName, 
        'unauthorized', 
        siteName, 
        { location, timestamp: Date.now() }
      );
    } catch (error) {
      console.error('❌ Error obteniendo ruta de unauthorized:', error);
      return `/${siteName}/${moduleName}/auth/unauthorized`;
    }
  };

  /**
   * Verifica si el módulo está registrado en el PolicyProcessor
   * @param {string} moduleName - Nombre del módulo a verificar
   * @returns {boolean} - true si está registrado
   */
  const isModuleRegistered = (moduleName) => {
    return policyProcessor.moduleConfigs.has(moduleName);
  };

  return {
    getPostLoginRedirect,
    getLoginRoute,
    getRegisterRoute,
    getUnauthorizedRoute,
    getCurrentContext,
    isModuleRegistered
  };
};

export default useAuthRedirect;

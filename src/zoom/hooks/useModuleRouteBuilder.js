/**
 * useModuleRouteBuilder
 * 
 * Hook especializado para construir rutas de módulos basándose en la jerarquía
 * y configuración del sistema. Utilizado principalmente en herramientas admin
 * como SiteConfiguration para mostrar rutas correctas.
 * 
 * Este hook centraliza la lógica de construcción de rutas que antes estaba
 * duplicada en varios componentes.
 */

import { useMemo } from 'react';

/**
 * Hook para construir rutas de módulos con contexto jerárquico
 * 
 * @param {Object} siteConfig - Configuración del sitio
 * @returns {Object} Funciones para construir rutas
 */
export const useModuleRouteBuilder = (siteConfig) => {
  
  /**
   * Construye la ruta base de un módulo considerando toda su jerarquía
   * 
   * Jerarquía soportada:
   * - Módulos raíz: /site/module
   * - Submódulos: /site/parent/module
   * - Submódulos incorporados: /site/parent/submodule
   * 
   * @param {Object} module - Objeto del módulo con propiedades:
   *   - module: nombre del módulo
   *   - routing.routePrefix: prefijo de ruta (opcional)
   *   - routing.parentModule: módulo padre (opcional)
   *   - isIncorporated: si es submódulo incorporado
   *   - parentModuleName: nombre del padre para incorporados
   * @returns {string} Ruta base completa del módulo
   */
  const buildModuleBasePath = useMemo(() => {
    return (module) => {
      if (!module || !siteConfig) return '/';
      
      let basePath = `/${siteConfig.siteId}`;
      
      // Caso 1: Submódulo incorporado
      if (module.isIncorporated && module.parentModuleName) {
        return buildIncorporatedModulePath(module, basePath);
      }
      
      // Caso 2: Módulo regular (con o sin padre)
      return buildRegularModulePath(module, basePath);
    };
  }, [siteConfig]);
  
  /**
   * Construye ruta para submódulo incorporado
   * Ejemplo: admin incorpora googleAds → /zoomy/admin/googleAds
   */
  const buildIncorporatedModulePath = (module, basePath) => {
    // Buscar el módulo padre en siteConfig
    const parentModule = siteConfig.modules?.find(
      m => m.module === module.parentModuleName || m.name === module.parentModuleName
    );
    
    if (parentModule) {
      // Si el padre tiene su propio padre (abuelo), agregarlo primero
      if (parentModule.routing?.parentModule) {
        const grandParentModule = siteConfig.modules?.find(
          m => m.module === parentModule.routing.parentModule
        );
        
        if (grandParentModule) {
          const grandParentPrefix = grandParentModule.routing?.routePrefix 
                                  || grandParentModule.module 
                                  || grandParentModule.name;
          basePath += `/${grandParentPrefix}`;
        }
      }
      
      // Agregar ruta del padre
      const parentPrefix = parentModule.routing?.routePrefix 
                         || parentModule.module 
                         || parentModule.name;
      basePath += `/${parentPrefix}`;
    }
    
    // Agregar el nombre del módulo actual (submódulo)
    const modulePrefix = module.routing?.routePrefix 
                       || module.module 
                       || module.name;
    basePath += `/${modulePrefix}`;
    
    return basePath;
  };
  
  /**
   * Construye ruta para módulo regular
   * Ejemplo: admin → /zoomy/admin
   */
  const buildRegularModulePath = (module, basePath) => {
    // Si tiene parent module, construir su ruta primero
    if (module.routing?.parentModule) {
      const parentModule = siteConfig.modules?.find(
        m => m.module === module.routing.parentModule
      );
      
      if (parentModule) {
        // Verificar si el padre también tiene padre (para soportar 3+ niveles)
        if (parentModule.routing?.parentModule) {
          const grandParentModule = siteConfig.modules?.find(
            m => m.module === parentModule.routing.parentModule
          );
          
          if (grandParentModule) {
            const grandParentPrefix = grandParentModule.routing?.routePrefix 
                                    || grandParentModule.module 
                                    || grandParentModule.name;
            basePath += `/${grandParentPrefix}`;
          }
        }
        
        const parentPrefix = parentModule.routing?.routePrefix 
                           || parentModule.module 
                           || parentModule.name;
        basePath += `/${parentPrefix}`;
      }
    }
    
    // Agregar el routePrefix o nombre del módulo actual
    const modulePrefix = module.routing?.routePrefix 
                       || module.module 
                       || module.name;
    
    if (modulePrefix) {
      basePath += `/${modulePrefix}`;
    }
    
    return basePath;
  };
  
  /**
   * Construye una ruta completa dado un basePath y un path relativo
   * Maneja correctamente paths vacíos, relativos y absolutos
   * 
   * @param {string} basePath - Ruta base del módulo
   * @param {string} path - Path relativo de la ruta
   * @returns {string} Ruta completa
   */
  const buildFullPath = useMemo(() => {
    return (basePath, path) => {
      // Ruta absoluta: retornar tal cual
      if (path?.startsWith('/')) {
        return path;
      }
      
      // Ruta relativa no vacía: agregar al basePath
      if (path && path !== '') {
        const separator = basePath.endsWith('/') || path.startsWith('/') ? '' : '/';
        return basePath + separator + path;
      }
      
      // Path vacío o undefined: retornar basePath
      return basePath || '/';
    };
  }, []);
  
  /**
   * Construye el contexto de ruta de un módulo
   * Retorna objeto con toda la información de rutas del módulo
   * 
   * @param {Object} module - Objeto del módulo
   * @returns {Object} Contexto con basePath, fullPath builder, etc
   */
  const getModuleRouteContext = useMemo(() => {
    return (module) => {
      const basePath = buildModuleBasePath(module);
      
      return {
        basePath,
        siteId: siteConfig.siteId,
        moduleName: module.module || module.name,
        parentModule: module.routing?.parentModule || module.parentModuleName,
        isIncorporated: !!module.isIncorporated,
        
        // Helper para construir rutas completas
        buildPath: (path) => buildFullPath(basePath, path),
        
        // Helpers para scopes específicos
        toSite: (path) => `/${siteConfig.siteId}/${path}`,
        toModule: (path) => buildFullPath(basePath, path),
        
        // Información parsed de la ruta
        segments: basePath.split('/').filter(Boolean),
        depth: basePath.split('/').filter(Boolean).length
      };
    };
  }, [siteConfig, buildModuleBasePath, buildFullPath]);
  
  /**
   * Normaliza un array de rutas agregando el basePath
   * Útil para procesar rutas de routes/index.js
   * 
   * @param {Array} routes - Array de objetos de ruta
   * @param {string} basePath - Ruta base a aplicar
   * @returns {Array} Rutas normalizadas
   */
  const normalizeRoutes = useMemo(() => {
    return (routes, basePath) => {
      if (!Array.isArray(routes)) return [];
      
      return routes.map(route => ({
        ...route,
        fullPath: buildFullPath(basePath, route.path),
        children: route.children 
          ? normalizeRoutes(route.children, buildFullPath(basePath, route.path))
          : undefined
      }));
    };
  }, [buildFullPath]);
  
  return {
    buildModuleBasePath,
    buildFullPath,
    getModuleRouteContext,
    normalizeRoutes,
    siteId: siteConfig?.siteId
  };
};

export default useModuleRouteBuilder;

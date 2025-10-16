/**
 * Config Loader - Sistema de Configuración en Cascada
 * 
 * Implementa el sistema de carga de configuraciones con tres niveles:
 * 1. Base Config (módulo)
 * 2. Parent Override (módulo padre)
 * 3. Site Override (site)
 * 
 * La configuración final es el resultado de hacer deep merge de estos tres niveles.
 */

/**
 * Verifica si un valor es un objeto plano (no array, no null)
 */
function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deep merge de objetos (recursivo)
 * Merges source into target, source tiene prioridad
 * 
 * @param {Object} target - Objeto base
 * @param {Object} source - Objeto a mergear (tiene prioridad)
 * @returns {Object} Objeto mergeado
 */
export function deepMerge(target, source) {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        // Si la key no existe en target, copiar todo el objeto
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          // Si existe, hacer merge recursivo
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        // Si no es objeto, sobrescribir directamente
        output[key] = source[key];
      }
    });
  }
  
  return output;
}

/**
 * Carga la configuración de un módulo aplicando la jerarquía de overrides
 * 
 * NIVEL 1: Base Config (modules/{moduleName}/config/{moduleName}.config.js)
 * NIVEL 2: Parent Override (modules/{parentModule}/config/{moduleName}.override.config.js)
 * NIVEL 3: Site Override (sites/{siteName}/config/{moduleName}.override.config.js)
 * 
 * @param {string} moduleName - Nombre del módulo (ej: 'googleAds', 'marketing')
 * @param {string} parentModule - Módulo padre (ej: 'admin', 'compras-admin') o null
 * @param {string} siteName - Nombre del site (ej: 'zoomy', 'blocave')
 * @param {Object} options - Opciones adicionales
 * @param {boolean} options.silent - Si true, no loggear warnings (default: false)
 * @param {boolean} options.throwOnMissing - Si true, throw error si no hay config base (default: false)
 * @returns {Promise<Object>} Configuración merged
 */
export async function loadModuleConfig(moduleName, parentModule = null, siteName = null, options = {}) {
  const { silent = false, throwOnMissing = false } = options;
  
  let finalConfig = {};
  const configSources = []; // Para tracking de qué configs se cargaron
  
  // ============================================
  // NIVEL 1: Cargar config base del módulo
  // ============================================
  try {
    const baseConfigModule = await import(
      /* @vite-ignore */
      `../../modules/${moduleName}/config/${moduleName}.config.js`
    );
    const baseConfig = baseConfigModule.default || {};
    finalConfig = deepMerge({}, baseConfig);
    
    configSources.push({
      level: 1,
      type: 'base',
      source: `modules/${moduleName}/config/${moduleName}.config.js`,
      keys: Object.keys(baseConfig),
      found: true
    });
    
    if (!silent) {
      console.log(`📦 [ConfigLoader] ${moduleName} - Base config cargada:`, {
        keys: Object.keys(finalConfig),
        source: `modules/${moduleName}/config/${moduleName}.config.js`
      });
    }
  } catch (error) {
    configSources.push({
      level: 1,
      type: 'base',
      source: `modules/${moduleName}/config/${moduleName}.config.js`,
      found: false,
      error: error.message
    });
    
    if (!silent) {
      console.warn(
        `⚠️  [ConfigLoader] ${moduleName} - No se encontró config base:`,
        error.message
      );
    }
    
    if (throwOnMissing) {
      throw new Error(
        `Config base no encontrada para módulo ${moduleName}: ${error.message}`
      );
    }
  }
  
  // ============================================
  // NIVEL 2: Aplicar override del padre (si existe)
  // ============================================
  if (parentModule) {
    try {
      const parentOverrideModule = await import(
        /* @vite-ignore */
        `../../modules/${parentModule}/config/${moduleName}.override.config.js`
      );
      const overrideData = parentOverrideModule.default || {};
      
      const beforeKeys = new Set(Object.keys(finalConfig));
      finalConfig = deepMerge(finalConfig, overrideData);
      const afterKeys = new Set(Object.keys(finalConfig));
      
      // Detectar qué keys se modificaron o agregaron
      const modifiedKeys = Object.keys(overrideData);
      const newKeys = [...afterKeys].filter(k => !beforeKeys.has(k));
      
      configSources.push({
        level: 2,
        type: 'parent-override',
        parent: parentModule,
        source: `modules/${parentModule}/config/${moduleName}.override.config.js`,
        modifiedKeys,
        newKeys,
        found: true
      });
      
      if (!silent) {
        console.log(`🔄 [ConfigLoader] ${moduleName} - Override de padre aplicado:`, {
          parent: parentModule,
          modifiedKeys,
          newKeys,
          source: `modules/${parentModule}/config/${moduleName}.override.config.js`
        });
      }
    } catch (error) {
      configSources.push({
        level: 2,
        type: 'parent-override',
        parent: parentModule,
        source: `modules/${parentModule}/config/${moduleName}.override.config.js`,
        found: false,
        error: error.message
      });
      
      // No es error si no hay override del padre (es opcional)
      if (!silent) {
        console.log(
          `ℹ️  [ConfigLoader] ${moduleName} - Sin override de padre (${parentModule})`
        );
      }
    }
  }
  
  // ============================================
  // NIVEL 3: Aplicar override del site (si existe)
  // ============================================
  if (siteName) {
    try {
      const siteOverrideModule = await import(
        /* @vite-ignore */
        `../../sites/${siteName}/config/${moduleName}.override.config.js`
      );
      const overrideData = siteOverrideModule.default || {};
      
      const beforeKeys = new Set(Object.keys(finalConfig));
      finalConfig = deepMerge(finalConfig, overrideData);
      const afterKeys = new Set(Object.keys(finalConfig));
      
      // Detectar qué keys se modificaron o agregaron
      const modifiedKeys = Object.keys(overrideData);
      const newKeys = [...afterKeys].filter(k => !beforeKeys.has(k));
      
      configSources.push({
        level: 3,
        type: 'site-override',
        site: siteName,
        source: `sites/${siteName}/config/${moduleName}.override.config.js`,
        modifiedKeys,
        newKeys,
        found: true
      });
      
      if (!silent) {
        console.log(`🔄 [ConfigLoader] ${moduleName} - Override de site aplicado:`, {
          site: siteName,
          modifiedKeys,
          newKeys,
          source: `sites/${siteName}/config/${moduleName}.override.config.js`
        });
      }
    } catch (error) {
      configSources.push({
        level: 3,
        type: 'site-override',
        site: siteName,
        source: `sites/${siteName}/config/${moduleName}.override.config.js`,
        found: false,
        error: error.message
      });
      
      // No es error si no hay override del site (es opcional)
      if (!silent) {
        console.log(
          `ℹ️  [ConfigLoader] ${moduleName} - Sin override de site (${siteName})`
        );
      }
    }
  }
  
  // ============================================
  // RESULTADO FINAL
  // ============================================
  if (!silent) {
    console.log(`✅ [ConfigLoader] ${moduleName} - Config final merged:`, {
      site: siteName || 'N/A',
      parent: parentModule || 'ninguno',
      configKeys: Object.keys(finalConfig),
      sourcesApplied: configSources.filter(s => s.found).length
    });
  }
  
  // Agregar metadata a la config final para debugging
  finalConfig._meta = {
    moduleName,
    parentModule,
    siteName,
    sources: configSources,
    mergedAt: new Date().toISOString()
  };
  
  return finalConfig;
}

/**
 * Obtiene información sobre qué configs están disponibles para un módulo
 * Útil para debugging y visualización
 * 
 * @param {string} moduleName - Nombre del módulo
 * @param {string} parentModule - Módulo padre (opcional)
 * @param {string} siteName - Nombre del site (opcional)
 * @returns {Promise<Object>} Info sobre configs disponibles
 */
export async function getConfigInfo(moduleName, parentModule = null, siteName = null) {
  const info = {
    moduleName,
    parentModule,
    siteName,
    configs: {
      base: { exists: false, path: null },
      parentOverride: { exists: false, path: null },
      siteOverride: { exists: false, path: null }
    }
  };
  
  // Check base config
  try {
    await import(
      /* @vite-ignore */
      `../../modules/${moduleName}/config/${moduleName}.config.js`
    );
    info.configs.base.exists = true;
    info.configs.base.path = `modules/${moduleName}/config/${moduleName}.config.js`;
  } catch (e) {
    // No existe
  }
  
  // Check parent override
  if (parentModule) {
    try {
      await import(
        /* @vite-ignore */
        `../../modules/${parentModule}/config/${moduleName}.override.config.js`
      );
      info.configs.parentOverride.exists = true;
      info.configs.parentOverride.path = `modules/${parentModule}/config/${moduleName}.override.config.js`;
    } catch (e) {
      // No existe
    }
  }
  
  // Check site override
  if (siteName) {
    try {
      await import(
        /* @vite-ignore */
        `../../sites/${siteName}/config/${moduleName}.override.config.js`
      );
      info.configs.siteOverride.exists = true;
      info.configs.siteOverride.path = `sites/${siteName}/config/${moduleName}.override.config.js`;
    } catch (e) {
      // No existe
    }
  }
  
  return info;
}

/**
 * Helper para cargar todas las configs de todos los módulos de un site
 * Útil para visualización en UI
 * 
 * @param {Array} modules - Array de módulos del site.config.js
 * @param {string} siteName - Nombre del site
 * @returns {Promise<Object>} Mapa de moduleName -> config
 */
export async function loadAllModuleConfigs(modules, siteName) {
  const configs = {};
  
  for (const module of modules) {
    try {
      const config = await loadModuleConfig(
        module.module,
        module.routing?.parentModule,
        siteName,
        { silent: true }
      );
      configs[module.module] = config;
    } catch (error) {
      console.error(`Error loading config for ${module.module}:`, error);
      configs[module.module] = { _error: error.message };
    }
  }
  
  return configs;
}

export default {
  loadModuleConfig,
  getConfigInfo,
  loadAllModuleConfigs,
  deepMerge
};

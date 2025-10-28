/**
 * Site Migratum - Configuración e Inicialización
 * 
 * Este es un sitio de administración puro que:
 * - NO usa el módulo 'admin' como intermediario
 * - Importa directamente solo los módulos base (base, auth) y añadirá los específicos de Migratum de forma explícita
 * - Gestionará sus propios módulos administrativos
 * 
 * Flujo de inicialización:
 * 1. Cargar site.config.js
 * 2. Inicializar ModuleInitializer
 * 3. Cargar módulos en orden (base → auth) y luego activar los módulos propios definidos en site.config.js
 * 4. Registrar rutas del sitio
 * 5. Registrar rutas de módulos
 */

import { registerSiteRoutes } from '../../zoom/routing/routesRegistry.js';
import { ModuleInitializer } from '../../zoom/modules/ModuleInitializer.js';
import { policyProcessor } from '../../zoom/security/policyProcessor.js';
import { routes } from './routes/index.js';
import siteConfig from './site.config.js';

// Instancia del inicializador de módulos
let moduleInitializer = null;

export default {
  name: "migratum",
  
  // Configuración modular del sitio
  config: siteConfig,
  
  // Módulos raíz cargados desde el core; los módulos propios (wallet, kyc, etc.) se agregan desde site.config.js
  modules: ['base', 'auth'],
  
  dependencies: [],
  
  /**
   * Función de instalación del sitio
   */
  install: async () => {
    console.log('🚀 ========================================');
    console.log('🚀 Inicializando Site: Migratum');
    console.log('🚀 ========================================');
    
    try {
      // 0. Registrar jerarquía de módulos
      console.log('📍 Paso 0: Registrando jerarquía de módulos...');
      await registerModuleHierarchyInPolicy();
      console.log('✅ Jerarquía de módulos registrada');
      
      // 1. Registrar rutas base del site
      console.log('📍 Paso 1: Registrando rutas base del site...');
      registerSiteRoutes("migratum", routes);
      console.log('✅ Rutas base del site registradas');
      
      // 2. Crear instancia del ModuleInitializer
      console.log('📍 Paso 2: Creando ModuleInitializer...');
      moduleInitializer = new ModuleInitializer(siteConfig);
      console.log('✅ ModuleInitializer creado');
      
      // 3. Configurar listeners de eventos
      setupEventListeners(moduleInitializer);
      
      // 4. Inicializar módulos
      console.log('📍 Paso 3: Inicializando módulos...');
      await moduleInitializer.initialize();
      console.log('✅ Módulos inicializados correctamente');
      
      // 5. Registrar rutas de módulos
      console.log('📍 Paso 4: Registrando rutas de módulos...');
      await registerModuleRoutes(moduleInitializer);
      console.log('✅ Rutas de módulos registradas');
      
      console.log('🎉 ========================================');
      console.log('🎉 Site Migratum inicializado correctamente');
      console.log('🎉 ========================================');
      
      // Mostrar diagnóstico
      const diagnostics = moduleInitializer.getDiagnostics();
      console.log('📊 Diagnóstico del sistema:', diagnostics);
      
    } catch (error) {
      console.error('❌ Error inicializando site Migratum:', error);
      throw error;
    }
  },
  
  /**
   * Obtener el inicializador de módulos
   */
  getModuleInitializer: () => {
    return moduleInitializer;
  },
  
  /**
   * Destruir el site
   */
  destroy: async () => {
    console.log('🗑️  Destruyendo site Migratum...');
    if (moduleInitializer) {
      await moduleInitializer.destroy();
      moduleInitializer = null;
    }
    console.log('✅ Site Migratum destruido');
  }
};

/**
 * Configura listeners de eventos del ModuleInitializer
 */
function setupEventListeners(initializer) {
  initializer.on('initialization:start', (data) => {
    console.log(`🔄 Iniciando inicialización de ${data.siteId}...`);
  });
  
  initializer.on('initialization:complete', (data) => {
    console.log(`✅ Inicialización completada: ${data.criticalCount} críticos, ${data.lazyCount} lazy`);
  });
  
  initializer.on('initialization:error', (data) => {
    console.error(`❌ Error en inicialización:`, data.error);
  });
  
  initializer.on('module:initializing', (data) => {
    console.log(`⏳ Inicializando módulo: ${data.instanceId}...`);
  });
  
  initializer.on('module:initialized', (data) => {
    console.log(`✅ Módulo inicializado: ${data.instanceId}`);
  });
  
  initializer.on('module:mounting', (data) => {
    console.log(`📦 Montando módulo: ${data.instanceId}...`);
  });
  
  initializer.on('module:mounted', (data) => {
    console.log(`✅ Módulo montado: ${data.instanceId}`);
  });
  
  initializer.on('module:error', (data) => {
    console.error(`❌ Error en módulo ${data.instanceId} [${data.phase}]:`, data.error);
  });
}

/**
 * Registra la jerarquía de módulos en el PolicyProcessor
 */
async function registerModuleHierarchyInPolicy() {
  const siteName = 'migratum';
  
  // Registrar configuración de autenticación del site
  if (siteConfig.auth) {
    policyProcessor.registerSiteAuthConfig(siteName, siteConfig.auth);
  }
  
  // Iterar sobre los módulos definidos en site.config.js
  if (siteConfig.modules && Array.isArray(siteConfig.modules)) {
    for (const moduleInstance of siteConfig.modules) {
      const moduleType = moduleInstance.module;
      const moduleId = moduleInstance.id;
      const parentModule = moduleInstance.routing?.parentModule || null;
      
      console.log(`  📦 Registrando módulo: ${moduleId} (tipo: ${moduleType})${parentModule ? ` bajo ${parentModule}` : ''}`);
      
      // Cargar config local del módulo si existe
      let localModuleConfig = null;
      try {
        const modPath = `../../modules/${moduleType}/config/authConfig.js`;
        const imported = await import(/* @vite-ignore */ modPath);
        localModuleConfig = imported?.default || imported?.[`${moduleType}AuthConfig`] || null;
      } catch (e) {
        // Es normal que algunos módulos no tengan authConfig local
      }

      // Mezclar configuraciones
      const mergedModuleForHierarchy = {
        ...moduleInstance,
        auth: {
          ...(moduleInstance.auth || {}),
          ...(localModuleConfig?.auth || {})
        },
        protectedRoutes: {
          ...(moduleInstance.protectedRoutes || {}),
          ...(localModuleConfig?.protectedRoutes || {})
        },
        publicRoutes: [
          ...new Set([...(moduleInstance.publicRoutes || []), ...(localModuleConfig?.publicRoutes || [])])
        ]
      };

      policyProcessor.registerModuleHierarchy(
        siteName,
        moduleType,
        mergedModuleForHierarchy,
        parentModule
      );
      
      // Registrar en moduleConfigs
      if (mergedModuleForHierarchy.auth || mergedModuleForHierarchy.protectedRoutes || mergedModuleForHierarchy.publicRoutes) {
        const moduleConfig = {
          moduleName: moduleType,
          instanceId: moduleId,
          auth: mergedModuleForHierarchy.auth,
          protectedRoutes: mergedModuleForHierarchy.protectedRoutes || {},
          publicRoutes: mergedModuleForHierarchy.publicRoutes || [],
          routePrefix: mergedModuleForHierarchy.routing?.routePrefix || null
        };
        policyProcessor.registerModule(moduleConfig);
      }
    }
  }
  
  // Debug: Mostrar jerarquía registrada
  const hierarchy = policyProcessor.getHierarchy(siteName);
  console.log('🌳 Jerarquía registrada:', JSON.stringify(hierarchy, null, 2));
}

/**
 * Registra las rutas de todos los módulos cargados
 */
async function registerModuleRoutes(initializer) {
  const allInstances = initializer.getAllModuleInstances();
  
  console.log(`📍 Módulos montados: ${Object.keys(allInstances).length}`);
  
  for (const [instanceId, instance] of Object.entries(allInstances)) {
    const moduleData = initializer.modules.get(instanceId);
    const moduleConfig = moduleData.config;
    
    console.log(`  - ${instanceId} (${moduleConfig.module || moduleConfig.name})`);
    
    if (moduleConfig.routing) {
      const { parentModule, routePrefix } = moduleConfig.routing;
      const basePath = parentModule 
        ? `/migratum/${parentModule}/${routePrefix}`
        : `/migratum/${routePrefix}`;
      console.log(`    └─ Rutas: ${basePath}/*`);
    }
  }
  
  console.log('✅ Todas las rutas de módulos están registradas');
}

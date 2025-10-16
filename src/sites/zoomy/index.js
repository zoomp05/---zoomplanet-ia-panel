/**
 * Site Zoomy - Configuración e Inicialización
 * 
 * Este archivo integra:
 * - Sistema de configuración modular (site.config.js)
 * - Sistema de inicialización de módulos (ModuleInitializer)
 * - Sistema de rutas dinámicas (routesRegistry)
 * 
 * Flujo de inicialización:
 * 1. Cargar site.config.js (define módulos e instancias)
 * 2. Inicializar ModuleInitializer
 * 3. ModuleInitializer carga módulos en orden correcto
 * 4. Cada módulo registra sus rutas usando registerModuleRoutes
 * 5. Site registra sus rutas base usando registerSiteRoutes
 */

import { registerSiteRoutes } from '../../zoom/routing/routesRegistry.js';
import { ModuleInitializer } from '../../zoom/modules/ModuleInitializer.js';
import { policyProcessor } from '../../zoom/security/policyProcessor.js';
import { routes } from './routes/index.js';
import siteConfig from './site.config.js'; // Usar la nueva configuración modular

// Instancia del inicializador de módulos
let moduleInitializer = null;

export default {
  name: "zoomy",
  
  // Nueva configuración modular del sitio
  config: siteConfig,
  
  // Lista de módulos raíz del site (primer nivel de jerarquía)
  // Estos módulos definen las rutas base: /zoomy/auth y /zoomy/admin
  // La jerarquía interna (ej: /zoomy/admin/auth) se construye dentro de cada módulo
  modules: ['auth', 'admin'],
  
  // Sin dependencias a nivel de site (se manejan a nivel de módulo)
  dependencies: [],
  
  /**
   * Función de instalación del sitio
   * Ahora usa ModuleInitializer para gestionar todo el ciclo de vida
   */
  install: async () => {
    console.log('🚀 ========================================');
    console.log('🚀 Inicializando Site: Zoomy');
    console.log('🚀 ========================================');
    
    try {
      // 0. Registrar jerarquía de módulos en PolicyProcessor
      console.log('📍 Paso 0: Registrando jerarquía de módulos...');
  await registerModuleHierarchyInPolicy();
      console.log('✅ Jerarquía de módulos registrada');
      
      // 1. Registrar rutas base del site
      console.log('📍 Paso 1: Registrando rutas base del site...');
      registerSiteRoutes("zoomy", routes);
      console.log('✅ Rutas base del site registradas');
      
      // 2. Crear instancia del ModuleInitializer
      console.log('📍 Paso 2: Creando ModuleInitializer...');
      moduleInitializer = new ModuleInitializer(siteConfig);
      console.log('✅ ModuleInitializer creado');
      
      // 3. Configurar listeners de eventos
      setupEventListeners(moduleInitializer);
      
      // 4. Inicializar todos los módulos
      console.log('📍 Paso 3: Inicializando módulos...');
      await moduleInitializer.initialize();
      console.log('✅ Módulos inicializados correctamente');
      
      // 5. Registrar rutas de módulos dinámicamente
      console.log('📍 Paso 4: Registrando rutas de módulos...');
      await registerModuleRoutes(moduleInitializer);
      console.log('✅ Rutas de módulos registradas');
      
      console.log('🎉 ========================================');
      console.log('🎉 Site Zoomy inicializado correctamente');
      console.log('🎉 ========================================');
      
      // Mostrar diagnóstico
      const diagnostics = moduleInitializer.getDiagnostics();
      console.log('📊 Diagnóstico del sistema:', diagnostics);
      
    } catch (error) {
      console.error('❌ Error inicializando site Zoomy:', error);
      throw error;
    }
  },
  
  /**
   * Función para obtener el inicializador de módulos
   * Útil para debugging y gestión manual
   */
  getModuleInitializer: () => {
    return moduleInitializer;
  },
  
  /**
   * Función para destruir el site
   * Limpia todos los módulos y recursos
   */
  destroy: async () => {
    console.log('🗑️  Destruyendo site Zoomy...');
    if (moduleInitializer) {
      await moduleInitializer.destroy();
      moduleInitializer = null;
    }
    console.log('✅ Site Zoomy destruido');
  }
};

/**
 * Configura listeners de eventos del ModuleInitializer
 */
function setupEventListeners(initializer) {
  // Eventos de inicialización general
  initializer.on('initialization:start', (data) => {
    console.log(`🔄 Iniciando inicialización de ${data.siteId}...`);
  });
  
  initializer.on('initialization:complete', (data) => {
    console.log(`✅ Inicialización completada: ${data.criticalCount} críticos, ${data.lazyCount} lazy`);
  });
  
  initializer.on('initialization:error', (data) => {
    console.error(`❌ Error en inicialización:`, data.error);
  });
  
  // Eventos de módulos individuales
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
  
  // Eventos de lazy loading
  initializer.on('module:lazy-loading', (data) => {
    console.log(`⏳ Cargando módulo lazy: ${data.instanceId}...`);
  });
  
  initializer.on('module:lazy-loaded', (data) => {
    console.log(`✅ Módulo lazy cargado: ${data.instanceId}`);
  });
  
  initializer.on('module:lazy-error', (data) => {
    console.error(`❌ Error cargando módulo lazy ${data.instanceId}:`, data.error);
  });
}

/**
 * Registra la jerarquía de módulos en el PolicyProcessor
 * Esto es crucial para que los hooks de redirección funcionen correctamente
 */
async function registerModuleHierarchyInPolicy() {
  const siteName = 'zoomy';
  
  // Registrar configuración de autenticación del site si existe
  if (siteConfig.auth) {
    policyProcessor.registerSiteAuthConfig(siteName, siteConfig.auth);
  }
  
  // Iterar sobre los módulos definidos en site.config.js
  if (siteConfig.modules && Array.isArray(siteConfig.modules)) {
    for (const moduleInstance of siteConfig.modules) {
      const moduleType = moduleInstance.module; // 'auth', 'admin', etc.
      const moduleId = moduleInstance.id; // 'auth-panel', 'admin-main', etc.
      const parentModule = moduleInstance.routing?.parentModule || null;
      
      console.log(`  📦 Registrando módulo: ${moduleId} (tipo: ${moduleType})${parentModule ? ` bajo ${parentModule}` : ''}`);
      
      // Registrar en la jerarquía usando el TIPO del módulo como nombre
      // Pero la configuración incluye el ID único
      // Cargar config local del módulo si existe (src/modules/{moduleType}/config/authConfig.js)
      let localModuleConfig = null;
      try {
        // Solo intentamos cargar authConfig cuando el tipo es el módulo dueño de auth rules (p.ej. admin, auth)
        const modPath = `../../modules/${moduleType}/config/authConfig.js`;
        const imported = await import(/* @vite-ignore */ modPath);
        localModuleConfig = imported?.default || imported?.[`${moduleType}AuthConfig`] || null;
      } catch (e) {
        // Es normal que algunos módulos no tengan authConfig local
      }

      // Mezclar auth y rutas de la instancia con el authConfig local (local tiene prioridad)
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
        moduleType, // Usar el tipo genérico para la jerarquía
        mergedModuleForHierarchy,
        parentModule
      );
      
      // Registrar también en moduleConfigs con el tipo del módulo
      if (mergedModuleForHierarchy.auth || mergedModuleForHierarchy.protectedRoutes || mergedModuleForHierarchy.publicRoutes) {
        const moduleConfig = {
          moduleName: moduleType, // Usar tipo genérico
          instanceId: moduleId, // ID único
          auth: mergedModuleForHierarchy.auth,
          protectedRoutes: mergedModuleForHierarchy.protectedRoutes || {},
          publicRoutes: mergedModuleForHierarchy.publicRoutes || []
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
 * 
 * Este método conecta el ModuleInitializer con el sistema de rutas existente
 * Cada módulo ya ha llamado a registerModuleRoutes en su método install()
 */
async function registerModuleRoutes(initializer) {
  const allInstances = initializer.getAllModuleInstances();
  
  console.log(`📍 Módulos montados: ${Object.keys(allInstances).length}`);
  
  // Iterar sobre cada instancia de módulo
  for (const [instanceId, instance] of Object.entries(allInstances)) {
    const moduleData = initializer.modules.get(instanceId);
    const moduleConfig = moduleData.config;
    
    console.log(`  - ${instanceId} (${moduleConfig.module || moduleConfig.name})`);
    
    // Las rutas ya fueron registradas durante el install() del módulo
    // Este log es solo para confirmación
    if (moduleConfig.routing) {
      const { parentModule, routePrefix } = moduleConfig.routing;
      const basePath = parentModule 
        ? `/zoomy/${parentModule}/${routePrefix}`
        : `/zoomy/${routePrefix}`;
      console.log(`    └─ Rutas: ${basePath}/*`);
    }
  }
  
  console.log('✅ Todas las rutas de módulos están registradas');
}


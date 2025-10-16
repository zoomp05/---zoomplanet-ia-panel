/**
 * ModuleInitializer
 * 
 * Sistema de inicialización de módulos que:
 * - Carga módulos en el orden correcto usando ModuleDependencyResolver
 * - Gestiona el ciclo de vida de los módulos (init, mount, unmount, destroy)
 * - Registra y ejecuta hooks en cada fase del ciclo de vida
 * - Gestiona lazy loading de módulos no críticos
 * - Provee contexto compartido entre módulos
 * - Maneja errores de inicialización con fallbacks
 */

import ModuleDependencyResolver from './ModuleDependencyResolver.js';
import SessionManager from '../session/SessionManager.js';
import configManager from '../config/ConfigManager.js';

/**
 * Estados del ciclo de vida de un módulo
 */
export const ModuleLifecycleState = {
  UNINITIALIZED: 'uninitialized',    // Módulo no inicializado
  INITIALIZING: 'initializing',      // En proceso de inicialización
  INITIALIZED: 'initialized',        // Inicializado pero no montado
  MOUNTING: 'mounting',              // En proceso de montaje
  MOUNTED: 'mounted',                // Montado y activo
  UNMOUNTING: 'unmounting',          // En proceso de desmontaje
  UNMOUNTED: 'unmounted',            // Desmontado pero puede volver a montarse
  DESTROYING: 'destroying',          // En proceso de destrucción
  DESTROYED: 'destroyed',            // Destruido completamente
  ERROR: 'error'                     // Error en alguna fase
};

/**
 * Clase que gestiona la inicialización y ciclo de vida de módulos
 */
export class ModuleInitializer {
  constructor(siteConfig) {
    this.siteConfig = siteConfig;
    this.siteId = siteConfig.siteId;
    
    console.log('🔍 DEBUG - ModuleInitializer constructor:', {
      siteId: siteConfig.siteId,
      hasModules: !!siteConfig.modules,
      modulesType: typeof siteConfig.modules,
      modulesLength: siteConfig.modules?.length,
      modulesSample: siteConfig.modules?.slice(0, 2)
    });
    
    // Servicios core
    this.dependencyResolver = new ModuleDependencyResolver(siteConfig);
    this.sessionManager = new SessionManager(siteConfig);
    this.configManager = configManager;
    
    // Estado de módulos
    this.modules = new Map(); // instanceId -> { config, instance, state, error }
    this.hooks = new Map();   // instanceId -> { hookName -> [callbacks] }
    this.contexts = new Map(); // instanceId -> shared context
    
    // Orden de carga
    this.loadOrder = [];
    this.lazyModules = [];
    
    // Estado de inicialización
    this.initialized = false;
    this.initializing = false;
    
    // Listeners de eventos
    this.listeners = new Map();
    
    // Cache de módulos cargados dinámicamente
    this.moduleCache = new Map();
  }

  /**
   * Inicializa todos los módulos críticos del site
   */
  async initialize() {
    if (this.initialized || this.initializing) {
      console.warn(`[ModuleInitializer] Site ${this.siteId} ya está inicializado o inicializando`);
      return;
    }

    this.initializing = true;
    this.emit('initialization:start', { siteId: this.siteId });

    try {
      // 1. Cargar configuraciones dinámicas desde DB
      console.log(`[ModuleInitializer] Cargando configuración del site ${this.siteId}...`);
      const dynamicSiteConfig = await this.configManager.loadSiteConfig(this.siteId);
      
      // Actualizar siteConfig con overrides de DB (preservando modules array)
      const originalModules = this.siteConfig.modules;
      this.siteConfig = { ...this.siteConfig, ...dynamicSiteConfig };
      // Si dynamicSiteConfig no tiene modules, restaurar el original
      if (!dynamicSiteConfig.modules) {
        this.siteConfig.modules = originalModules;
      }
      
      console.log('🔍 DEBUG - After DB merge:', {
        hasModules: !!this.siteConfig.modules,
        modulesLength: this.siteConfig.modules?.length
      });
      
      // Actualizar el dependencyResolver con el siteConfig actualizado
      this.dependencyResolver = new ModuleDependencyResolver(this.siteConfig);

      // 2. Resolver orden de carga de módulos
      console.log(`[ModuleInitializer] Resolviendo dependencias de módulos...`);
      this.loadOrder = this.dependencyResolver.resolveLoadOrder();
      
      // 3. Separar módulos críticos de lazy
      const { critical, lazy } = this.separateCriticalAndLazy();
      this.lazyModules = lazy;

      console.log(`[ModuleInitializer] Módulos críticos: ${critical.length}, Lazy: ${lazy.length}`);

      // 4. Inicializar módulos críticos
      await this.initializeModules(critical);

      // 5. Montar módulos críticos
      await this.mountModules(critical);

      // 6. Configurar lazy loading para módulos no críticos
      this.setupLazyLoading(lazy);

      this.initialized = true;
      this.initializing = false;
      
      this.emit('initialization:complete', { 
        siteId: this.siteId, 
        criticalCount: critical.length,
        lazyCount: lazy.length
      });

      console.log(`[ModuleInitializer] Site ${this.siteId} inicializado correctamente`);

    } catch (error) {
      this.initializing = false;
      this.emit('initialization:error', { siteId: this.siteId, error });
      console.error(`[ModuleInitializer] Error inicializando site ${this.siteId}:`, error);
      throw error;
    }
  }

  /**
   * Separa módulos críticos de lazy según configuración
   */
  separateCriticalAndLazy() {
    const critical = [];
    const lazy = [];

    for (const instanceId of this.loadOrder) {
      const moduleConfig = this.siteConfig.modules.find(m => m.instanceId === instanceId);
      if (!moduleConfig) continue;

      if (moduleConfig.lazy) {
        lazy.push(instanceId);
      } else {
        critical.push(instanceId);
      }
    }

    return { critical, lazy };
  }

  /**
   * Inicializa una lista de módulos
   */
  async initializeModules(moduleIds) {
    for (const instanceId of moduleIds) {
      try {
        await this.initializeModule(instanceId);
      } catch (error) {
        console.error(`[ModuleInitializer] Error inicializando ${instanceId}:`, error);
        
        // Marcar módulo con error pero continuar con los demás
        this.modules.set(instanceId, {
          config: this.getModuleConfig(instanceId),
          instance: null,
          state: ModuleLifecycleState.ERROR,
          error
        });
      }
    }
  }

  /**
   * Inicializa un módulo individual
   */
  async initializeModule(instanceId) {
    const moduleConfig = this.getModuleConfig(instanceId);
    if (!moduleConfig) {
      throw new Error(`Configuración no encontrada para módulo ${instanceId}`);
    }

    console.log(`[ModuleInitializer] Inicializando módulo ${instanceId}...`);

    // Cambiar estado
    this.setModuleState(instanceId, ModuleLifecycleState.INITIALIZING);
    this.emit('module:initializing', { instanceId, config: moduleConfig });

    try {
      // 1. Cargar configuración dinámica del módulo desde DB
      const dynamicModuleConfig = await this.configManager.loadModuleConfig(
        this.siteId,
        instanceId
      );

      // Merge de configuración
      const finalConfig = { ...moduleConfig, ...dynamicModuleConfig };

      // 2. Cargar código del módulo
      const moduleName = moduleConfig.module || moduleConfig.name;
      const ModuleClass = await this.loadModuleCode(moduleName, moduleConfig.version);

      // 3. Crear contexto para el módulo
      const context = this.createModuleContext(instanceId, finalConfig);

      // 4. Crear instancia del módulo
      const instance = new ModuleClass(finalConfig, context);

      // 5. Ejecutar hooks onBeforeInit
      await this.executeHooks(instanceId, 'onBeforeInit', { config: finalConfig, context });

      // 6. Llamar al método init del módulo si existe
      if (typeof instance.init === 'function') {
        await instance.init();
      }

      // 7. Llamar al método install del módulo para registrar rutas
      if (typeof instance.install === 'function') {
        const routingConfig = finalConfig.routing || {};
        const { parentModule = null, inheritLayouts = {} } = routingConfig;
        
        console.log(`[ModuleInitializer] Registrando rutas de ${instanceId}...`);
        await instance.install(this.siteId, parentModule, inheritLayouts);
      }

      // 8. Ejecutar hooks onAfterInit
      await this.executeHooks(instanceId, 'onAfterInit', { instance, config: finalConfig, context });

      // Guardar módulo inicializado
      this.modules.set(instanceId, {
        config: finalConfig,
        instance,
        state: ModuleLifecycleState.INITIALIZED,
        error: null
      });

      console.log(`[ModuleInitializer] Módulo ${instanceId} inicializado correctamente`);
      this.emit('module:initialized', { instanceId, instance });

    } catch (error) {
      this.setModuleState(instanceId, ModuleLifecycleState.ERROR);
      this.emit('module:error', { instanceId, error, phase: 'initialization' });
      throw error;
    }
  }

  /**
   * Monta una lista de módulos (los hace visibles/activos)
   */
  async mountModules(moduleIds) {
    for (const instanceId of moduleIds) {
      try {
        await this.mountModule(instanceId);
      } catch (error) {
        console.error(`[ModuleInitializer] Error montando ${instanceId}:`, error);
      }
    }
  }

  /**
   * Monta un módulo individual
   */
  async mountModule(instanceId) {
    const moduleData = this.modules.get(instanceId);
    if (!moduleData) {
      throw new Error(`Módulo ${instanceId} no está inicializado`);
    }

    if (moduleData.state !== ModuleLifecycleState.INITIALIZED) {
      console.warn(`[ModuleInitializer] Módulo ${instanceId} no está en estado INITIALIZED`);
      return;
    }

    console.log(`[ModuleInitializer] Montando módulo ${instanceId}...`);

    this.setModuleState(instanceId, ModuleLifecycleState.MOUNTING);
    this.emit('module:mounting', { instanceId });

    try {
      const { instance, config } = moduleData;

      // 1. Ejecutar hooks onBeforeMount
      await this.executeHooks(instanceId, 'onBeforeMount', { instance, config });

      // 2. Llamar al método mount del módulo si existe
      if (typeof instance.mount === 'function') {
        await instance.mount();
      }

      // 3. Ejecutar hooks onAfterMount
      await this.executeHooks(instanceId, 'onAfterMount', { instance, config });

      this.setModuleState(instanceId, ModuleLifecycleState.MOUNTED);
      this.emit('module:mounted', { instanceId });

      console.log(`[ModuleInitializer] Módulo ${instanceId} montado correctamente`);

    } catch (error) {
      this.setModuleState(instanceId, ModuleLifecycleState.ERROR);
      this.emit('module:error', { instanceId, error, phase: 'mounting' });
      throw error;
    }
  }

  /**
   * Desmonta un módulo (lo oculta/desactiva pero puede volver a montarse)
   */
  async unmountModule(instanceId) {
    const moduleData = this.modules.get(instanceId);
    if (!moduleData || moduleData.state !== ModuleLifecycleState.MOUNTED) {
      console.warn(`[ModuleInitializer] Módulo ${instanceId} no está montado`);
      return;
    }

    console.log(`[ModuleInitializer] Desmontando módulo ${instanceId}...`);

    this.setModuleState(instanceId, ModuleLifecycleState.UNMOUNTING);

    try {
      const { instance, config } = moduleData;

      // 1. Ejecutar hooks onBeforeUnmount
      await this.executeHooks(instanceId, 'onBeforeUnmount', { instance, config });

      // 2. Llamar al método unmount del módulo si existe
      if (typeof instance.unmount === 'function') {
        await instance.unmount();
      }

      // 3. Ejecutar hooks onAfterUnmount
      await this.executeHooks(instanceId, 'onAfterUnmount', { instance, config });

      this.setModuleState(instanceId, ModuleLifecycleState.UNMOUNTED);
      this.emit('module:unmounted', { instanceId });

      console.log(`[ModuleInitializer] Módulo ${instanceId} desmontado correctamente`);

    } catch (error) {
      this.setModuleState(instanceId, ModuleLifecycleState.ERROR);
      this.emit('module:error', { instanceId, error, phase: 'unmounting' });
      throw error;
    }
  }

  /**
   * Destruye un módulo completamente (libera recursos)
   */
  async destroyModule(instanceId) {
    const moduleData = this.modules.get(instanceId);
    if (!moduleData) {
      console.warn(`[ModuleInitializer] Módulo ${instanceId} no existe`);
      return;
    }

    console.log(`[ModuleInitializer] Destruyendo módulo ${instanceId}...`);

    this.setModuleState(instanceId, ModuleLifecycleState.DESTROYING);

    try {
      const { instance, config } = moduleData;

      // Si está montado, desmontarlo primero
      if (moduleData.state === ModuleLifecycleState.MOUNTED) {
        await this.unmountModule(instanceId);
      }

      // 1. Ejecutar hooks onBeforeDestroy
      await this.executeHooks(instanceId, 'onBeforeDestroy', { instance, config });

      // 2. Llamar al método destroy del módulo si existe
      if (typeof instance.destroy === 'function') {
        await instance.destroy();
      }

      // 3. Ejecutar hooks onAfterDestroy
      await this.executeHooks(instanceId, 'onAfterDestroy', { instance, config });

      // 4. Limpiar contexto y hooks
      this.contexts.delete(instanceId);
      this.hooks.delete(instanceId);

      this.setModuleState(instanceId, ModuleLifecycleState.DESTROYED);
      this.emit('module:destroyed', { instanceId });

      console.log(`[ModuleInitializer] Módulo ${instanceId} destruido correctamente`);

    } catch (error) {
      this.setModuleState(instanceId, ModuleLifecycleState.ERROR);
      this.emit('module:error', { instanceId, error, phase: 'destroying' });
      throw error;
    }
  }

  /**
   * Configura lazy loading para módulos no críticos
   */
  setupLazyLoading(lazyModuleIds) {
    console.log(`[ModuleInitializer] Configurando lazy loading para ${lazyModuleIds.length} módulos`);

    for (const instanceId of lazyModuleIds) {
      const moduleConfig = this.getModuleConfig(instanceId);
      
      // Registrar módulo lazy pero no cargarlo todavía
      this.modules.set(instanceId, {
        config: moduleConfig,
        instance: null,
        state: ModuleLifecycleState.UNINITIALIZED,
        error: null
      });

      // Configurar trigger de carga según configuración
      this.setupLazyLoadTrigger(instanceId, moduleConfig);
    }
  }

  /**
   * Configura el trigger para cargar un módulo lazy
   */
  setupLazyLoadTrigger(instanceId, moduleConfig) {
    // Por defecto, carga bajo demanda cuando se accede al módulo
    // Puede configurarse para cargar en idle, viewport, interacción, etc.
    
    const trigger = moduleConfig.lazyTrigger || 'manual';

    switch (trigger) {
      case 'idle':
        // Cargar cuando el navegador esté idle
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(() => this.loadLazyModule(instanceId));
        } else {
          setTimeout(() => this.loadLazyModule(instanceId), 2000);
        }
        break;

      case 'viewport':
        // Cargar cuando el elemento entre al viewport (requiere observer)
        // Implementación específica del módulo
        break;

      case 'interaction':
        // Cargar en la primera interacción del usuario
        const loadOnInteraction = () => {
          this.loadLazyModule(instanceId);
          document.removeEventListener('click', loadOnInteraction);
          document.removeEventListener('scroll', loadOnInteraction);
          document.removeEventListener('keydown', loadOnInteraction);
        };
        document.addEventListener('click', loadOnInteraction, { once: true });
        document.addEventListener('scroll', loadOnInteraction, { once: true });
        document.addEventListener('keydown', loadOnInteraction, { once: true });
        break;

      case 'manual':
      default:
        // No hacer nada, esperar a que se llame manualmente
        console.log(`[ModuleInitializer] Módulo ${instanceId} configurado para carga manual`);
        break;
    }
  }

  /**
   * Carga un módulo lazy bajo demanda
   */
  async loadLazyModule(instanceId) {
    const moduleData = this.modules.get(instanceId);
    
    if (!moduleData) {
      throw new Error(`Módulo lazy ${instanceId} no está registrado`);
    }

    if (moduleData.state !== ModuleLifecycleState.UNINITIALIZED) {
      console.warn(`[ModuleInitializer] Módulo ${instanceId} ya está cargado o cargando`);
      return moduleData.instance;
    }

    console.log(`[ModuleInitializer] Cargando módulo lazy ${instanceId}...`);
    this.emit('module:lazy-loading', { instanceId });

    try {
      // Inicializar y montar el módulo
      await this.initializeModule(instanceId);
      await this.mountModule(instanceId);

      this.emit('module:lazy-loaded', { instanceId });
      
      return this.modules.get(instanceId).instance;

    } catch (error) {
      console.error(`[ModuleInitializer] Error cargando módulo lazy ${instanceId}:`, error);
      this.emit('module:lazy-error', { instanceId, error });
      throw error;
    }
  }

  /**
   * Carga el código de un módulo dinámicamente
   */
  async loadModuleCode(moduleName, version) {
    const cacheKey = `${moduleName}@${version || 'latest'}`;

    // Verificar cache
    if (this.moduleCache.has(cacheKey)) {
      console.log(`[ModuleInitializer] Módulo ${cacheKey} cargado desde cache`);
      return this.moduleCache.get(cacheKey);
    }

    console.log(`[ModuleInitializer] Cargando código del módulo ${cacheKey}...`);

    try {
      // Construir ruta del módulo
      const modulePath = version 
        ? `/src/modules/${moduleName}/${version}/index.js`
        : `/src/modules/${moduleName}/index.js`;

      // Cargar módulo dinámicamente
      const module = await import(/* @vite-ignore */ modulePath);
      
      // El módulo debe exportar una clase default
      const ModuleClass = module.default;
      
      if (!ModuleClass) {
        throw new Error(`Módulo ${moduleName} no exporta una clase default`);
      }

      // Guardar en cache
      this.moduleCache.set(cacheKey, ModuleClass);

      return ModuleClass;

    } catch (error) {
      console.error(`[ModuleInitializer] Error cargando módulo ${cacheKey}:`, error);
      throw new Error(`No se pudo cargar el módulo ${cacheKey}: ${error.message}`);
    }
  }

  /**
   * Crea el contexto compartido para un módulo
   */
  createModuleContext(instanceId, config) {
    const context = {
      // Identificación
      siteId: this.siteId,
      instanceId: instanceId,
      moduleName: config.name,
      moduleVersion: config.version,

      // Servicios core
      sessionManager: this.sessionManager,
      configManager: this.configManager,
      moduleInitializer: this,

      // Métodos para interactuar con otros módulos
      getModule: (targetInstanceId) => this.getModuleInstance(targetInstanceId),
      getModules: () => this.getAllModuleInstances(),
      
      // Métodos para hooks
      registerHook: (hookName, callback) => this.registerHook(instanceId, hookName, callback),
      unregisterHook: (hookName, callback) => this.unregisterHook(instanceId, hookName, callback),
      
      // Eventos
      emit: (eventName, data) => this.emit(`module:${instanceId}:${eventName}`, data),
      on: (eventName, callback) => this.on(`module:${instanceId}:${eventName}`, callback),
      off: (eventName, callback) => this.off(`module:${instanceId}:${eventName}`, callback),

      // Almacenamiento compartido entre módulos
      shared: {}
    };

    this.contexts.set(instanceId, context);
    return context;
  }

  /**
   * Registra un hook para un módulo
   */
  registerHook(instanceId, hookName, callback) {
    if (!this.hooks.has(instanceId)) {
      this.hooks.set(instanceId, new Map());
    }

    const moduleHooks = this.hooks.get(instanceId);
    
    if (!moduleHooks.has(hookName)) {
      moduleHooks.set(hookName, []);
    }

    moduleHooks.get(hookName).push(callback);
    
    console.log(`[ModuleInitializer] Hook ${hookName} registrado para ${instanceId}`);
  }

  /**
   * Desregistra un hook
   */
  unregisterHook(instanceId, hookName, callback) {
    const moduleHooks = this.hooks.get(instanceId);
    if (!moduleHooks) return;

    const callbacks = moduleHooks.get(hookName);
    if (!callbacks) return;

    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
      console.log(`[ModuleInitializer] Hook ${hookName} desregistrado de ${instanceId}`);
    }
  }

  /**
   * Ejecuta todos los hooks registrados para un evento
   */
  async executeHooks(instanceId, hookName, data) {
    // 1. Ejecutar hooks del módulo específico
    const moduleHooks = this.hooks.get(instanceId);
    if (moduleHooks && moduleHooks.has(hookName)) {
      const callbacks = moduleHooks.get(hookName);
      for (const callback of callbacks) {
        try {
          await callback(data);
        } catch (error) {
          console.error(`[ModuleInitializer] Error en hook ${hookName} de ${instanceId}:`, error);
        }
      }
    }

    // 2. Ejecutar hooks definidos en la configuración del módulo
    const config = this.getModuleConfig(instanceId);
    if (config && config.hooks && typeof config.hooks[hookName] === 'function') {
      try {
        await config.hooks[hookName](data);
      } catch (error) {
        console.error(`[ModuleInitializer] Error en hook config ${hookName} de ${instanceId}:`, error);
      }
    }
  }

  /**
   * Obtiene la configuración de un módulo
   */
  getModuleConfig(instanceId) {
    return this.siteConfig.modules.find(m => m.instanceId === instanceId);
  }

  /**
   * Obtiene la instancia de un módulo
   */
  getModuleInstance(instanceId) {
    const moduleData = this.modules.get(instanceId);
    return moduleData ? moduleData.instance : null;
  }

  /**
   * Obtiene todas las instancias de módulos montados
   */
  getAllModuleInstances() {
    const instances = {};
    for (const [instanceId, moduleData] of this.modules) {
      if (moduleData.state === ModuleLifecycleState.MOUNTED) {
        instances[instanceId] = moduleData.instance;
      }
    }
    return instances;
  }

  /**
   * Obtiene el estado de un módulo
   */
  getModuleState(instanceId) {
    const moduleData = this.modules.get(instanceId);
    return moduleData ? moduleData.state : ModuleLifecycleState.UNINITIALIZED;
  }

  /**
   * Establece el estado de un módulo
   */
  setModuleState(instanceId, state) {
    const moduleData = this.modules.get(instanceId);
    if (moduleData) {
      moduleData.state = state;
      this.emit('module:state-changed', { instanceId, state });
    }
  }

  /**
   * Obtiene información de diagnóstico del sistema
   */
  getDiagnostics() {
    const diagnostics = {
      siteId: this.siteId,
      initialized: this.initialized,
      totalModules: this.modules.size,
      states: {},
      errors: []
    };

    // Contar módulos por estado
    for (const [instanceId, moduleData] of this.modules) {
      const state = moduleData.state;
      diagnostics.states[state] = (diagnostics.states[state] || 0) + 1;

      if (state === ModuleLifecycleState.ERROR) {
        diagnostics.errors.push({
          instanceId,
          error: moduleData.error?.message || 'Unknown error'
        });
      }
    }

    return diagnostics;
  }

  /**
   * Reinicia un módulo (destroy + init + mount)
   */
  async restartModule(instanceId) {
    console.log(`[ModuleInitializer] Reiniciando módulo ${instanceId}...`);
    
    await this.destroyModule(instanceId);
    await this.initializeModule(instanceId);
    await this.mountModule(instanceId);
    
    console.log(`[ModuleInitializer] Módulo ${instanceId} reiniciado correctamente`);
  }

  /**
   * Destruye todos los módulos y limpia recursos
   */
  async destroy() {
    console.log(`[ModuleInitializer] Destruyendo site ${this.siteId}...`);

    const moduleIds = Array.from(this.modules.keys());
    
    for (const instanceId of moduleIds) {
      try {
        await this.destroyModule(instanceId);
      } catch (error) {
        console.error(`[ModuleInitializer] Error destruyendo ${instanceId}:`, error);
      }
    }

    this.modules.clear();
    this.hooks.clear();
    this.contexts.clear();
    this.listeners.clear();
    this.moduleCache.clear();

    this.initialized = false;

    console.log(`[ModuleInitializer] Site ${this.siteId} destruido correctamente`);
  }

  /**
   * Sistema de eventos
   */
  on(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName).push(callback);
  }

  off(eventName, callback) {
    const callbacks = this.listeners.get(eventName);
    if (!callbacks) return;

    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  emit(eventName, data) {
    const callbacks = this.listeners.get(eventName);
    if (!callbacks) return;

    for (const callback of callbacks) {
      try {
        callback(data);
      } catch (error) {
        console.error(`[ModuleInitializer] Error en listener de ${eventName}:`, error);
      }
    }
  }
}

export default ModuleInitializer;

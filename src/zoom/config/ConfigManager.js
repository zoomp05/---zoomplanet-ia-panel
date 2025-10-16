/**
 * Config Manager
 * 
 * Gestiona configuraciones de sites y módulos de forma dinámica.
 * Permite modificar configuraciones desde el panel de administración
 * sin necesidad de editar archivos directamente.
 * 
 * Características:
 * - Carga configuraciones desde archivos (defaults)
 * - Carga configuraciones desde BD (overrides)
 * - Merge inteligente de configuraciones
 * - Hot reload de configuraciones
 * - Validación de cambios
 * - Historial de cambios
 * - Rollback de configuraciones
 */

class ConfigManager {
  constructor() {
    this.configs = new Map(); // Configuraciones en memoria
    this.defaultConfigs = new Map(); // Configuraciones por defecto (archivos)
    this.dbConfigs = new Map(); // Configuraciones de BD (overrides)
    this.listeners = new Map(); // Listeners de cambios
    this.history = []; // Historial de cambios
    
    console.log('⚙️ ConfigManager initialized');
  }
  
  // ============================================
  // CARGA DE CONFIGURACIONES
  // ============================================
  
  /**
   * Carga la configuración de un site
   * Primero carga el archivo default, luego aplica overrides de BD
   */
  async loadSiteConfig(siteId) {
    console.log(`📥 Loading site config: ${siteId}`);
    
    try {
      // 1. Cargar configuración por defecto desde archivo
      const defaultConfig = await this.loadDefaultSiteConfig(siteId);
      this.defaultConfigs.set(`site:${siteId}`, defaultConfig);
      
      // 2. Cargar overrides desde BD
      const dbConfig = await this.loadDbSiteConfig(siteId);
      this.dbConfigs.set(`site:${siteId}`, dbConfig);
      
      // 3. Mergear configuraciones
      const finalConfig = this.mergeConfigs(defaultConfig, dbConfig);
      this.configs.set(`site:${siteId}`, finalConfig);
      
      console.log(`✅ Site config loaded: ${siteId}`);
      
      return finalConfig;
    } catch (error) {
      console.error(`❌ Error loading site config ${siteId}:`, error);
      throw error;
    }
  }
  
  /**
   * Carga configuración por defecto desde archivo
   */
  async loadDefaultSiteConfig(siteId) {
    try {
      // Importar dinámicamente el archivo de configuración
      // Desde src/zoom/config/ ir a src/sites/
      const configModule = await import(`../../sites/${siteId}/site.config.js`);
      return configModule.default;
    } catch (error) {
      console.error(`Error loading default config for ${siteId}:`, error);
      throw new Error(`Site config file not found: sites/${siteId}/site.config.js`);
    }
  }
  
  /**
   * Carga overrides desde BD
   */
  async loadDbSiteConfig(siteId) {
    try {
      // En Node.js o si no hay API client configurado, retornar vacío
      if (typeof window === 'undefined' || !window.__API_CLIENT__) {
        console.warn('API client not configured, skipping DB config load');
        return {};
      }
      
      // Llamar a la API para obtener configuración de BD
      const response = await fetch(`/api/config/site/${siteId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          // No hay configuración en BD, usar solo defaults
          return {};
        }
        throw new Error(`Failed to load DB config: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.config || {};
    } catch (error) {
      console.warn(`Could not load DB config for ${siteId}:`, error.message);
      return {}; // Retornar vacío, usará solo defaults
    }
  }
  
  /**
   * Carga configuración de una instancia de módulo
   */
  async loadModuleConfig(siteId, instanceId) {
    console.log(`📥 Loading module config: ${siteId}/${instanceId}`);
    
    try {
      // 1. Obtener configuración del site
      const siteConfig = this.configs.get(`site:${siteId}`) || 
                         await this.loadSiteConfig(siteId);
      
      // 2. Encontrar la instancia del módulo
      const moduleInstance = siteConfig.modules.find(m => m.id === instanceId);
      
      if (!moduleInstance) {
        throw new Error(`Module instance ${instanceId} not found in site ${siteId}`);
      }
      
      // 3. Cargar configuración del archivo
      const defaultConfig = await this.loadDefaultModuleConfig(siteId, moduleInstance.config);
      this.defaultConfigs.set(`module:${siteId}:${instanceId}`, defaultConfig);
      
      // 4. Cargar overrides desde BD
      const dbConfig = await this.loadDbModuleConfig(siteId, instanceId);
      this.dbConfigs.set(`module:${siteId}:${instanceId}`, dbConfig);
      
      // 5. Mergear configuraciones
      const finalConfig = this.mergeConfigs(defaultConfig, dbConfig);
      this.configs.set(`module:${siteId}:${instanceId}`, finalConfig);
      
      console.log(`✅ Module config loaded: ${instanceId}`);
      
      return finalConfig;
    } catch (error) {
      console.error(`❌ Error loading module config ${instanceId}:`, error);
      throw error;
    }
  }
  
  /**
   * Carga configuración por defecto de módulo desde archivo
   */
  async loadDefaultModuleConfig(siteId, configPath) {
    try {
      // Resolver path relativo
      const fullPath = configPath.startsWith('./')
        ? `../sites/${siteId}/${configPath.substring(2)}`
        : configPath;
      
      const configModule = await import(/* @vite-ignore */ fullPath);
      return configModule.default;
    } catch (error) {
      console.error(`Error loading default module config from ${configPath}:`, error);
      throw error;
    }
  }
  
  /**
   * Carga overrides de módulo desde BD
   */
  async loadDbModuleConfig(siteId, instanceId) {
    try {
      if (typeof window === 'undefined' || !window.__API_CLIENT__) {
        return {};
      }
      
      const response = await fetch(`/api/config/site/${siteId}/module/${instanceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return {};
        }
        throw new Error(`Failed to load DB module config: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.config || {};
    } catch (error) {
      console.warn(`Could not load DB module config for ${instanceId}:`, error.message);
      return {};
    }
  }
  
  // ============================================
  // MERGE DE CONFIGURACIONES
  // ============================================
  
  /**
   * Mergea configuración por defecto con overrides de BD
   */
  mergeConfigs(defaultConfig, dbConfig) {
    if (!dbConfig || Object.keys(dbConfig).length === 0) {
      return defaultConfig;
    }
    
    return this.deepMerge(defaultConfig, dbConfig);
  }
  
  /**
   * Deep merge de objetos
   */
  deepMerge(target, source) {
    const output = { ...target };
    
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            output[key] = source[key];
          } else {
            output[key] = this.deepMerge(target[key], source[key]);
          }
        } else {
          output[key] = source[key];
        }
      });
    }
    
    return output;
  }
  
  /**
   * Verifica si es un objeto
   */
  isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }
  
  // ============================================
  // ACTUALIZACIÓN DE CONFIGURACIONES
  // ============================================
  
  /**
   * Actualiza configuración de un site en BD
   */
  async updateSiteConfig(siteId, updates, options = {}) {
    console.log(`💾 Updating site config: ${siteId}`);
    
    try {
      // 1. Validar cambios
      if (options.validate !== false) {
        await this.validateSiteConfigChanges(siteId, updates);
      }
      
      // 2. Obtener configuración actual
      const currentConfig = this.configs.get(`site:${siteId}`);
      
      // 3. Aplicar cambios
      const newDbConfig = this.deepMerge(
        this.dbConfigs.get(`site:${siteId}`) || {},
        updates
      );
      
      // 4. Guardar en BD
      await this.saveDbSiteConfig(siteId, newDbConfig);
      
      // 5. Actualizar en memoria
      this.dbConfigs.set(`site:${siteId}`, newDbConfig);
      const finalConfig = this.mergeConfigs(
        this.defaultConfigs.get(`site:${siteId}`),
        newDbConfig
      );
      this.configs.set(`site:${siteId}`, finalConfig);
      
      // 6. Registrar en historial
      this.addToHistory({
        type: 'site_config_update',
        siteId,
        changes: updates,
        previousConfig: currentConfig,
        newConfig: finalConfig,
        timestamp: new Date(),
        user: options.user
      });
      
      // 7. Notificar listeners
      this.emit(`config:site:${siteId}:updated`, {
        siteId,
        config: finalConfig,
        changes: updates
      });
      
      console.log(`✅ Site config updated: ${siteId}`);
      
      return finalConfig;
    } catch (error) {
      console.error(`❌ Error updating site config ${siteId}:`, error);
      throw error;
    }
  }
  
  /**
   * Actualiza configuración de un módulo en BD
   */
  async updateModuleConfig(siteId, instanceId, updates, options = {}) {
    console.log(`💾 Updating module config: ${siteId}/${instanceId}`);
    
    try {
      // 1. Validar cambios
      if (options.validate !== false) {
        await this.validateModuleConfigChanges(siteId, instanceId, updates);
      }
      
      // 2. Obtener configuración actual
      const currentConfig = this.configs.get(`module:${siteId}:${instanceId}`);
      
      // 3. Aplicar cambios
      const newDbConfig = this.deepMerge(
        this.dbConfigs.get(`module:${siteId}:${instanceId}`) || {},
        updates
      );
      
      // 4. Guardar en BD
      await this.saveDbModuleConfig(siteId, instanceId, newDbConfig);
      
      // 5. Actualizar en memoria
      this.dbConfigs.set(`module:${siteId}:${instanceId}`, newDbConfig);
      const finalConfig = this.mergeConfigs(
        this.defaultConfigs.get(`module:${siteId}:${instanceId}`),
        newDbConfig
      );
      this.configs.set(`module:${siteId}:${instanceId}`, finalConfig);
      
      // 6. Registrar en historial
      this.addToHistory({
        type: 'module_config_update',
        siteId,
        instanceId,
        changes: updates,
        previousConfig: currentConfig,
        newConfig: finalConfig,
        timestamp: new Date(),
        user: options.user
      });
      
      // 7. Notificar listeners
      this.emit(`config:module:${siteId}:${instanceId}:updated`, {
        siteId,
        instanceId,
        config: finalConfig,
        changes: updates
      });
      
      console.log(`✅ Module config updated: ${instanceId}`);
      
      return finalConfig;
    } catch (error) {
      console.error(`❌ Error updating module config ${instanceId}:`, error);
      throw error;
    }
  }
  
  /**
   * Guarda configuración de site en BD
   */
  async saveDbSiteConfig(siteId, config) {
    const response = await fetch(`/api/config/site/${siteId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify({ config })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save site config: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  /**
   * Guarda configuración de módulo en BD
   */
  async saveDbModuleConfig(siteId, instanceId, config) {
    const response = await fetch(`/api/config/site/${siteId}/module/${instanceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify({ config })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save module config: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  // ============================================
  // VALIDACIÓN
  // ============================================
  
  /**
   * Valida cambios en configuración de site
   */
  async validateSiteConfigChanges(siteId, updates) {
    // TODO: Implementar validaciones específicas
    // - Verificar que módulos existen
    // - Validar reglas de instancia
    // - Verificar dependencias
    // etc.
    
    return true;
  }
  
  /**
   * Valida cambios en configuración de módulo
   */
  async validateModuleConfigChanges(siteId, instanceId, updates) {
    // TODO: Implementar validaciones específicas
    // - Verificar que cambios son compatibles
    // - Validar permisos requeridos
    // - Verificar hooks existen
    // etc.
    
    return true;
  }
  
  // ============================================
  // CONSULTAS
  // ============================================
  
  /**
   * Obtiene configuración de un site
   */
  getSiteConfig(siteId) {
    return this.configs.get(`site:${siteId}`);
  }
  
  /**
   * Obtiene configuración de un módulo
   */
  getModuleConfig(siteId, instanceId) {
    return this.configs.get(`module:${siteId}:${instanceId}`);
  }
  
  /**
   * Obtiene configuración por defecto (sin overrides)
   */
  getDefaultConfig(key) {
    return this.defaultConfigs.get(key);
  }
  
  /**
   * Obtiene solo los overrides de BD
   */
  getDbConfig(key) {
    return this.dbConfigs.get(key);
  }
  
  /**
   * Verifica si hay overrides para una configuración
   */
  hasOverrides(key) {
    const dbConfig = this.dbConfigs.get(key);
    return dbConfig && Object.keys(dbConfig).length > 0;
  }
  
  // ============================================
  // HISTORIAL Y ROLLBACK
  // ============================================
  
  /**
   * Agrega entrada al historial
   */
  addToHistory(entry) {
    this.history.push(entry);
    
    // Limitar historial a 100 entradas
    if (this.history.length > 100) {
      this.history.shift();
    }
  }
  
  /**
   * Obtiene historial de cambios
   */
  getHistory(filters = {}) {
    let history = [...this.history];
    
    if (filters.type) {
      history = history.filter(e => e.type === filters.type);
    }
    
    if (filters.siteId) {
      history = history.filter(e => e.siteId === filters.siteId);
    }
    
    if (filters.instanceId) {
      history = history.filter(e => e.instanceId === filters.instanceId);
    }
    
    return history;
  }
  
  /**
   * Hace rollback a una configuración anterior
   */
  async rollback(historyIndex, options = {}) {
    const entry = this.history[historyIndex];
    
    if (!entry) {
      throw new Error('History entry not found');
    }
    
    console.log(`⏪ Rolling back to ${entry.timestamp}`);
    
    if (entry.type === 'site_config_update') {
      return await this.updateSiteConfig(
        entry.siteId,
        entry.previousConfig,
        { ...options, validate: false }
      );
    } else if (entry.type === 'module_config_update') {
      return await this.updateModuleConfig(
        entry.siteId,
        entry.instanceId,
        entry.previousConfig,
        { ...options, validate: false }
      );
    }
  }
  
  // ============================================
  // EVENTOS
  // ============================================
  
  /**
   * Registra listener de cambios
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }
  
  /**
   * Elimina listener
   */
  off(event, callback) {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }
  
  /**
   * Emite evento
   */
  emit(event, data) {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event);
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in config listener for ${event}:`, error);
      }
    });
  }
  
  // ============================================
  // UTILIDADES
  // ============================================
  
  /**
   * Obtiene token de autenticación
   */
  getAuthToken() {
    // Obtener de sessionManager o localStorage
    const session = localStorage.getItem('zoomy_panel_session') ||
                    localStorage.getItem('zoomy_admin_session');
    
    if (session) {
      try {
        const parsed = JSON.parse(session);
        return parsed.token || parsed.accessToken;
      } catch (error) {
        return null;
      }
    }
    
    return null;
  }
  
  /**
   * Recarga todas las configuraciones
   */
  async reloadAll() {
    console.log('🔄 Reloading all configs...');
    
    const siteIds = Array.from(this.configs.keys())
      .filter(k => k.startsWith('site:'))
      .map(k => k.replace('site:', ''));
    
    for (const siteId of siteIds) {
      await this.loadSiteConfig(siteId);
    }
    
    console.log('✅ All configs reloaded');
  }
  
  /**
   * Limpia caché de configuraciones
   */
  clearCache() {
    this.configs.clear();
    this.dbConfigs.clear();
    console.log('🗑️ Config cache cleared');
  }
}

// Singleton
const configManager = new ConfigManager();

export default configManager;

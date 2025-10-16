/**
 * Session Manager para Site Zoomy
 * 
 * Gestiona múltiples sesiones independientes y compartidas entre
 * diferentes instancias de Auth (admin, panel, compras).
 * 
 * Características:
 * - Sesiones aisladas o compartidas según configuración
 * - Herencia de sesiones entre instancias
 * - Sincronización automática
 * - Validación de expiración
 * - Limpieza automática
 */

class SessionManager {
  constructor(siteConfig) {
    this.siteConfig = siteConfig;
    this.sessions = new Map(); // Sesiones en memoria
    this.instanceRules = siteConfig.instanceRules;
    this.listeners = new Map(); // Event listeners
    
    // Inicializar listeners de storage para sincronización entre tabs
    this.initStorageListeners();
    
    // Inicializar timer de limpieza
    this.initCleanupTimer();
    
    console.log('🔐 SessionManager initialized for site:', siteConfig.name);
  }
  
  // ============================================
  // GESTIÓN DE SESIONES
  // ============================================
  
  /**
   * Crea una sesión para una instancia de Auth
   */
  createSession(instanceId, userData, context = {}) {
    console.log(`📝 Creating session for instance: ${instanceId}`);
    
    const authInstances = this.siteConfig.modules.filter(m => m.module === 'auth');
    const instance = authInstances.find(i => i.id === instanceId);
    
    if (!instance) {
      throw new Error(`Auth instance ${instanceId} not found`);
    }
    
    const sessionConfig = this.instanceRules.auth.sessions[instance.scope];
    
    if (!sessionConfig) {
      throw new Error(`Session config not found for scope: ${instance.scope}`);
    }
    
    const session = {
      instanceId,
      scope: instance.scope,
      user: userData,
      createdAt: Date.now(),
      expiresAt: Date.now() + (sessionConfig.timeout * 1000),
      lastActivity: Date.now(),
      storage: sessionConfig.storage,
      key: sessionConfig.key,
      sliding: sessionConfig.sliding,
      metadata: {
        ip: context.ip,
        userAgent: context.userAgent,
        device: context.device
      }
    };
    
    // Guardar en storage correspondiente
    this.saveSession(session);
    
    // Registrar en memoria
    this.sessions.set(instanceId, session);
    
    // Si esta sesión debe compartirse con otras instancias
    if (sessionConfig.shareWith && sessionConfig.shareWith.length > 0) {
      sessionConfig.shareWith.forEach(targetScope => {
        this.shareSession(instance.scope, targetScope, session);
      });
    }
    
    // Emitir evento
    this.emit('session:created', { instanceId, session });
    
    console.log(`✅ Session created: ${instanceId} (expires in ${sessionConfig.timeout}s)`);
    
    return session;
  }
  
  /**
   * Comparte una sesión con otra instancia
   */
  shareSession(sourceScope, targetScope, sourceSession) {
    console.log(`🔗 Sharing session from ${sourceScope} to ${targetScope}`);
    
    const targetConfig = this.instanceRules.auth.sessions[targetScope];
    
    if (!targetConfig) {
      console.warn(`Target scope ${targetScope} not found, skipping share`);
      return;
    }
    
    // Verificar si el target puede heredar del source
    if (targetConfig.inheritFrom !== sourceScope) {
      console.warn(`Target ${targetScope} cannot inherit from ${sourceScope}`);
      return;
    }
    
    // Crear sesión compartida
    const sharedSession = {
      ...sourceSession,
      scope: targetScope,
      key: targetConfig.key,
      storage: targetConfig.storage,
      inheritedFrom: sourceScope,
      createdAt: Date.now(),
      expiresAt: Date.now() + (targetConfig.timeout * 1000)
    };
    
    // Guardar la sesión compartida
    this.saveSession(sharedSession);
    
    console.log(`✅ Session shared: ${targetScope}`);
  }
  
  /**
   * Guarda sesión en el storage correspondiente
   */
  saveSession(session) {
    const storage = this.getStorage(session.storage);
    
    try {
      storage.setItem(session.key, JSON.stringify(session));
    } catch (error) {
      console.error(`Error saving session ${session.key}:`, error);
      throw new Error('Failed to save session');
    }
  }
  
  /**
   * Obtiene sesión de una instancia
   */
  getSession(instanceId) {
    // 1. Buscar en memoria
    if (this.sessions.has(instanceId)) {
      const session = this.sessions.get(instanceId);
      
      // Verificar expiración
      if (this.isSessionValid(session)) {
        // Si es sliding session, actualizar actividad
        if (session.sliding) {
          this.updateSessionActivity(session);
        }
        return session;
      } else {
        // Sesión expirada
        this.destroySession(instanceId, 'expired');
        return null;
      }
    }
    
    // 2. Buscar en storage
    const instance = this.siteConfig.modules.find(m => m.id === instanceId);
    if (!instance || instance.module !== 'auth') return null;
    
    const sessionConfig = this.instanceRules.auth.sessions[instance.scope];
    if (!sessionConfig) return null;
    
    const storage = this.getStorage(sessionConfig.storage);
    const sessionData = storage.getItem(sessionConfig.key);
    
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        
        if (this.isSessionValid(session)) {
          // Cargar en memoria
          this.sessions.set(instanceId, session);
          
          // Actualizar actividad si es sliding
          if (session.sliding) {
            this.updateSessionActivity(session);
          }
          
          return session;
        } else {
          // Sesión expirada
          this.destroySession(instanceId, 'expired');
          return null;
        }
      } catch (error) {
        console.error('Error parsing session:', error);
        storage.removeItem(sessionConfig.key);
        return null;
      }
    }
    
    return null;
  }
  
  /**
   * Actualiza la actividad de una sesión (para sliding sessions)
   */
  updateSessionActivity(session) {
    const now = Date.now();
    session.lastActivity = now;
    
    // Extender expiración si es sliding
    if (session.sliding) {
      const sessionConfig = this.instanceRules.auth.sessions[session.scope];
      session.expiresAt = now + (sessionConfig.timeout * 1000);
      
      // Guardar cambios
      this.saveSession(session);
    }
  }
  
  /**
   * Verifica si una sesión es válida
   */
  isSessionValid(session) {
    if (!session) return false;
    
    const now = Date.now();
    
    // Verificar expiración
    if (session.expiresAt < now) {
      return false;
    }
    
    // Si la sesión fue heredada, verificar que la sesión padre siga activa
    if (session.inheritedFrom) {
      const parentConfig = this.instanceRules.auth.sessions[session.inheritedFrom];
      if (parentConfig) {
        const storage = this.getStorage(parentConfig.storage);
        const parentSessionData = storage.getItem(parentConfig.key);
        
        if (!parentSessionData) {
          console.warn(`Parent session ${session.inheritedFrom} not found`);
          return false;
        }
        
        try {
          const parentSession = JSON.parse(parentSessionData);
          if (parentSession.expiresAt < now) {
            console.warn(`Parent session ${session.inheritedFrom} expired`);
            return false;
          }
        } catch (error) {
          console.error('Error validating parent session:', error);
          return false;
        }
      }
    }
    
    return true;
  }
  
  /**
   * Destruye una sesión
   */
  destroySession(instanceId, reason = 'manual') {
    console.log(`🗑️ Destroying session: ${instanceId} (reason: ${reason})`);
    
    const instance = this.siteConfig.modules.find(m => m.id === instanceId);
    if (!instance || instance.module !== 'auth') return;
    
    const sessionConfig = this.instanceRules.auth.sessions[instance.scope];
    if (!sessionConfig) return;
    
    // Obtener sesión antes de destruir (para el evento)
    const session = this.sessions.get(instanceId);
    
    // Eliminar de storage
    const storage = this.getStorage(sessionConfig.storage);
    storage.removeItem(sessionConfig.key);
    
    // Eliminar de memoria
    this.sessions.delete(instanceId);
    
    // Emitir evento
    this.emit('session:destroyed', { instanceId, session, reason });
    
    console.log(`✅ Session destroyed: ${instanceId}`);
  }
  
  /**
   * Destruye todas las sesiones del site
   */
  destroyAllSessions(reason = 'logout') {
    console.log(`🗑️ Destroying all sessions (reason: ${reason})`);
    
    const authInstances = this.siteConfig.modules.filter(m => m.module === 'auth');
    
    authInstances.forEach(instance => {
      this.destroySession(instance.id, reason);
    });
    
    console.log('✅ All sessions destroyed');
  }
  
  /**
   * Sincroniza sesiones según reglas de compartición
   */
  syncSessions() {
    console.log('🔄 Syncing sessions...');
    
    const authInstances = this.siteConfig.modules.filter(m => m.module === 'auth');
    
    authInstances.forEach(instance => {
      const session = this.getSession(instance.id);
      const sessionConfig = this.instanceRules.auth.sessions[instance.scope];
      
      if (session && sessionConfig && sessionConfig.shareWith) {
        sessionConfig.shareWith.forEach(targetScope => {
          this.shareSession(instance.scope, targetScope, session);
        });
      }
    });
    
    console.log('✅ Sessions synced');
  }
  
  // ============================================
  // UTILIDADES
  // ============================================
  
  /**
   * Obtiene el storage correspondiente
   */
  getStorage(storageType) {
    // En Node.js, usar un Map en memoria
    if (typeof window === 'undefined') {
      if (!this._mockStorage) {
        this._mockStorage = new Map();
      }
      return {
        getItem: (key) => this._mockStorage.get(key) || null,
        setItem: (key, value) => this._mockStorage.set(key, value),
        removeItem: (key) => this._mockStorage.delete(key),
        clear: () => this._mockStorage.clear()
      };
    }
    
    return storageType === 'localStorage' ? localStorage : sessionStorage;
  }
  
  /**
   * Obtiene todas las sesiones activas
   */
  getActiveSessions() {
    const activeSessions = [];
    
    const authInstances = this.siteConfig.modules.filter(m => m.module === 'auth');
    
    authInstances.forEach(instance => {
      const session = this.getSession(instance.id);
      if (session) {
        activeSessions.push({
          instanceId: instance.id,
          scope: instance.scope,
          user: session.user,
          expiresAt: session.expiresAt,
          timeRemaining: session.expiresAt - Date.now()
        });
      }
    });
    
    return activeSessions;
  }
  
  /**
   * Verifica si un usuario tiene sesión activa en algún scope
   */
  hasActiveSession(userId) {
    const sessions = this.getActiveSessions();
    return sessions.some(s => s.user.id === userId);
  }
  
  /**
   * Obtiene sesión por scope
   */
  getSessionByScope(scope) {
    const instance = this.siteConfig.modules.find(
      m => m.module === 'auth' && m.scope === scope
    );
    
    if (!instance) return null;
    
    return this.getSession(instance.id);
  }
  
  // ============================================
  // EVENTOS
  // ============================================
  
  /**
   * Registra un listener de eventos
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }
  
  /**
   * Elimina un listener de eventos
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
   * Emite un evento
   */
  emit(event, data) {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event);
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }
  
  // ============================================
  // INICIALIZACIÓN
  // ============================================
  
  /**
   * Inicializa listeners de storage para sincronización entre tabs
   */
  initStorageListeners() {
    // Solo inicializar en entorno de navegador
    if (typeof window === 'undefined') {
      console.log('⚠️  SessionManager: Skipping storage listeners (not in browser)');
      return;
    }
    
    window.addEventListener('storage', (event) => {
      if (!event.key) return;
      
      // Detectar cambios en sesiones
      const authInstances = this.siteConfig.modules.filter(m => m.module === 'auth');
      
      authInstances.forEach(instance => {
        const sessionConfig = this.instanceRules.auth.sessions[instance.scope];
        
        if (event.key === sessionConfig.key) {
          if (event.newValue) {
            // Sesión actualizada/creada en otro tab
            try {
              const session = JSON.parse(event.newValue);
              this.sessions.set(instance.id, session);
              this.emit('session:updated', { instanceId: instance.id, session });
            } catch (error) {
              console.error('Error syncing session from storage:', error);
            }
          } else {
            // Sesión eliminada en otro tab
            this.sessions.delete(instance.id);
            this.emit('session:destroyed', { instanceId: instance.id, reason: 'external' });
          }
        }
      });
    });
  }
  
  /**
   * Inicializa timer de limpieza automática de sesiones expiradas
   */
  initCleanupTimer() {
    // Limpiar sesiones expiradas cada minuto
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions();
    }, 60000); // 1 minuto
  }
  
  /**
   * Limpia sesiones expiradas
   */
  cleanupExpiredSessions() {
    const authInstances = this.siteConfig.modules.filter(m => m.module === 'auth');
    
    authInstances.forEach(instance => {
      const session = this.getSession(instance.id);
      // getSession ya maneja la expiración y limpieza
    });
  }
  
  /**
   * Destruye el SessionManager
   */
  destroy() {
    console.log('🗑️ Destroying SessionManager');
    
    // Limpiar interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    // Limpiar listeners
    this.listeners.clear();
    
    // NO destruir sesiones automáticamente
    // Las sesiones persisten en storage
  }
}

export default SessionManager;

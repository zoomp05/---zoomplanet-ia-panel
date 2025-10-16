/**
 * Configuración de Auth para Módulo de Compras
 * 
 * Esta instancia de Auth está configurada con:
 * - Sesión temporal (sessionStorage)
 * - Hereda sesión del panel si existe
 * - Timeout corto (30 minutos)
 * - Lazy load (solo se carga al acceder a compras)
 */

export default {
  // ============================================
  // IDENTIFICACIÓN DE LA INSTANCIA
  // ============================================
  instanceId: 'auth-compras',
  module: 'auth',
  scope: 'compras',
  
  // ============================================
  // CONFIGURACIÓN ESPECÍFICA
  // ============================================
  config: {
    // ----------------------------------------
    // Características de autenticación
    // ----------------------------------------
    enableEmailVerification: false, // Hereda del panel
    enablePasswordReset: false, // Se hace desde panel
    enableMFA: false,
    enableBiometric: false,
    enableSSO: true, // Usa SSO con panel
    
    // ----------------------------------------
    // Proveedores de autenticación
    // ----------------------------------------
    providers: ['sso'], // Solo SSO (hereda sesión de panel)
    
    // ----------------------------------------
    // Configuración de sesión
    // ----------------------------------------
    session: {
      storage: 'sessionStorage', // Solo dura mientras la pestaña está abierta
      key: 'zoomy_compras_session',
      timeout: 1800, // 30 minutos
      sliding: true,
      secure: true,
      sameSite: 'lax',
      httpOnly: false,
      domain: '.zoomy.com',
      path: '/compras',
      inheritFrom: 'panel', // Heredar sesión del panel
      requireParentSession: true // Requiere que panel esté autenticado
    },
    
    // ----------------------------------------
    // Configuración de tokens JWT
    // ----------------------------------------
    tokens: {
      accessTokenExpiry: '30m',
      refreshTokenExpiry: '1d',
      algorithm: 'HS256',
      issuer: 'zoomy-auth-compras',
      audience: 'zoomy-compras-api',
      inheritFromScope: 'panel' // Usar token del panel
    },
    
    // ----------------------------------------
    // Validaciones (heredadas del panel)
    // ----------------------------------------
    validation: {
      // Hereda validaciones del panel
      inherit: true
    },
    
    // ----------------------------------------
    // Permisos requeridos
    // ----------------------------------------
    permissions: {
      minRole: 'user',
      requiredRoles: ['user', 'premium'],
      capabilities: ['view_products', 'make_purchases']
    },
    
    // ----------------------------------------
    // Configuración de API
    // ----------------------------------------
    api: {
      baseUrl: '/api/compras/auth',
      endpoints: {
        validate: '/validate', // Validar sesión heredada
        refresh: '/refresh'
      },
      timeout: 5000,
      retries: 2
    },
    
    // ----------------------------------------
    // Rutas de esta instancia
    // ----------------------------------------
    routes: {
      prefix: '/compras/auth',
      validate: '/compras/auth/validate',
      // No tiene login/register propios, usa los del panel
    },
    
    // ----------------------------------------
    // Componentes personalizados
    // ----------------------------------------
    components: {
      SessionExpiredModal: './components/ComprasSessionExpiredModal.jsx',
      Layout: './layouts/ComprasLayout.jsx'
    },
    
    // ----------------------------------------
    // Hooks específicos de esta instancia
    // ----------------------------------------
    hooks: {
      /**
       * Ejecutado al inicializar el módulo de compras
       */
      onInit: async (context) => {
        console.log('🛒 Initializing compras auth...');
        
        // Verificar si hay sesión del panel
        const panelSession = localStorage.getItem('zoomy_panel_session');
        
        if (!panelSession) {
          console.warn('⚠️ No panel session found. Redirecting to login...');
          window.location.href = '/panel/auth/login?redirect=/compras';
          return null;
        }
        
        // Validar sesión del panel
        try {
          const session = JSON.parse(panelSession);
          
          // Verificar que no haya expirado
          if (session.expiresAt < Date.now()) {
            console.warn('⚠️ Panel session expired');
            localStorage.removeItem('zoomy_panel_session');
            window.location.href = '/panel/auth/login?redirect=/compras';
            return null;
          }
          
          // Crear sesión de compras heredada
          const comprasSession = {
            ...session,
            scope: 'compras',
            key: 'zoomy_compras_session',
            inheritedFrom: 'panel',
            createdAt: Date.now(),
            expiresAt: Date.now() + (1800 * 1000) // 30 min
          };
          
          sessionStorage.setItem('zoomy_compras_session', JSON.stringify(comprasSession));
          
          console.log('✅ Compras session inherited from panel');
          
          return comprasSession;
        } catch (error) {
          console.error('❌ Error inheriting session:', error);
          window.location.href = '/panel/auth/login?redirect=/compras';
          return null;
        }
      },
      
      /**
       * Ejecutado al validar sesión
       */
      onValidate: async (session, context) => {
        console.log('🔍 Validating compras session...');
        
        // Verificar que la sesión del panel siga activa
        const panelSession = localStorage.getItem('zoomy_panel_session');
        
        if (!panelSession) {
          throw new Error('Panel session lost. Please login again.');
        }
        
        // Verificar permisos para compras
        const user = session.user;
        const hasPermission = user.capabilities?.includes('make_purchases');
        
        if (!hasPermission) {
          throw new Error('Usuario no tiene permisos para realizar compras');
        }
        
        return session;
      },
      
      /**
       * Ejecutado cuando la sesión expira
       */
      onSessionExpire: async (session, context) => {
        console.warn('⏱️ Compras session expired');
        
        // Limpiar sesión de compras
        sessionStorage.removeItem('zoomy_compras_session');
        
        // Verificar si la sesión del panel sigue activa
        const panelSession = localStorage.getItem('zoomy_panel_session');
        
        if (panelSession) {
          // Si panel sigue activo, ofrecer renovar
          const shouldRenew = confirm('Tu sesión de compras expiró. ¿Deseas continuar?');
          
          if (shouldRenew) {
            // Re-inicializar sesión de compras
            await this.onInit(context);
          } else {
            window.location.href = '/panel';
          }
        } else {
          // Panel también expiró, redirigir a login
          window.location.href = '/panel/auth/login?redirect=/compras';
        }
      },
      
      /**
       * Ejecutado al cerrar la pestaña/navegador
       */
      onUnload: async (context) => {
        console.log('👋 Compras module unloading...');
        
        // Limpiar sesión temporal
        sessionStorage.removeItem('zoomy_compras_session');
        
        // NO limpiar sesión del panel (sigue activa)
      }
    },
    
    // ----------------------------------------
    // Submódulos (hereda del panel)
    // ----------------------------------------
    submodules: {
      // Compras no tiene submódulos propios
      // Usa los del panel mediante herencia
    },
    
    // ----------------------------------------
    // Configuración de seguridad
    // ----------------------------------------
    security: {
      enableRateLimiting: true,
      maxRequestsPerMinute: 30,
      requireParentSession: true, // Obligatorio tener sesión del panel
      validateParentSession: true, // Validar en cada request
      sessionConcurrency: 1 // Solo una sesión de compras por usuario
    },
    
    // ----------------------------------------
    // Notificaciones
    // ----------------------------------------
    notifications: {
      onSessionExpire: {
        inApp: true, // Modal en la app
        email: false,
        push: false
      }
    },
    
    // ----------------------------------------
    // Configuración de herencia de sesión
    // ----------------------------------------
    inheritance: {
      parentScope: 'panel',
      syncWithParent: true, // Sincronizar cambios con panel
      expireWithParent: true, // Expirar si panel expira
      shareUserData: true, // Compartir datos del usuario
      sharePermissions: true, // Compartir permisos
      
      // Qué hacer si la sesión del panel cambia
      onParentSessionChange: 'reload', // reload | ignore | logout
      
      // Qué hacer si el usuario hace logout en panel
      onParentLogout: 'logout' // logout | keep | ask
    }
  }
};

/**
 * Configuración de Auth para Administradores
 * 
 * Esta instancia de Auth está configurada con:
 * - Seguridad máxima (MFA, contraseñas fuertes)
 * - Sesión de 1 hora sin renovación automática
 * - Autenticación con LDAP
 * - Permisos de administrador requeridos
 */

export default {
  // ============================================
  // IDENTIFICACIÓN DE LA INSTANCIA
  // ============================================
  instanceId: 'auth-admin',
  module: 'auth',
  scope: 'admin',
  
  // ============================================
  // CONFIGURACIÓN ESPECÍFICA
  // ============================================
  config: {
    // ----------------------------------------
    // Características de autenticación
    // ----------------------------------------
    enableEmailVerification: true,
    enablePasswordReset: true,
    enableMFA: true, // Multi-Factor Authentication obligatorio para admins
    enableBiometric: false,
    enableSSO: true,
    
    // ----------------------------------------
    // Proveedores de autenticación
    // ----------------------------------------
    providers: ['email', 'ldap'], // Admin usa LDAP corporativo
    
    // ----------------------------------------
    // Configuración de sesión
    // ----------------------------------------
    session: {
      storage: 'localStorage',
      key: 'zoomy_admin_session',
      timeout: 3600, // 1 hora
      sliding: false, // NO renovar automáticamente - requiere re-login
      secure: true,
      sameSite: 'strict',
      httpOnly: false, // Frontend necesita acceder
      domain: '.zoomy.com',
      path: '/admin'
    },
    
    // ----------------------------------------
    // Configuración de tokens JWT
    // ----------------------------------------
    tokens: {
      accessTokenExpiry: '1h',
      refreshTokenExpiry: '7d',
      algorithm: 'RS256', // Algoritmo más seguro para admin
      issuer: 'zoomy-auth-admin',
      audience: 'zoomy-admin-api'
    },
    
    // ----------------------------------------
    // Validaciones de contraseña (más estrictas)
    // ----------------------------------------
    validation: {
      passwordMinLength: 12,
      passwordMaxLength: 128,
      requireSpecialChars: true,
      requireNumbers: true,
      requireUppercase: true,
      requireLowercase: true,
      preventCommonPasswords: true,
      preventPasswordReuse: 5, // No reutilizar últimas 5 contraseñas
      passwordExpiryDays: 90, // Cambiar contraseña cada 90 días
    },
    
    // ----------------------------------------
    // Permisos requeridos
    // ----------------------------------------
    permissions: {
      minRole: 'admin',
      requiredRoles: ['admin', 'superadmin'],
      capabilities: [
        'manage_users',
        'manage_settings',
        'manage_modules',
        'view_analytics',
        'manage_security'
      ]
    },
    
    // ----------------------------------------
    // Configuración de API
    // ----------------------------------------
    api: {
      baseUrl: '/api/admin/auth',
      endpoints: {
        login: '/login',
        logout: '/logout',
        refresh: '/refresh',
        verify: '/verify',
        mfa: '/mfa/verify',
        ldap: '/ldap/authenticate'
      },
      timeout: 10000,
      retries: 2
    },
    
    // ----------------------------------------
    // Rutas de esta instancia
    // ----------------------------------------
    routes: {
      prefix: '/admin/auth',
      login: '/admin/auth/login',
      register: false, // NO permitir auto-registro de admins
      forgotPassword: '/admin/auth/forgot-password',
      resetPassword: '/admin/auth/reset-password',
      mfa: '/admin/auth/mfa',
      profile: '/admin/auth/profile'
    },
    
    // ----------------------------------------
    // Componentes personalizados
    // ----------------------------------------
    components: {
      LoginForm: './components/AdminLoginForm.jsx',
      MFAForm: './components/AdminMFAForm.jsx',
      Layout: './layouts/AdminAuthLayout.jsx'
    },
    
    // ----------------------------------------
    // Hooks específicos de esta instancia
    // ----------------------------------------
    hooks: {
      /**
       * Ejecutado después de login exitoso
       */
      onLogin: async (user, context) => {
        console.log('🔐 Admin logged in:', user.email);
        
        // Registrar en audit log
        await context.auditLog?.create({
          action: 'admin_login',
          userId: user.id,
          email: user.email,
          ip: context.ip,
          userAgent: context.userAgent,
          timestamp: new Date(),
          success: true
        });
        
        // Cargar permisos del admin
        const permissions = await context.services.PermissionService.loadUserPermissions(user.id);
        
        // Verificar que tenga permisos de admin
        if (!permissions.includes('admin')) {
          throw new Error('Usuario no tiene permisos de administrador');
        }
        
        return {
          ...user,
          permissions
        };
      },
      
      /**
       * Ejecutado después de logout
       */
      onLogout: async (user, context) => {
        console.log('🔓 Admin logged out:', user.email);
        
        // Registrar logout en audit log
        await context.auditLog?.create({
          action: 'admin_logout',
          userId: user.id,
          email: user.email,
          timestamp: new Date()
        });
        
        // Limpiar sesiones admin en todos los tabs
        localStorage.removeItem('zoomy_admin_session');
        sessionStorage.clear();
        
        // Invalidar tokens en el servidor
        await context.api.post('/api/admin/auth/invalidate', {
          userId: user.id
        });
      },
      
      /**
       * Ejecutado si el login falla
       */
      onLoginFailed: async (email, error, context) => {
        console.error('❌ Admin login failed:', email, error);
        
        // Registrar intento fallido
        await context.auditLog?.create({
          action: 'admin_login_failed',
          email,
          error: error.message,
          ip: context.ip,
          timestamp: new Date(),
          success: false
        });
        
        // Incrementar contador de intentos fallidos
        const attempts = await context.redis?.incr(`login_attempts:${email}`);
        
        // Bloquear después de 3 intentos
        if (attempts >= 3) {
          await context.redis?.setex(`login_blocked:${email}`, 900, 'true'); // 15 min
          throw new Error('Cuenta bloqueada temporalmente por múltiples intentos fallidos');
        }
      },
      
      /**
       * Ejecutado cuando la sesión expira
       */
      onSessionExpire: async (user, context) => {
        console.warn('⏱️ Admin session expired:', user.email);
        
        // Registrar expiración
        await context.auditLog?.create({
          action: 'admin_session_expired',
          userId: user.id,
          timestamp: new Date()
        });
        
        // Limpiar storage
        localStorage.removeItem('zoomy_admin_session');
      }
    },
    
    // ----------------------------------------
    // Submódulos que esta instancia necesita
    // ----------------------------------------
    submodules: {
      'role': {
        instanceId: 'role-admin',
        required: true,
        config: {
          defaultRole: null, // No hay rol por defecto, debe asignarse manualmente
          allowedRoles: ['admin', 'superadmin', 'moderator'],
          roleHierarchy: {
            'superadmin': 100,
            'admin': 80,
            'moderator': 60
          }
        }
      },
      'account': {
        instanceId: 'account-admin',
        required: true,
        config: {
          accountType: 'admin',
          autoCreate: false, // No crear automáticamente
          features: ['full_access', 'audit_log', 'user_management']
        }
      },
      'audit': {
        instanceId: 'audit-admin',
        required: true,
        config: {
          logAllActions: true,
          retentionDays: 365
        }
      }
    },
    
    // ----------------------------------------
    // Configuración de seguridad adicional
    // ----------------------------------------
    security: {
      enableRateLimiting: true,
      maxLoginAttempts: 3,
      lockoutDuration: 900, // 15 minutos
      enableIPWhitelist: false,
      enableDeviceFingerprinting: true,
      requireEmailConfirmation: true,
      enable2FA: true,
      sessionConcurrency: 1 // Solo una sesión activa por admin
    },
    
    // ----------------------------------------
    // Notificaciones
    // ----------------------------------------
    notifications: {
      onLogin: {
        email: true,
        push: false,
        sms: false
      },
      onLoginFromNewDevice: {
        email: true,
        push: false,
        sms: true
      },
      onPasswordChange: {
        email: true,
        push: false,
        sms: true
      }
    }
  }
};

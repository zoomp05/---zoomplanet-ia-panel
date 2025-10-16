/**
 * Configuración de Auth para Panel de Usuarios
 * 
 * Esta instancia de Auth está configurada con:
 * - Seguridad estándar para usuarios
 * - Sesión de 2 horas con renovación automática
 * - Soporte para OAuth (Google, Facebook)
 * - Auto-registro habilitado
 * - Compartir sesión con módulo de compras
 */

export default {
  // ============================================
  // IDENTIFICACIÓN DE LA INSTANCIA
  // ============================================
  instanceId: 'auth-panel',
  module: 'auth',
  scope: 'panel',
  
  // ============================================
  // CONFIGURACIÓN ESPECÍFICA
  // ============================================
  config: {
    // ----------------------------------------
    // Características de autenticación
    // ----------------------------------------
    enableEmailVerification: true,
    enablePasswordReset: true,
    enableMFA: false, // MFA opcional para usuarios
    enableBiometric: false,
    enableSSO: true,
    enableSocialLogin: true,
    
    // ----------------------------------------
    // Proveedores de autenticación
    // ----------------------------------------
    providers: ['email', 'google', 'facebook'], // OAuth para facilitar registro
    
    // ----------------------------------------
    // Configuración de sesión
    // ----------------------------------------
    session: {
      storage: 'localStorage',
      key: 'zoomy_panel_session',
      timeout: 7200, // 2 horas
      sliding: true, // Renovar automáticamente con actividad del usuario
      secure: true,
      sameSite: 'lax',
      httpOnly: false,
      domain: '.zoomy.com',
      path: '/panel'
    },
    
    // ----------------------------------------
    // Configuración de tokens JWT
    // ----------------------------------------
    tokens: {
      accessTokenExpiry: '2h',
      refreshTokenExpiry: '30d',
      algorithm: 'HS256',
      issuer: 'zoomy-auth-panel',
      audience: 'zoomy-panel-api'
    },
    
    // ----------------------------------------
    // Validaciones de contraseña (estándar)
    // ----------------------------------------
    validation: {
      passwordMinLength: 8,
      passwordMaxLength: 128,
      requireSpecialChars: false,
      requireNumbers: true,
      requireUppercase: false,
      requireLowercase: true,
      preventCommonPasswords: true,
      preventPasswordReuse: 3,
      passwordExpiryDays: null, // Sin expiración
    },
    
    // ----------------------------------------
    // Permisos requeridos
    // ----------------------------------------
    permissions: {
      minRole: 'user',
      requiredRoles: ['user'],
      capabilities: []
    },
    
    // ----------------------------------------
    // Configuración de API
    // ----------------------------------------
    api: {
      baseUrl: '/api/panel/auth',
      endpoints: {
        login: '/login',
        register: '/register',
        logout: '/logout',
        refresh: '/refresh',
        verify: '/verify',
        verifyCode: '/verify-code',
        resendCode: '/resend-code',
        social: {
          google: '/social/google',
          facebook: '/social/facebook'
        }
      },
      timeout: 10000,
      retries: 3
    },
    
    // ----------------------------------------
    // Rutas de esta instancia
    // ----------------------------------------
    routes: {
      prefix: '/panel/auth',
      login: '/panel/auth/login',
      register: '/panel/auth/register',
      forgotPassword: '/panel/auth/forgot-password',
      resetPassword: '/panel/auth/reset-password',
      verifyEmail: '/panel/auth/verify-email',
      profile: '/panel/auth/profile',
      settings: '/panel/auth/settings'
    },
    
    // ----------------------------------------
    // Componentes personalizados
    // ----------------------------------------
    components: {
      LoginForm: './components/PanelLoginForm.jsx',
      RegisterForm: './components/PanelRegisterForm.jsx',
      ForgotPasswordForm: './components/PanelForgotPasswordForm.jsx',
      ResetPasswordForm: './components/PanelResetPasswordForm.jsx',
      VerificationCodeModal: './components/VerificationCodeModal.jsx',
      Layout: './layouts/PanelAuthLayout.jsx'
    },
    
    // ----------------------------------------
    // Hooks específicos de esta instancia
    // ----------------------------------------
    hooks: {
      /**
       * Ejecutado después de registro exitoso
       */
      onRegister: async (user, context) => {
        console.log('📝 User registered:', user.email);
        
        try {
          // 1. Crear account automáticamente
          const account = await context.services.AccountService.createDefaultAccount({
            userId: user.id,
            type: 'basic',
            features: ['basic_access']
          });
          
          // 2. Asignar role por defecto
          await context.services.RoleService.assignRole(user.id, 'user');
          
          // 3. Enviar email de bienvenida
          await context.services.EmailService.sendWelcome({
            to: user.email,
            name: user.profile?.firstName || user.email,
            verificationCode: user.verificationCode
          });
          
          // 4. Registrar evento
          await context.analytics?.track('user_registered', {
            userId: user.id,
            email: user.email,
            source: context.source || 'direct'
          });
          
          return {
            ...user,
            account
          };
        } catch (error) {
          console.error('Error en onRegister:', error);
          // Si falla la creación de account, eliminar el usuario
          await context.models.User.deleteOne({ _id: user.id });
          throw new Error('Error al completar el registro. Por favor intenta de nuevo.');
        }
      },
      
      /**
       * Ejecutado después de login exitoso
       */
      onLogin: async (user, context) => {
        console.log('🔐 User logged in:', user.email);
        
        // Cargar datos del usuario
        const userData = await context.services.UserService.loadFullUserData(user.id);
        
        // Registrar último login
        await context.models.User.updateOne(
          { _id: user.id },
          { 
            $set: { 
              lastLogin: new Date(),
              lastLoginIP: context.ip
            } 
          }
        );
        
        // Track analytics
        await context.analytics?.track('user_login', {
          userId: user.id,
          email: user.email
        });
        
        return userData;
      },
      
      /**
       * Ejecutado después de logout
       */
      onLogout: async (user, context) => {
        console.log('🔓 User logged out:', user.email);
        
        // Limpiar sesión local
        localStorage.removeItem('zoomy_panel_session');
        
        // Si la sesión se compartía con compras, también limpiarla
        sessionStorage.removeItem('zoomy_compras_session');
        
        // Track analytics
        await context.analytics?.track('user_logout', {
          userId: user.id
        });
      },
      
      /**
       * Ejecutado después de verificación de email
       */
      onEmailVerified: async (user, context) => {
        console.log('✅ Email verified:', user.email);
        
        // Enviar email de confirmación
        await context.services.EmailService.sendEmailVerified({
          to: user.email,
          name: user.profile?.firstName || user.email
        });
        
        // Actualizar estado de verificación
        await context.models.User.updateOne(
          { _id: user.id },
          { 
            $set: { 
              emailConfirmed: true,
              emailConfirmedAt: new Date()
            } 
          }
        );
        
        // Track analytics
        await context.analytics?.track('email_verified', {
          userId: user.id
        });
      },
      
      /**
       * Ejecutado si el login falla
       */
      onLoginFailed: async (email, error, context) => {
        console.error('❌ Login failed:', email, error.message);
        
        // Incrementar contador de intentos
        const attempts = await context.redis?.incr(`login_attempts:${email}`);
        await context.redis?.expire(`login_attempts:${email}`, 300); // 5 minutos
        
        // Bloquear temporalmente después de 5 intentos
        if (attempts >= 5) {
          await context.redis?.setex(`login_blocked:${email}`, 900, 'true'); // 15 min
          throw new Error('Demasiados intentos fallidos. Cuenta bloqueada temporalmente.');
        }
      },
      
      /**
       * Ejecutado cuando se solicita reset de contraseña
       */
      onPasswordResetRequest: async (email, context) => {
        console.log('🔑 Password reset requested:', email);
        
        const user = await context.models.User.findOne({ email });
        if (!user) {
          // Por seguridad, no revelar si el email existe
          return { success: true };
        }
        
        // Generar token de reset
        const resetToken = await context.services.TokenService.generateResetToken(user.id);
        
        // Enviar email con link de reset
        await context.services.EmailService.sendPasswordReset({
          to: email,
          name: user.profile?.firstName || email,
          resetToken,
          resetUrl: `${context.baseUrl}/panel/auth/reset-password?token=${resetToken}`
        });
        
        return { success: true };
      }
    },
    
    // ----------------------------------------
    // Submódulos que esta instancia necesita
    // ----------------------------------------
    submodules: {
      'role': {
        instanceId: 'role-panel',
        required: true,
        config: {
          defaultRole: 'user',
          allowedRoles: ['user', 'premium', 'moderator'],
          autoAssign: true
        }
      },
      'account': {
        instanceId: 'account-panel',
        required: true,
        config: {
          accountType: 'standard',
          autoCreate: true,
          defaultFeatures: ['basic_access']
        }
      }
    },
    
    // ----------------------------------------
    // Configuración de seguridad
    // ----------------------------------------
    security: {
      enableRateLimiting: true,
      maxLoginAttempts: 5,
      lockoutDuration: 900, // 15 minutos
      enableIPWhitelist: false,
      enableDeviceFingerprinting: false,
      requireEmailConfirmation: true,
      enable2FA: false, // Opcional
      sessionConcurrency: 3 // Hasta 3 sesiones simultáneas
    },
    
    // ----------------------------------------
    // Notificaciones
    // ----------------------------------------
    notifications: {
      onRegister: {
        email: true,
        push: false,
        sms: false
      },
      onLogin: {
        email: false,
        push: false,
        sms: false
      },
      onLoginFromNewDevice: {
        email: true,
        push: false,
        sms: false
      },
      onPasswordChange: {
        email: true,
        push: false,
        sms: false
      }
    },
    
    // ----------------------------------------
    // Configuración de OAuth
    // ----------------------------------------
    oauth: {
      google: {
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
        redirectUri: `${import.meta.env.VITE_BASE_URL}/panel/auth/callback/google`,
        scope: ['email', 'profile']
      },
      facebook: {
        appId: import.meta.env.VITE_FACEBOOK_APP_ID,
        appSecret: import.meta.env.VITE_FACEBOOK_APP_SECRET,
        redirectUri: `${import.meta.env.VITE_BASE_URL}/panel/auth/callback/facebook`,
        scope: ['email', 'public_profile']
      }
    }
  }
};

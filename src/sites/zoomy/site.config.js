/**
 * Configuración del Site Zoomy
 * 
 * Este archivo define la estructura completa del site Zoomy:
 * - Módulos habilitados (con múltiples instancias)
 * - Reglas de sesión para cada instancia de Auth
 * - Dependencias entre módulos
 * - Configuración de deployment
 */

export default {
  // ============================================
  // IDENTIFICACIÓN DEL SITE
  // ============================================
  siteId: 'zoomy', // ID único del site (usado para routing y sesiones)
  name: 'Zoomy Platform',
  version: '1.0.0',
  
  // ============================================
  // METADATA
  // ============================================
  metadata: {
    title: 'Zoomy - Tu Plataforma de Gestión',
    description: 'Plataforma integral de gestión empresarial',
    baseUrl: typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'production'
      ? 'https://zoomy.com' 
      : 'http://localhost:3000',
    author: 'ZoomPlanet Team',
  },
  
  // ============================================
  // CONFIGURACIÓN DE DEPLOYMENT
  // ============================================
  deployment: {
    mode: (typeof import.meta !== 'undefined' && import.meta.env?.MODE) || process.env.NODE_ENV || 'development', // development | production
    buildOptimization: true,
    staticGeneration: true,
    preloadModules: ['auth-panel', 'account-main'], // Módulos críticos a precargar
    lazyModules: ['auth-compras', 'compras-main'], // Módulos a cargar bajo demanda
  },
  
  // ============================================
  // MÓDULOS HABILITADOS EN ESTE SITE
  // Cada entrada define una INSTANCIA específica de un módulo
  // 
  // IMPORTANTE: Solo se definen aquí los módulos que necesitan instancias
  // Los submódulos se gestionan internamente por cada módulo
  // Ejemplo: Admin gestiona internamente account, project, crm
  // ============================================
  modules: [
    // ============================================
    // NIVEL 0: MÓDULOS BASE (Servicios compartidos)
    // ============================================
    
    // ----------------------------------------
    // BASE - Servicios y componentes compartidos
    // NO tiene rutas propias, solo exporta funcionalidad
    // Otros módulos pueden importar SiteConfiguration, etc.
    // ----------------------------------------
    {
      id: 'base',
      module: 'base',
      scope: 'global',
      lazy: false,
      priority: 0,
      dependencies: [],
      
      // Sin rutas propias, solo servicios
      routes: null,
      
      routing: {
        parentModule: null,
        routePrefix: null
      }
    },
    
    // ============================================
    // NIVEL 1: MÓDULOS RAÍZ DEL SITE
    // ============================================
    
    // ----------------------------------------
    // AUTH PANEL - Autenticación raíz para usuarios
    // Ruta: /zoomy/auth/*
    // ----------------------------------------
    {
      id: 'auth-panel',
      module: 'auth',
      scope: 'panel',
      config: './config/auth.panel.config.js',
      lazy: false,
      routes: '/auth',
      priority: 1,
      dependencies: [],
      
      // Configuración de autenticación
      auth: {
        loginRoute: '/auth/login',
        registerRoute: '/auth/register',
        homeRoute: '/dashboard',
        unauthorizedRoute: '/auth/unauthorized'
      },
      
      // Rutas públicas (no requieren autenticación)
      publicRoutes: [
        'auth/login',
        'auth/register',
        'auth/forgot-password',
        'auth/reset-password',
        'auth/verify-email',
        'auth/email-confirmation-required'
      ],
      
      // Configuración de routing para registerModuleRoutes
      routing: {
        parentModule: null,             // Módulo raíz del site
        routePrefix: 'auth',            // /zoomy/auth/*
        inheritLayouts: {}              // Usa layout por defecto de auth
      }
    },
    
    // ----------------------------------------
    // ADMIN MAIN - Panel de administración raíz
    // Ruta: /zoomy/admin/*
    // Gestiona internamente: account, project, crm, y su propia instancia de auth
    // ----------------------------------------
    {
      id: 'admin-main',
      module: 'admin',
      scope: 'main',
      dependencies: ['auth-admin'],     // Requiere Auth Admin
      config: './config/admin.config.js',
      lazy: false,
      routes: '/admin',
      priority: 2,
      
      // Configuración de autenticación (usa auth submódulo)
      auth: {
        loginRoute: '/admin/auth/login',
        registerRoute: '/admin/auth/register',
        homeRoute: '/admin/dashboard',
        unauthorizedRoute: '/admin/auth/unauthorized'
      },
      
      // Rutas públicas (Auth dentro de Admin)
      publicRoutes: [
        'auth/login',
        'auth/register',
        'auth/forgot-password',
        'auth/reset-password'
      ],
      
      // Rutas protegidas
      protectedRoutes: {
        '': { // Raíz de admin
          allow: false,
          redirectTo: '/admin/auth/login',
          policies: [{ roles: ['admin'] }]
        },
        'dashboard': {
          allow: true,
          policies: [{ roles: ['admin'] }]
        }
      },
      
      // Configuración de routing para registerModuleRoutes
      routing: {
        parentModule: null,             // Módulo raíz del site
        routePrefix: 'admin',           // /zoomy/admin/*
        inheritLayouts: {}
      }
    },
    
    // ============================================
    // NIVEL 2: SUBMÓDULOS (Gestionados por módulos raíz)
    // ============================================
    
    // ----------------------------------------
    // AUTH ADMIN - Autenticación para administradores
    // Ruta: /zoomy/admin/auth/*
    // Este es un submódulo de Admin
    // ----------------------------------------
    {
      id: 'auth-admin',
      module: 'auth',
      scope: 'admin',
      config: './config/auth.admin.config.js',
      lazy: false,
      routes: '/admin/auth',
      priority: 1,
      dependencies: [],
      
      // Configuración de autenticación
      auth: {
        loginRoute: '/admin/auth/login',
        registerRoute: '/admin/auth/register',
        homeRoute: '/admin/dashboard',
        unauthorizedRoute: '/admin/auth/unauthorized'
      },
      
      // Rutas públicas
      publicRoutes: [
        'login',
        'register',
        'forgot-password',
        'reset-password'
      ],
      
      // Configuración de routing para registerModuleRoutes
      routing: {
        parentModule: 'admin',          // Submódulo de Admin
        routePrefix: 'auth',            // /zoomy/admin/auth/*
        inheritLayouts: {
          auth: 'modules/admin/layouts/MainLayout.jsx' // Usa layout de Admin
        }
      }
    }
    
    // NOTA: account, project, crm NO se definen aquí
    // Esos módulos son gestionados internamente por Admin
    // Admin los carga y registra sus rutas automáticamente
  ],
  
  // ============================================
  // REGLAS DE INTERACCIÓN ENTRE INSTANCIAS
  // Define cómo múltiples instancias del mismo módulo interactúan
  // ============================================
  instanceRules: {
    // ----------------------------------------
    // Reglas para Auth (múltiples instancias)
    // ----------------------------------------
    'auth': {
      allowMultiple: true, // Permitir múltiples instancias
      sessionIsolation: true, // Cada instancia tiene su propia sesión
      sessionStrategy: 'scoped', // scoped | shared | isolated
      
      // Configuración de sesiones por scope
      sessions: {
        // Sesión para administradores (auth-admin)
        'admin': {
          storage: 'localStorage',
          key: 'zoomy_admin_session',
          timeout: 3600, // 1 hora
          sliding: false, // No renovar automáticamente
          secure: true,
          sameSite: 'strict',
          shareWith: [], // No compartir con otras instancias (aislada)
          priority: 'high'
        },
        
        // Sesión para usuarios del panel (auth-panel)
        'panel': {
          storage: 'localStorage',
          key: 'zoomy_panel_session',
          timeout: 7200, // 2 horas
          sliding: true, // Renovar automáticamente con actividad
          secure: true,
          sameSite: 'lax',
          shareWith: [], // De momento no comparte con otros módulos
          priority: 'medium'
        }
      },
      
      // Hooks para sincronización entre instancias
      hooks: {
        onLogin: 'syncAuthInstances',
        onLogout: 'clearAllSessions',
        onSessionExpire: 'handleExpiration'
      }
    }
    
    // NOTA: Solo definimos reglas para Auth ya que es el único módulo
    // con múltiples instancias (auth-admin y auth-panel)
  },
  
  // ============================================
  // LAYOUTS DEL SITE
  // ============================================
  layouts: {
    default: './layouts/PublicLayout.jsx',
    admin: './layouts/AdminLayout.jsx'
  },
  
  // ============================================
  // HOOKS DEL SITE (Lifecycle)
  // ============================================
  hooks: {
    beforeInit: './hooks/beforeInit.js',
    afterInit: './hooks/afterInit.js',
    onModuleLoad: './hooks/onModuleLoad.js',
    onModuleError: './hooks/onModuleError.js',
  },
  
  // ============================================
  // CONFIGURACIÓN DE BUILD
  // ============================================
  build: {
    outputDir: './dist/zoomy',
    generateManifest: true,
    splitChunks: true,
    optimization: {
      minimizeModules: true,
      treeshake: true,
      inlineSmallModules: true,
      preloadCritical: true,
      removeUnusedCode: true
    },
    sourceMaps: (typeof import.meta !== 'undefined' && import.meta.env?.MODE !== 'production') || process.env.NODE_ENV !== 'production',
  },
  
  // ============================================
  // FEATURES FLAGS
  // ============================================
  features: {
    enableHotReload: (typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'development') || process.env.NODE_ENV === 'development',
    enableDevTools: (typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'development') || process.env.NODE_ENV === 'development',
    enableAnalytics: (typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'production') || process.env.NODE_ENV === 'production',
    enableErrorReporting: true,
    enablePerformanceMonitoring: (typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'production') || process.env.NODE_ENV === 'production',
  },
  
  // ============================================
  // CONFIGURACIÓN DE SEGURIDAD
  // ============================================
  security: {
    enableCSRF: true,
    enableXSSProtection: true,
    enableContentSecurityPolicy: true,
    allowedOrigins: [
      'https://zoomy.com',
      'https://api.zoomy.com',
      'http://localhost:3000' // Solo en desarrollo
    ],
  }
};

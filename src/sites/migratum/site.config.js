/**
 * Configuración del Site Migratum
 * 
 * Este sitio es únicamente de administración.
 * A diferencia de Zoomy que usa el módulo 'admin' para gestionar submódulos,
 * Migratum importa directamente solo los módulos base que necesita:
 * - base: Servicios compartidos
 * - auth: Autenticación de administradores
 * - account: Gestión de cuentas/perfiles
 * 
 * Los demás módulos de administración (project, crm, marketing, googleAds, etc.)
 * se crearán directamente en este sitio según se necesiten.
 */

export default {
  // ============================================
  // IDENTIFICACIÓN DEL SITE
  // ============================================
  siteId: 'migratum',
  name: 'Migratum Admin Platform',
  version: '1.0.0',
  
  // ============================================
  // METADATA
  // ============================================
  metadata: {
    title: 'Migratum - Panel de Administración',
    description: 'Plataforma administrativa para gestión de Migratum',
    baseUrl: typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'production'
      ? 'https://admin.migratum.com' 
      : 'http://localhost:3000',
    author: 'Migratum Team',
  },
  
  // ============================================
  // CONFIGURACIÓN DE DEPLOYMENT
  // ============================================
  deployment: {
    mode: (typeof import.meta !== 'undefined' && import.meta.env?.MODE) || process.env.NODE_ENV || 'development',
    buildOptimization: true,
    staticGeneration: true,
    preloadModules: ['auth', 'base'], // Módulos críticos a precargar
    lazyModules: [], // Módulos a cargar bajo demanda
  },
  
  // ============================================
  // MÓDULOS HABILITADOS EN ESTE SITE
  // Solo los módulos base que necesita Migratum
  // ============================================
  modules: [
    // ----------------------------------------
    // BASE - Servicios y componentes compartidos
    // ----------------------------------------
    {
      id: 'base',
      module: 'base',
      scope: 'global',
      lazy: false,
      priority: 0,
      dependencies: [],
      routes: null,
      routing: {
        parentModule: null,
        routePrefix: null
      }
    },
    
    // ----------------------------------------
    // AUTH - Autenticación de administradores
    // Ruta: /migratum/auth/*
    // ----------------------------------------
    {
      id: 'auth',
      module: 'auth',
      scope: 'admin',
      config: './config/auth.config.js',
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
      
      // Configuración de routing
      routing: {
        parentModule: null,
        routePrefix: 'auth',
        inheritLayouts: {
          auth: 'sites/migratum/layouts/AdminLayout.jsx' // Usa layout de Migratum
        }
      }
    },
    
    // ----------------------------------------
    // ACCOUNT - Gestión de cuentas/perfiles
    // Ruta: /migratum/account/*
    // ----------------------------------------
    {
      id: 'account',
      module: 'account',
      scope: 'admin',
      config: './config/account.config.js',
      lazy: false,
      routes: '/account',
      priority: 2,
      dependencies: ['auth'],
      
      // Rutas protegidas
      protectedRoutes: {
        '': {
          allow: true,
          policies: [{ roles: ['admin', 'user'] }]
        }
      },
      
      // Configuración de routing
      routing: {
        parentModule: null,
        routePrefix: 'account',
        inheritLayouts: {
          account: 'sites/migratum/layouts/AdminLayout.jsx'
        }
      }
    }
    
    // NOTA: Aquí se agregarán más módulos conforme se necesiten:
    // - project, crm, marketing, googleAds, newsletter, etc.
  ],
  
  // ============================================
  // REGLAS DE SESIÓN
  // ============================================
  instanceRules: {
    'auth': {
      allowMultiple: false, // Solo una instancia de auth en Migratum
      sessionIsolation: false,
      sessionStrategy: 'shared',
      
      sessions: {
        'admin': {
          storage: 'localStorage',
          key: 'migratum_admin_session',
          timeout: 3600, // 1 hora
          sliding: false,
          secure: true,
          sameSite: 'strict',
          shareWith: [],
          priority: 'high'
        }
      }
    }
  },
  
  // ============================================
  // LAYOUTS DEL SITE
  // ============================================
  layouts: {
    default: './layouts/AdminLayout.jsx',
    admin: './layouts/AdminLayout.jsx'
  },
  
  // ============================================
  // HOOKS DEL SITE
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
    outputDir: './dist/migratum',
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
      'https://admin.migratum.com',
      'https://api.migratum.com',
      'http://localhost:3000',
      'http://localhost:4000'
    ],
  }
};

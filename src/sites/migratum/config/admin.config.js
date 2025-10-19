/**
 * Configuración del módulo Admin para el site Migratum
 * 
 * Esta configuración define cómo se comporta el módulo admin específicamente
 * en el contexto de Migratum, incluyendo rutas, permisos y módulos integrados.
 */

export const migratumAdminConfig = {
  // Identificación del módulo
  moduleId: 'admin',
  siteName: 'migratum',
  
  // Configuración de autenticación y autorización
  auth: {
    requireAuth: true,
    allowedRoles: ['admin', 'super_admin', 'migratum_admin'],
    sessionTimeout: 3600, // 1 hora
    multiFactorAuth: false, // Para el futuro
  },
  
  // Módulos integrados en este admin (específicos para Migratum)
  integratedModules: [
    {
      name: 'blockchain',
      enabled: true,
      routes: [
        { path: '/blockchain/networks', component: 'blockchain/pages/Networks.jsx' },
        { path: '/blockchain/wallets', component: 'blockchain/pages/Wallets.jsx' },
        { path: '/blockchain/transactions', component: 'blockchain/pages/Transactions.jsx' },
        { path: '/blockchain/contracts', component: 'blockchain/pages/Contracts.jsx' },
      ]
    },
    {
      name: 'migration',
      enabled: true,
      routes: [
        { path: '/migration/jobs', component: 'migration/pages/Jobs.jsx' },
        { path: '/migration/history', component: 'migration/pages/History.jsx' },
        { path: '/migration/config', component: 'migration/pages/Config.jsx' },
      ]
    }
  ],
  
  // Configuración de navegación específica para Migratum
  navigation: {
    showBreadcrumbs: true,
    collapsibleSidebar: true,
    defaultCollapsed: false,
    theme: 'dark',
    
    // Elementos del menú principales
    mainMenu: {
      dashboard: { enabled: true, order: 1 },
      blockchain: { enabled: true, order: 2 },
      migration: { enabled: true, order: 3 },
      administration: { enabled: true, order: 4 },
    }
  },
  
  // Configuración de características específicas
  features: {
    // Blockchain features
    blockchain: {
      multiNetwork: true,
      walletIntegration: true,
      smartContractDeploy: true,
      transactionMonitoring: true,
    },
    
    // Migration features  
    migration: {
      batchMigration: true,
      rollbackSupport: true,
      migrationScheduling: true,
      progressTracking: true,
    },
    
    // Admin features
    administration: {
      userManagement: true,
      roleManagement: true,
      permissionManagement: true,
      systemConfiguration: true,
      auditLogging: true,
    }
  },
  
  // Configuración de la interfaz
  ui: {
    theme: 'professional', // professional | modern | classic
    primaryColor: '#1890ff',
    layout: 'sidebar', // sidebar | topbar | mixed
    
    // Configuración del sidebar
    sidebar: {
      width: 200,
      collapsedWidth: 80,
      theme: 'dark',
      showLogo: true,
      logoText: 'MIGRATUM',
      logoTextCollapsed: 'M',
    },
    
    // Configuración del header
    header: {
      fixed: true,
      showUserMenu: true,
      showNotifications: false, // Para el futuro
      showSearch: false, // Para el futuro
    }
  },
  
  // Configuración de API y conexiones
  api: {
    baseUrl: process.env.VITE_API_URL || 'http://localhost:4000',
    endpoints: {
      blockchain: '/api/blockchain',
      migration: '/api/migration',
      admin: '/api/admin',
    },
    
    // Configuración de WebSocket para actualizaciones en tiempo real
    websocket: {
      enabled: false, // Para el futuro
      url: process.env.VITE_WS_URL || 'ws://localhost:4000/ws',
    }
  },
  
  // Configuración de monitoreo y logging
  monitoring: {
    enableAnalytics: process.env.NODE_ENV === 'production',
    enableErrorReporting: true,
    enablePerformanceMonitoring: process.env.NODE_ENV === 'production',
    
    // Eventos a trackear
    trackEvents: [
      'blockchain_transaction_created',
      'migration_job_started',
      'migration_job_completed',
      'user_login',
      'admin_action_performed',
    ]
  },
  
  // Configuración de desarrollo
  development: {
    enableDevTools: process.env.NODE_ENV === 'development',
    enableHotReload: process.env.NODE_ENV === 'development',
    mockData: process.env.NODE_ENV === 'development',
    debugMode: process.env.NODE_ENV === 'development',
  }
};

export default migratumAdminConfig;
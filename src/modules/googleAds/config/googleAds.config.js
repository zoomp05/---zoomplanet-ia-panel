/**
 * Configuración del módulo Google Ads
 * 
 * Esta configuración define los parámetros por defecto del módulo Google Ads.
 * Puede ser sobreescrita por configuraciones de módulos padres o del sitio.
 */

export default {
  // Identificación del módulo
  moduleName: 'googleAds',
  
  // Configuración de Google Ads API
  api: {
    enabled: false, // Activar cuando se tengan las credenciales
    version: 'v15', // Versión de la API de Google Ads
    clientId: process.env.VITE_GOOGLE_ADS_CLIENT_ID || '',
    clientSecret: process.env.VITE_GOOGLE_ADS_CLIENT_SECRET || '',
    developerToken: process.env.VITE_GOOGLE_ADS_DEVELOPER_TOKEN || '',
    refreshToken: process.env.VITE_GOOGLE_ADS_REFRESH_TOKEN || '',
    loginCustomerId: process.env.VITE_GOOGLE_ADS_LOGIN_CUSTOMER_ID || '',
  },
  
  // Configuración de sincronización con Marketing
  marketing: {
    enableSync: true, // Permitir sincronización con módulo Marketing
    autoSync: false, // No sincronizar automáticamente (manual por ahora)
    syncInterval: 900000, // 15 minutos (en ms)
    syncOnCampaignCreate: false,
    syncOnCampaignUpdate: false,
  },
  
  // Configuración de métricas y reportes
  metrics: {
    updateInterval: 300000, // 5 minutos (en ms)
    retentionDays: 90, // Retener datos por 90 días
    enableRealtime: false, // Métricas en tiempo real (requiere API activa)
  },
  
  // Configuración de presupuestos
  budgets: {
    currency: 'USD',
    defaultDailyBudget: 100,
    minDailyBudget: 10,
    maxDailyBudget: 10000,
    alertThreshold: 0.9, // Alerta cuando se alcance el 90% del presupuesto
  },
  
  // Configuración de campañas
  campaigns: {
    defaultStatus: 'PAUSED', // Nuevas campañas empiezan pausadas
    allowedTypes: [
      'SEARCH',
      'DISPLAY',
      'SHOPPING',
      'VIDEO',
      'SMART',
      'PERFORMANCE_MAX'
    ],
    defaultType: 'SEARCH',
  },
  
  // Configuración de keywords
  keywords: {
    maxKeywordsPerAdGroup: 100,
    defaultMatchType: 'BROAD',
    allowedMatchTypes: ['BROAD', 'PHRASE', 'EXACT'],
    enableNegativeKeywords: true,
  },
  
  // Features habilitadas
  features: {
    enableKeywordResearch: true,
    enableAutomatedBidding: false,
    enableSmartCampaigns: false,
    enableConversionTracking: true,
    enableRemarketing: true,
    enableAudienceTargeting: true,
  },
  
  // Integración con IA (para futuras mejoras)
  ai: {
    enabled: false,
    features: {
      keywordSuggestions: false,
      adCopyGeneration: false,
      bidOptimization: false,
      performancePrediction: false,
    },
  },
  
  // Configuración de la UI
  ui: {
    defaultView: 'dashboard', // dashboard | campaigns | reports
    itemsPerPage: 20,
    enableAdvancedFilters: true,
    enableBulkActions: true,
    theme: 'default',
  },
  
  // Permisos y roles
  permissions: {
    canCreateCampaigns: ['admin'],
    canEditCampaigns: ['admin'],
    canDeleteCampaigns: ['admin'],
    canViewReports: ['admin', 'marketing-manager'],
    canManageSettings: ['admin'],
  },
};

/**
 * Configuración del módulo Marketing
 * 
 * Esta configuración define los parámetros por defecto del módulo de Marketing.
 * Puede ser sobreescrita por configuraciones de módulos padres o del sitio.
 */

export default {
  // Identificación del módulo
  moduleName: 'marketing',
  
  // Configuración de campañas de marketing
  campaigns: {
    defaultStatus: 'draft', // draft | active | paused | completed
    allowedChannels: [
      'google-ads',
      'facebook-ads',
      'email',
      'sms',
      'social-media',
      'content',
      'seo',
      'affiliate'
    ],
    defaultChannel: 'google-ads',
  },
  
  // Integración con Google Ads
  googleAds: {
    enableIntegration: true,
    autoLinkCampaigns: false,
    syncMetrics: true,
    syncInterval: 900000, // 15 minutos
  },
  
  // Configuración de métricas
  metrics: {
    updateInterval: 300000, // 5 minutos
    retentionDays: 90,
    enableRealtime: false,
  },
  
  // Configuración de presupuestos
  budgets: {
    currency: 'USD',
    defaultBudget: 1000,
    minBudget: 100,
    maxBudget: 100000,
    alertThreshold: 0.9,
  },
  
  // Features habilitadas
  features: {
    enableAICampaigns: true,
    enableMultiChannel: true,
    enableAutomation: true,
    enableReporting: true,
    enableAnalytics: true,
  },
  
  // Configuración de IA
  ai: {
    enabled: true,
    features: {
      campaignOptimization: true,
      contentGeneration: true,
      audienceSegmentation: true,
      performancePrediction: true,
    },
  },
  
  // Configuración de la UI
  ui: {
    defaultView: 'dashboard',
    itemsPerPage: 20,
    enableAdvancedFilters: true,
    enableBulkActions: true,
    theme: 'default',
  },
  
  // Permisos y roles
  permissions: {
    canCreateCampaigns: ['admin', 'marketing-manager'],
    canEditCampaigns: ['admin', 'marketing-manager'],
    canDeleteCampaigns: ['admin'],
    canViewReports: ['admin', 'marketing-manager', 'marketing-analyst'],
    canManageSettings: ['admin'],
  },
};

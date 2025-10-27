/**
 * Configuración del módulo Hosting & Domains
 * 
 * Esta configuración define los parámetros del módulo de gestión de hosting,
 * dominios y facturación. Consume productos del módulo commerce.
 */

export default {
  // Identificación del módulo
  moduleName: 'hosting',
  
  // Configuración de cuentas de hosting
  accounts: {
    defaultStatus: 'active', // active | suspended | pending | cancelled
    allowedStatuses: ['active', 'suspended', 'pending', 'cancelled', 'expired'],
    autoSuspendOnPaymentFailure: true,
    suspensionGraceDays: 7,
  },
  
  // Configuración de recursos
  resources: {
    monitoringInterval: 300000, // 5 minutos
    criticalThreshold: 90, // Porcentaje para alertas críticas
    warningThreshold: 80, // Porcentaje para alertas de advertencia
    enableAutoScaling: false,
    enableAlerts: true,
  },
  
  // Configuración de dominios
  domains: {
    defaultRegistrar: 'internal',
    allowedRegistrars: ['godaddy', 'namecheap', 'cloudflare', 'internal'],
    autoRenewal: true,
    renewalReminderDays: [30, 15, 7, 1],
    enableWhoisPrivacy: true,
    enableDNSManagement: true,
  },
  
  // Configuración de SSL
  ssl: {
    autoInstall: true,
    provider: 'letsencrypt',
    allowedProviders: ['letsencrypt', 'comodo', 'digicert', 'godaddy'],
    autoRenewal: true,
    renewalDays: 30,
  },
  
  // Configuración de facturación
  billing: {
    currency: 'USD',
    billingCycle: 'monthly', // monthly | quarterly | annually
    allowedCycles: ['monthly', 'quarterly', 'semiannually', 'annually', 'biennially'],
    autoInvoiceGeneration: true,
    invoiceDueDays: 7,
    enableAutoPay: true,
    latePaymentGraceDays: 3,
  },
  
  // Configuración de planes (referencia a commerce)
  plans: {
    source: 'commerce', // Los planes vienen del módulo commerce
    productType: 'HOSTING_PLAN',
    enableTrialPeriod: true,
    trialDays: 7,
    allowUpgrade: true,
    allowDowngrade: false,
    upgradeProration: true,
  },
  
  // Configuración de backups
  backups: {
    enabled: true,
    frequency: 'daily',
    retention: 30,
    autoRestore: false,
    enableManualBackups: true,
  },
  
  // Features habilitadas
  features: {
    enableCPanel: false,
    enablePlesk: false,
    enableDirectAdmin: false,
    enableFileManager: true,
    enableDatabaseManager: true,
    enableEmailManager: true,
    enableSSH: false,
    enableFTP: true,
    enableCronJobs: true,
  },
  
  // Configuración de la UI
  ui: {
    defaultView: 'dashboard',
    itemsPerPage: 20,
    enableAdvancedFilters: true,
    enableBulkActions: true,
    theme: 'default',
    showResourceGraphs: true,
    refreshInterval: 60000, // 1 minuto
  },
  
  // Permisos y roles
  permissions: {
    canCreateAccounts: ['admin', 'hosting-manager'],
    canEditAccounts: ['admin', 'hosting-manager'],
    canDeleteAccounts: ['admin'],
    canSuspendAccounts: ['admin', 'hosting-manager'],
    canManageDomains: ['admin', 'hosting-manager'],
    canViewBilling: ['admin', 'hosting-manager', 'billing'],
    canManageBilling: ['admin', 'billing'],
    canViewReports: ['admin', 'hosting-manager', 'billing'],
    canManageSettings: ['admin'],
  },
  
  // Integración con commerce
  commerce: {
    enabled: true,
    syncProducts: true,
    syncInterval: 3600000, // 1 hora
  },
  
  // Notificaciones
  notifications: {
    enableEmail: true,
    enableSMS: false,
    enableInApp: true,
    events: [
      'account_created',
      'account_suspended',
      'account_expiring',
      'domain_expiring',
      'ssl_expiring',
      'invoice_generated',
      'payment_received',
      'payment_failed',
      'resource_critical',
    ],
  },
};

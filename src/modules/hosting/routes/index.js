/**
 * Configuración de Rutas del Módulo Hosting
 * Define todas las rutas y subrutas para hosting, dominios y billing
 * 
 * Estructura de rutas React Router v7:
 * /:site/admin/hosting/
 *   /                       - Dashboard
 *   /accounts               - Lista de cuentas
 *   /accounts/:accountId    - Detalles de cuenta
 *   /plans                  - Planes disponibles (desde commerce)
 *   /resources              - Monitoreo de recursos
 *   /domains                - Lista de dominios
 *   /billing                - Dashboard de facturación
 *   /billing/invoices       - Lista de facturas
 */

export const routes = [
  {
    path: "",
    layout: "modules/admin/layouts/MainLayout.jsx", // Usar layout de admin
    moduleName: "hosting",
    children: [
      {
        path: "", // /[siteName]/admin/hosting
        componentPath: "modules/hosting/pages/Dashboard.jsx",
      },
      {
        path: "accounts", // /[siteName]/admin/hosting/accounts
        componentPath: "modules/hosting/pages/AccountsList.jsx",
      },
      {
        path: "accounts/:accountId", // /[siteName]/admin/hosting/accounts/:accountId
        componentPath: "modules/hosting/pages/AccountDetails.jsx",
      },
      {
        path: "plans", // /[siteName]/admin/hosting/plans
        componentPath: "modules/hosting/pages/Plans.jsx",
      },
      {
        path: "resources", // /[siteName]/admin/hosting/resources
        componentPath: "modules/hosting/pages/Resources.jsx",
      },
      {
        path: "domains", // /[siteName]/admin/hosting/domains
        componentPath: "modules/hosting/pages/domains/DomainsList.jsx",
      },
      {
        path: "billing", // /[siteName]/admin/hosting/billing
        componentPath: "modules/hosting/pages/billing/BillingDashboard.jsx",
      },
    ],
  },
];

/**
 * Configuración del menú del módulo hosting
 * Se usa en ContextualHeader
 */
export const hostingMenuConfig = [
  {
    key: 'hosting-dashboard',
    label: 'Dashboard',
    icon: 'CloudServerOutlined',
    url: '/admin/hosting'
  },
  {
    key: 'hosting-accounts',
    label: 'Cuentas',
    icon: 'CloudServerOutlined',
    children: [
      {
        key: 'hosting-accounts-list',
        label: 'Todas las Cuentas',
        url: '/admin/hosting/accounts'
      },
      {
        key: 'hosting-accounts-new',
        label: 'Nueva Cuenta',
        url: '/admin/hosting/accounts/new'
      },
      {
        key: 'hosting-resources',
        label: 'Monitor de Recursos',
        url: '/admin/hosting/resources'
      }
    ]
  },
  {
    key: 'hosting-plans',
    label: 'Planes',
    icon: 'AppstoreOutlined',
    url: '/admin/hosting/plans'
  },
  {
    key: 'hosting-domains',
    label: 'Dominios',
    icon: 'GlobalOutlined',
    children: [
      {
        key: 'hosting-domains-list',
        label: 'Mis Dominios',
        url: '/admin/hosting/domains'
      },
      {
        key: 'hosting-domains-register',
        label: 'Registrar Dominio',
        url: '/admin/hosting/domains/register'
      },
      {
        key: 'hosting-domains-transfer',
        label: 'Transferir Dominio',
        url: '/admin/hosting/domains/transfer'
      }
    ]
  },
  {
    key: 'hosting-billing',
    label: 'Facturación',
    icon: 'DollarOutlined',
    children: [
      {
        key: 'hosting-billing-dashboard',
        label: 'Dashboard',
        url: '/admin/hosting/billing'
      },
      {
        key: 'hosting-billing-invoices',
        label: 'Facturas',
        url: '/admin/hosting/billing/invoices'
      },
      {
        key: 'hosting-billing-payment-methods',
        label: 'Métodos de Pago',
        url: '/admin/hosting/billing/payment-methods'
      },
      {
        key: 'hosting-billing-usage',
        label: 'Uso y Estadísticas',
        url: '/admin/hosting/billing/usage'
      }
    ]
  }
];

/**
 * Metadatos del módulo hosting
 */
export const hostingModuleConfig = {
  name: 'Hosting & Domains',
  key: 'hosting',
  icon: 'CloudServerOutlined',
  description: 'Gestión de cuentas de hosting, dominios y facturación',
  basePath: '/admin/hosting',
  permissions: {
    view: ['admin', 'hosting_manager'],
    edit: ['admin', 'hosting_manager'],
    delete: ['admin']
  }
};

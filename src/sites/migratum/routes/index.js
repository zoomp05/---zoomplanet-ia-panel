/**
 * Rutas del sitio Migratum
 * 
 * Define las rutas principales del sitio con layout centralizado
 * Servicios financieros para inmigrantes en Canadá
 */

export const routes = [
  {
    path: "", // /migratum
    layout: "./sites/migratum/layouts/AdminLayout.jsx",
    siteName: "migratum",
    children: [
      {
        path: "", // /migratum
        componentPath: "sites/migratum/pages/index.jsx",
      },
      {
        path: "dashboard", // /migratum/dashboard
        componentPath: "sites/migratum/pages/Dashboard.jsx",
      },
      // KYC y Verificación
      {
        path: "kyc", // /migratum/kyc
        componentPath: "sites/migratum/pages/GenericModulePage.jsx",
        props: { moduleName: "KYC y Verificación", pageName: "Dashboard" }
      },
      {
        path: "kyc/pending", // /migratum/kyc/pending
        componentPath: "sites/migratum/pages/GenericModulePage.jsx",
        props: { moduleName: "KYC y Verificación", pageName: "Pendientes de Revisión" }
      },
      {
        path: "kyc/approved", // /migratum/kyc/approved
        componentPath: "sites/migratum/pages/GenericModulePage.jsx",
        props: { moduleName: "KYC y Verificación", pageName: "Aprobados" }
      },
      {
        path: "kyc/rejected", // /migratum/kyc/rejected
        componentPath: "sites/migratum/pages/GenericModulePage.jsx",
        props: { moduleName: "KYC y Verificación", pageName: "Rechazados" }
      },
      {
        path: "kyc/documents", // /migratum/kyc/documents
        componentPath: "sites/migratum/pages/GenericModulePage.jsx",
        props: { moduleName: "KYC y Verificación", pageName: "Documentos" }
      },
      // Wallet y Token
      {
        path: "wallet", // /migratum/wallet
        componentPath: "sites/migratum/pages/GenericModulePage.jsx",
        props: { moduleName: "Wallet y Token", pageName: "Dashboard" }
      },
      {
        path: "wallet/management", // /migratum/wallet/management
        componentPath: "sites/migratum/pages/GenericModulePage.jsx",
        props: { moduleName: "Wallet y Token", pageName: "Gestión de Wallets" }
      },
      {
        path: "wallet/transactions", // /migratum/wallet/transactions
        componentPath: "sites/migratum/pages/GenericModulePage.jsx",
        props: { moduleName: "Wallet y Token", pageName: "Transacciones" }
      },
      {
        path: "wallet/token-management", // /migratum/wallet/token-management
        componentPath: "sites/migratum/pages/GenericModulePage.jsx",
        props: { moduleName: "Wallet y Token", pageName: "Gestión de Token MIG" }
      },
      {
        path: "wallet/rewards", // /migratum/wallet/rewards
        componentPath: "sites/migratum/pages/GenericModulePage.jsx",
        props: { moduleName: "Wallet y Token", pageName: "Recompensas" }
      },
      // Servicios Crediticios
      {
        path: "credits", // /migratum/credits
        componentPath: "sites/migratum/pages/GenericModulePage.jsx",
        props: { moduleName: "Servicios Crediticios", pageName: "Dashboard" }
      },
      {
        path: "credits/pending", // /migratum/credits/pending
        componentPath: "sites/migratum/pages/GenericModulePage.jsx",
        props: { moduleName: "Servicios Crediticios", pageName: "Solicitudes Pendientes" }
      },
      {
        path: "credits/approved", // /migratum/credits/approved
        componentPath: "sites/migratum/pages/GenericModulePage.jsx",
        props: { moduleName: "Servicios Crediticios", pageName: "Créditos Activos" }
      },
      {
        path: "credits/evaluation", // /migratum/credits/evaluation
        componentPath: "sites/migratum/pages/GenericModulePage.jsx",
        props: { moduleName: "Servicios Crediticios", pageName: "Evaluación Crediticia" }
      },
      {
        path: "credits/history", // /migratum/credits/history
        componentPath: "sites/migratum/pages/GenericModulePage.jsx",
        props: { moduleName: "Servicios Crediticios", pageName: "Historial Crediticio" }
      },
      // Servicios de Vivienda
      {
        path: "housing", // /migratum/housing
        componentPath: "sites/migratum/pages/GenericModulePage.jsx",
        props: { moduleName: "Servicios de Vivienda", pageName: "Dashboard" }
      },
      {
        path: "housing/properties", // /migratum/housing/properties
        componentPath: "sites/migratum/pages/GenericModulePage.jsx",
        props: { moduleName: "Servicios de Vivienda", pageName: "Propiedades Disponibles" }
      },
      {
        path: "housing/applications", // /migratum/housing/applications
        componentPath: "sites/migratum/pages/GenericModulePage.jsx",
        props: { moduleName: "Servicios de Vivienda", pageName: "Aplicaciones de Renta" }
      },
      {
        path: "housing/contracts", // /migratum/housing/contracts
        componentPath: "sites/migratum/pages/GenericModulePage.jsx",
        props: { moduleName: "Servicios de Vivienda", pageName: "Contratos" }
      },
      {
        path: "housing/support", // /migratum/housing/support
        componentPath: "sites/migratum/pages/GenericModulePage.jsx",
        props: { moduleName: "Servicios de Vivienda", pageName: "Soporte Habitacional" }
      },
      // Servicios Migratorios
      {
        path: "immigration", // /migratum/immigration
        componentPath: "sites/migratum/pages/GenericModulePage.jsx",
        props: { moduleName: "Servicios Migratorios", pageName: "Dashboard" }
      },
      {
        path: "immigration/applications", // /migratum/immigration/applications
        componentPath: "sites/migratum/pages/GenericModulePage.jsx",
        props: { moduleName: "Servicios Migratorios", pageName: "Aplicaciones" }
      },
      {
        path: "immigration/documents", // /migratum/immigration/documents
        componentPath: "sites/migratum/pages/GenericModulePage.jsx",
        props: { moduleName: "Servicios Migratorios", pageName: "Documentos" }
      },
      {
        path: "immigration/status", // /migratum/immigration/status
        componentPath: "sites/migratum/pages/GenericModulePage.jsx",
        props: { moduleName: "Servicios Migratorios", pageName: "Estado de Casos" }
      },
      {
        path: "immigration/consultation", // /migratum/immigration/consultation
        componentPath: "sites/migratum/pages/GenericModulePage.jsx",
        props: { moduleName: "Servicios Migratorios", pageName: "Consultas" }
      },
      // Servicios Bancarios
      {
        path: "banking", // /migratum/banking
        componentPath: "sites/migratum/pages/GenericModulePage.jsx",
        props: { moduleName: "Servicios Bancarios", pageName: "Dashboard" }
      },
      {
        path: "banking/accounts", // /migratum/banking/accounts
        componentPath: "sites/migratum/pages/GenericModulePage.jsx",
        props: { moduleName: "Servicios Bancarios", pageName: "Cuentas Bancarias" }
      },
      {
        path: "banking/applications", // /migratum/banking/applications
        componentPath: "sites/migratum/pages/GenericModulePage.jsx",
        props: { moduleName: "Servicios Bancarios", pageName: "Aplicaciones" }
      },
      {
        path: "banking/support", // /migratum/banking/support
        componentPath: "sites/migratum/pages/GenericModulePage.jsx",
        props: { moduleName: "Servicios Bancarios", pageName: "Soporte Bancario" }
      },
      // Reportes y Analytics
      {
        path: "reports", // /migratum/reports
        componentPath: "sites/migratum/pages/GenericModulePage.jsx",
        props: { moduleName: "Reportes y Analytics", pageName: "Dashboard" }
      },
      {
        path: "reports/financial", // /migratum/reports/financial
        componentPath: "sites/migratum/pages/GenericModulePage.jsx",
        props: { moduleName: "Reportes y Analytics", pageName: "Reportes Financieros" }
      },
      {
        path: "reports/users", // /migratum/reports/users
        componentPath: "sites/migratum/pages/GenericModulePage.jsx",
        props: { moduleName: "Reportes y Analytics", pageName: "Reportes de Usuarios" }
      },
      {
        path: "reports/activity", // /migratum/reports/activity
        componentPath: "sites/migratum/pages/GenericModulePage.jsx",
        props: { moduleName: "Reportes y Analytics", pageName: "Actividad del Sistema" }
      },
      // Administración directa (sin módulo intermedio)
      {
        path: "users", // /migratum/users
        moduleName: "user",
        componentPath: "modules/user/pages/Users.jsx",
      },
      {
        path: "users/roles", // /migratum/users/roles
        moduleName: "user",
        componentPath: "modules/user/pages/Roles.jsx",
      },
      {
        path: "settings", // /migratum/settings
        componentPath: "modules/admin/pages/settings.jsx",
      },
      {
        path: "site-config", // /migratum/site-config
        componentPath: "modules/base/pages/SiteConfiguration.jsx",
      },
    ]
  }
];

export const migratumRoutes = routes;

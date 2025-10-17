/**
 * Configuración Base del Módulo Admin
 * 
 * Este es el módulo padre que gestiona todos los submódulos administrativos.
 * Define qué submódulos están disponibles y configuraciones generales.
 * 
 * ARQUITECTURA:
 * - Site (zoomy) define: ['auth', 'admin'] (solo módulos raíz)
 * - Admin define: sus submódulos (delegación jerárquica)
 * - Cada submódulo lee su propia config
 */

export default {
  // Identificación
  name: 'Administration',
  description: 'Panel administrativo central del sistema',
  
  // Submódulos que gestiona admin
  // NOTA: Esta es la delegación real - admin define sus propios submódulos
  submodules: [
    'base',
    'googleAds',
    'marketing',
    'project',
    'crm',
    'account',
    'newsletter',
    'site-config' // Meta: config de la configuración
  ],
  
  // Configuración de layouts por defecto para submódulos
  layouts: {
    default: 'modules/admin/layouts/MainLayout.jsx',
    // Cada submódulo puede usar el layout de admin por defecto
    // o definir el suyo propio en su config
  },
  
  // Permisos base para acceder al módulo admin
  permissions: {
    view: ['admin', 'superadmin'],
    edit: ['admin', 'superadmin'],
    delete: ['superadmin']
  },
  
  // Características del módulo admin
  features: {
    dashboard: true,
    userManagement: true,
    moduleManagement: true,
    siteConfiguration: true,
    analytics: true
  },
  
  // Configuración de menú
  menu: {
    enabled: true,
    position: 'top',
    items: [
      {
        key: 'dashboard',
        label: 'Dashboard',
        icon: 'DashboardOutlined',
        path: '/admin'
      },
      {
        key: 'modules',
        label: 'Módulos',
        icon: 'AppstoreOutlined',
        children: 'dynamic' // Se genera dinámicamente desde submodules
      },
      {
        key: 'config',
        label: 'Configuración',
        icon: 'SettingOutlined',
        path: '/admin/site-config'
      }
    ]
  },
  
  // API endpoints
  api: {
    enabled: true,
    baseUrl: '/api/admin',
    endpoints: {
      modules: '/modules',
      config: '/config',
      users: '/users',
      roles: '/roles'
    }
  },
  
  // Configuración de sesión
  session: {
    timeout: 3600000, // 1 hora en ms
    keepAlive: true,
    refreshInterval: 300000 // 5 minutos
  }
};

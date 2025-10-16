// Configuración específica del sitio Zoomy
export const authConfig = {
  siteName: 'zoomy',
  loginRoute: '/zoomy/admin/auth/login',
  homeRoute: '/zoomy/admin/dashboard',
  unauthorizedRoute: '/zoomy/admin/unauthorized',
  
  // Roles específicos del sitio Zoomy
  roles: {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin', 
    MARKETING_MANAGER: 'marketing_manager',
    ANALYST: 'analyst',
    VIEWER: 'viewer'
  },
  
  // Permisos específicos del sitio Zoomy
  permissions: {
    // Gestión de campañas
    CREATE_CAMPAIGNS: 'campaigns:create',
    EDIT_CAMPAIGNS: 'campaigns:edit',
    DELETE_CAMPAIGNS: 'campaigns:delete',
    VIEW_CAMPAIGNS: 'campaigns:view',
    
    // Analytics y reportes
    VIEW_ANALYTICS: 'analytics:view',
    EXPORT_REPORTS: 'reports:export',
    
    // Gestión de usuarios
    MANAGE_USERS: 'users:manage',
    VIEW_USERS: 'users:view',
    
    // Configuración del sistema
    SYSTEM_CONFIG: 'system:config'
  },
  
  // Ruta al componente de loading
  loadingComponentPath: './sites/zoomy/components/LoadingComponent.jsx'
};

export default authConfig;

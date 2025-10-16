// Configuración específica del sitio Blocave
export const authConfig = {
  siteName: 'blocave',
  loginRoute: '/blocave/auth/login',
  homeRoute: '/blocave/dashboard',
  unauthorizedRoute: '/blocave/unauthorized',
  
  // Roles específicos del sitio Blocave
  roles: {
    SUPER_ADMIN: 'superadmin',
    ADMIN: 'admin',
    MODERATOR: 'moderator',
    USER: 'user',
    GUEST: 'guest'
  },
  
  // Permisos específicos del sitio Blocave
  permissions: {
    // Gestión de contenido
    CREATE_CONTENT: 'content:create',
    EDIT_CONTENT: 'content:edit',
    DELETE_CONTENT: 'content:delete',
    PUBLISH_CONTENT: 'content:publish',
    
    // Moderación
    MODERATE_COMMENTS: 'moderation:comments',
    MODERATE_USERS: 'moderation:users',
    
    // Administración
    VIEW_ADMIN_PANEL: 'admin:view',
    MANAGE_SETTINGS: 'admin:settings',
    SYSTEM_ACCESS: 'system.access',
    USER_MANAGEMENT: 'users.manage',
    CONTENT_MODERATE: 'content.moderate'
  },
  
  // Ruta al componente de loading
  loadingComponentPath: './sites/blocave/components/LoadingComponent.jsx'
};

export default authConfig;

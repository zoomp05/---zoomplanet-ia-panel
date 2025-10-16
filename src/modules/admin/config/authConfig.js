/**
 * Configuración de autenticación específica del módulo admin
 * Similar al sistema AccessControl de Yii2 - Estructura simplificada
 */

export const adminAuthConfig = {
  moduleName: 'admin',
  
  // Rutas públicas que NO requieren autenticación (para evitar bucles infinitos)
  publicRoutes: [
    'auth/login',
    'auth/register', 
    'auth/forgot-password',
    'auth/reset-password',
    'auth/verify-email',
    'auth/unauthorized'
  ],

  // Configuración de autenticación
  auth: {
    loginRoute: '/admin/auth/login',
    registerRoute: '/admin/auth/register', 
    homeRoute: '/admin/dashboard',
    unauthorizedRoute: '/auth/unauthorized',
    sessionTimeout: 3600000 // 1 hora
  },
  
  // Configuración de cache
  cache: {
    policiesTimeout: 1800000, // 30 minutos
    sessionRefresh: 300000    // 5 minutos
  },
  
  // Rutas protegidas del módulo - Auth procesa roles/permisos automáticamente
  protectedRoutes: {
    '': {                           // /[site]/admin
      allow: true,
      policies: [
        { allow: true },
        { roles: ['admin', 'manager'] },  // Roles permitidos
        { permissions: ['admin.access'] } // Permisos requeridos
      ]
      // redirectTo se omite, usa loginRoute por defecto
    },
    'dashboard': {                  // /[site]/admin/dashboard  
      allow: true,
      policies: [
        { allow: true },
        { roles: ['admin', 'manager'] },
        { permissions: ['admin.access', 'dashboard.view'] }
      ]
    },
    'users': {                      // /[site]/admin/users
      allow: true,
      policies: [
        { allow: true },
        { roles: ['admin'] },  // Solo admin
        { permissions: ['user.manage'] }
      ]
    },
    'users/create': {               // /[site]/admin/users/create
      allow: true,
      policies: [
        { allow: true },
        { roles: ['admin'] },
        { permissions: ['user.create'] }
      ]
    },
    'users/edit': {                 // /[site]/admin/users/edit
      allow: true,
      policies: [
        { allow: true },
        { roles: ['admin'] },
        { permissions: ['user.edit'] }
      ]
    },
    'settings': {                   // /[site]/admin/settings
      allow: true,
      policies: [
        { allow: true },
        { roles: ['admin'] },
        { permissions: ['system.config'] }
      ],
      redirectTo: '/admin' // Redirección específica para esta ruta
    },
    'reports': {                    // /[site]/admin/reports
      allow: true,
      policies: [
        { allow: true },
        { roles: ['admin', 'manager'] },
        { permissions: ['reports.view'] }
      ]
    },
    'special': {                    // Ejemplo de ruta con callback personalizado
      allow: true,
      policies: [
        { allow: true },
        { roles: ['admin'] },
        { 
          matchCallback: (user, siteId, context) => {
            // Lógica especial que Auth no puede procesar automáticamente
            const now = new Date();
            const dayOfWeek = now.getDay();
            return dayOfWeek === 0 || dayOfWeek === 6; // Solo fines de semana
          }
        }
      ]
    }
  },
  
  // Submódulos que puede sobreescribir
  submoduleOverrides: {
    'marketing': {
      'campaigns': {
        allow: true,
        policies: [
          { allow: true },
          { roles: ['admin', 'marketing-manager'] },
          { permissions: ['admin.access', 'marketing.campaigns'] }
        ],
        redirectTo: '/admin'
      },
      'analytics': {
        allow: true,
        policies: [
          { allow: true },
          { roles: ['admin', 'analyst'] },
          { permissions: ['admin.access', 'marketing.analytics'] }
        ],
        redirectTo: '/admin'
      }
    }
  },
  
  
};

export default adminAuthConfig;

/**
 * Ejemplo de configuración de autenticación para el módulo Marketing
 * Estructura simplificada sin funciones complejas
 */

export const marketingAuthConfig = {
  moduleName: 'marketing',
  
  // Rutas públicas que NO requieren autenticación
  publicRoutes: [
    'auth/login',
    'public/demo',
    'public/info'
  ],
  
  // Rutas protegidas del módulo - Auth procesa automáticamente
  protectedRoutes: {
    '': {                           // /[site]/marketing
      allow: true,
      policies: [
        { allow: true },
        { roles: ['admin', 'marketing', 'manager'] },  
        { permissions: ['marketing.access'] }
      ]
    },
    'campaigns': {                  // /[site]/marketing/campaigns
      allow: true,
      policies: [
        { allow: true },
        { roles: ['admin', 'marketing'] },
        { permissions: ['campaign.manage'] }
      ]
    },
    'campaigns/create': {           // /[site]/marketing/campaigns/create
      allow: true,
      policies: [
        { allow: true },
        { roles: ['admin', 'marketing'] },
        { permissions: ['campaign.create'] },
        { 
          matchCallback: (user, siteId, context) => {
            // Solo permitir crear campañas en horario laboral
            const now = new Date();
            const hour = now.getHours();
            return hour >= 9 && hour <= 18;
          }
        }
      ]
    },
    'analytics': {                  // /[site]/marketing/analytics
      allow: true,
      policies: [
        { allow: true },
        { roles: ['admin', 'marketing', 'analyst'] },
        { permissions: ['analytics.view'] }
      ]
    },
    'reports': {                    // /[site]/marketing/reports
      allow: true,
      policies: [
        { allow: true },
        { roles: ['admin', 'marketing'] },
        { permissions: ['reports.generate'] }
      ]
    }
  },
  
  // Configuración de autenticación específica
  auth: {
    defaultRedirect: '/marketing/campaigns',
    loginRoute: '/auth/login',
    registerRoute: '/auth/register',
    homeRoute: '/marketing/campaigns',
    unauthorizedRoute: '/auth/unauthorized',
    sessionTimeout: 7200000 // 2 horas
  },
  
  // Configuración de cache específica
  cache: {
    policiesTimeout: 600000,  // 10 minutos
    sessionRefresh: 180000    // 3 minutos
  }
};

export default marketingAuthConfig;

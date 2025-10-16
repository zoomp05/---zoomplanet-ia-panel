/**
 * Configuración de autenticación para el módulo CRM
 * Unifica acceso a submódulos marketing y newsletter.
 */

export const crmAuthConfig = {
  moduleName: 'crm',
  publicRoutes: [
    'auth/login'
  ],
  auth: {
    loginRoute: '/auth/login',
    homeRoute: '/crm',
    unauthorizedRoute: '/auth/unauthorized',
    sessionTimeout: 5400000 // 1.5h
  },
  cache: {
    policiesTimeout: 900000,
    sessionRefresh: 300000
  },
  protectedRoutes: {
    '': {
      allow: true,
      policies: [
        { allow: true },
        { roles: ['admin','marketing','manager','content','newsletter'] },
        { permissions: ['crm.access'] }
      ]
    },
    'marketing': {
      allow: true,
      inherits: true, // Delega a marketingAuthConfig para rutas internas
      policies: [
        { allow: true },
        { roles: ['admin','marketing'] },
        { permissions: ['marketing.access'] }
      ]
    },
    'newsletter': {
      allow: true,
      policies: [
        { allow: true },
        { roles: ['admin','newsletter','marketing'] },
        { permissions: ['newsletter.access'] }
      ]
    }
  },
  submoduleOverrides: {
    marketing: {
      'campaigns': {
        allow: true,
        policies: [
          { allow: true },
          { roles: ['admin','marketing'] },
          { permissions: ['campaign.manage'] }
        ]
      }
    }
  }
};

export default crmAuthConfig;

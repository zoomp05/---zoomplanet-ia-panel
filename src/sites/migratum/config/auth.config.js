/**
 * Configuración de autenticación para Migratum
 */

export default {
  // Rutas de autenticación
  auth: {
    loginRoute: '/migratum/auth/login',
    registerRoute: '/migratum/auth/register',
    homeRoute: '/migratum/dashboard',
    unauthorizedRoute: '/migratum/auth/unauthorized'
  },
  
  // Rutas públicas (no requieren autenticación)
  publicRoutes: [
    'auth/login',
    'auth/register',
    'auth/forgot-password',
    'auth/reset-password',
    'auth/verify-email',
    'auth/email-confirmation-required'
  ],
  
  // Rutas protegidas
  protectedRoutes: {
    'dashboard': {
      allow: true,
      policies: [{ roles: ['admin', 'user'] }]
    },
    'account': {
      allow: true,
      policies: [{ roles: ['admin', 'user'] }]
    }
  }
};

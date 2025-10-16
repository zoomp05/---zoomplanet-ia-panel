/**
 * Configuración de autenticación del módulo Auth
 * Define políticas para las rutas del propio módulo auth
 */

export const authAuthConfig = {
  moduleName: 'auth',
  
  // Rutas públicas que NO requieren autenticación (la mayoría del módulo auth)
  publicRoutes: [
    '', // /[site]/auth (login page)
    'login',
    'register', 
    'forgot-password',
    'reset-password',
    'verify-email',
    'unauthorized'
  ],
  
  // Rutas protegidas del módulo auth (muy pocas)
  protectedRoutes: {
    'config': {                     // /[site]/auth/config - Configuración de auth
      allow: true,
      policies: [
        { roles: ['admin', 'super-admin'] },  // Solo administradores
        { permissions: ['auth.config'] }      // Permiso específico
      ]
    }
    // Nota: La mayoría de rutas auth son públicas por naturaleza
  },
  
  // Configuración de autenticación (para este módulo específico)
  auth: {
    defaultRedirect: '/',              // Después del login ir al home del sitio
    loginRoute: '/auth/login',         // Ruta de login (dentro del mismo módulo)
    registerRoute: '/auth/register',   // Ruta de registro
    homeRoute: '/',                    // Home del sitio (no del módulo)
    unauthorizedRoute: '/auth/unauthorized',
    sessionTimeout: 7200000,          // 2 horas (más tiempo para usuarios normales)
    allowRegistration: true,           // Permitir registro público
    allowPasswordReset: true           // Permitir reset de password
  },
  
  // Configuración de cache
  cache: {
    policiesTimeout: 1800000, // 30 minutos
    sessionRefresh: 600000    // 10 minutos (más frecuente para auth)
  }
};

export default authAuthConfig;

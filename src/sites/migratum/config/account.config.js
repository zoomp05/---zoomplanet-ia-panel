/**
 * Configuración del módulo Account para Migratum
 */

export default {
  // Rutas protegidas
  protectedRoutes: {
    '': {
      allow: true,
      policies: [{ roles: ['admin', 'user'] }]
    },
    'profile': {
      allow: true,
      policies: [{ roles: ['admin', 'user'] }]
    },
    'settings': {
      allow: true,
      policies: [{ roles: ['admin', 'user'] }]
    }
  }
};

// src/zoom/appConfig.js
// Configuración centralizada de la aplicación para declarar módulos base y reemplazos.
// Esta capa permite desacoplar App/main de implementaciones concretas (Auth, Core, etc.)

export const appConfig = {
  modules: {
    auth: {
      // Nombre del módulo de autenticación a cargar dinámicamente
      moduleName: 'auth',
      // Punto de entrada (index) relativo a src/modules
      entry: 'modules/auth',
      // Componente provider (ruta al contexto) para envolver App, cargado dinámicamente
      provider: 'modules/auth/contexts/AuthContext.jsx',
      // Si en el futuro se cambia a otro módulo (por ejemplo 'authKeycloak') solo se ajusta aquí
    },
    base: {
      // Módulo base con servicios y componentes compartidos (NO confundir con src/zoom)
      moduleName: 'base',
      entry: 'modules/base'
    }
  },
  sites: {
    enabled: ['zoomy'],
    settings: {
      zoomy: {
        defaultRoute: '/zoomy',
        title: 'Zoomy - IA Panel',
        modules: ['admin', 'marketing']
      }
    }
  },
  routing: {
  // Shims actuales; luego moveremos implementación física
  systemLoader: 'zoom/routing/systemLoader.js',
  routeProcessor: 'zoom/routing/routeProcessor.js'
  },
  security: {
  policyProcessor: 'zoom/security/policyProcessor.js'
  }
};

export default appConfig;

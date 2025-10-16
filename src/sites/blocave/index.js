import { registerSiteRoutes } from '../../zoom/routing/routesRegistry';
import siteConfig from './config/index';

// Rutas básicas del sitio Blocave
const routes = [
  {
    path: "/blocave",
    componentPath: "./sites/blocave/pages/Dashboard.jsx"
  },
  {
    path: "/blocave/dashboard",
    componentPath: "./sites/blocave/pages/Dashboard.jsx"
  }
];

export default {
  name: "blocave",
  
  // Configuración del sitio (incluyendo auth)
  config: siteConfig,
  
  // Módulos que este sitio debe cargar
  modules: ['auth'],
  
  // Sin dependencias por ahora
  dependencies: [],
  
  // Función de instalación del sitio
  install: () => {
    // Registramos el sitio Blocave con sus rutas principales
    console.log("Registering Blocave site routes", routes);
    registerSiteRoutes("blocave", routes);
  }
};

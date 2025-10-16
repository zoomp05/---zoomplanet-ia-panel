import { registerModuleRoutes } from '../../zoom/routing/routesRegistry';
import { routes } from './routes/index';

export default {
  name: "user",
  dependencies: ['auth'],
  submodules: [],
  // La función de instalación ahora recibe información sobre su ubicación jerárquica
  install: (siteName, parentModule = null) => {
    console.log(`Registrando rutas del módulo user para el sitio ${siteName}${parentModule ? ` en ${parentModule}` : ''}`);
    registerModuleRoutes("user", routes, siteName, parentModule);
  }
};

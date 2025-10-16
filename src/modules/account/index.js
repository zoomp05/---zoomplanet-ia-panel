import { registerModuleRoutes } from '../../zoom/routing/routesRegistry';
import { routes } from './routes/index';

export default {
  name: 'account',
  dependencies: ['auth'],
  modules: [],
  layouts: {},
  install(siteName, parentModule = null, inheritedLayouts = {}) {
    console.log(`Registrando rutas del módulo account para el sitio ${siteName}${parentModule ? ` bajo ${parentModule}` : ''}`);
    // Heredar layouts del padre (admin) para renderizar dentro de su layout
    const combinedLayouts = { ...inheritedLayouts, ...this.layouts };
    registerModuleRoutes('account', routes, siteName, parentModule, combinedLayouts);
  }
};

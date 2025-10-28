import { registerModuleRoutes } from '../../zoom/routing/routesRegistry';
import { routes } from './routes/index';

export default {
  name: "wallet",
  dependencies: ['auth', 'user'],
  modules: [], // Módulos que administra
  layouts: {
    wallet: "modules/admin/layouts/MainLayout.jsx", // Usa layout de admin por defecto
  },
  install(siteName, parentModule = null, inheritedLayouts = {}, routePrefix = null) {
    console.log(`Registrando rutas del módulo wallet para el sitio ${siteName}${parentModule ? ` en ${parentModule}` : ''}`);
    console.log(`Layouts heredados para wallet:`, inheritedLayouts);
    
    // Combinar layouts heredados con los propios layouts del módulo
    const combinedLayouts = { ...inheritedLayouts, ...this.layouts };
    console.log(`Layouts combinados para wallet:`, combinedLayouts);
    
    // Registrar rutas del módulo wallet
    registerModuleRoutes("wallet", routes, siteName, parentModule, combinedLayouts, { routePrefix });
  }
};
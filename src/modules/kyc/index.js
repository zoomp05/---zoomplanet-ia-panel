import { registerModuleRoutes } from '../../zoom/routing/routesRegistry';
import { routes } from './routes/index';

export default {
  name: "kyc",
  dependencies: ['auth', 'user'],
  modules: [], // Módulos que administra
  layouts: {
    kyc: "modules/admin/layouts/MainLayout.jsx", // Usa layout de admin por defecto
  },
  install(siteName, parentModule = null, inheritedLayouts = {}) {
    console.log(`Registrando rutas del módulo KYC para el sitio ${siteName}${parentModule ? ` en ${parentModule}` : ''}`);
    console.log(`Layouts heredados para KYC:`, inheritedLayouts);
    
    // Combinar layouts heredados con los propios layouts del módulo
    const combinedLayouts = { ...inheritedLayouts, ...this.layouts };
    console.log(`Layouts combinados para KYC:`, combinedLayouts);
    
    // Registrar rutas del módulo KYC
    registerModuleRoutes("kyc", routes, siteName, parentModule, combinedLayouts);
  }
};
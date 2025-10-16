import { registerModuleRoutes } from '../../zoom/routing/routesRegistry';
import { routes } from './routes/index';

export default {
  name: "marketing",
  dependencies: ["project"], // Depende del módulo project para Account
  modules: [],
  install(siteName, parentModule = null, layouts = {}) {
    console.log(`Registrando rutas de 'marketing' en sitio=${siteName}, padre=${parentModule || 'ninguno'}`);
    console.log(`Layouts heredados para marketing:`, layouts);
    console.log(`Específicamente layout para 'marketing':`, layouts.marketing);
    registerModuleRoutes("marketing", routes, siteName, parentModule, layouts);
  }
};

import { registerModuleRoutes } from '../../zoom/routing/routesRegistry';
import { routes } from './routes/index';

export default {
  name: "newsletter",
  dependencies: [],
  submodules: [],
  install(siteName, parentModule = null, layouts = {}) {
    console.log(`Registrando rutas de 'newsletter' en sitio=${siteName}, padre=${parentModule || 'ninguno'}`);
    console.log(`Layouts heredados para newsletter:`, layouts);
    console.log(`Específicamente layout para 'newsletter':`, layouts.newsletter);
    registerModuleRoutes("newsletter", routes, siteName, parentModule, layouts);
  }
};
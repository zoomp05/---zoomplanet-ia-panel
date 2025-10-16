import { registerModuleRoutes } from '../../zoom/routing/routesRegistry';
import { routes } from './routes/index';

export default {
  name: "project",
  dependencies: [],
  submodules: [],
  install(siteName, parentModule = null, layouts = {}) {
    console.log(`Registrando rutas de 'project' en sitio=${siteName}, padre=${parentModule || 'ninguno'}`);
    console.log(`Layouts heredados para project:`, layouts);
    console.log(`Específicamente layout para 'project':`, layouts.project);
    registerModuleRoutes("project", routes, siteName, parentModule, layouts);
  }
};
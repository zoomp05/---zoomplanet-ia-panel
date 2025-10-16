import { registerModuleRoutes } from '../../zoom/routing/routesRegistry';
import { flowRoutes } from './routes';

export default {
  name: 'flow',
  install: (ctx={}) => {
    // Intentamos deducir siteName & parentModule via contexto si se pasa
    const siteName = ctx.siteName || 'zoomy';
    const parentModule = ctx.parentModule || null;
    registerModuleRoutes('flow', flowRoutes, siteName, parentModule);
  },
  dependencies: [],
};

import { registerModuleRoutes } from '../../zoom/routing/routesRegistry';
import { routes } from './routes/index';

export default {
  name: "admin",
  dependencies: [],
  modules: ['base', 'auth', 'project','crm', 'account', 'googleAds', 'marketing'], // Módulos que este módulo administra
  layouts: {
    // NOTA: Estas sobreescrituras son para operaciones CRUD/admin, no para rutas públicas de auth
    // Las rutas públicas (login, register) seguirán usando el layout por defecto del módulo auth
    // Solo las rutas administrativas de auth usarán el layout de admin
    // auth: "modules/admin/layouts/MainLayout.jsx", // COMENTADO: Solo para CRUD admin de usuarios
    project: "modules/admin/layouts/MainLayout.jsx",
    crm: "modules/admin/layouts/MainLayout.jsx", 
    marketing: "modules/admin/layouts/MainLayout.jsx",
    googleAds: "modules/admin/layouts/MainLayout.jsx",
    account: "modules/admin/layouts/MainLayout.jsx",
    newsletter: "modules/admin/layouts/MainLayout.jsx",
  },
  install(siteName, parentModule = null, inheritedLayouts = {}) { // <-- función normal
    console.log(`Registrando rutas del módulo admin para el sitio ${siteName}${parentModule ? ` en ${parentModule}` : ''}`);
    console.log(`Layouts heredados para admin:`, inheritedLayouts);
    // Combinar layouts heredados con los propios layouts del módulo
    const combinedLayouts = { ...inheritedLayouts, ...this.layouts };
    console.log(`Layouts combinados para admin:`, combinedLayouts);
    // Registrar rutas del módulo admin
  registerModuleRoutes("admin", routes, siteName, parentModule, combinedLayouts);
  }
};

// Actualizado: usar registro centralizado migrado
import { registerModuleRoutes } from '../../zoom/routing/routesRegistry';
import { routes, defaultLayoutConfig } from './routes';

export default {
  name: "auth",
  dependencies: [],
  
  // Configuración por defecto de layouts del módulo
  defaultLayouts: defaultLayoutConfig,
  
  install(siteName, parentModule = null, inheritedLayouts = {}) {
    // Validar que siteName sea proporcionado
    if (!siteName) {
      throw new Error("Auth module: siteName es requerido");
    }
    
    console.log(`🔐 Registrando módulo Auth:`);
    console.log(`   Sitio: ${siteName}`);
    console.log(`   Módulo padre: ${parentModule || 'ninguno'}`);
    console.log(`   Layouts heredados:`, inheritedLayouts);
    
    // Jerarquía de layouts: inheritedLayouts > route.layout > defaultLayouts
    const authLayoutOverride = inheritedLayouts.auth;
    if (authLayoutOverride) {
      console.log(`   🎨 Layout sobreescrito por padre: ${authLayoutOverride}`);
    } else {
      console.log(`   🎨 Usando layout por defecto: ${defaultLayoutConfig.defaultLayout}`);
    }
    
    registerModuleRoutes("auth", routes, siteName, parentModule, inheritedLayouts);
  }
};

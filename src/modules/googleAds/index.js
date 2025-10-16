/**
 * Módulo GoogleAds
 * 
 * Módulo para integración con Google Ads API.
 * Permite gestionar campañas, anuncios, métricas y sincronización
 * con el módulo de Marketing (opcional).
 * 
 * Características:
 * - Gestión de campañas de Google Ads
 * - Sincronización con Marketing Campaigns (opcional)
 * - Métricas y reportes en tiempo real
 * - Gestión de presupuestos y pujas
 * - Keywords y targeting
 */

import { registerModuleRoutes } from '../../zoom/routing/routesRegistry';
import { routes } from './routes/index';

export default {
  name: "googleAds",
  
  // Dependencias opcionales
  // Si marketing está disponible, se podrá vincular con MarketingCampaign
  dependencies: [],
  
  // Submódulos internos (vacío por ahora)
  modules: [],
  
  // Layouts específicos del módulo
  layouts: {
    googleAds: "modules/googleAds/layouts/MainLayout.jsx"
  },
  
  /**
   * Instalación del módulo
   * @param {string} siteName - Nombre del sitio (ej: 'zoomy')
   * @param {string|null} parentModule - Módulo padre si aplica
   * @param {Object} layouts - Layouts heredados
   */
  install(siteName, parentModule = null, layouts = {}) {
    console.log(`📢 Registrando rutas de 'googleAds' en sitio=${siteName}, padre=${parentModule || 'ninguno'}`);
    console.log(`📦 Layouts heredados para googleAds:`, layouts);
    
    // Registrar rutas del módulo
    registerModuleRoutes("googleAds", routes, siteName, parentModule, layouts);
    
    console.log(`✅ Módulo GoogleAds registrado correctamente`);
  },
  
  /**
   * Metadata del módulo
   */
  metadata: {
    version: '1.0.0',
    description: 'Integración con Google Ads API para gestión de campañas publicitarias',
    author: 'ZoomPlanet Team',
    features: [
      'Gestión de campañas Google Ads',
      'Sincronización con Marketing Campaigns',
      'Métricas y reportes en tiempo real',
      'Gestión de presupuestos y keywords',
      'Optimización automática con IA'
    ]
  }
};

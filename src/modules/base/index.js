/**
 * Módulo Base
 * 
 * Proporciona funcionalidad común y servicios base para todos los módulos del sistema.
 * Este módulo NO debe confundirse con src/zoom (core del sistema).
 * 
 * Responsabilidades:
 * - Servicios de utilidades comunes
 * - Componentes base reutilizables (como SiteConfiguration)
 * - Configuración compartida
 * - Helpers y herramientas comunes
 */

import { registerModuleRoutes } from '../../zoom/routing/routesRegistry.js';

// Exportar componentes importantes para que otros módulos puedan importarlos directamente
export { default as SiteConfiguration } from './pages/SiteConfiguration.jsx';

export default {
  name: 'base',
  version: '1.0.0',
  
  /**
   * Instalación del módulo base
   */
  install: async () => {
    console.log('📦 ========================================');
    console.log('📦 Instalando módulo: Base');
    console.log('📦 ========================================');
    
    try {
      // Registrar rutas del módulo base (si otros módulos quieren usarlas)
      // Aunque principalmente se importará el componente directamente
      console.log('✅ Módulo Base instalado correctamente');
      console.log('✅ Componente SiteConfiguration disponible para importación');
      
      return {
        success: true,
        message: 'Módulo Base cargado correctamente'
      };
    } catch (error) {
      console.error('❌ Error instalando módulo Base:', error);
      throw error;
    }
  },
  
  /**
   * Servicios exportados por el módulo base
   */
  services: {
    // Aquí irán servicios comunes como:
    // - Logger
    // - Cache
    // - Storage
    // - HTTP Client
    // - Validadores
    // etc.
  },
  
  /**
   * Componentes exportados
   */
  components: {
    SiteConfiguration: () => import('./pages/SiteConfiguration.jsx'),
    // Más componentes UI base compartidos
  },
  
  /**
   * Utilidades exportadas
   */
  utils: {
    // Funciones de utilidad compartidas
  }
};

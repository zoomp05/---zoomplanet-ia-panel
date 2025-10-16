// Sistema de inicialización de módulos

// Importar los sitios y módulos principales
import authModule from './auth/index';
import crmModule from './crm/index';
import zoomySite from '@sites/zoomy/index';

// Arreglo de todos los módulos y sitios
const allModules = [
  authModule,
  crmModule,
  zoomySite,
  // Aquí puedes añadir más módulos y sitios cuando los crees
];

// Función para ordenar los módulos basado en dependencias
const sortModules = (modules) => {
  const moduleMap = new Map();
  modules.forEach(module => moduleMap.set(module.name, module));
  
  const visited = new Set();
  const sorted = [];
  
  function visit(moduleName) {
    if (visited.has(moduleName)) return;
    visited.add(moduleName);
    
    const module = moduleMap.get(moduleName);
    if (!module) return; // Módulo no encontrado
    
    // Visitar primero las dependencias
    if (module.dependencies && module.dependencies.length > 0) {
      module.dependencies.forEach(dep => visit(dep));
    }
    
    sorted.push(module);
  }
  
  // Visitar todos los módulos
  modules.forEach(module => visit(module.name));
  
  return sorted;
};

// Inicializa todos los módulos en el orden correcto
export const initModules = () => {
  console.log("Initializing all modules and sites...");
  
  // Ordenar los módulos basado en sus dependencias
  const sortedModules = sortModules(allModules);
  
  // Inicializar cada módulo
  sortedModules.forEach(module => {
    console.log(`Installing module: ${module.name}`);
    module.install();
  });
  
  console.log("All modules and sites initialized successfully");
};

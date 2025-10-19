/**
 * Hook onModuleLoad - Ejecutado cuando se carga un módulo
 */

export default async function onModuleLoad(moduleId, moduleInstance) {
  console.log(`📦 Migratum: Módulo cargado - ${moduleId}`);
  
  // Aquí se pueden hacer tareas cuando se carga cada módulo
  // Por ejemplo: registrar analytics, logging, etc.
  
  return true;
}

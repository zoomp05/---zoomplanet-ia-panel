/**
 * Hook onModuleError - Ejecutado cuando hay un error al cargar un módulo
 */

export default async function onModuleError(moduleId, error) {
  console.error(`❌ Migratum: Error en módulo - ${moduleId}`, error);
  
  // Aquí se pueden manejar errores de módulos
  // Por ejemplo: registrar en servicio de logging, mostrar notificación, etc.
  
  return true;
}

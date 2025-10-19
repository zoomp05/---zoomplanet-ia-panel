/**
 * Hook afterInit - Ejecutado después de inicializar el sitio
 */

export default async function afterInit() {
  console.log('✅ Migratum: Ejecutando hook afterInit...');
  
  // Aquí se pueden hacer tareas post-inicialización
  // Por ejemplo: cargar datos iniciales, inicializar servicios, etc.
  
  return true;
}

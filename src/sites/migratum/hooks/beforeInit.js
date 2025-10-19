/**
 * Hook beforeInit - Ejecutado antes de inicializar el sitio
 */

export default async function beforeInit() {
  console.log('🔧 Migratum: Ejecutando hook beforeInit...');
  
  // Aquí se pueden hacer validaciones pre-inicialización
  // Por ejemplo: verificar localStorage, validar permisos, etc.
  
  return true;
}

// Registro simple para configuraciones de navegación por módulo
const navigationModules = new Map();
const listeners = new Set();

export function registerModuleNavigation(moduleName, navigationConfig) {
  if (!moduleName || !navigationConfig) return;
  navigationModules.set(moduleName, navigationConfig);
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[navigationRegistry] registrado', moduleName);
  }
  listeners.forEach(cb => {
    try { cb(getAllNavigationConfigs()); } catch(e) { /* noop */ }
  });
}

export function getModuleNavigation(moduleName) {
  return navigationModules.get(moduleName);
}

export function getAllNavigationConfigs() {
  return Array.from(navigationModules.entries()).map(([name, config]) => ({ name, config }));
}

export function subscribeNavigation(callback) {
  if (typeof callback !== 'function') return () => {};
  listeners.add(callback);
  // emitir inmediatamente
  try { callback(getAllNavigationConfigs()); } catch(e) {}
  return () => listeners.delete(callback);
}

export default { registerModuleNavigation, getModuleNavigation, getAllNavigationConfigs, subscribeNavigation };

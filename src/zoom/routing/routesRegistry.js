// Centralized routes registry (migrated from src/config/routesRegistry.js)
// Mantiene la misma API pública.

const routeTree = {};
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// Buscar módulo (node) recursivamente en árbol de módulos de un sitio
const findModuleNode = (modulesObj, targetName) => {
  if (!modulesObj) return null;
  if (modulesObj[targetName]) return modulesObj[targetName];
  for (const key of Object.keys(modulesObj)) {
    const child = modulesObj[key];
    if (child && child.submodules) {
      const found = findModuleNode(child.submodules, targetName);
      if (found) return found;
    }
  }
  return null;
};

export const registerSiteRoutes = (siteName, routes) => {
  if (!siteName) return; if (!routeTree[siteName]) routeTree[siteName] = { base: [], modules: {} };
  routeTree[siteName].base = deepClone(routes || []);
};

export const registerModuleRoutes = (moduleName, routes, siteName, parentModule = null, inheritedLayouts = {}, options = {}) => {
  if (!siteName || !moduleName) return;
  if (!routeTree[siteName]) routeTree[siteName] = { base: [], modules: {} };
  const clonedRoutes = deepClone(routes || []);
  const routePrefix = options.routePrefix || null;

  if (!parentModule) {
    // Registro a nivel raíz
    routeTree[siteName].modules[moduleName] = { routes: clonedRoutes, submodules: {}, inheritedLayouts, routePrefix };
    return;
  }

  // Buscar el nodo del módulo padre en cualquier profundidad
  const parentNode = findModuleNode(routeTree[siteName].modules, parentModule);
  if (!parentNode) {
    // Si no existe el padre, crearlo en raíz para no perder las rutas (fallback)
    if (!routeTree[siteName].modules[parentModule]) {
      routeTree[siteName].modules[parentModule] = { routes: [], submodules: {}, inheritedLayouts: {}, routePrefix: null };
    }
    routeTree[siteName].modules[parentModule].submodules[moduleName] = { routes: clonedRoutes, submodules: {}, inheritedLayouts, routePrefix };
    return;
  }

  if (!parentNode.submodules) parentNode.submodules = {};
  parentNode.submodules[moduleName] = { routes: clonedRoutes, submodules: {}, inheritedLayouts, routePrefix };
};

export const getAllRoutes = () => {
  const collected = [];

  const pushRoutes = (siteName, moduleChain, moduleNode, pathSegments = []) => {
    const currentName = moduleChain[moduleChain.length - 1];
    const currentSegment = moduleNode.routePrefix || currentName;
    const accumulated = [...pathSegments, currentSegment];
    const base = `/${siteName}/${accumulated.join('/')}`;
    (moduleNode.routes || []).forEach(r => {
      const full = (r.path === '' || r.path == null) ? base : `${base}${r.path.startsWith('/') ? r.path : '/' + r.path}`;
      collected.push({ ...r, path: full });
    });
    Object.entries(moduleNode.submodules || {}).forEach(([subName, subNode]) => {
      pushRoutes(siteName, [...moduleChain, subName], subNode, accumulated);
    });
  };

  Object.keys(routeTree).forEach(siteName => {
    const site = routeTree[siteName];
    site.base.forEach(r => {
      const normalizedPath = r.path && r.path.startsWith('/') ? r.path : `/${siteName}${r.path ? (r.path.startsWith('/') ? r.path : `/${r.path}`) : ''}`;
      collected.push({ ...r, path: normalizedPath });
    });
    Object.entries(site.modules).forEach(([modName, modNode]) => {
      pushRoutes(siteName, [modName], modNode, []);
    });
  });
  return collected;
};

export const clearAllRoutes = () => { Object.keys(routeTree).forEach(k => delete routeTree[k]); };

export const getAllLayouts = () => {
  const layouts = {};
  Object.values(routeTree).forEach(site => {
    const process = modules => {
      Object.keys(modules).forEach(m => {
        const mod = modules[m];
        if (mod.inheritedLayouts) Object.entries(mod.inheritedLayouts).forEach(([k,v]) => { layouts[k]=v; });
        if (mod.submodules) process(mod.submodules);
      });
    };
    process(site.modules);
  });
  return layouts;
};

export const debugRouteTree = () => routeTree;

export default {
  registerSiteRoutes,
  registerModuleRoutes,
  getAllRoutes,
  clearAllRoutes,
  getAllLayouts,
  debugRouteTree
};

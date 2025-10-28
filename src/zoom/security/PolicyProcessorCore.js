// src/zoom/security/PolicyProcessorCore.js
// Versión centralizada del PolicyProcessor movida desde modules/auth/services.

class PolicyProcessor {
  constructor() {
    this.moduleConfigs = new Map();
    this.siteAuthConfigs = new Map();
    this.cache = new Map();
  // Nueva estructura jerárquica
  // hierarchy: { [siteName]: { authConfig, modules: { [moduleName]: ModuleNode } } }
  // ModuleNode: { name, authConfig, children: {}, parent: string|null, routePrefix: string|null }
  this.hierarchy = {};
  }
  registerSiteAuthConfig(siteName, siteAuthConfig) { if (!siteName || !siteAuthConfig) return; this.siteAuthConfigs.set(siteName, siteAuthConfig); console.log(`✅ AuthConfig de sitio registrado: ${siteName}`); }
  registerModuleHierarchy(siteName, moduleName, moduleConfig, parentModuleName = null) {
    if (!siteName || !moduleName) return;
    if (!this.hierarchy[siteName]) this.hierarchy[siteName] = { authConfig: this.siteAuthConfigs.get(siteName) || null, modules: {} };
    const siteNode = this.hierarchy[siteName];
    const ensureNode = (name) => {
      if (!siteNode.modules[name]) siteNode.modules[name] = { name, authConfig: null, children: {}, parent: null, routePrefix: null };
      return siteNode.modules[name];
    };
    const node = ensureNode(moduleName);
    node.authConfig = moduleConfig?.auth || null;
    node.routePrefix = moduleConfig?.routing?.routePrefix || moduleConfig?.routePrefix || node.routePrefix || null;
    if (parentModuleName) {
      const parent = ensureNode(parentModuleName);
      node.parent = parentModuleName;
      if (!parent.children[moduleName]) parent.children[moduleName] = node;
    }
  }
  getHierarchy(siteName = null) { return siteName ? this.hierarchy[siteName] : this.hierarchy; }
  getModulePathSegment(siteName, moduleName) {
    if (!siteName || !moduleName) return null;
    const siteNode = this.hierarchy[siteName];
    const moduleNode = siteNode?.modules?.[moduleName];
    const configPrefix = this.moduleConfigs.get(moduleName)?.routePrefix || null;
    return moduleNode?.routePrefix || configPrefix || moduleName;
  }
  resolveModuleChainFromPath(siteName, pathSegments = []) {
    if (!siteName) return [];
    const siteNode = this.hierarchy[siteName];
    if (!siteNode) return [];
    const chain = [];
    let currentModules = siteNode.modules;
    let currentNode = null;
    for (const segment of pathSegments) {
      if (!currentModules) break;
      const entries = Object.entries(currentModules);
      const match = entries.find(([name, node]) => {
        const seg = node.routePrefix || name;
        return seg === segment;
      });
      if (!match) break;
      const [name, node] = match;
      chain.push(name);
      currentNode = node;
      currentModules = node.children;
    }
    return chain;
  }
  buildModuleChain(siteName, moduleName) {
    const siteNode = this.hierarchy[siteName]; if (!siteNode) return [];
    const modules = siteNode.modules; const chain = []; let current = modules[moduleName];
    while (current) { chain.unshift(current); if (!current.parent) break; current = modules[current.parent]; }
    return chain; // de raíz a hoja
  }
  getEffectiveAuthConfig(siteName, moduleName) {
    const siteConfig = this.siteAuthConfigs.get(siteName) || {};
    if (!moduleName) return siteConfig;
    const chain = this.buildModuleChain(siteName, moduleName);
    const merged = { ...siteConfig }; // herencia: site -> cada módulo (override)
    for (const node of chain) {
      if (node.authConfig) {
        Object.assign(merged, Object.fromEntries(Object.entries(node.authConfig).filter(([k]) => ['loginRoute','registerRoute','homeRoute','unauthorizedRoute','defaultRedirect'].includes(k))));
      }
    }
    return merged;
  }
  resolvePostLoginHome(siteName, moduleNameChain = []) {
    // moduleNameChain: lista de módulos desde más específico a menos (ej: ['auth','admin'])
    const ordered = [...new Set(moduleNameChain.filter(Boolean))];
    // Probar ignorando 'auth' primero (padre), luego propio módulo, luego site, luego otros módulos.
    for (const mod of ordered) {
      if (mod === 'auth') continue; // auth submódulo, preferir padre
      const eff = this.getEffectiveAuthConfig(siteName, mod);
      if (eff.homeRoute) return this.resolveHierarchicalRoute(eff.homeRoute, siteName, mod, {});
    }
    // Si no se encontró y estamos sólo en auth, usar site -> auth -> otros
    const siteEff = this.getEffectiveAuthConfig(siteName, null);
    if (siteEff.homeRoute) return this.resolveHierarchicalRoute(siteEff.homeRoute, siteName, null, {});
    // Buscar primer módulo con homeRoute
    const siteNode = this.hierarchy[siteName];
    if (siteNode) {
      for (const modName of Object.keys(siteNode.modules)) {
        const eff = this.getEffectiveAuthConfig(siteName, modName);
        if (eff.homeRoute) return this.resolveHierarchicalRoute(eff.homeRoute, siteName, modName, {});
      }
    }
    return `/${siteName}/dashboard`;
  }
  /**
   * Resolución unificada post-login considerando:
   * 1. Si estamos dentro de un módulo padre que incluye auth como submódulo.
   * 2. Si auth está standalone pero existen módulos padres que exponen rutas publicRoutes 'auth/*'.
   * 3. Herencia jerárquica (site -> módulo padre -> submódulos).
   */
  getPostLoginRedirect(siteName, currentModule, relativePath = '') {
    // Caso submódulo: /site/{parent}/auth/... => currentModule = parent, relativePath empieza con auth/
    if (currentModule && relativePath.startsWith('auth/')) {
      return this.resolvePostLoginHome(siteName, [currentModule, 'auth']);
    }
    // Caso auth standalone: /site/auth/login
    if (currentModule === 'auth') {
      // Detectar candidatos que expongan auth/* en publicRoutes
      const parents = [];
      const siteNode = this.hierarchy[siteName];
      if (siteNode) {
        for (const [modName, modNode] of Object.entries(siteNode.modules)) {
          if (modName === 'auth') continue;
          const cfg = this.moduleConfigs.get(modName);
          if (cfg && Array.isArray(cfg.publicRoutes) && cfg.publicRoutes.some(r => r.startsWith('auth/'))) {
            parents.push(modName);
          }
        }
      }
      if (parents.length === 1) return this.resolvePostLoginHome(siteName, [parents[0], 'auth']);
      if (parents.length > 1) {
        // Heurística de selección genérica (mismo criterio que antes): homeRoute + protectedRoutes
        const scored = parents.map(mName => {
          const cfg = this.moduleConfigs.get(mName) || {}; const hasHome = cfg?.auth?.homeRoute ? 1 : 0; const protectedCount = cfg?.protectedRoutes ? Object.keys(cfg.protectedRoutes).length : 0; const hasProtected = protectedCount > 0 ? 1 : 0; return { mName, score: hasHome + hasProtected, protectedCount };
        }).sort((a,b)=> b.score - a.score || b.protectedCount - a.protectedCount || a.mName.localeCompare(b.mName));
        return this.resolvePostLoginHome(siteName, [scored[0].mName, 'auth']);
      }
      // Sin padres: usar jerarquía general
      return this.resolvePostLoginHome(siteName, ['auth']);
    }
    // Módulo normal (no auth). Usar su cadena jerárquica para home.
    return this.resolvePostLoginHome(siteName, [currentModule]);
  }
  resolveHierarchicalRoute(route, currentSite, currentModule, context = {}) {
    console.log('[resolveHierarchicalRoute] 🔍 Input:', { route, currentSite, currentModule });

    if (currentSite && route.startsWith(`/${currentSite}/`)) {
      console.log('[resolveHierarchicalRoute] ✅ (1) Ruta ya completa, retornando:', route);
      return route;
    }

    if (route.startsWith('/')) {
      const routeParts = route.substring(1).split('/');
      const possibleModule = routeParts[0];
      
      // CORRECCIÓN CLAVE: Si el módulo actual es un padre (ej: 'admin') y la ruta
      // que se quiere resolver es para un submódulo (ej: '/auth/login'),
      // debemos construir la ruta jerárquicamente.
      if (currentModule && currentModule !== possibleModule) {
        const siteNode = this.hierarchy[currentSite];
        const parentNode = siteNode?.modules?.[currentModule];
        if (parentNode?.children?.[possibleModule]) {
          const parentSegment = this.getModulePathSegment(currentSite, currentModule);
          const result = `/${currentSite}/${parentSegment}${route}`;
          console.log(`[resolveHierarchicalRoute] ✅ (2) Forzando jerarquía: ${parentSegment} + ${route} -> ${result}`);
          return result;
        }
      }

      // Si no hay un módulo padre que corregir, se añade el sitio.
      const result = `/${currentSite}${route}`;
      console.log(`[resolveHierarchicalRoute] ✅ (3) Añadiendo sitio a ruta absoluta: ${result}`);
      return result;
    }

    // Para rutas relativas (sin / inicial)
    if (currentModule) {
      const parentSegment = this.getModulePathSegment(currentSite, currentModule);
      const result = `/${currentSite}/${parentSegment}/${route}`;
      console.log(`[resolveHierarchicalRoute] ✅ (4) Ruta relativa con módulo: ${result}`);
      return result;
    }

    const result = `/${currentSite}/${route}`;
    console.log(`[resolveHierarchicalRoute] ✅ (5) Ruta relativa sin módulo: ${result}`);
    return result;
  }

  getResolvedAuthConfig(moduleConfig, currentSite, currentModule, context = {}) {
    const moduleAuth = moduleConfig?.auth || {}; const siteAuth = currentSite ? (this.siteAuthConfigs.get(currentSite) || {}) : {};
    const moduleSegment = currentModule ? this.getModulePathSegment(currentSite, currentModule) : null;
    const defaultPath = moduleSegment ? `/${moduleSegment}/dashboard` : '/dashboard';
    const pick = (key, def) => { const v = siteAuth?.[key] ?? moduleAuth?.[key] ?? def; return this.resolveHierarchicalRoute(v, currentSite, currentModule, context); };
    return {
      defaultRedirect: pick('defaultRedirect', defaultPath),
      loginRoute: pick('loginRoute', '/auth/login'),
      registerRoute: pick('registerRoute', '/auth/register'),
      homeRoute: pick('homeRoute', defaultPath),
      unauthorizedRoute: pick('unauthorizedRoute', '/auth/unauthorized')
    };
  }
  registerModule(moduleConfig) { this.moduleConfigs.set(moduleConfig.moduleName, moduleConfig); console.log(`✅ Módulo registrado: ${moduleConfig.moduleName}`); }
  async evaluateAccess(moduleName, route, user, siteId, context = {}) {
    const moduleConfig = this.moduleConfigs.get(moduleName);
  if (!moduleConfig) { console.warn(`⚠️ No se encontró configuración para el módulo: ${moduleName}`); const fallbackLoginRoute = this.resolveHierarchicalRoute('/auth/login', siteId, null, context); return { allow: false, redirectTo: fallbackLoginRoute }; }
    const resolvedAuthConfig = this.getResolvedAuthConfig(moduleConfig, siteId, moduleName, context);
    const routeConfig = this.findRouteConfig(moduleConfig, route);
    if (!routeConfig) { console.log(`✅ Ruta sin configuración específica, permitiendo acceso: ${route}`); return { allow: true }; }
    if (!routeConfig.allow) { const redirectTo = routeConfig.redirectTo ? this.resolveHierarchicalRoute(routeConfig.redirectTo, siteId, moduleName, context) : resolvedAuthConfig.loginRoute; return { allow: false, redirectTo }; }
    if (routeConfig.policies && routeConfig.policies.length > 0) { for (const policy of routeConfig.policies) { const hasAccess = await this.evaluatePolicyRule(policy, user, siteId, context); if (!hasAccess) { const redirectTo = routeConfig.redirectTo ? this.resolveHierarchicalRoute(routeConfig.redirectTo, siteId, moduleName, context) : resolvedAuthConfig.loginRoute; return { allow: false, redirectTo, failedPolicy: this.getPolicyDescription(policy) }; } } }
    return { allow: true };
  }
  async evaluatePolicyRule(policy, user, siteId, context) {
    if (policy.allow === true && Object.keys(policy).length === 1) return true;
    if (!user && (policy.roles || policy.permissions || policy.matchCallback)) return false;
    if (policy.roles && policy.roles.length > 0) { const userRoles = await this.getUserRoles(user?.id, siteId); const hasRole = policy.roles.some(requiredRole => { if (requiredRole === '@') return !!user; if (requiredRole === '?') return true; return userRoles.some(userRole => userRole.name === requiredRole); }); if (!hasRole) return false; }
    if (policy.permissions && policy.permissions.length > 0) { const userPermissions = await this.getUserPermissions(user?.id, siteId); const hasPermission = policy.permissions.some(requiredPermission => userPermissions.some(userPermission => userPermission.name === requiredPermission)); if (!hasPermission) return false; }
    if (policy.matchCallback && typeof policy.matchCallback === 'function') { try { return policy.matchCallback(user, siteId, context); } catch (error) { console.error('Error en matchCallback:', error); return false; } }
    return true;
  }
  async getUserRoles(userId, siteId) { if (!userId) return []; return [{ name: 'admin' }, { name: 'user' }]; }
  async getUserPermissions(userId, siteId) { if (!userId) return []; return [{ name: 'admin.access' }, { name: 'user.manage' }, { name: 'dashboard.view' }, { name: 'user.create' }, { name: 'user.edit' }, { name: 'system.config' }, { name: 'reports.view' }, { name: 'marketing.access' }, { name: 'campaign.manage' }, { name: 'campaign.create' }, { name: 'analytics.view' }, { name: 'reports.generate' }]; }
  findRouteConfig(moduleConfig, route) { const normalizedRoute = route.startsWith('/') ? route.slice(1) : route; if (moduleConfig.protectedRoutes[normalizedRoute]) return moduleConfig.protectedRoutes[normalizedRoute]; const routeParts = normalizedRoute.split('/'); for (let i = routeParts.length - 1; i >= 0; i--) { const parentRoute = routeParts.slice(0, i).join('/'); if (moduleConfig.protectedRoutes[parentRoute]) { return moduleConfig.protectedRoutes[parentRoute]; } } return moduleConfig.protectedRoutes['']; }
  getPolicyDescription(policy) { const parts = []; if (policy.roles) parts.push(`roles: [${policy.roles.join(', ')}]`); if (policy.permissions) parts.push(`permissions: [${policy.permissions.join(', ')}]`); if (policy.matchCallback) parts.push('callback personalizado'); return parts.join(' + ') || 'política desconocida'; }
  getRedirectRoute(moduleName, type = 'login', siteId = null, context = {}) {
    const moduleConfig = this.moduleConfigs.get(moduleName);
    const siteAuth = siteId ? this.siteAuthConfigs.get(siteId) : null;
    if (siteAuth) {
      const keyMap = { login: 'loginRoute', register: 'registerRoute', home: 'homeRoute', unauthorized: 'unauthorizedRoute' };
      const key = keyMap[type] || 'loginRoute';
      const candidate = siteAuth[key];
      if (candidate) {
        return this.resolveHierarchicalRoute(candidate, siteId, moduleName, context);
      }
    }
    if (!moduleConfig || !moduleConfig.auth) {
      const fallbackRoute = this.resolveHierarchicalRoute('/auth/login', siteId, moduleName, context);
      return fallbackRoute;
    }
    const resolvedAuthConfig = this.getResolvedAuthConfig(moduleConfig, siteId, moduleName, context);
    switch (type) {
      case 'login':
        return resolvedAuthConfig.loginRoute;
      case 'register':
        return resolvedAuthConfig.registerRoute;
      case 'home':
        return resolvedAuthConfig.homeRoute;
      case 'unauthorized':
        return resolvedAuthConfig.unauthorizedRoute;
      default:
        return resolvedAuthConfig.loginRoute;
    }
  }
  clearCache() { this.cache.clear(); }
  getStats() { const stats = { totalModules: this.moduleConfigs.size, modules: {} }; for (const [moduleName, config] of this.moduleConfigs) { stats.modules[moduleName] = { routes: Object.keys(config.protectedRoutes || {}).length }; } return stats; }
}
export const policyProcessor = new PolicyProcessor();
export default PolicyProcessor;


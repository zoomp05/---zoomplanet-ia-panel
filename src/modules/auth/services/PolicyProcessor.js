/**
 * PolicyProcessor - Procesador de políticas estilo Yii2
 * Procesa automáticamente roles y permisos definidos en authConfig
 */

class PolicyProcessor {
  constructor() {
    this.moduleConfigs = new Map();
    this.siteAuthConfigs = new Map(); // authConfig por sitio
    this.cache = new Map();
  }

  /**
   * Permite registrar una configuración de autenticación a nivel de sitio
   * @param {string} siteName
   * @param {object} siteAuthConfig
   */
  registerSiteAuthConfig(siteName, siteAuthConfig) {
    if (!siteName || !siteAuthConfig) return;
    this.siteAuthConfigs.set(siteName, siteAuthConfig);
    console.log(`✅ AuthConfig de sitio registrado: ${siteName}`);
  }

  /**
   * Resuelve rutas jerárquicas completando la estructura completa
   * @param {string} route - Ruta a resolver (ej: '/admin/auth/login')
   * @param {string} currentSite - Sitio actual
   * @param {string} currentModule - Módulo actual
   * @param {Object} context - Contexto adicional
   * @returns {string} - Ruta completa resuelta
   */
  resolveHierarchicalRoute(route, currentSite, currentModule, context = {}) {
    // Si ya está completa con el sitio, devolverla
    if (currentSite && route.startsWith(`/${currentSite}/`)) {
      return route;
    }

    // Si la ruta es absoluta sin sitio
    if (route.startsWith('/')) {
      const routeParts = route.substring(1).split('/');
      const possibleModule = routeParts[0];
      if (this.moduleConfigs.has(possibleModule)) {
        return `/${currentSite}${route}`;
      }
      if (currentModule && !route.startsWith(`/${currentModule}/`)) {
        return `/${currentSite}/${currentModule}${route}`;
      }
      return `/${currentSite}${route}`;
    }

    // Ruta relativa
    if (currentModule) {
      return `/${currentSite}/${currentModule}/${route}`;
    }
    return `/${currentSite}/${route}`;
  }

  /**
   * Obtiene la configuración de redirección con rutas resueltas
   */
  getResolvedAuthConfig(moduleConfig, currentSite, currentModule, context = {}) {
    const moduleAuth = moduleConfig?.auth || {};
    const siteAuth = currentSite ? (this.siteAuthConfigs.get(currentSite) || {}) : {};

    // Prioridad: siteAuth > moduleAuth > defaults
    const pick = (key, def) => {
      const v = siteAuth?.[key] ?? moduleAuth?.[key] ?? def;
      return this.resolveHierarchicalRoute(v, currentSite, currentModule, context);
    };

    return {
      defaultRedirect: pick('defaultRedirect', `/${currentModule || ''}/dashboard`),
      loginRoute: pick('loginRoute', '/auth/login'),
      registerRoute: pick('registerRoute', '/auth/register'),
      homeRoute: pick('homeRoute', `/${currentModule || ''}/dashboard`),
      unauthorizedRoute: pick('unauthorizedRoute', '/auth/unauthorized')
    };
  }

  registerModule(moduleConfig) {
    this.moduleConfigs.set(moduleConfig.moduleName, moduleConfig);
    console.log(`✅ Módulo registrado: ${moduleConfig.moduleName}`);
  }

  async evaluateAccess(moduleName, route, user, siteId, context = {}) {
    const moduleConfig = this.moduleConfigs.get(moduleName);
    if (!moduleConfig) {
      console.warn(`⚠️ No se encontró configuración para el módulo: ${moduleName}`);
      const fallbackLoginRoute = this.resolveHierarchicalRoute('/auth/login', siteId, null, context);
      return { allow: false, redirectTo: fallbackLoginRoute };
    }

    const resolvedAuthConfig = this.getResolvedAuthConfig(moduleConfig, siteId, moduleName, context);

    const routeConfig = this.findRouteConfig(moduleConfig, route);
    if (!routeConfig) {
      console.log(`✅ Ruta sin configuración específica, permitiendo acceso: ${route}`);
      return { allow: true };
    }

    if (!routeConfig.allow) {
      const redirectTo = routeConfig.redirectTo
        ? this.resolveHierarchicalRoute(routeConfig.redirectTo, siteId, moduleName, context)
        : resolvedAuthConfig.loginRoute;
      return { allow: false, redirectTo };
    }

    if (routeConfig.policies && routeConfig.policies.length > 0) {
      for (const policy of routeConfig.policies) {
        const hasAccess = await this.evaluatePolicyRule(policy, user, siteId, context);
        if (!hasAccess) {
          const redirectTo = routeConfig.redirectTo
            ? this.resolveHierarchicalRoute(routeConfig.redirectTo, siteId, moduleName, context)
            : resolvedAuthConfig.loginRoute;
          return { allow: false, redirectTo, failedPolicy: this.getPolicyDescription(policy) };
        }
      }
    }

    return { allow: true };
  }

  async evaluatePolicyRule(policy, user, siteId, context) {
    if (policy.allow === true && Object.keys(policy).length === 1) {
      return true;
    }

    if (!user && (policy.roles || policy.permissions || policy.matchCallback)) {
      return false;
    }

    if (policy.roles && policy.roles.length > 0) {
      const userRoles = await this.getUserRoles(user?.id, siteId);
      const hasRole = policy.roles.some(requiredRole => {
        if (requiredRole === '@') return !!user;
        if (requiredRole === '?') return true;
        return userRoles.some(userRole => userRole.name === requiredRole);
      });
      
      if (!hasRole) return false;
    }

    if (policy.permissions && policy.permissions.length > 0) {
      const userPermissions = await this.getUserPermissions(user?.id, siteId);
      const hasPermission = policy.permissions.some(requiredPermission =>
        userPermissions.some(userPermission => userPermission.name === requiredPermission)
      );
      
      if (!hasPermission) return false;
    }

    if (policy.matchCallback && typeof policy.matchCallback === 'function') {
      try {
        return policy.matchCallback(user, siteId, context);
      } catch (error) {
        console.error('Error en matchCallback:', error);
        return false;
      }
    }

    return true;
  }

  async getUserRoles(userId, siteId) {
    if (!userId) return [];
    
    // Mock para testing - TODO: Implementar GraphQL
    return [{ name: 'admin' }, { name: 'user' }];
  }

  async getUserPermissions(userId, siteId) {
    if (!userId) return [];
    
    // Mock para testing - TODO: Implementar GraphQL
    return [
      { name: 'admin.access' },
      { name: 'user.manage' },
      { name: 'dashboard.view' },
      { name: 'user.create' },
      { name: 'user.edit' },
      { name: 'system.config' },
      { name: 'reports.view' },
      { name: 'marketing.access' },
      { name: 'campaign.manage' },
      { name: 'campaign.create' },
      { name: 'analytics.view' },
      { name: 'reports.generate' }
    ];
  }

  findRouteConfig(moduleConfig, route) {
    const normalizedRoute = route.startsWith('/') ? route.slice(1) : route;
    
    if (moduleConfig.protectedRoutes[normalizedRoute]) {
      return moduleConfig.protectedRoutes[normalizedRoute];
    }

    const routeParts = normalizedRoute.split('/');
    for (let i = routeParts.length - 1; i >= 0; i--) {
      const parentRoute = routeParts.slice(0, i).join('/');
      if (moduleConfig.protectedRoutes[parentRoute]) {
        return moduleConfig.protectedRoutes[parentRoute];
      }
    }

    return moduleConfig.protectedRoutes[''];
  }

  getPolicyDescription(policy) {
    const parts = [];
    if (policy.roles) parts.push(`roles: [${policy.roles.join(', ')}]`);
    if (policy.permissions) parts.push(`permissions: [${policy.permissions.join(', ')}]`);
    if (policy.matchCallback) parts.push('callback personalizado');
    return parts.join(' + ') || 'política desconocida';
  }

  getRedirectRoute(moduleName, type = 'login', siteId = null, context = {}) {
    const moduleConfig = this.moduleConfigs.get(moduleName);

    // Priorizar authConfig de sitio si está registrado y se pasó siteId
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
      const fallbackRoute = this.resolveHierarchicalRoute('/auth/login', siteId, null, context);
      return fallbackRoute;
    }

    const resolvedAuthConfig = this.getResolvedAuthConfig(moduleConfig, siteId, moduleName, context);
    switch (type) {
      case 'login': return resolvedAuthConfig.loginRoute;
      case 'register': return resolvedAuthConfig.registerRoute;
      case 'home': return resolvedAuthConfig.homeRoute;
      case 'unauthorized': return resolvedAuthConfig.unauthorizedRoute;
      default: return resolvedAuthConfig.loginRoute;
    }
  }

  clearCache() {
    this.cache.clear();
  }

  getStats() {
    const stats = {
      totalModules: this.moduleConfigs.size,
      modules: {}
    };

    for (const [moduleName, config] of this.moduleConfigs) {
      stats.modules[moduleName] = {
        routes: Object.keys(config.protectedRoutes || {}).length
      };
    }

    return stats;
  }
}

export const policyProcessor = new PolicyProcessor();
export default PolicyProcessor;

// src/zoom/security/resolveLoginRoute.js
// Utilidad pura (sin React) para obtener la ruta de login correcta
// basada en la URL actual, la jerarquía registrada y las configs de módulos/sitio.

import { policyProcessor } from './policyProcessor.js';

/**
 * Obtiene la ruta de login correcta considerando jerarquía y configs
 * @param {string} [pathname] - Ruta actual (por defecto window.location.pathname si existe)
 * @param {string} [fallbackSite='zoomy'] - Site por defecto si no se puede inferir
 * @returns {string}
 */
export function resolveLoginRoute(pathname, fallbackSite = 'zoomy') {
  try {
    const path = typeof pathname === 'string'
      ? pathname
      : (typeof window !== 'undefined' ? window.location.pathname : '/');

    const parts = path.split('/').filter(Boolean); // [site, maybeModule, maybeAuth, ...]
    const siteName = parts[0] || fallbackSite;
    const first = parts[1] || null;
    const second = parts[2] || null;

    // Casos:
    // 1) /site/auth/... -> usar auth del site
    if (first === 'auth') {
      return `/${siteName}/auth/login`;
    }

    // 2) /site/{module}/auth/... -> auth submódulo del módulo padre
    if (second === 'auth') {
      return `/${siteName}/${first}/auth/login`;
    }

    // 3) /site/{module}/... -> verificar si {module} tiene auth como hijo
    if (first) {
      const hasAuthSubmodule = !!policyProcessor?.hierarchy?.[siteName]?.modules?.[first]?.children?.auth;
      if (hasAuthSubmodule) {
        return `/${siteName}/${first}/auth/login`;
      }
      // Si no, usar auth del site
      return `/${siteName}/auth/login`;
    }

    // 4) Sin site detectable -> fallback
    return `/${fallbackSite}/auth/login`;
  } catch (err) {
    console.error('[resolveLoginRoute] error:', err);
    return `/${fallbackSite}/auth/login`;
  }
}

export default resolveLoginRoute;

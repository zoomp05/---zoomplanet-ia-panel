// src/modules/auth/hooks/resolveLoginRoute.js
// Resolver de ruta de login ubicado en el módulo Auth.
// Usa una heurística segura antes de que la jerarquía esté disponible y,
// cuando ya está, valida con PolicyProcessor para preferir el auth local.

import { policyProcessor } from '../../../zoom/security/policyProcessor.js';

/**
 * Obtiene la ruta de login correcta considerando jerarquía y contexto actual.
 * - Si estamos dentro de /site/{module}/..., preferimos /site/{module}/auth/login
 *   incluso si la jerarquía aún no está lista (evita fallback al auth raíz del site).
 * - Si la jerarquía confirma que {module} tiene submódulo auth, usamos esa ruta.
 * - Si estamos ya en /site/auth/..., usamos el auth del site.
 * - Fallback: /{site}/auth/login
 */
export function resolveLoginRoute(pathname, fallbackSite = 'zoomy') {
  const path = typeof pathname === 'string'
    ? pathname
    : (typeof window !== 'undefined' ? window.location.pathname : '/');

  console.log('[resolveLoginRoute] 🔍 Evaluando pathname:', path);

  const segments = path.split('/').filter(Boolean); // [site, maybeModule, maybeAuth, ...]
  const siteName = segments[0] || fallbackSite;
  const first = segments[1] || null;   // 'auth' o un módulo: 'admin', 'panel', etc.
  const second = segments[2] || null;  // puede ser 'auth'

  console.log('[resolveLoginRoute] 📊 Segmentos:', { siteName, first, second });

  // 1) Si ya estamos dentro de /site/auth/... → auth del site
  if (first === 'auth') {
    const route = `/${siteName}/auth/login`;
    console.log('[resolveLoginRoute] ✅ Case 1: Auth del site:', route);
    return route;
  }

  // 2) Si estamos en /site/{module}/auth/... → auth del módulo
  if (first && second === 'auth') {
    const route = `/${siteName}/${first}/auth/login`;
    console.log('[resolveLoginRoute] ✅ Case 2: Auth del módulo (ya en /auth):', route);
    return route;
  }

  // 3) Si estamos en /site/{module}/... (y no es 'auth') → preferir auth local del módulo
  if (first && first !== 'auth') {
    console.log('[resolveLoginRoute] 🔍 Case 3: Detectado módulo:', first);
    
    // Validar con jerarquía si está disponible
    const hasAuthSubmodule = !!policyProcessor?.hierarchy?.[siteName]?.modules?.[first]?.children?.auth;
    console.log('[resolveLoginRoute] 📋 Jerarquía disponible:', !!policyProcessor?.hierarchy);
    console.log('[resolveLoginRoute] 📋 Tiene submódulo auth:', hasAuthSubmodule);
    
    if (hasAuthSubmodule) {
      const route = `/${siteName}/${first}/auth/login`;
      console.log('[resolveLoginRoute] ✅ Case 3a: Auth del módulo (validado por jerarquía):', route);
      return route;
    }
    
    // Jerarquía no lista o sin registro → heurística por defecto: usar auth del módulo
    const route = `/${siteName}/${first}/auth/login`;
    console.log('[resolveLoginRoute] ✅ Case 3b: Auth del módulo (heurística):', route);
    return route;
  }

  // 4) Fallback final → auth del site
  const route = `/${siteName}/auth/login`;
  console.log('[resolveLoginRoute] ✅ Case 4: Fallback auth del site:', route);
  return route;
}

export default resolveLoginRoute;

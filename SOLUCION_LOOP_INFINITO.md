# Solución del Loop Infinito en Login

## Problema Original
Loop infinito al intentar acceder a `/zoomy/admin/auth/login` sin sesión.

## Causa Raíz Identificada
`RouteGuard` ejecutándose en TODAS las rutas (incluido el login) y no detectando correctamente las rutas públicas debido a:
1. Cálculo incorrecto del `relativePath`
2. Comparación muy estricta con `publicRoutes`
3. Falta de logging para debugging

## Solución Implementada

### 1. Mover Resolver de Login al Módulo Auth
- **Antes**: `src/zoom/security/resolveLoginRoute.js`
- **Ahora**: `src/modules/auth/hooks/resolveLoginRoute.js`
- **Razón**: Mantener la lógica de autenticación dentro del módulo Auth (modularidad)

### 2. Mejorar Heurística de resolveLoginRoute
```javascript
// Heurística "pro-módulo": priorizar auth local del módulo
if (first && first !== 'auth') {
  const hasAuthSubmodule = !!policyProcessor?.hierarchy?.[siteName]?.modules?.[first]?.children?.auth;
  if (hasAuthSubmodule) {
    return `/${siteName}/${first}/auth/login`;
  }
  // Fallback: usar auth del módulo incluso si jerarquía no está lista
  return `/${siteName}/${first}/auth/login`;
}
```

### 3. Corregir Detección de Rutas Públicas en RouteGuard
```javascript
// Añadir logging detallado
console.log(`[RouteGuard] 🔍 Evaluando ruta:`, {
  fullPath, siteName, pathParts, siteIndex,
  moduleIndex, routeParts, relativePath, moduleConfig
});

// Mejorar comparación de rutas públicas
const isPublic = publicRoutes.some(pubRoute => {
  if (relativePath === pubRoute) return true;
  if (relativePath === pubRoute.replace(/^\//, '')) return true;
  if (relativePath.endsWith(pubRoute)) return true;
  return false;
});
```

### 4. Actualizar Todas las Importaciones
- `apolloClient.js` → usa `resolveLoginRoute` del módulo Auth
- `AuthGuard.jsx` (módulo) → usa `resolveLoginRoute` del módulo Auth
- `AuthGuard.jsx` (compartido) → usa `resolveLoginRoute` del módulo Auth
- `ResetPassword.jsx` → usa `resolveLoginRoute` del módulo Auth

### 5. Fusionar Config Local de Módulos
En `sites/zoomy/index.js`:
```javascript
// Cargar authConfig local del módulo
const modPath = `../../modules/${moduleType}/config/authConfig.js`;
const imported = await import(/* @vite-ignore */ modPath);
localModuleConfig = imported?.default || imported?.[`${moduleType}AuthConfig`] || null;

// Mezclar con site.config
const mergedModuleForHierarchy = {
  ...moduleInstance,
  auth: { ...(moduleInstance.auth || {}), ...(localModuleConfig?.auth || {}) },
  protectedRoutes: { ...(moduleInstance.protectedRoutes || {}), ...(localModuleConfig?.protectedRoutes || {}) },
  publicRoutes: [...new Set([...(moduleInstance.publicRoutes || []), ...(localModuleConfig?.publicRoutes || [])])]
};
```

## Estado Actual
✅ Resolver de login movido al módulo Auth
✅ Heurística mejorada para priorizar auth local
✅ Detección de rutas públicas mejorada con logging
✅ Importaciones actualizadas
✅ Fusión de configs local + site implementada
⏳ **Pendiente**: Verificar en navegador con logs de consola

## Próximos Pasos
1. Abrir `http://localhost:3000/zoomy/admin/auth/login`
2. Revisar logs de consola:
   - `[RouteGuard] 🔍 Evaluando ruta:` → ver `relativePath` calculado
   - `🔓 Ruta pública detectada:` → confirmar detección
3. Si sigue el loop:
   - Capturar logs exactos de `relativePath`
   - Ajustar lógica de comparación según el valor real
4. Si funciona:
   - Marcar como resuelto
   - Documentar solución final

## Archivos Modificados
- `src/modules/auth/hooks/resolveLoginRoute.js` (nuevo)
- `src/modules/auth/guards/RouteGuard.jsx`
- `src/config/apolloClient.js`
- `src/modules/auth/components/AuthGuard.jsx`
- `src/components/Guards/AuthGuard.jsx`
- `src/modules/auth/pages/ResetPassword.jsx`
- `src/sites/zoomy/index.js`
- `src/zoom/config/ConfigManager.js`
- `src/zoom/security/resolveLoginRoute.js` (eliminado)

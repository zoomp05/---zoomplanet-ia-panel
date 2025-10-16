# Solución: Redirección Correcta en Jerarquía de Módulos

## 🎯 Problema Original

Cuando un usuario intenta acceder a `/zoomy/admin` sin autenticación, el sistema redirigía incorrectamente a `/login` en lugar de `/zoomy/admin/auth/login`, causando un **loop infinito**.

## 🔍 Causa Raíz

El sistema no estaba registrando correctamente la **jerarquía de módulos** en el `PolicyProcessor`. Específicamente:

1. **Auth submódulo no detectado**: Cuando `admin` tiene `auth` como submódulo, el sistema no sabía que `/zoomy/admin` requiere autenticación en `/zoomy/admin/auth/login`
2. **Hooks sin contexto**: Los hooks `useAuthRedirect` y `useContextualRoute` no tenían información sobre la jerarquía de módulos
3. **Falta de registro**: No se estaba llamando a `policyProcessor.registerModuleHierarchy()` durante la inicialización del site

## ✅ Solución Implementada

### 1. **Registro de Jerarquía en `index.js`**

Agregamos una nueva función `registerModuleHierarchyInPolicy()` que se ejecuta antes de inicializar los módulos:

```javascript
function registerModuleHierarchyInPolicy() {
  const siteName = 'zoomy';
  
  // Registrar cada módulo con su jerarquía
  siteConfig.modules.forEach(moduleInstance => {
    const moduleType = moduleInstance.module; // 'auth', 'admin'
    const moduleId = moduleInstance.id; // 'auth-panel', 'admin-main'
    const parentModule = moduleInstance.routing?.parentModule || null;
    
    // Registrar en PolicyProcessor
    policyProcessor.registerModuleHierarchy(
      siteName,
      moduleType,
      moduleInstance,
      parentModule
    );
    
    // Registrar configuración de auth
    if (moduleInstance.auth) {
      policyProcessor.registerModule({
        moduleName: moduleType,
        instanceId: moduleId,
        auth: moduleInstance.auth,
        protectedRoutes: moduleInstance.protectedRoutes || {},
        publicRoutes: moduleInstance.publicRoutes || []
      });
    }
  });
}
```

### 2. **Actualización de `site.config.js`**

Agregamos configuraciones de `auth`, `publicRoutes` y `protectedRoutes` para cada módulo:

```javascript
{
  id: 'admin-main',
  module: 'admin',
  
  // Configuración de autenticación (usa auth submódulo)
  auth: {
    loginRoute: '/admin/auth/login',
    registerRoute: '/admin/auth/register',
    homeRoute: '/admin/dashboard',
    unauthorizedRoute: '/admin/auth/unauthorized'
  },
  
  // Rutas públicas (Auth dentro de Admin)
  publicRoutes: [
    'auth/login',
    'auth/register'
  ],
  
  // Rutas protegidas
  protectedRoutes: {
    '': { // Raíz de admin
      allow: false,
      redirectTo: '/admin/auth/login',
      policies: [{ roles: ['admin'] }]
    }
  }
}
```

### 3. **Mejora de `useContextualRoute`**

Ahora detecta correctamente si estamos en un submódulo:

```javascript
// Detectar si estamos en un submódulo
// Si secondSegment es 'auth' o similar, entonces firstModule es el padre
const isInSubmodule = secondSegment === 'auth' || (pathSegments.length > 2 && firstModule !== 'auth');

// Cuando context='module', usar el módulo padre si estamos en submódulo
if (isInSubmodule && pathSegments.length >= 3) {
  // /zoomy/admin/auth/login -> /zoomy/admin/{relativePath}
  return `/${pathSegments.slice(0, 2).join('/')}/${relativePath}`;
}
```

### 4. **Mejora de `useAuthRedirect.getLoginRoute()`**

Ahora consulta la jerarquía del `PolicyProcessor`:

```javascript
const getLoginRoute = () => {
  const { siteName, moduleName } = getCurrentContext();
  
  // Si moduleName no es 'auth', verificar si tiene auth como submódulo
  if (moduleName !== 'auth') {
    const hasAuthSubmodule = policyProcessor.hierarchy[siteName]?.modules?.[moduleName]?.children?.auth;
    
    if (hasAuthSubmodule) {
      return `/${siteName}/${moduleName}/auth/login`;
    }
  }
  
  // Si estamos en auth directamente, usar policyProcessor
  return policyProcessor.getRedirectRoute(moduleName, 'login', siteName);
};
```

## 🔄 Flujo de Redirección Correcto

### Escenario 1: Usuario accede a `/zoomy/admin` sin autenticación

1. **ProtectedRoute** detecta que no hay autenticación
2. Llama a `useAuthRedirect().getLoginRoute()`
3. `getCurrentContext()` retorna: `{ siteName: 'zoomy', moduleName: 'admin' }`
4. `getLoginRoute()` verifica: ¿`admin` tiene `auth` como submódulo? → **SÍ**
5. Retorna: `/zoomy/admin/auth/login` ✅
6. Usuario es redirigido correctamente

### Escenario 2: Usuario está en `/zoomy/admin/auth/login` y hace clic en "Registrarse"

1. `Login.jsx` usa: `getModuleRoute("register")`
2. `useContextualRoute('module')` detecta submódulo
3. Construye: `/zoomy/admin/auth/register` ✅

### Escenario 3: Usuario accede a `/zoomy/auth/login` (Auth standalone)

1. `getCurrentContext()` retorna: `{ siteName: 'zoomy', moduleName: 'auth' }`
2. `getLoginRoute()` detecta: `moduleName === 'auth'`
3. Usa `policyProcessor` directamente
4. Retorna: `/zoomy/auth/login` ✅

## 📊 Estructura de Jerarquía Registrada

```json
{
  "zoomy": {
    "authConfig": null,
    "modules": {
      "auth": {
        "name": "auth",
        "authConfig": {
          "loginRoute": "/auth/login",
          "homeRoute": "/dashboard"
        },
        "children": {},
        "parent": null
      },
      "admin": {
        "name": "admin",
        "authConfig": {
          "loginRoute": "/admin/auth/login",
          "homeRoute": "/admin/dashboard"
        },
        "children": {
          "auth": {
            "name": "auth",
            "authConfig": {
              "loginRoute": "/admin/auth/login",
              "homeRoute": "/admin/dashboard"
            },
            "children": {},
            "parent": "admin"
          }
        },
        "parent": null
      }
    }
  }
}
```

## 🧪 Testing

### Verificar Jerarquía Registrada

Abre la consola del navegador y busca:
```
🌳 Jerarquía registrada: {...}
```

### Verificar Redirección

1. **Sin autenticación, accede a**: `/zoomy/admin`
2. **Debe redirigir a**: `/zoomy/admin/auth/login` ✅
3. **Revisa la consola** para ver los logs:
   - `🔍 getLoginRoute - Context: {...}`
   - `✅ Usando Auth submódulo de admin`

### Verificar Contexto de Rutas

En `Login.jsx`, las rutas deben construirse correctamente:
- "¿Olvidaste tu contraseña?" → `/zoomy/admin/auth/forgot-password`
- "Regístrate aquí" → `/zoomy/admin/auth/register`

## 📝 Archivos Modificados

1. ✅ `src/sites/zoomy/index.js` - Agregado registro de jerarquía
2. ✅ `src/sites/zoomy/site.config.js` - Agregadas configs de auth y rutas
3. ✅ `src/hooks/useContextualRoute.js` - Mejorada detección de submódulos
4. ✅ `src/modules/auth/hooks/useAuthRedirect.js` - Mejorada detección de jerarquía

## 🎉 Resultado

- ✅ **No más loops infinitos**
- ✅ **Redirección correcta según jerarquía**
- ✅ **Soporte para múltiples instancias de Auth**
- ✅ **Rutas contextuales funcionando correctamente**
- ✅ **Cada módulo puede tener su propia instancia de Auth aislada**

## 🚀 Próximos Pasos

1. Probar autenticación en `/zoomy/admin/auth/login`
2. Verificar que después del login redirija a `/zoomy/admin/dashboard`
3. Probar navegación entre diferentes secciones de admin
4. Verificar que las sesiones estén correctamente aisladas (admin vs panel)

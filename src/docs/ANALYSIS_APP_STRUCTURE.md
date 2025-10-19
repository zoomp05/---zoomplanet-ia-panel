# Análisis de Estructura y Secuencia de Carga - App.jsx

## 🔄 Secuencia de Inicialización

### 1. **App.jsx - Punto de Entrada Principal**
```jsx
// Secuencia de inicialización en useEffect()
1. detectCurrentSite() -> Detecta sitio actual desde URL (/zoomy/, /blocave/)
2. initializeSystem() -> Inicializa todo el sistema
3. getSiteConfig() -> Obtiene configuración consolidada del sitio
4. Renderiza RouterProvider con router generado
```

### 2. **systemLoader.jsx - Coordinador de Carga**
```javascript
// Función initializeSystem() ejecuta esta secuencia:
1. clearAllRoutes() -> Limpia rutas previas
2. loadSite(siteName) -> Para cada sitio en sitesConfig.enabledSites
3. getAllRoutes() -> Obtiene rutas registradas
4. processRoutes() -> Transforma rutas para React Router
5. createBrowserRouter() -> Crea router final
```

## 🏗️ Estructura Jerárquica de Carga

### **Nivel 1: Sites (Sitios)**
```
sites/
├── zoomy/
│   ├── index.js                    # Definición del sitio
│   ├── config/
│   │   ├── index.js               # Configuración consolidada
│   │   └── authConfig.js          # Config auth específica del sitio
│   └── routes/
│       └── index.js               # Rutas base del sitio
└── blocave/
    └── ... (similar structure)
```

**Archivo:** `sites/zoomy/index.js`
```javascript
export default {
  name: "zoomy",
  config: siteConfig,              // ← Configuración consolidada
  modules: ['auth', 'admin'],      // ← Módulos que debe cargar
  dependencies: [],
  install: () => registerSiteRoutes("zoomy", routes)
}
```

### **Nivel 2: Modules (Módulos)**
```
modules/
├── auth/
│   ├── index.js                   # Definición del módulo
│   ├── services/
│   │   └── PolicyProcessor.js     # ← Procesador de políticas
│   └── hooks/
│       └── useAuthRedirect.js     # ← Hook que creamos
├── admin/
│   ├── index.js                   # Definición del módulo
│   ├── config/
│   │   └── authConfig.js          # ← Config auth específica del módulo
│   └── modules: ['auth', 'marketing'] # ← Submódulos
└── marketing/
    └── ... (similar structure)
```

**Archivo:** `modules/admin/index.js`
```javascript
export default {
  name: "admin",
  modules: ['base', 'auth', 'project', 'marketing'], // ← Submódulos
  layouts: { /* sobreescrituras de layout */ },
  install(siteName, parentModule = null, inheritedLayouts = {}) {
    // NO registra authConfig en PolicyProcessor
    registerModuleRoutes("admin", routes, siteName, parentModule, combinedLayouts);
  }
}
```

## 📋 Configuraciones de Auth

### **1. Site-Level Auth Config**
```javascript
// sites/zoomy/config/authConfig.js
export const authConfig = {
  siteName: 'zoomy',
  loginRoute: '/zoomy/admin/auth/login',    // ← Ruta completa
  homeRoute: '/zoomy/admin/dashboard',      // ← Ruta completa
  roles: { /* roles específicos del sitio */ },
  permissions: { /* permisos específicos */ }
}
```

### **2. Module-Level Auth Config**
```javascript
// modules/admin/config/authConfig.js
export const adminAuthConfig = {
  moduleName: 'admin',
  auth: {
    loginRoute: '/admin/auth/login',        // ← Ruta relativa
    homeRoute: '/admin/dashboard',          // ← Ruta relativa
    defaultRedirect: '/admin/dashboard',    // ← Ruta relativa
  },
  protectedRoutes: { /* configuración de rutas protegidas */ }
}
```

## 🔄 Flujo de Registro de Rutas

### **Secuencia de loadSite() y loadModule()**
```
1. loadSite('zoomy')
   ├── Import sites/zoomy/index.js
   ├── site.install() -> registerSiteRoutes()
   └── For each module in site.modules:
       ├── loadModule('auth', 'zoomy')
       │   ├── Import modules/auth/index.js
       │   ├── module.install('zoomy', null)
       │   └── registerModuleRoutes('auth', routes, 'zoomy')
       └── loadModule('admin', 'zoomy')
           ├── Import modules/admin/index.js
           ├── module.install('zoomy', null)
           ├── registerModuleRoutes('admin', routes, 'zoomy')
           └── For each submodule in admin.modules:
               └── loadModule('auth', 'zoomy', 'admin')
                   ├── Import modules/auth/index.js
                   ├── module.install('zoomy', 'admin', inheritedLayouts)
                   └── registerModuleRoutes('auth', routes, 'zoomy', 'admin')
```

## 🗂️ Estructura de RouteTree

### **Resultado en routesRegistry.js**
```javascript
routeTree = {
  'zoomy': {
    base: [/* rutas del sitio */],
    modules: {
      'auth': {
        routes: [/* rutas de auth directo */],
        submodules: {}
      },
      'admin': {
        routes: [/* rutas de admin */],
        submodules: {
          'auth': {
            routes: [/* rutas de auth bajo admin */],
            submodules: {}
          },
          'marketing': { /* ... */ }
        }
      }
    }
  }
}
```

## 🔍 Problemas Identificados

### **1. Configuración de Auth No Se Registra en PolicyProcessor**
- **Problema:** `modules/admin/index.js` NO registra su `authConfig` en PolicyProcessor
- **Resultado:** PolicyProcessor no conoce la configuración de admin
- **Impacto:** `useAuthRedirect` no puede obtener rutas correctas

### **2. Múltiples Instancias del Módulo Auth**
- **Auth Directo:** `/zoomy/auth/*` 
- **Auth Bajo Admin:** `/zoomy/admin/auth/*`
- **Problema:** Cada instancia puede tener configuraciones diferentes

### **3. Jerarquía de Configuraciones**
```
Prioridad de configuraciones (de mayor a menor):
1. Site-level config (sites/zoomy/config/authConfig.js)
2. Module-level config (modules/admin/config/authConfig.js)  
3. Default auth config (modules/auth/config/authConfig.js)
```

## 🚀 Rutas Generadas

### **URLs Finales Esperadas:**
```
/zoomy/                            # Sitio base
/zoomy/auth/login                  # Auth directo
/zoomy/admin/                      # Admin base
/zoomy/admin/auth/login           # ← Auth bajo admin (CASO ACTUAL)
/zoomy/admin/dashboard            # ← Destino esperado después del login
/zoomy/admin/marketing/           # Marketing bajo admin
```

## 🎯 Punto de Integración para PolicyProcessor

### **Ubicaciones Donde Se Puede Registrar AuthConfig:**

1. **En systemLoader.jsx** (después de cargar módulos)
2. **En cada module.install()** (durante la carga del módulo)
3. **En routesRegistry.js** (durante el registro de rutas)
4. **En App.jsx** (después de initializeSystem())

### **Hook useAuthRedirect - Contexto de Ejecución:**
```javascript
// Cuando se ejecuta desde /zoomy/admin/auth/login:
getCurrentContext() = {
  siteName: 'zoomy',      // ← Primer segmento
  moduleName: 'admin',    // ← Segundo segmento  
  relativePath: 'auth/login'  // ← Resto de segmentos
}

// Necesita obtener homeRoute de adminAuthConfig.auth.homeRoute
// Pero PolicyProcessor no tiene adminAuthConfig registrado
```

## 📝 Conclusiones

1. **Estructura es Sólida:** La jerarquía de sites → modules → submodules está bien diseñada
2. **Falta Integración:** PolicyProcessor no está integrado en el flujo de carga
3. **Configuraciones Múltiples:** Hay configs de auth en site-level y module-level
4. **Hook Correcto:** `useAuthRedirect` es el approach correcto, pero falta registro de configs
5. **Punto de Integración:** Se debe registrar authConfigs en PolicyProcessor durante loadModule()

## 🔧 Próximos Pasos Sugeridos

1. Modificar `loadModule()` para registrar authConfigs en PolicyProcessor
2. Crear sistema de prioridades para múltiples configs de auth
3. Integrar site-level y module-level configs
4. Testing del flujo completo de redirección

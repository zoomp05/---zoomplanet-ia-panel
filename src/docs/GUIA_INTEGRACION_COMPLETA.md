# Guía de Integración Completa - Sistema Modular Zoomy

## 📋 Resumen del Sistema

Este documento explica cómo se integran todos los componentes del nuevo sistema modular:

```
site.config.js → ModuleInitializer → Module.install() → registerModuleRoutes() → routeTree → React Router
```

---

## 🏗️ Arquitectura General

### Componentes Principales

1. **site.config.js** - Configuración declarativa del site
2. **ModuleInitializer** - Orquestador de módulos
3. **SessionManager** - Gestor de sesiones múltiples
4. **ConfigManager** - Gestor de configuración dinámica
5. **ModuleDependencyResolver** - Resolución de dependencias
6. **routesRegistry** - Sistema de rutas dinámicas

### Ubicaciones

```
src/
├── zoom/                           # Core del sistema
│   ├── config/
│   │   └── ConfigManager.js        # Configuración dinámica
│   ├── modules/
│   │   ├── ModuleInitializer.js    # Inicialización de módulos
│   │   └── ModuleDependencyResolver.js  # Dependencias
│   ├── session/
│   │   └── SessionManager.js       # Gestión de sesiones
│   └── routing/
│       └── routesRegistry.js       # Rutas dinámicas
│
├── sites/
│   └── zoomy/
│       ├── index.js                # Punto de entrada del site
│       ├── site.config.js          # Configuración del site
│       └── config/
│           ├── auth.admin.config.js
│           ├── auth.panel.config.js
│           └── auth.compras.config.js
│
└── modules/
    ├── auth/
    │   ├── index.js                # Exporta clase Auth
    │   └── routes/
    │       └── index.js            # Define rutas del módulo
    ├── admin/
    └── account/
```

---

## 🔄 Flujo de Inicialización Completo

### Paso 1: Carga del Site

```javascript
// src/sites/zoomy/index.js
import { ModuleInitializer } from '../../zoom/modules/ModuleInitializer';
import siteConfig from './site.config';

export default {
  name: "zoomy",
  config: siteConfig,
  
  install: async () => {
    // 1. Registrar rutas base del site
    registerSiteRoutes("zoomy", routes);
    
    // 2. Crear ModuleInitializer
    const initializer = new ModuleInitializer(siteConfig);
    
    // 3. Inicializar módulos
    await initializer.initialize();
  }
};
```

### Paso 2: Configuración del Site

```javascript
// src/sites/zoomy/site.config.js
export default {
  siteId: 'zoomy',
  
  modules: [
    {
      id: 'auth-admin',
      module: 'auth',
      scope: 'admin',
      config: './config/auth.admin.config.js',
      
      // Configuración de rutas
      routing: {
        parentModule: 'admin',        // /zoomy/admin/auth/*
        routePrefix: 'auth',
        inheritLayouts: {
          auth: 'modules/admin/layouts/MainLayout.jsx'
        }
      },
      
      lazy: false,
      priority: 1,
      dependencies: []
    },
    // ... más módulos
  ],
  
  instanceRules: {
    auth: {
      sessions: {
        admin: { isolated: true, timeout: 3600 },
        panel: { isolated: false, canShare: ['compras'] }
      }
    }
  }
};
```

### Paso 3: Inicialización de Módulos

```javascript
// ModuleInitializer.initialize()
async initialize() {
  // 1. Cargar config desde DB
  const dynamicSiteConfig = await configManager.loadSiteConfig('zoomy');
  
  // 2. Resolver orden de carga
  const loadOrder = dependencyResolver.resolveLoadOrder();
  // → ['auth-admin', 'auth-panel', 'admin-main', ...]
  
  // 3. Separar críticos de lazy
  const { critical, lazy } = this.separateCriticalAndLazy();
  
  // 4. Inicializar módulos críticos
  await this.initializeModules(critical);
  
  // 5. Montar módulos
  await this.mountModules(critical);
  
  // 6. Configurar lazy loading
  this.setupLazyLoading(lazy);
}
```

### Paso 4: Inicialización Individual

```javascript
// ModuleInitializer.initializeModule(instanceId)
async initializeModule(instanceId) {
  // 1. Cargar config dinámica
  const dynamicConfig = await configManager.loadModuleConfig('zoomy', instanceId);
  
  // 2. Merge de configuración
  const finalConfig = { ...moduleConfig, ...dynamicConfig };
  
  // 3. Cargar código del módulo
  const ModuleClass = await loadModuleCode('auth', '1.0.0');
  // → import('/src/modules/auth/index.js')
  
  // 4. Crear contexto
  const context = this.createModuleContext(instanceId, finalConfig);
  
  // 5. Crear instancia
  const instance = new ModuleClass(finalConfig, context);
  
  // 6. Ejecutar init
  if (instance.init) await instance.init();
  
  // 7. Registrar rutas
  if (instance.install) {
    const { parentModule, inheritLayouts } = finalConfig.routing;
    await instance.install('zoomy', parentModule, inheritLayouts);
  }
  
  // 8. Guardar instancia
  this.modules.set(instanceId, { config, instance, state: 'INITIALIZED' });
}
```

### Paso 5: Registro de Rutas

```javascript
// src/modules/auth/index.js
export default {
  name: "auth",
  
  install(siteName, parentModule = null, inheritedLayouts = {}) {
    console.log(`🔐 Registrando Auth en ${siteName}`);
    console.log(`   Parent: ${parentModule}`);
    console.log(`   Layouts: ${JSON.stringify(inheritedLayouts)}`);
    
    // Registrar rutas en el árbol
    registerModuleRoutes("auth", routes, siteName, parentModule, inheritedLayouts);
  }
};
```

### Paso 6: Construcción del Árbol de Rutas

```javascript
// routesRegistry.js
const routeTree = {
  zoomy: {
    base: [...],              // Rutas del site
    modules: {
      admin: {
        routes: [...],        // Rutas de admin
        submodules: {
          auth: {             // auth-admin instance
            routes: [
              { path: '/zoomy/admin/auth/login', ... },
              { path: '/zoomy/admin/auth/config', ... }
            ]
          }
        }
      },
      panel: {
        routes: [...],
        submodules: {
          auth: {             // auth-panel instance
            routes: [
              { path: '/zoomy/panel/auth/login', ... },
              { path: '/zoomy/panel/auth/register', ... }
            ]
          }
        }
      }
    }
  }
};
```

### Paso 7: Generación de Rutas para React Router

```javascript
// App.jsx o router setup
import { getAllRoutes } from './zoom/routing/routesRegistry';

const allRoutes = getAllRoutes();
// → Array de todas las rutas combinadas

// Crear rutas de React Router
const router = createBrowserRouter(
  allRoutes.map(route => ({
    path: route.path,
    element: <LazyComponent path={route.componentPath} />,
    layout: route.layout
  }))
);
```

---

## 🔐 Sistema de Sesiones

### Configuración de Sesiones

```javascript
// site.config.js
instanceRules: {
  auth: {
    sessions: {
      // Sesión aislada para admin
      admin: {
        storage: 'localStorage',
        key: 'zoomy_admin_session',
        timeout: 3600,
        renewable: false,
        sliding: false,
        isolated: true
      },
      
      // Sesión compartible para panel
      panel: {
        storage: 'localStorage',
        key: 'zoomy_panel_session',
        timeout: 7200,
        renewable: true,
        sliding: true,
        isolated: false,
        canShare: ['compras']  // Puede compartir con compras
      },
      
      // Sesión heredada para compras
      compras: {
        storage: 'sessionStorage',
        key: 'zoomy_compras_session',
        timeout: 1800,
        inheritFrom: 'panel',   // Hereda sesión de panel
        onInherit: 'validate'   // Valida la sesión heredada
      }
    }
  }
}
```

### Uso de SessionManager

```javascript
// En el módulo Auth
class Auth {
  constructor(config, context) {
    this.sessionManager = context.sessionManager;
  }
  
  async login(credentials) {
    // Crear sesión específica para este scope
    const session = await this.sessionManager.createSession({
      scope: this.config.scope,    // 'admin', 'panel', o 'compras'
      user: userData,
      expiresIn: this.config.session.timeout
    });
    
    return session;
  }
  
  async logout() {
    await this.sessionManager.destroySession(this.config.scope);
  }
  
  isAuthenticated() {
    return this.sessionManager.isSessionValid(this.config.scope);
  }
}
```

---

## 🎨 Sistema de Layouts

### Jerarquía de Layouts

```
1. Layout por defecto del módulo (definido en module/routes/index.js)
2. Layout heredado del parent (definido en site.config.js routing.inheritLayouts)
3. Layout específico de la ruta (definido en route.layout)
```

### Ejemplo

```javascript
// site.config.js - auth-admin hereda layout de admin
{
  id: 'auth-admin',
  routing: {
    inheritLayouts: {
      auth: 'modules/admin/layouts/MainLayout.jsx'
    }
  }
}

// modules/auth/routes/index.js - layout por defecto
export const routes = [
  {
    path: "",
    layout: "modules/auth/layouts/AuthLayout.jsx",  // ← Default
    children: [
      { path: "login", ... },          // Usa AuthLayout (sobreescrito por MainLayout)
      { 
        path: "reset", 
        layout: "modules/auth/layouts/MinimalLayout.jsx"  // ← Override específico
      }
    ]
  }
];
```

**Resultado:**
- `/zoomy/admin/auth/login` → `MainLayout.jsx` (heredado de admin)
- `/zoomy/admin/auth/reset` → `MinimalLayout.jsx` (override específico)
- `/zoomy/panel/auth/login` → `AuthLayout.jsx` (por defecto)

---

## 🧩 Contexto de Módulos

Cada módulo recibe un contexto con acceso a servicios core:

```javascript
// ModuleInitializer.createModuleContext()
const context = {
  // Identificación
  siteId: 'zoomy',
  instanceId: 'auth-admin',
  moduleName: 'auth',
  
  // Servicios core
  sessionManager: this.sessionManager,
  configManager: this.configManager,
  moduleInitializer: this,
  
  // Comunicación entre módulos
  getModule: (id) => this.getModuleInstance(id),
  getModules: () => this.getAllModuleInstances(),
  
  // Hooks
  registerHook: (name, cb) => this.registerHook(instanceId, name, cb),
  
  // Eventos
  emit: (event, data) => this.emit(`module:${instanceId}:${event}`, data),
  on: (event, cb) => this.on(`module:${instanceId}:${event}`, cb),
  
  // Storage compartido
  shared: {}
};
```

### Uso en Módulo

```javascript
class Auth {
  constructor(config, context) {
    this.config = config;
    this.context = context;
    
    // Acceder a otros módulos
    const account = context.getModule('account-main');
    
    // Registrar hooks
    context.registerHook('onLogin', async (data) => {
      console.log('Usuario logueado:', data.user);
    });
    
    // Emitir eventos
    context.emit('user:login', { userId: 123 });
  }
}
```

---

## 🔌 Hooks del Ciclo de Vida

### Hooks Disponibles

```javascript
// En site.config.js o module config
{
  id: 'auth-admin',
  hooks: {
    onBeforeInit: async (data) => {
      console.log('Antes de inicializar', data.config);
    },
    
    onAfterInit: async (data) => {
      console.log('Después de inicializar', data.instance);
    },
    
    onBeforeMount: async (data) => {
      console.log('Antes de montar');
    },
    
    onAfterMount: async (data) => {
      console.log('Después de montar');
    },
    
    onBeforeUnmount: async (data) => {
      console.log('Antes de desmontar');
    },
    
    onAfterUnmount: async (data) => {
      console.log('Después de desmontar');
    },
    
    onBeforeDestroy: async (data) => {
      console.log('Antes de destruir');
    },
    
    onAfterDestroy: async (data) => {
      console.log('Después de destruir');
    }
  }
}
```

---

## 🚀 Lazy Loading

### Configuración

```javascript
// site.config.js
{
  id: 'auth-compras',
  lazy: true,
  lazyTrigger: 'manual',  // manual | idle | viewport | interaction
  priority: 5
}
```

### Triggers

- **`manual`** - Carga explícita con `moduleInitializer.loadLazyModule('auth-compras')`
- **`idle`** - Carga cuando el navegador está idle
- **`viewport`** - Carga cuando entra al viewport (requiere IntersectionObserver)
- **`interaction`** - Carga en la primera interacción del usuario

### Uso

```javascript
// Cargar módulo lazy bajo demanda
const comprasAuth = await moduleInitializer.loadLazyModule('auth-compras');

// El módulo se inicializa, monta y registra sus rutas automáticamente
```

---

## 🔧 Configuración Dinámica

### Actualizar Configuración desde Panel

```javascript
// En el panel de configuración
import { ConfigManager } from '../zoom/config/ConfigManager';

const configManager = new ConfigManager();

// Cambiar timeout de sesión de admin
await configManager.updateModuleConfig('zoomy', 'auth-admin', {
  session: {
    timeout: 7200  // De 1h a 2h
  }
});

// La configuración se actualiza en:
// 1. Base de datos MongoDB
// 2. Memoria (moduleInitializer)
// 3. Se emite evento 'config:updated'
```

### Rollback

```javascript
// Ver historial de cambios
const history = await configManager.getHistory('zoomy', 'auth-admin');

// Revertir al estado anterior
await configManager.rollback('zoomy', 'auth-admin', 0);
```

---

## 📊 Diagnóstico y Debugging

### Diagnóstico del Sistema

```javascript
const diagnostics = moduleInitializer.getDiagnostics();

console.log(diagnostics);
// {
//   siteId: 'zoomy',
//   initialized: true,
//   totalModules: 7,
//   states: {
//     MOUNTED: 5,
//     UNINITIALIZED: 2
//   },
//   errors: []
// }
```

### Debug del Árbol de Rutas

```javascript
import { debugRouteTree } from './zoom/routing/routesRegistry';

const tree = debugRouteTree();
console.log(JSON.stringify(tree, null, 2));
```

### Listeners de Eventos

```javascript
moduleInitializer.on('module:error', (data) => {
  console.error(`Error en ${data.instanceId}:`, data.error);
  
  // Enviar a sistema de monitoreo
  sendToMonitoring({
    type: 'module_error',
    instanceId: data.instanceId,
    phase: data.phase,
    error: data.error.message
  });
});
```

---

## ✅ Checklist de Implementación

### Para Crear un Nuevo Site

- [ ] Crear `src/sites/{sitename}/site.config.js`
- [ ] Definir `siteId`, `modules`, `instanceRules`
- [ ] Configurar `routing` para cada módulo
- [ ] Crear configs específicos en `sites/{sitename}/config/`
- [ ] Actualizar `sites/{sitename}/index.js` con `ModuleInitializer`
- [ ] Definir rutas base en `sites/{sitename}/routes/index.js`
- [ ] Configurar `deployment` y `metadata`

### Para Agregar un Nuevo Módulo

- [ ] Crear `src/modules/{modulename}/index.js` exportando clase
- [ ] Definir `routes` en `modules/{modulename}/routes/index.js`
- [ ] Implementar métodos `init()`, `mount()`, `install()`
- [ ] Agregar entrada en `site.config.js` del site
- [ ] Definir config específico si es necesario
- [ ] Configurar `routing` (parentModule, routePrefix, inheritLayouts)
- [ ] Establecer `dependencies` si depende de otros módulos

### Para Múltiples Instancias del Mismo Módulo

- [ ] Definir múltiples entradas en `site.config.js` con `id` único
- [ ] Asignar `scope` diferente a cada instancia
- [ ] Crear configs específicos para cada instancia
- [ ] Configurar `routing` con `parentModule` apropiado
- [ ] Definir reglas de sesión en `instanceRules.{module}.sessions`
- [ ] Establecer `dependencies` entre instancias si es necesario

---

## 🎯 Conclusión

Este sistema integra:

✅ **Configuración declarativa** - Todo en `site.config.js`  
✅ **Rutas dinámicas** - Sistema existente mantenido  
✅ **Múltiples instancias** - Mismo módulo, diferentes configs  
✅ **Sesiones aisladas** - Por scope, compartibles o heredadas  
✅ **Lazy loading** - Optimización de carga  
✅ **Ciclo de vida** - Hooks en cada fase  
✅ **Configuración dinámica** - Editable desde panel  
✅ **Dependencias** - Resolución automática  
✅ **Layouts jerárquicos** - Herencia y sobreescritura  

Todo funciona de forma **integrada y cohesiva**, manteniendo compatibilidad con el sistema existente y añadiendo capacidades avanzadas.

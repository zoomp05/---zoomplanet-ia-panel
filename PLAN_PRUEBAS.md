# 🧪 Plan de Pruebas - Sistema Modular Zoomy

## 📋 Estado Actual

### Archivos Implementados

✅ **Core del Sistema** (`src/zoom/`)
- `config/ConfigManager.js` - Gestión de configuración dinámica
- `modules/ModuleInitializer.js` - Inicialización y ciclo de vida
- `modules/ModuleDependencyResolver.js` - Resolución de dependencias
- `session/SessionManager.js` - Gestión de sesiones múltiples

✅ **Site Zoomy** (`src/sites/zoomy/`)
- `index.js` - Punto de entrada actualizado con ModuleInitializer
- `site.config.js` - Configuración modular (3 instancias)
- `config/auth.admin.config.js` - Config para auth de administradores
- `config/auth.panel.config.js` - Config para auth de usuarios
- `config/auth.compras.config.js` - Config para auth de compras (opcional)

✅ **Documentación**
- `ARQUITECTURA_MODULAR_POR_SITE.md` - Propuesta inicial
- `SISTEMA_RUTAS_DINAMICAS.md` - Compatibilidad con rutas
- `GUIA_INTEGRACION_COMPLETA.md` - Guía paso a paso
- `ESTRUCTURA_JERARQUIA_MODULOS.md` - Jerarquía correcta
- `SISTEMA_CONFIGURACION_DINAMICA.md` - Configuración desde panel

---

## 🎯 Estructura de Módulos Actual

```
Zoomy Site
├── auth-panel          → /zoomy/auth/*
└── admin-main          → /zoomy/admin/*
    └── auth-admin      → /zoomy/admin/auth/*
```

### Módulos Definidos en site.config.js

```javascript
modules: [
  { id: 'auth-panel',  module: 'auth',  routing: { parentModule: null } },
  { id: 'admin-main',  module: 'admin', routing: { parentModule: null } },
  { id: 'auth-admin',  module: 'auth',  routing: { parentModule: 'admin' } }
]
```

### Módulos Raíz en index.js

```javascript
modules: ['auth', 'admin']
```

---

## 🧪 Plan de Pruebas

### Fase 1: Pruebas Unitarias de Componentes

#### 1.1 ModuleDependencyResolver
```bash
# Test: Resolución de orden de carga
Input: ['auth-panel', 'admin-main', 'auth-admin']
       dependencies: { 'admin-main': ['auth-admin'] }

Expected Output: ['auth-panel', 'auth-admin', 'admin-main']
```

**Prueba:**
```javascript
import { ModuleDependencyResolver } from './src/zoom/modules/ModuleDependencyResolver.js';

const modules = [
  { id: 'auth-panel', dependencies: [] },
  { id: 'admin-main', dependencies: ['auth-admin'] },
  { id: 'auth-admin', dependencies: [] }
];

const resolver = new ModuleDependencyResolver(modules);
const order = resolver.resolveLoadOrder();

console.log('Orden de carga:', order);
// Expected: ['auth-panel', 'auth-admin', 'admin-main']
```

#### 1.2 SessionManager
```bash
# Test: Creación de sesiones aisladas
```

**Prueba:**
```javascript
import { SessionManager } from './src/zoom/session/SessionManager.js';
import siteConfig from './src/sites/zoomy/site.config.js';

const sessionManager = new SessionManager(siteConfig);

// Crear sesión de admin
const adminSession = sessionManager.createSession({
  scope: 'admin',
  user: { id: 1, name: 'Admin', role: 'admin' },
  expiresIn: 3600
});

// Crear sesión de panel
const panelSession = sessionManager.createSession({
  scope: 'panel',
  user: { id: 2, name: 'User', role: 'user' },
  expiresIn: 7200
});

// Verificar aislamiento
console.log('Admin session:', sessionManager.getSession('admin'));
console.log('Panel session:', sessionManager.getSession('panel'));
console.log('Sessions are isolated:', adminSession.token !== panelSession.token);
```

#### 1.3 ConfigManager
```bash
# Test: Carga de configuración con merge
```

**Prueba:**
```javascript
import { ConfigManager } from './src/zoom/config/ConfigManager.js';

const configManager = new ConfigManager();

// Cargar config del site
const siteConfig = await configManager.loadSiteConfig('zoomy');
console.log('Site config loaded:', siteConfig);

// Cargar config de módulo
const authConfig = await configManager.loadModuleConfig('zoomy', 'auth-admin');
console.log('Auth config loaded:', authConfig);
```

---

### Fase 2: Pruebas de Integración

#### 2.1 Inicialización Completa del Site

**Archivo de prueba:** `test-site-initialization.js`

```javascript
// test-site-initialization.js
import zoomySite from './src/sites/zoomy/index.js';

async function testSiteInitialization() {
  console.log('🧪 Iniciando prueba de inicialización del site...\n');
  
  try {
    // Ejecutar install del site
    await zoomySite.install();
    
    // Obtener el ModuleInitializer
    const initializer = zoomySite.getModuleInitializer();
    
    // Verificar estado
    const diagnostics = initializer.getDiagnostics();
    console.log('\n📊 Diagnóstico:', diagnostics);
    
    // Verificar módulos cargados
    const instances = initializer.getAllModuleInstances();
    console.log('\n📦 Módulos cargados:', Object.keys(instances));
    
    // Verificar rutas registradas
    import { getAllRoutes, debugRouteTree } from './src/zoom/routing/routesRegistry.js';
    const routes = getAllRoutes();
    console.log('\n🛤️  Rutas registradas:', routes.length);
    console.log('Árbol de rutas:', JSON.stringify(debugRouteTree(), null, 2));
    
    // Verificar sesiones
    const sessionManager = initializer.sessionManager;
    console.log('\n🔐 SessionManager activo:', !!sessionManager);
    
    console.log('\n✅ Prueba de inicialización EXITOSA');
    return true;
    
  } catch (error) {
    console.error('\n❌ Prueba de inicialización FALLIDA:', error);
    return false;
  }
}

// Ejecutar prueba
testSiteInitialization();
```

**Comando:**
```bash
node test-site-initialization.js
```

**Expected Output:**
```
🚀 ========================================
🚀 Inicializando Site: Zoomy
🚀 ========================================
📍 Paso 1: Registrando rutas base del site...
✅ Rutas base del site registradas
📍 Paso 2: Creando ModuleInitializer...
✅ ModuleInitializer creado
📍 Paso 3: Inicializando módulos...
⏳ Inicializando módulo: auth-panel...
✅ Módulo inicializado: auth-panel
⏳ Inicializando módulo: auth-admin...
✅ Módulo inicializado: auth-admin
⏳ Inicializando módulo: admin-main...
✅ Módulo inicializado: admin-main
✅ Módulos inicializados correctamente
📍 Paso 4: Registrando rutas de módulos...
📍 Módulos montados: 3
  - auth-panel (auth)
    └─ Rutas: /zoomy/auth/*
  - auth-admin (auth)
    └─ Rutas: /zoomy/admin/auth/*
  - admin-main (admin)
    └─ Rutas: /zoomy/admin/*
✅ Todas las rutas de módulos están registradas
🎉 ========================================
🎉 Site Zoomy inicializado correctamente
🎉 ========================================
📊 Diagnóstico del sistema: {
  siteId: 'zoomy',
  initialized: true,
  totalModules: 3,
  states: { MOUNTED: 3 },
  errors: []
}
```

#### 2.2 Verificación de Rutas

**Archivo de prueba:** `test-routes.js`

```javascript
// test-routes.js
import { getAllRoutes, debugRouteTree } from './src/zoom/routing/routesRegistry.js';
import zoomySite from './src/sites/zoomy/index.js';

async function testRoutes() {
  console.log('🧪 Prueba de rutas dinámicas...\n');
  
  // Inicializar site
  await zoomySite.install();
  
  // Obtener todas las rutas
  const routes = getAllRoutes();
  
  // Verificar rutas esperadas
  const expectedRoutes = [
    '/zoomy/auth/login',
    '/zoomy/auth/register',
    '/zoomy/admin/dashboard',
    '/zoomy/admin/auth/login',
    '/zoomy/admin/auth/config'
  ];
  
  console.log('✅ Rutas encontradas:');
  routes.forEach(route => {
    console.log(`   - ${route.path}`);
  });
  
  console.log('\n🔍 Verificando rutas esperadas:');
  expectedRoutes.forEach(expectedPath => {
    const found = routes.some(route => route.path === expectedPath);
    console.log(`   ${found ? '✅' : '❌'} ${expectedPath}`);
  });
  
  // Mostrar árbol completo
  console.log('\n📊 Árbol de rutas completo:');
  console.log(JSON.stringify(debugRouteTree(), null, 2));
}

testRoutes();
```

**Comando:**
```bash
node test-routes.js
```

#### 2.3 Verificación de Sesiones

**Archivo de prueba:** `test-sessions.js`

```javascript
// test-sessions.js
import zoomySite from './src/sites/zoomy/index.js';

async function testSessions() {
  console.log('🧪 Prueba de sesiones múltiples...\n');
  
  // Inicializar site
  await zoomySite.install();
  
  const initializer = zoomySite.getModuleInitializer();
  const sessionManager = initializer.sessionManager;
  
  // Test 1: Crear sesión de admin
  console.log('📝 Test 1: Crear sesión de admin');
  const adminSession = sessionManager.createSession({
    scope: 'admin',
    user: { id: 1, name: 'Admin User', role: 'admin' },
    expiresIn: 3600
  });
  console.log('✅ Sesión admin creada:', adminSession.sessionId);
  
  // Test 2: Crear sesión de panel
  console.log('\n📝 Test 2: Crear sesión de panel');
  const panelSession = sessionManager.createSession({
    scope: 'panel',
    user: { id: 2, name: 'Regular User', role: 'user' },
    expiresIn: 7200
  });
  console.log('✅ Sesión panel creada:', panelSession.sessionId);
  
  // Test 3: Verificar aislamiento
  console.log('\n📝 Test 3: Verificar aislamiento de sesiones');
  const adminFromStorage = sessionManager.getSession('admin');
  const panelFromStorage = sessionManager.getSession('panel');
  console.log('✅ Sesión admin recuperada:', !!adminFromStorage);
  console.log('✅ Sesión panel recuperada:', !!panelFromStorage);
  console.log('✅ Sesiones aisladas:', adminSession.sessionId !== panelSession.sessionId);
  
  // Test 4: Validar sesiones
  console.log('\n📝 Test 4: Validar sesiones');
  console.log('✅ Admin session válida:', sessionManager.isSessionValid('admin'));
  console.log('✅ Panel session válida:', sessionManager.isSessionValid('panel'));
  
  // Test 5: Destruir sesión de admin
  console.log('\n📝 Test 5: Destruir sesión de admin');
  sessionManager.destroySession('admin');
  console.log('✅ Sesión admin destruida');
  console.log('✅ Admin session válida:', sessionManager.isSessionValid('admin')); // false
  console.log('✅ Panel session válida:', sessionManager.isSessionValid('panel')); // true
  
  console.log('\n✅ Todas las pruebas de sesión EXITOSAS');
}

testSessions();
```

---

### Fase 3: Pruebas de Carga Dinámica

#### 3.1 Lazy Loading de Módulos

**Archivo de prueba:** `test-lazy-loading.js`

```javascript
// test-lazy-loading.js
import zoomySite from './src/sites/zoomy/index.js';

async function testLazyLoading() {
  console.log('🧪 Prueba de lazy loading...\n');
  
  // Inicializar site
  await zoomySite.install();
  
  const initializer = zoomySite.getModuleInitializer();
  
  // Verificar módulos cargados inicialmente
  console.log('📦 Módulos cargados al inicio:');
  let instances = initializer.getAllModuleInstances();
  console.log('   Total:', Object.keys(instances).length);
  Object.keys(instances).forEach(id => {
    console.log(`   - ${id}`);
  });
  
  // Cargar módulo lazy (si existe)
  console.log('\n📦 Cargando módulo lazy: auth-compras');
  try {
    await initializer.loadLazyModule('auth-compras');
    console.log('✅ Módulo lazy cargado');
    
    instances = initializer.getAllModuleInstances();
    console.log('   Total después:', Object.keys(instances).length);
    
  } catch (error) {
    console.log('ℹ️  Módulo lazy no disponible (esperado):', error.message);
  }
  
  console.log('\n✅ Prueba de lazy loading completada');
}

testLazyLoading();
```

---

### Fase 4: Pruebas en Navegador

#### 4.1 Inicialización en App

**Modificar temporalmente:** `src/main.jsx` o `src/App.jsx`

```javascript
// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import zoomySite from './sites/zoomy/index.js';

async function initializeApp() {
  console.log('🚀 Inicializando aplicación...');
  
  try {
    // Inicializar site
    await zoomySite.install();
    console.log('✅ Site inicializado');
    
    // Obtener rutas
    import { getAllRoutes } from './zoom/routing/routesRegistry.js';
    const routes = getAllRoutes();
    console.log('✅ Rutas cargadas:', routes.length);
    
    // Renderizar app
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <div>
          <h1>Zoomy App Initialized</h1>
          <p>Modules loaded: {Object.keys(zoomySite.getModuleInitializer().getAllModuleInstances()).length}</p>
          <h2>Routes:</h2>
          <ul>
            {routes.map(route => (
              <li key={route.path}>{route.path}</li>
            ))}
          </ul>
        </div>
      </React.StrictMode>
    );
    
  } catch (error) {
    console.error('❌ Error inicializando app:', error);
    document.getElementById('root').innerHTML = `<pre>Error: ${error.message}\n\n${error.stack}</pre>`;
  }
}

initializeApp();
```

**Comando:**
```bash
npm run dev
```

**Verificar en consola del navegador:**
- ✅ Logs de inicialización
- ✅ Módulos cargados
- ✅ Rutas registradas
- ✅ Sin errores

---

## 📊 Criterios de Éxito

### Must Have (Crítico)
- [ ] ModuleInitializer se crea sin errores
- [ ] Se cargan los 3 módulos (auth-panel, auth-admin, admin-main)
- [ ] Se generan las rutas correctas (/zoomy/auth/*, /zoomy/admin/*, /zoomy/admin/auth/*)
- [ ] No hay colisiones entre instancias de Auth
- [ ] SessionManager crea sesiones aisladas

### Should Have (Importante)
- [ ] Orden de carga respeta dependencias (auth-admin antes de admin-main)
- [ ] Eventos de inicialización se emiten correctamente
- [ ] getDiagnostics() muestra estado correcto
- [ ] Layouts se heredan correctamente

### Nice to Have (Opcional)
- [ ] Lazy loading funciona si hay módulos lazy
- [ ] ConfigManager carga configs dinámicas
- [ ] Hot reload funciona en desarrollo

---

## 🐛 Problemas Conocidos a Verificar

1. **Import paths** - Verificar que todos los imports usen rutas relativas correctas
2. **Module exports** - Verificar que módulos exporten clase default
3. **Async/await** - Verificar que install() sea async
4. **Config paths** - Verificar que './config/auth.admin.config.js' exista
5. **Circular dependencies** - Verificar que no haya ciclos

---

## 📝 Notas para Debugging

### Logs Importantes

```javascript
// Activar logs detallados
localStorage.setItem('DEBUG', 'zoom:*');

// Ver estado completo
console.log(zoomySite.getModuleInitializer().getDiagnostics());

// Ver árbol de rutas
import { debugRouteTree } from './zoom/routing/routesRegistry.js';
console.log(debugRouteTree());

// Ver módulos cargados
const initializer = zoomySite.getModuleInitializer();
console.log(initializer.modules);
```

### Breakpoints Recomendados

1. `ModuleInitializer.initialize()` - Línea de inicio
2. `ModuleInitializer.initializeModule()` - Por cada módulo
3. `registerModuleRoutes()` - Registro de rutas
4. `SessionManager.createSession()` - Creación de sesiones

---

## ✅ Checklist de Pruebas

Marcar cada prueba al completarla:

- [ ] Prueba 1.1: ModuleDependencyResolver
- [ ] Prueba 1.2: SessionManager
- [ ] Prueba 1.3: ConfigManager
- [ ] Prueba 2.1: Inicialización completa
- [ ] Prueba 2.2: Verificación de rutas
- [ ] Prueba 2.3: Verificación de sesiones
- [ ] Prueba 3.1: Lazy loading
- [ ] Prueba 4.1: Inicialización en navegador

---

## 🎯 Próximos Pasos Después de Pruebas

1. **Si todo funciona:**
   - Documentar resultados
   - Crear ejemplos de uso
   - Implementar API de configuración

2. **Si hay errores:**
   - Documentar errores encontrados
   - Priorizar fixes
   - Actualizar código según necesidad

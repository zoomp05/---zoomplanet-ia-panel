# Guía de Integración del Módulo Base - ModulosYiiInspired

## 🎯 Contexto

El worktree **ModulosYiiInspired** tiene una arquitectura diferente a **Modulos2.0**:

| Característica | Modulos2.0 | ModulosYiiInspired |
|----------------|------------|-------------------|
| **Sites** | ✅ Sí (site.config.js) | ❌ No |
| **Anidación** | ✅ Sí (admin/auth) | ❌ No (plana) |
| **Config** | site.config.js | initModules.js |
| **Routing** | Jerárquico | Plano |

---

## 📋 Pasos para Integrar Base en ModulosYiiInspired

### 1. Crear el Módulo Base

**Archivo**: `src/modules/base/index.js`

```javascript
import { registerModuleRoutes } from '../../zoom/routing/routesRegistry';
import { routes } from './routes/index';

export default {
  name: "base",
  dependencies: [],
  
  // Exportar componentes para que otros módulos los importen
  components: {
    SiteConfiguration: () => import('./pages/SiteConfiguration.jsx')
  },
  
  services: {
    // Aquí irán servicios comunes
  },
  
  utils: {
    // Aquí irán utilidades comunes
  },
  
  install(siteName = 'zoomy', parentModule = null, inheritedLayouts = {}) {
    console.log(`📦 Módulo Base instalado para ${siteName}`);
    
    // El módulo base NO registra rutas propias
    // Solo exporta componentes y servicios
    
    // Opcional: Si quieres registrar rutas (para acceder directamente a /base/site-config)
    // registerModuleRoutes("base", routes, siteName, parentModule, inheritedLayouts);
    
    return { success: true };
  }
};
```

---

### 2. Crear Rutas Opcionales

**Archivo**: `src/modules/base/routes/index.js`

```javascript
export const routes = [
  {
    path: "",
    layout: null, // Sin layout específico
    moduleName: "base",
    children: [
      {
        path: "site-config",
        componentPath: "modules/base/pages/SiteConfiguration.jsx"
      }
    ]
  }
];
```

---

### 3. Copiar SiteConfiguration

**Copiar desde Modulos2.0**:
```
src/modules/base/pages/SiteConfiguration.jsx
```

**⚠️ IMPORTANTE**: Ajustar la importación del `siteConfig` en `SiteConfiguration.jsx`:

```javascript
// En ModulosYiiInspired NO existe site.config.js
// Así que el componente debe cargar la config dinámicamente

const loadDefaultSiteConfig = async () => {
  try {
    // En lugar de importar desde sites/zoomy/site.config.js
    // Construir la config desde initModules
    const defaultConfig = {
      siteId: 'zoomy',
      name: 'Zoomy Platform',
      version: '1.0.0',
      modules: [] // Se llena dinámicamente
    };
    setSiteConfig(defaultConfig);
  } catch (error) {
    console.error('❌ Error cargando configuración:', error);
  }
};
```

---

### 4. Agregar Base a initModules.js

**Archivo**: `src/modules/initModules.js`

```javascript
// Importar el módulo base
import baseModule from './base/index';
import authModule from './auth/index';
import crmModule from './crm/index';
import zoomySite from '@sites/zoomy/index';

// Arreglo de todos los módulos y sitios
const allModules = [
  baseModule,  // ✅ Agregar primero (sin dependencias)
  authModule,
  crmModule,
  zoomySite,
  // ... resto de módulos
];
```

---

### 5. Agregar al Menú de Admin

**Opción A: Importar SiteConfiguration directamente**

```javascript
// En admin/pages/ crear SiteConfigWrapper.jsx
import React from 'react';
import SiteConfiguration from '../../base/pages/SiteConfiguration.jsx';

export default function SiteConfigWrapper() {
  // Construir config manualmente para ModulosYiiInspired
  const config = {
    siteId: 'zoomy',
    name: 'Zoomy Platform',
    modules: [
      { id: 'base', module: 'base', priority: 0 },
      { id: 'auth', module: 'auth', priority: 1 },
      { id: 'admin', module: 'admin', priority: 2 },
      // ... resto de módulos
    ]
  };
  
  return <SiteConfiguration siteConfig={config} siteId="zoomy" />;
}
```

**Opción B: Registrar ruta en admin**

```javascript
// En admin/routes/index.js agregar:
{
  path: "site-config",
  componentPath: "modules/base/pages/SiteConfiguration.jsx"
}
```

---

### 6. Actualizar ContextualHeader (Si aplica)

Si admin tiene ContextualHeader, agregar el item:

```javascript
{
  type: 'group',
  key: 'system-admin-group',
  label: 'Sistema',
  children: [
    { 
      key: 'site-config', 
      icon: <AppstoreOutlined />, 
      label: 'Configuración del Sitio', 
      url: '/admin/site-config' 
    },
  ],
}
```

---

## 🔄 Diferencias Clave

### En Modulos2.0 (Actual)
```javascript
// site.config.js define todo
modules: [
  { id: 'base', module: 'base', ... },
  { id: 'auth-panel', module: 'auth', ... }
]
```

### En ModulosYiiInspired
```javascript
// initModules.js solo lista módulos
const allModules = [
  baseModule,
  authModule,
  adminModule
];
```

---

## ✅ Verificación

Después de integrar, verificar:

- [ ] `baseModule` aparece en `initModules.js`
- [ ] Se instala primero (sin dependencias)
- [ ] Admin puede importar componentes de base
- [ ] Ruta `/admin/site-config` funciona (si se registró)
- [ ] No hay errores de importación circular

---

## 💡 Uso en Otros Módulos

Una vez integrado base, cualquier módulo puede importar:

```javascript
// Importación directa
import SiteConfiguration from '../base/pages/SiteConfiguration.jsx';

// O si base exporta en index.js:
import baseModule from '../base';
const SiteConfig = await baseModule.components.SiteConfiguration();
```

---

## 📝 Notas

- **Base NO necesita site.config.js** en ModulosYiiInspired
- **Base NO registra rutas propias** (opcional)
- **Base SOLO exporta** componentes y servicios
- **Otros módulos importan** lo que necesiten de base

---

## 🎯 Próximos Pasos

1. Crear carpeta `src/modules/base/` en ModulosYiiInspired
2. Copiar `SiteConfiguration.jsx` desde Modulos2.0
3. Ajustar importaciones (eliminar referencia a site.config.js)
4. Agregar `baseModule` a `initModules.js`
5. Registrar ruta en admin o crear wrapper
6. Probar que funciona

---

**Archivo**: `INTEGRACION_BASE_MODULOSYII.md`  
**Fecha**: 4 de octubre de 2025

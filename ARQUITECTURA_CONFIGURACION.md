# 📐 Arquitectura de Configuración - Sistema Modular

**Fecha**: 16 de octubre de 2025  
**Versión**: 2.0

---

## 🎯 Principios Fundamentales

### 1. Delegación de Responsabilidades

```
SITE (zoomy)
└─ Define módulos raíz: ['auth', 'admin']
   └─ No gestiona submódulos directamente
   
ADMIN MODULE
└─ Define submódulos: ['base', 'auth', 'project', 'crm', 'account', 'googleAds', 'marketing']
   └─ Delega configuración a cada submódulo
   
GOOGLEADS MODULE
└─ Define su propia configuración en: googleAds/config/googleAds.config.js
   └─ Configuración por defecto del módulo
```

### 2. Jerarquía de Configuración (Cascada)

```
┌─────────────────────────────────────────┐
│  1. CONFIGURACIÓN DEL MÓDULO (Base)    │  ← Prioridad BAJA
│     src/modules/googleAds/config/       │
│     googleAds.config.js                 │
└─────────────────────────────────────────┘
              ↓ (puede ser sobreescrita por)
┌─────────────────────────────────────────┐
│  2. CONFIGURACIÓN DEL PADRE (Override)  │  ← Prioridad MEDIA
│     src/modules/admin/config/           │
│     googleAds.override.config.js        │
│     (si existe)                         │
└─────────────────────────────────────────┘
              ↓ (puede ser sobreescrita por)
┌─────────────────────────────────────────┐
│  3. CONFIGURACIÓN DEL SITE (Override)   │  ← Prioridad ALTA
│     src/sites/zoomy/config/             │
│     googleAds.override.config.js        │
│     (si existe)                         │
└─────────────────────────────────────────┘
```

---

## 📂 Estructura de Archivos

### Estructura Actual (Correcta)

```
src/
├── sites/
│   └── zoomy/
│       ├── index.js                    ← Define: modules: ['auth', 'admin']
│       ├── site.config.js              ← Config del site (deployment, features, etc.)
│       └── config/
│           ├── auth.admin.config.js    ← Override de auth para admin-zoomy
│           ├── auth.panel.config.js    ← Override de auth para panel-zoomy
│           └── authConfig.js           ← Config de auth para zoomy
│
├── modules/
│   ├── admin/
│   │   ├── index.js                    ← Define: modules: ['base', 'auth', 'googleAds', ...]
│   │   ├── routes/
│   │   ├── layouts/
│   │   └── config/                     ← (Opcional) Overrides de submódulos
│   │       └── googleAds.override.config.js  ← Si admin necesita override
│   │
│   ├── googleAds/
│   │   ├── index.js
│   │   ├── routes/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── config/                     ✅ CONFIGURACIÓN AQUÍ
│   │       └── googleAds.config.js     ← Configuración por defecto
│   │
│   └── marketing/
│       ├── index.js
│       ├── routes/
│       ├── layouts/
│       ├── pages/
│       └── config/                     ✅ CONFIGURACIÓN AQUÍ
│           └── marketing.config.js     ← Configuración por defecto
```

---

## 🔄 Flujo de Carga de Configuración

### Ejemplo: Módulo GoogleAds

```javascript
// PASO 1: Carga configuración base del módulo
// src/modules/googleAds/config/googleAds.config.js
const baseConfig = {
  moduleName: 'googleAds',
  api: { enabled: false },
  budgets: { currency: 'USD', defaultDailyBudget: 100 }
};

// PASO 2: Admin carga googleAds y puede hacer override
// src/modules/admin/index.js
import googleAdsModule from '../googleAds/index.js';

export default {
  modules: ['googleAds', ...],
  install(siteName, parentModule, inheritedLayouts) {
    // Admin carga la config base de googleAds
    const googleAdsConfig = await import('../googleAds/config/googleAds.config.js');
    
    // Admin puede tener su propio override (OPCIONAL)
    let adminOverride = {};
    try {
      adminOverride = await import('./config/googleAds.override.config.js');
    } catch (e) {
      // No hay override de admin, se usa la config base
    }
    
    // Merge: baseConfig + adminOverride
    const mergedConfig = { ...googleAdsConfig.default, ...adminOverride.default };
    
    // Instalar googleAds con la config merged
    googleAdsModule.install(siteName, 'admin', mergedConfig);
  }
};

// PASO 3: Site puede hacer override final (OPCIONAL)
// src/sites/zoomy/index.js
export default {
  modules: ['auth', 'admin'],
  install: async () => {
    // Site puede tener su propio override para googleAds
    let siteOverride = {};
    try {
      siteOverride = await import('./config/googleAds.override.config.js');
    } catch (e) {
      // No hay override del site
    }
    
    // Este override se pasaría al admin cuando lo carga
    // admin recibiría: { ...baseConfig, ...adminOverride, ...siteOverride }
  }
};
```

### Resultado Final

```javascript
// Config final de googleAds en zoomy/admin/googleAds:
{
  moduleName: 'googleAds',            // Base
  api: { 
    enabled: true,                    // Override de admin
    version: 'v15'                    // Base
  },
  budgets: { 
    currency: 'MXN',                  // Override de site (zoomy)
    defaultDailyBudget: 100           // Base
  }
}
```

---

## 🎨 Casos de Uso

### Caso 1: Dos Instancias de Admin con Configs Diferentes

```
zoomy/admin/googleAds
└─ Usa: googleAds base config + zoomy/admin override

zoomy/compras/admin/googleAds
└─ Usa: googleAds base config + zoomy/compras/admin override
```

**Ejemplo:**

```javascript
// src/sites/zoomy/config/admin.override.config.js
export default {
  // Override para admin principal de zoomy
  googleAds: {
    budgets: { currency: 'USD' }
  }
};

// src/sites/zoomy/config/compras-admin.override.config.js
export default {
  // Override para admin de compras de zoomy
  googleAds: {
    budgets: { currency: 'MXN' },
    api: { enabled: false }  // Compras no tiene Google Ads API
  }
};
```

### Caso 2: Mismo Módulo, Diferentes Sites

```
zoomy/admin/googleAds
└─ currency: 'USD', defaultBudget: 100

blocave/admin/googleAds
└─ currency: 'EUR', defaultBudget: 50
```

**Implementación:**

```javascript
// src/modules/googleAds/config/googleAds.config.js (BASE)
export default {
  budgets: { 
    currency: 'USD',       // Default para todos
    defaultDailyBudget: 100 
  }
};

// src/sites/blocave/config/googleAds.override.config.js (OVERRIDE)
export default {
  budgets: { 
    currency: 'EUR',       // Override solo para blocave
    defaultDailyBudget: 50 
  }
};
```

---

## 🔧 Implementación: Sistema de Merge de Configs

### Función Propuesta en ModuleInitializer

```javascript
/**
 * Carga la configuración de un módulo aplicando la jerarquía de overrides
 * 
 * @param {string} moduleName - Nombre del módulo (ej: 'googleAds')
 * @param {string} parentModule - Módulo padre (ej: 'admin')
 * @param {string} siteName - Nombre del site (ej: 'zoomy')
 * @returns {Object} Configuración merged
 */
async function loadModuleConfig(moduleName, parentModule, siteName) {
  let config = {};
  
  // 1. Cargar config base del módulo
  try {
    const baseConfig = await import(`../modules/${moduleName}/config/${moduleName}.config.js`);
    config = { ...baseConfig.default };
    console.log(`📦 Config base de ${moduleName}:`, config);
  } catch (e) {
    console.warn(`⚠️  No se encontró config base para ${moduleName}`);
  }
  
  // 2. Aplicar override del módulo padre (si existe)
  if (parentModule) {
    try {
      const parentOverride = await import(`../modules/${parentModule}/config/${moduleName}.override.config.js`);
      config = deepMerge(config, parentOverride.default);
      console.log(`🔄 Override de ${parentModule} aplicado a ${moduleName}`);
    } catch (e) {
      // No hay override del padre, OK
    }
  }
  
  // 3. Aplicar override del site (si existe)
  try {
    const siteOverride = await import(`../sites/${siteName}/config/${moduleName}.override.config.js`);
    config = deepMerge(config, siteOverride.default);
    console.log(`🔄 Override de site ${siteName} aplicado a ${moduleName}`);
  } catch (e) {
    // No hay override del site, OK
  }
  
  console.log(`✅ Config final de ${moduleName}:`, config);
  return config;
}

/**
 * Merge profundo de objetos (recursivo)
 */
function deepMerge(target, source) {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}
```

---

## 📊 Ejemplo Completo de Flujo

### Escenario: GoogleAds en Zoomy Admin

```
1. ModuleInitializer carga zoomy
   └─ zoomy/index.js define: modules: ['auth', 'admin']

2. ModuleInitializer carga admin
   └─ admin/index.js define: modules: ['googleAds', 'marketing', ...]

3. ModuleInitializer carga googleAds
   ├─ Llama a loadModuleConfig('googleAds', 'admin', 'zoomy')
   │
   ├─ PASO 1: Carga googleAds/config/googleAds.config.js
   │  └─ { api: { enabled: false }, budgets: { currency: 'USD' } }
   │
   ├─ PASO 2: Busca admin/config/googleAds.override.config.js
   │  └─ NO EXISTE → Skip
   │
   ├─ PASO 3: Busca zoomy/config/googleAds.override.config.js
   │  └─ NO EXISTE → Skip
   │
   └─ RESULTADO: Config base sin overrides

4. googleAds se instala con la config final
   └─ googleAds.install('zoomy', 'admin', finalConfig)
```

---

## ✅ Ventajas de Esta Arquitectura

### 1. Separación de Responsabilidades
- Cada módulo gestiona su propia configuración
- No hay configs "huérfanos" en el site
- Fácil de rastrear de dónde viene cada config

### 2. Reutilización
- Un módulo define su config UNA VEZ
- Múltiples sites/padres pueden usarlo
- Overrides solo cuando es necesario

### 3. Flexibilidad
- Site puede override todo el árbol de módulos
- Padre puede override sus hijos
- Módulo siempre tiene config por defecto

### 4. Mantenibilidad
- Config base está con el código del módulo
- Overrides están claramente identificados
- Fácil de entender qué se está sobreescribiendo

---

## 🚀 Migración de Configs Existentes

### ✅ Ya Migrado

- ✅ `googleAds.config.js` → movido a `modules/googleAds/config/`
- ✅ `marketing.config.js` → movido a `modules/marketing/config/`

### ⚠️ Mantener en zoomy/config

- ✅ `auth.admin.config.js` → Override de auth para admin en zoomy
- ✅ `auth.panel.config.js` → Override de auth para panel en zoomy
- ✅ `authConfig.js` → Config general de auth para zoomy

**¿Por qué?** Porque auth puede tener diferentes configuraciones según el contexto (admin vs panel) en el mismo site.

---

## 📝 Checklist de Implementación

### Fase 1: Estructura de Archivos ✅
- [x] Mover `googleAds.config.js` a `modules/googleAds/config/`
- [x] Mover `marketing.config.js` a `modules/marketing/config/`
- [x] Crear carpeta `config/` en googleAds
- [x] Actualizar headers de configs (quitar referencias a site específico)

### Fase 2: Sistema de Merge de Configs 🔄
- [ ] Implementar `loadModuleConfig()` en ModuleInitializer
- [ ] Implementar `deepMerge()` helper
- [ ] Actualizar `install()` de módulos para recibir config merged
- [ ] Agregar logs de debug para ver qué configs se cargan

### Fase 3: Overrides Opcionales 🔄
- [ ] Crear ejemplo de `admin/config/googleAds.override.config.js`
- [ ] Crear ejemplo de `zoomy/config/googleAds.override.config.js`
- [ ] Documentar cómo crear overrides

### Fase 4: Testing 🔄
- [ ] Probar carga con solo config base
- [ ] Probar carga con override de padre
- [ ] Probar carga con override de site
- [ ] Probar merge profundo de objetos nested

---

## 🎯 Estado Actual

**Arquitectura de Configuración**: ✅ Definida  
**Migración de Archivos**: ✅ Completada  
**Sistema de Merge**: ⏳ Pendiente de implementación  
**Testing**: ⏳ Pendiente

**El módulo GoogleAds funciona correctamente con la config base.**  
**Los overrides son opcionales y se implementarán cuando se necesiten.**

---

**✨ Arquitectura limpia, escalable y mantenible**

# 🔧 Sistema de Overrides de Configuración (Futuro)

**Estado**: 📋 Diseñado, no implementado  
**Prioridad**: 🟢 Baja (nice-to-have)

---

## 🎯 Objetivo

Permitir que módulos padres y sites sobrescriban configuraciones de submódulos sin modificar el código fuente del módulo.

---

## 📐 Arquitectura de 3 Niveles

```
┌─────────────────────────────────────────────┐
│  NIVEL 1: BASE CONFIG (Prioridad: BAJA)    │
│  Ubicación: modules/{module}/config/       │
│  Archivo: {module}.config.js               │
│                                             │
│  Propósito: Configuración por defecto      │
│  Editable: Solo por el equipo del módulo   │
└─────────────────────────────────────────────┘
                    ↓ puede ser sobreescrito por
┌─────────────────────────────────────────────┐
│  NIVEL 2: PARENT OVERRIDE (Prioridad: MEDIA│
│  Ubicación: modules/{parent}/config/       │
│  Archivo: {module}.override.config.js      │
│                                             │
│  Propósito: Override del módulo padre      │
│  Ejemplo: Admin override de GoogleAds      │
└─────────────────────────────────────────────┘
                    ↓ puede ser sobreescrito por
┌─────────────────────────────────────────────┐
│  NIVEL 3: SITE OVERRIDE (Prioridad: ALTA)  │
│  Ubicación: sites/{site}/config/           │
│  Archivo: {module}.override.config.js      │
│                                             │
│  Propósito: Override específico del site   │
│  Ejemplo: Zoomy override de GoogleAds      │
└─────────────────────────────────────────────┘
```

---

## 💡 Casos de Uso

### Caso 1: Diferentes Monedas por Site

**Escenario**: GoogleAds debe usar USD en Zoomy pero EUR en Blocave

**Implementación**:

```javascript
// ============================================
// NIVEL 1: BASE (modules/googleAds/config/googleAds.config.js)
// ============================================
export default {
  budgets: {
    currency: 'USD',        // ← Default para todos
    defaultDailyBudget: 100
  }
};

// ============================================
// NIVEL 3: SITE OVERRIDE (sites/blocave/config/googleAds.override.config.js)
// ============================================
export default {
  budgets: {
    currency: 'EUR',        // ← Override solo para Blocave
    // defaultDailyBudget se mantiene en 100 (del base)
  }
};

// ============================================
// RESULTADO FINAL
// ============================================
// zoomy/admin/googleAds usa:  { currency: 'USD', defaultDailyBudget: 100 }
// blocave/admin/googleAds usa: { currency: 'EUR', defaultDailyBudget: 100 }
```

### Caso 2: API Deshabilitada en Compras

**Escenario**: Admin principal usa Google Ads API, pero Admin de Compras no

**Implementación**:

```javascript
// ============================================
// NIVEL 1: BASE (modules/googleAds/config/googleAds.config.js)
// ============================================
export default {
  api: {
    enabled: true,          // ← Habilitado por defecto
    version: 'v15'
  }
};

// ============================================
// NIVEL 2: PARENT OVERRIDE (modules/compras-admin/config/googleAds.override.config.js)
// ============================================
export default {
  api: {
    enabled: false,         // ← Deshabilitado para compras
    // version se mantiene en 'v15' (del base)
  }
};

// ============================================
// RESULTADO FINAL
// ============================================
// zoomy/admin/googleAds usa:         { enabled: true, version: 'v15' }
// zoomy/compras/admin/googleAds usa: { enabled: false, version: 'v15' }
```

### Caso 3: Permisos Diferentes por Site

**Escenario**: En Zoomy solo admin puede crear campañas, en Blocave también marketing-manager

**Implementación**:

```javascript
// ============================================
// NIVEL 1: BASE (modules/googleAds/config/googleAds.config.js)
// ============================================
export default {
  permissions: {
    canCreateCampaigns: ['admin'],
    canEditCampaigns: ['admin'],
    canDeleteCampaigns: ['admin']
  }
};

// ============================================
// NIVEL 3: SITE OVERRIDE (sites/blocave/config/googleAds.override.config.js)
// ============================================
export default {
  permissions: {
    canCreateCampaigns: ['admin', 'marketing-manager'],  // ← Ampliado
    canEditCampaigns: ['admin', 'marketing-manager'],    // ← Ampliado
    // canDeleteCampaigns se mantiene ['admin'] (del base)
  }
};

// ============================================
// RESULTADO FINAL
// ============================================
// zoomy/admin/googleAds:
//   canCreateCampaigns: ['admin']
//   canEditCampaigns: ['admin']
//   canDeleteCampaigns: ['admin']

// blocave/admin/googleAds:
//   canCreateCampaigns: ['admin', 'marketing-manager']
//   canEditCampaigns: ['admin', 'marketing-manager']
//   canDeleteCampaigns: ['admin']
```

---

## 🔧 Implementación Propuesta

### Función: `loadModuleConfig()`

```javascript
/**
 * Carga la configuración de un módulo aplicando overrides
 * 
 * @param {string} moduleName - Nombre del módulo (ej: 'googleAds')
 * @param {string} parentModule - Módulo padre (ej: 'admin', 'compras-admin')
 * @param {string} siteName - Nombre del site (ej: 'zoomy', 'blocave')
 * @returns {Promise<Object>} Configuración merged
 */
export async function loadModuleConfig(moduleName, parentModule, siteName) {
  let finalConfig = {};
  
  // ============================================
  // NIVEL 1: Cargar config base del módulo
  // ============================================
  try {
    const baseConfig = await import(
      `../modules/${moduleName}/config/${moduleName}.config.js`
    );
    finalConfig = deepMerge({}, baseConfig.default || {});
    
    console.log(`📦 [${moduleName}] Config base cargada:`, {
      keys: Object.keys(finalConfig),
      source: `modules/${moduleName}/config/${moduleName}.config.js`
    });
  } catch (error) {
    console.warn(
      `⚠️  [${moduleName}] No se encontró config base (${error.message})`
    );
  }
  
  // ============================================
  // NIVEL 2: Aplicar override del padre (si existe)
  // ============================================
  if (parentModule) {
    try {
      const parentOverride = await import(
        `../modules/${parentModule}/config/${moduleName}.override.config.js`
      );
      
      const overrideData = parentOverride.default || {};
      finalConfig = deepMerge(finalConfig, overrideData);
      
      console.log(`🔄 [${moduleName}] Override de padre aplicado:`, {
        parent: parentModule,
        overriddenKeys: Object.keys(overrideData),
        source: `modules/${parentModule}/config/${moduleName}.override.config.js`
      });
    } catch (error) {
      // No hay override del padre, esto es normal
      console.log(
        `ℹ️  [${moduleName}] Sin override de padre (${parentModule})`
      );
    }
  }
  
  // ============================================
  // NIVEL 3: Aplicar override del site (si existe)
  // ============================================
  try {
    const siteOverride = await import(
      `../sites/${siteName}/config/${moduleName}.override.config.js`
    );
    
    const overrideData = siteOverride.default || {};
    finalConfig = deepMerge(finalConfig, overrideData);
    
    console.log(`🔄 [${moduleName}] Override de site aplicado:`, {
      site: siteName,
      overriddenKeys: Object.keys(overrideData),
      source: `sites/${siteName}/config/${moduleName}.override.config.js`
    });
  } catch (error) {
    // No hay override del site, esto es normal
    console.log(`ℹ️  [${moduleName}] Sin override de site (${siteName})`);
  }
  
  // ============================================
  // RESULTADO FINAL
  // ============================================
  console.log(`✅ [${moduleName}] Config final merged:`, {
    site: siteName,
    parent: parentModule || 'ninguno',
    config: finalConfig
  });
  
  return finalConfig;
}

/**
 * Deep merge de objetos (recursivo)
 * Merges source into target, source has priority
 */
function deepMerge(target, source) {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        // Si la key no existe en target, copiar todo el objeto
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          // Si existe, hacer merge recursivo
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        // Si no es objeto, sobrescribir directamente
        output[key] = source[key];
      }
    });
  }
  
  return output;
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}
```

### Integración en Módulos

```javascript
// modules/googleAds/index.js
import { loadModuleConfig } from '../../zoom/config/configLoader.js';

export default {
  name: "googleAds",
  
  async install(siteName, parentModule = null, layouts = {}) {
    console.log(`📢 Instalando GoogleAds en ${siteName}/${parentModule || 'root'}`);
    
    // Cargar config con sistema de overrides
    const config = await loadModuleConfig('googleAds', parentModule, siteName);
    
    // Usar la config merged
    console.log(`📦 Config de GoogleAds:`, config);
    
    // ... resto de la instalación
  }
};
```

---

## 📁 Estructura de Archivos con Overrides

```
src/
├── sites/
│   ├── zoomy/
│   │   └── config/
│   │       ├── auth.admin.config.js
│   │       ├── auth.panel.config.js
│   │       └── googleAds.override.config.js     ← NIVEL 3 (opcional)
│   │
│   └── blocave/
│       └── config/
│           └── googleAds.override.config.js     ← NIVEL 3 (opcional)
│
├── modules/
│   ├── admin/
│   │   └── config/
│   │       └── googleAds.override.config.js     ← NIVEL 2 (opcional)
│   │
│   ├── compras-admin/
│   │   └── config/
│   │       └── googleAds.override.config.js     ← NIVEL 2 (opcional)
│   │
│   ├── googleAds/
│   │   └── config/
│   │       └── googleAds.config.js              ← NIVEL 1 (base)
│   │
│   └── marketing/
│       └── config/
│           └── marketing.config.js              ← NIVEL 1 (base)
│
└── zoom/
    └── config/
        └── configLoader.js                      ← Sistema de merge
```

---

## ✅ Ventajas del Sistema

### 1. Flexibilidad Total
- Cada nivel puede override cualquier parte de la config
- No se modifica el código fuente del módulo
- Fácil de ajustar sin romper la base

### 2. Mantenibilidad
- Config base está versionada con el módulo
- Overrides claramente identificados (.override.config.js)
- Fácil de ver qué se está sobreescribiendo

### 3. Escalabilidad
- Soporta múltiples sites con diferentes configs
- Soporta múltiples instancias de un módulo
- Cada override es independiente

### 4. Debugging
- Logs claros de qué configs se cargan
- Logs de qué overrides se aplican
- Config final visible en consola

---

## 🚀 Plan de Implementación (Futuro)

### Fase 1: Core System (1-2 días)
- [ ] Implementar `deepMerge()` helper
- [ ] Implementar `loadModuleConfig()` en configLoader.js
- [ ] Agregar tests unitarios de merge
- [ ] Documentar API de configuración

### Fase 2: Integración (1 día)
- [ ] Actualizar módulos para usar loadModuleConfig()
- [ ] Actualizar ModuleInitializer
- [ ] Agregar logs de debug
- [ ] Testing end-to-end

### Fase 3: Ejemplos (1 día)
- [ ] Crear ejemplo de parent override
- [ ] Crear ejemplo de site override
- [ ] Documentar casos de uso comunes
- [ ] Crear guía de uso

---

## 📊 Estado Actual vs Futuro

### Estado Actual ✅
```
modules/googleAds/config/googleAds.config.js (BASE)
└─ Esta config se usa tal cual
└─ No hay sistema de overrides
```

### Estado Futuro 🔮
```
modules/googleAds/config/googleAds.config.js (BASE)
├─ modules/admin/config/googleAds.override.config.js (NIVEL 2)
└─ sites/zoomy/config/googleAds.override.config.js (NIVEL 3)
   └─ Config final = BASE + NIVEL 2 + NIVEL 3
```

---

## 🎯 Cuándo Implementar

**Ahora mismo**: NO necesario, el sistema funciona correctamente sin overrides

**Implementar cuando**:
- Se necesite configurar el mismo módulo diferente en múltiples sites
- Se tengan múltiples instancias de un módulo con configs diferentes
- Se requiera customización por ambiente (dev/staging/prod)

---

**✨ Sistema diseñado pero no implementado**  
**📋 Listo para implementar cuando se necesite**  
**🎯 La aplicación funciona sin overrides actualmente**

---

**Autor**: GitHub Copilot  
**Fecha**: 16 de octubre de 2025

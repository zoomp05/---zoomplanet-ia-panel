# 🎯 Estructura de Módulos y Rutas - Site Zoomy

## Jerarquía Correcta de Módulos

### Nivel 1: Módulos Raíz (Definidos en sites/zoomy/index.js)
```
zoomy/
├── auth          ← Módulo raíz (auth-panel para usuarios)
└── admin         ← Módulo raíz (panel de administración)
```

### Nivel 2+: Submódulos (Definidos internamente por cada módulo)

#### Admin gestiona sus propios submódulos:
```
zoomy/admin/
├── dashboard
├── users
├── auth          ← auth-admin (instancia de Auth para administradores)
├── account       ← Gestión de cuentas desde admin
├── project       ← Gestión de proyectos
└── crm           ← CRM
```

#### Auth tiene sus propias rutas:
```
zoomy/auth/
├── login
├── register
├── forgot-password
└── verify-email
```

---

## 📋 Configuración en site.config.js

### Módulos que deben estar:

```javascript
modules: [
  // 1. AUTH PANEL - Auth raíz en /zoomy/auth/*
  {
    id: 'auth-panel',
    module: 'auth',
    scope: 'panel',
    routing: {
      parentModule: null,      // Raíz del site
      routePrefix: 'auth'      // /zoomy/auth/*
    },
    priority: 1,
    lazy: false
  },
  
  // 2. ADMIN MAIN - Admin raíz en /zoomy/admin/*
  {
    id: 'admin-main',
    module: 'admin',
    scope: 'main',
    routing: {
      parentModule: null,      // Raíz del site
      routePrefix: 'admin'     // /zoomy/admin/*
    },
    priority: 2,
    lazy: false,
    dependencies: ['auth-admin']  // Admin requiere su propia Auth
  },
  
  // 3. AUTH ADMIN - Auth dentro de Admin en /zoomy/admin/auth/*
  {
    id: 'auth-admin',
    module: 'auth',
    scope: 'admin',
    routing: {
      parentModule: 'admin',   // Submódulo de Admin
      routePrefix: 'auth'      // /zoomy/admin/auth/*
    },
    priority: 1,
    lazy: false
  }
]
```

### Módulos que NO deben estar en site.config.js:
- ❌ `account` - Se gestiona desde Admin internamente
- ❌ `project` - Se gestiona desde Admin internamente
- ❌ `crm` - Se gestiona desde Admin internamente
- ❌ `panel` - No existe como módulo raíz
- ❌ `compras` - No se usa en este momento

---

## 🔧 Cómo funciona el sistema

### 1. Zoomy index.js define módulos raíz:
```javascript
modules: ['auth', 'admin']  // Solo primer nivel
```

### 2. Admin index.js define sus submódulos:
```javascript
// src/modules/admin/index.js
export default {
  name: "admin",
  modules: ['auth', 'account', 'project', 'crm'],  // Submódulos que gestiona
  
  install(siteName, parentModule = null, inheritedLayouts = {}) {
    // Admin registra sus rutas y las de sus submódulos
  }
}
```

### 3. site.config.js coordina las instancias:
- Define QUÉ instancias de módulos existen
- Define DÓNDE se montan (parentModule)
- Define configuración específica de cada instancia

---

## 🎯 Rutas Finales Generadas

```
/zoomy/auth/login                    → auth-panel
/zoomy/auth/register                 → auth-panel
/zoomy/auth/forgot-password          → auth-panel

/zoomy/admin/dashboard               → admin-main
/zoomy/admin/users                   → admin-main

/zoomy/admin/auth/login              → auth-admin
/zoomy/admin/auth/config             → auth-admin

/zoomy/admin/account/list            → account (gestionado por admin)
/zoomy/admin/account/create          → account (gestionado por admin)

/zoomy/admin/project/list            → project (gestionado por admin)
/zoomy/admin/crm/dashboard           → crm (gestionado por admin)
```

---

## ✅ Resumen

**Principio clave:** 
> Los módulos raíz se definen en `sites/zoomy/index.js`.
> Los submódulos se gestionan internamente por cada módulo.
> `site.config.js` solo define instancias y su ubicación en la jerarquía.

**NO duplicar submódulos:**
- Si `admin` gestiona `account`, NO poner `account` en el nivel raíz
- Si `admin` gestiona `auth`, definir esa instancia con `parentModule: 'admin'`

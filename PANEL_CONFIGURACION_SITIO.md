# Panel de Configuración del Sitio - Documentación

## 📋 Resumen

Se ha implementado un **Panel de Configuración del Sitio** en el módulo Base (reutilizable por cualquier módulo o site) que permite visualizar y gestionar:

- ✅ Árbol jerárquico de módulos
- ✅ Dependencias entre módulos
- ✅ Rutas públicas y protegidas de cada módulo
- ✅ Configuración global del sitio
- ✅ Reglas de interacción entre instancias (para módulos con múltiples instancias como Auth)
- ✅ Jerarquía de políticas registrada en PolicyProcessor

---

## 🏗️ Arquitectura Implementada

### 1. Módulo Base (`src/modules/base/`)

**Propósito**: Proporcionar servicios comunes y componentes base reutilizables para todos los módulos.

**⚠️ IMPORTANTE**: NO confundir con `src/zoom/` (que es el core del sistema).

**Responsabilidades**:
- Servicios de utilidades comunes (Logger, Cache, Storage, HTTP Client, etc.)
- Componentes UI base compartidos (como SiteConfiguration)
- Configuración compartida
- Helpers y herramientas comunes

**Ubicación**: `src/modules/base/index.js`

**Características**:
- Sin rutas propias (otros módulos pueden importar componentes)
- Puede ser requerido como dependencia por otros módulos
- Exporta servicios, componentes y utilidades
- Priority: 0 (carga primero)

**Componentes Exportados**:
- `SiteConfiguration`: Panel de configuración visual del sitio

---

### 2. Panel de Configuración (`src/modules/base/pages/SiteConfiguration.jsx`)

**⚠️ CAMBIO IMPORTANTE**: Movido de `admin/pages` a `base/pages` para que cualquier módulo pueda importarlo.

**Uso**:

```javascript
// Desde cualquier módulo, puedes importar y usar:
import { SiteConfiguration } from '../base';

// O importar directamente:
import SiteConfiguration from '../base/pages/SiteConfiguration.jsx';

// Y usarlo en tus rutas con props opcionales:
<SiteConfiguration siteConfig={miConfig} siteId="mi-site" />
```

**Ruta de Acceso en Admin**: `/zoomy/admin/site-config`

**Props**:
- `siteConfig` (opcional): Configuración del sitio. Si no se pasa, carga automáticamente `/sites/zoomy/site.config.js`
- `siteId` (opcional): ID del sitio para PolicyProcessor

**Pestañas Disponibles**:

#### 📊 Árbol de Módulos
- **Vista en Árbol Jerárquico**: Muestra la estructura de módulos padre-hijo
- **Detalles del Módulo Seleccionado**:
  - ID, Módulo, Scope, Prioridad
  - Tipo de carga (Lazy/Eager)
  - Ruta base y módulo padre
  - Dependencias
  - Configuración de autenticación
  - Tabla de rutas (públicas y protegidas)

#### 🌍 Configuración Global
- Información del sitio (ID, nombre, versión, modo)
- Configuración de deployment (build optimization, static generation, módulos precargados)
- Features flags (Hot Reload, Dev Tools, Analytics, Error Reporting)
- Configuración de seguridad (CSRF, XSS, CSP, orígenes permitidos)

#### 🔀 Reglas de Instancias
- Configuración para módulos con múltiples instancias (ej: Auth)
- Estrategias de sesión (scoped, shared, isolated)
- Configuración detallada por scope:
  - Storage type
  - Session key
  - Timeout y sliding
  - Secure y SameSite
  - Prioridad
  - Sesiones compartidas

#### 🔒 Jerarquía de Políticas
- Vista JSON de la jerarquía registrada en PolicyProcessor
- Útil para debugging y verificación

---

## 📁 Estructura de Archivos

```
src/
├── zoom/                                     # Core del sistema (UPDATED)
│   ├── components/
│   │   └── RouterErrorBoundary.jsx          # Movido desde modules/core (NEW)
│   ├── routing/
│   ├── security/
│   └── ...
│
├── modules/
│   ├── base/                                # Módulo de servicios compartidos (NEW)
│   │   ├── index.js                         # Exporta componentes y servicios
│   │   ├── pages/
│   │   │   └── SiteConfiguration.jsx        # Panel de Configuración (MOVED)
│   │   ├── routes/
│   │   │   └── index.js                     # Rutas opcionales
│   │   └── config/
│   │
│   └── admin/
│       ├── routes/
│       │   └── index.js                     # Rutas del admin (UPDATED - importa desde base)
│       └── config/
│           └── navigation.js                # Menú de navegación
│
└── sites/
    └── zoomy/
        └── site.config.js                   # Configuración del sitio (UPDATED)
```

**Cambios Importantes**:

1. ✅ **Módulo `core` eliminado** - Era redundante con `src/zoom`
2. ✅ **RouterErrorBoundary** migrado a `src/zoom/components/`
3. ✅ **SiteConfiguration** movido a `src/modules/base/pages/` para reutilización
4. ✅ **Módulo Base** agregado a `site.config.js` con priority 0
5. ✅ **Admin importa** SiteConfiguration desde base

---

## 🔧 Configuración en `site.config.js`

```javascript
modules: [
  // NIVEL 0: Módulo Base (servicios compartidos)
  {
    id: 'base',
    module: 'base',
    scope: 'global',
    lazy: false,
    priority: 0,  // Carga primero
    dependencies: [],
    routes: null,  // Sin rutas propias
  },
  
  // NIVEL 1: Módulos raíz
  // ...
]
```

### Agregar Módulo Base

```javascript
modules: [
  // ... otros módulos
  
  // MÓDULO BASE - Servicios comunes
  {
    id: 'base',
    module: 'base',
    lazy: false,
    priority: 0, // Mayor prioridad (se carga primero)
    dependencies: [],
    routing: {
      parentModule: null,
      routePrefix: 'base'
    }
  },
  
  // ADMIN - Ahora depende de Base
  {
    id: 'admin-main',
    module: 'admin',
    dependencies: ['base', 'auth-admin'], // Ahora requiere base
    // ... resto de configuración
  }
]
```

---

## 🚀 Uso

### 1. Acceder al Panel

```
http://localhost:3000/zoomy/admin/site-config
```

### 2. Navegar por las Pestañas

- **Árbol de Módulos**: Haz clic en un módulo para ver sus detalles
- **Configuración Global**: Revisa la configuración del sitio
- **Reglas de Instancias**: Verifica cómo interactúan las instancias de Auth
- **Jerarquía de Políticas**: Debug de la jerarquía registrada

### 3. Interpretar la Información

**Tags de Color**:
- 🟢 Verde: Eager (carga inmediata), Habilitado, Público
- 🟠 Naranja: Lazy (carga bajo demanda), Protegido
- 🔵 Azul: Información, Configuración específica
- 🔴 Rojo: Alta prioridad, Deshabilitado

---

## 📖 Ejemplo de Visualización

### Árbol de Módulos

```
🟢 Eager auth-panel (auth)
   └─ /zoomy/auth/*

🟢 Eager admin-main (admin)
   └─ /zoomy/admin/*
       ├── auth-admin (auth)
       │   └─ /zoomy/admin/auth/*
       ├── account-main (account)
       ├── project-main (project)
       └── crm-main (crm)
```

### Detalles de un Módulo

```
ID: auth-admin
Módulo: auth
Scope: admin
Prioridad: 1
Carga: 🟢 Eager (Inmediata)
Ruta Base: /admin/auth
Módulo Padre: admin
Dependencias: (ninguna)

Rutas:
- 🟢 /zoomy/admin/auth/login        (Pública)
- 🟢 /zoomy/admin/auth/register     (Pública)
- 🟠 /zoomy/admin/auth/profile      (Protegida - admin)
```

---

## 🔄 Flujo de Configuración

1. **Definir Módulos** en `site.config.js`
2. **Registrar Dependencias** entre módulos
3. **Configurar Rutas** (públicas y protegidas)
4. **Establecer Reglas de Instancias** (si aplica)
5. **Visualizar en Panel** → `/zoomy/admin/site-config`
6. **Verificar Jerarquía** en PolicyProcessor

---

## ✅ Próximos Pasos

### Fase 1: Funcionalidad Actual (Completado)
- ✅ Visualización de árbol de módulos
- ✅ Detalles de configuración
- ✅ Reglas de instancias
- ✅ Jerarquía de políticas

### Fase 2: Edición (Pendiente)
- [ ] Editar configuración de módulos desde el panel
- [ ] Agregar/eliminar módulos dinámicamente
- [ ] Modificar dependencias
- [ ] Validación de configuración en tiempo real

### Fase 3: Gestión Avanzada (Pendiente)
- [ ] Exportar/Importar configuración
- [ ] Histórico de cambios
- [ ] Validación de conflictos (ej: múltiples Auth sin reglas)
- [ ] Preview de cambios antes de aplicar

---

## 🐛 Debugging

### Verificar Carga de Módulos

```javascript
// En la consola del navegador
policyProcessor.getHierarchy('zoomy')
```

### Ver Módulos Registrados

```javascript
// En la consola
policyProcessor.getStats()
```

### Verificar Rutas

```javascript
// En la consola
import { getRegisteredRoutes } from '../zoom/routing/routesRegistry.js';
console.log(getRegisteredRoutes());
```

---

## 📚 Referencias

- **PolicyProcessor**: `src/zoom/security/PolicyProcessorCore.js`
- **Site Config**: `src/sites/zoomy/site.config.js`
- **Module Initializer**: `src/zoom/modules/ModuleInitializer.js`
- **Routes Registry**: `src/zoom/routing/routesRegistry.js`

---

## 🎯 Beneficios

1. **Visibilidad Total**: Ver toda la estructura del sitio en un solo lugar
2. **Debugging Facilitado**: Identificar problemas de configuración rápidamente
3. **Documentación Visual**: La configuración se autodocumenta
4. **Prevención de Conflictos**: Detectar módulos duplicados o mal configurados
5. **Onboarding**: Nuevos desarrolladores entienden la estructura fácilmente

---

**Fecha de Creación**: 4 de octubre de 2025  
**Versión**: 1.0.0  
**Autor**: Sistema de Configuración Zoomy

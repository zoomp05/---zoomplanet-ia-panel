# 🔄 Flujo de Carga del Módulo GoogleAds

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                      SITE: ZOOMY                            │
│                 (http://localhost:3000/zoomy)               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ├─── site.config.js
                              │    └─ Define módulos e instancias
                              │
                ┌─────────────┴─────────────┐
                │                           │
        ┌───────▼──────┐          ┌────────▼────────┐
        │  AUTH-PANEL  │          │   ADMIN-MAIN    │
        │   (Raíz)     │          │     (Raíz)      │
        │              │          │                 │
        │ /zoomy/auth/ │          │ /zoomy/admin/   │
        └──────────────┘          └────────┬────────┘
                                           │
                              ┌────────────┼────────────┐
                              │            │            │
                    ┌─────────▼──┐  ┌──────▼─────┐  ┌──▼──────────┐
                    │ AUTH-ADMIN │  │  GOOGLEADS │  │  MARKETING  │
                    │(Submódulo) │  │ (Submódulo)│  │ (Submódulo) │
                    │            │  │            │  │             │
                    │/admin/auth/│  │/admin/     │  │/admin/      │
                    │            │  │googleAds/  │  │marketing/   │
                    └────────────┘  └────────────┘  └─────────────┘
```

## Flujo de Inicialización

```
1. systemLoader.jsx
   └─ Carga site Zoomy
      └─ Ejecuta zoomy/index.js
         │
         ├─ Lee site.config.js
         │  └─ Encuentra módulos:
         │     - auth-panel (raíz)
         │     - admin-main (raíz)
         │     - auth-admin (submódulo de admin)
         │     - googleads-admin (submódulo de admin) ✅
         │     - marketing-admin (submódulo de admin) ✅
         │
         ├─ Crea ModuleInitializer
         │  └─ Inicializa módulos en orden de prioridad
         │
         ├─ Carga admin-main
         │  └─ admin/index.js
         │     ├─ modules: ['base', 'auth', 'project', 'crm', 'account', 'googleAds', 'marketing']
         │     └─ layouts: {
         │           googleAds: "modules/admin/layouts/MainLayout.jsx",
         │           marketing: "modules/admin/layouts/MainLayout.jsx"
         │        }
         │
         ├─ Carga googleads-admin (porque está en site.config.js)
         │  └─ googleAds/index.js
         │     ├─ install(siteName='zoomy', parentModule='admin', layouts)
         │     └─ registerModuleRoutes("googleAds", routes, "zoomy", "admin", layouts)
         │        └─ Registra rutas: /zoomy/admin/googleAds/*
         │
         └─ Carga marketing-admin (porque está en site.config.js)
            └─ marketing/index.js
               ├─ install(siteName='zoomy', parentModule='admin', layouts)
               └─ registerModuleRoutes("marketing", routes, "zoomy", "admin", layouts)
                  └─ Registra rutas: /zoomy/admin/marketing/*
```

## Estructura de Rutas Resultante

```
/zoomy/
├── auth/
│   ├── login
│   ├── register
│   └── forgot-password
│
└── admin/
    ├── dashboard
    │
    ├── auth/
    │   ├── login
    │   └── register
    │
    ├── googleAds/                    ✅ NUEVO
    │   ├── (Dashboard)
    │   ├── campaigns/
    │   │   ├── (lista)
    │   │   ├── create
    │   │   └── :id/
    │   │       ├── (detalle)
    │   │       └── edit
    │   ├── keywords/
    │   │   ├── (lista)
    │   │   └── research
    │   ├── reports/
    │   │   ├── (dashboard)
    │   │   ├── performance
    │   │   └── conversions
    │   ├── sync/
    │   │   └── marketing-campaigns
    │   └── settings/
    │       ├── (general)
    │       ├── accounts
    │       └── api
    │
    ├── marketing/                    ✅ ACTUALIZADO
    │   ├── (Dashboard)
    │   └── campaigns/
    │
    ├── account/
    ├── project/
    └── crm/
```

## Menú de Navegación

```
Marketing (TrophyOutlined)
│
├─ 📊 Campañas IA
│  ├─ Dashboard
│  └─ Campañas Asistidas por IA
│
├─ 🔴 Google Ads                      ✅ GRUPO NUEVO
│  ├─ Dashboard Google Ads
│  ├─ Campañas
│  ├─ Keywords
│  ├─ Reportes
│  └─ Sincronizar con Marketing
│
├─ 📈 Análisis y Seguimiento
│  ├─ Analytics
│  └─ CRM & Leads
│
└─ ⚙️ Configuración
   ├─ Configuración Marketing
   └─ Configuración Google Ads
```

## Archivos de Configuración

```
src/sites/zoomy/
├── index.js
├── site.config.js              ← Define módulos e instancias
│
├── config/
│   ├── auth.admin.config.js
│   ├── auth.panel.config.js
│   ├── googleAds.config.js     ← ✅ NUEVO - Config de Google Ads
│   └── marketing.config.js     ← ✅ NUEVO - Config de Marketing
│
└── routes/
    └── index.js
```

## Validación de Carga

### ✅ Checklist de Verificación

En la consola del navegador deberías ver:

```javascript
🚀 ======================================== 
🚀 Inicializando Site: Zoomy
🚀 ========================================

📍 Paso 0: Registrando jerarquía de módulos...
  📦 Registrando módulo: auth-panel (tipo: auth)
  📦 Registrando módulo: admin-main (tipo: admin)
  📦 Registrando módulo: auth-admin (tipo: auth) bajo admin
  📦 Registrando módulo: googleads-admin (tipo: googleAds) bajo admin  ✅
  📦 Registrando módulo: marketing-admin (tipo: marketing) bajo admin  ✅
✅ Jerarquía de módulos registrada

📍 Paso 1: Registrando rutas base del site...
✅ Rutas base del site registradas

📍 Paso 2: Creando ModuleInitializer...
✅ ModuleInitializer creado

📍 Paso 3: Inicializando módulos...
⏳ Inicializando módulo: auth-panel...
✅ Módulo inicializado: auth-panel

⏳ Inicializando módulo: admin-main...
✅ Módulo inicializado: admin-main

⏳ Inicializando módulo: auth-admin...
✅ Módulo inicializado: auth-admin

⏳ Inicializando módulo: googleads-admin...              ✅
📢 Registrando rutas de 'googleAds' en sitio=zoomy, padre=admin
✅ Módulo GoogleAds registrado correctamente            ✅

⏳ Inicializando módulo: marketing-admin...             ✅
📢 Registrando rutas de 'marketing' en sitio=zoomy, padre=admin
✅ Módulo Marketing registrado correctamente           ✅

📍 Paso 4: Registrando rutas de módulos...
✅ Rutas de módulos registradas

🎉 ========================================
🎉 Site Zoomy inicializado correctamente
🎉 ========================================
```

## Debugging

### Si googleAds NO carga:

1. **Verificar site.config.js**:
   ```bash
   grep -A 10 "googleads-admin" src/sites/zoomy/site.config.js
   ```
   Debería mostrar la configuración del módulo.

2. **Verificar archivos existen**:
   ```bash
   ls src/sites/zoomy/config/googleAds.config.js
   ls src/sites/zoomy/config/marketing.config.js
   ls src/modules/googleAds/index.js
   ls src/modules/googleAds/pages/Dashboard.jsx
   ```

3. **Verificar en consola del navegador**:
   - Buscar: "Registrando rutas de 'googleAds'"
   - Si NO aparece → módulo no está en site.config.js
   - Si aparece con error → revisar archivos del módulo

4. **Verificar en /zoomy/admin/site-config**:
   - Ir a pestaña "Árbol de Módulos"
   - Expandir "admin-main"
   - Buscar "[Incorporado] googleAds"

### Soluciones Rápidas

```bash
# Limpiar caché de Vite
rm -rf node_modules/.vite

# Reiniciar servidor
npm run dev

# Verificar instalación de dependencias
npm list @ant-design/icons
```

---

**🎯 Con estas correcciones, el módulo GoogleAds debería cargar correctamente en:**  
`http://localhost:3000/zoomy/admin/googleAds`

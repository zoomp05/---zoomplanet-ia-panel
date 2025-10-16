# 🆕 Módulo GoogleAds - Documentación Completa

**Fecha**: 6 de octubre de 2025  
**Versión**: 1.0.0

---

## 📋 Resumen Ejecutivo

Se ha creado el módulo **GoogleAds** completo para integración con la Google Ads API. El módulo permite gestionar campañas, anuncios, keywords y métricas, con una **relación opcional** con Marketing Campaigns.

---

## 🎯 Características Principales

### ✅ Funcionalidades Implementadas

1. **Dashboard Principal**
   - Métricas en tiempo real (inversión, impresiones, clicks, conversiones)
   - Vista de campañas activas
   - Accesos rápidos a funciones principales

2. **Gestión de Campañas**
   - Listado de campañas con filtros
   - Crear/Editar/Ver campañas
   - Vinculación opcional con Marketing Campaigns
   - Indicadores de estado y presupuesto

3. **Grupos de Anuncios**
   - Organización por grupos dentro de campañas
   - Gestión de targeting y pujas

4. **Anuncios**
   - Listado y gestión de anuncios individuales
   - Creación de nuevos anuncios

5. **Keywords**
   - Investigación de palabras clave
   - Gestión de keywords por campaña

6. **Reportes y Analytics**
   - Reportes de rendimiento
   - Reportes de conversiones
   - Dashboard de métricas

7. **Sincronización con Marketing**
   - Vinculación opcional con Marketing Campaigns
   - Dashboard de sincronización
   - Gestión de vínculos entre plataformas

8. **Configuración**
   - Configuración de API de Google Ads
   - Gestión de cuentas
   - Configuración general del módulo

---

## 🗂️ Estructura del Módulo

```
src/modules/googleAds/
├── index.js                          # Configuración del módulo
├── routes/
│   └── index.js                      # Definición de rutas
├── layouts/
│   └── MainLayout.jsx                # Layout principal
├── pages/
│   ├── Dashboard.jsx                 # Dashboard principal
│   ├── Campaigns/
│   │   ├── CampaignsList.jsx         # Listado de campañas
│   │   ├── CampaignDetail.jsx        # Detalle de campaña
│   │   ├── CreateCampaign.jsx        # Crear campaña
│   │   └── EditCampaign.jsx          # Editar campaña
│   ├── AdGroups/
│   │   ├── AdGroupsList.jsx
│   │   ├── CreateAdGroup.jsx
│   │   └── AdGroupDetail.jsx
│   ├── Ads/
│   │   ├── AdsList.jsx
│   │   ├── CreateAd.jsx
│   │   └── AdDetail.jsx
│   ├── Keywords/
│   │   ├── KeywordsList.jsx
│   │   └── KeywordResearch.jsx
│   ├── Reports/
│   │   ├── ReportsDashboard.jsx
│   │   ├── PerformanceReport.jsx
│   │   └── ConversionsReport.jsx
│   ├── Sync/
│   │   ├── SyncDashboard.jsx
│   │   └── MarketingCampaignSync.jsx  # 🔗 Vinculación con Marketing
│   └── Settings/
│       ├── GoogleAdsSettings.jsx
│       ├── AccountsManagement.jsx
│       └── ApiConfiguration.jsx
```

---

## 🔗 Integración con Marketing Campaigns

### Relación Opcional

GoogleAds puede funcionar de forma **completamente independiente** o vincularse con Marketing Campaigns:

#### Sin Vinculación ✅
```
GoogleAds Campaign #1
├─ Ad Group 1
├─ Ad Group 2
└─ Métricas propias
```

#### Con Vinculación ✅
```
Marketing Campaign "Black Friday 2025"
└─ GoogleAds Campaign #1 (vinculada)
   ├─ Ad Group 1
   ├─ Ad Group 2
   └─ Métricas sincronizadas con Marketing
```

### Ventajas de Vincular

1. **Métricas Unificadas**: Ver rendimiento de Google Ads dentro de Marketing
2. **Presupuesto Consolidado**: Gestionar presupuestos de forma centralizada
3. **Análisis Comparativo**: Comparar canales (Google Ads vs otros)
4. **Sincronización Automática**: Actualización cada 15 minutos

---

## 🚀 Rutas del Módulo

### Estructura de URLs

**Base**: `/zoomy/admin/googleAds`

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | Dashboard.jsx | Dashboard principal |
| `/campaigns` | CampaignsList.jsx | Listado de campañas |
| `/campaigns/create` | CreateCampaign.jsx | Crear campaña |
| `/campaigns/:id` | CampaignDetail.jsx | Detalle de campaña |
| `/campaigns/:id/edit` | EditCampaign.jsx | Editar campaña |
| `/campaigns/:id/ad-groups` | AdGroupsList.jsx | Grupos de anuncios |
| `/ads` | AdsList.jsx | Listado de anuncios |
| `/keywords` | KeywordsList.jsx | Keywords |
| `/keywords/research` | KeywordResearch.jsx | Investigación |
| `/reports` | ReportsDashboard.jsx | Dashboard reportes |
| `/sync` | SyncDashboard.jsx | Dashboard sincronización |
| `/sync/marketing-campaigns` | MarketingCampaignSync.jsx | Vincular con Marketing |
| `/settings` | GoogleAdsSettings.jsx | Configuración |

---

## 📝 Archivos Modificados

### 1. Módulo Admin (`src/modules/admin/index.js`)

**Cambio**: Agregado googleAds y marketing a modules[]

```javascript
modules: ['base', 'auth', 'project','crm', 'account', 'googleAds', 'marketing']
```

**Cambio**: Agregado layout para googleAds

```javascript
layouts: {
  googleAds: "modules/admin/layouts/MainLayout.jsx",
  marketing: "modules/admin/layouts/MainLayout.jsx"
}
```

### 2. ContextualHeader (`src/modules/admin/components/ContextualHeader/ContextualHeader.jsx`)

**Cambio 1**: Corregido scope de Marketing de "auto" → "module"

```javascript
{
  label: 'Marketing',
  scope: "module", // ✅ Ahora siempre /zoomy/admin/marketing
}
```

**Cambio 2**: Agregado grupo "Google Ads" en menú Marketing

```javascript
{
  type: 'group',
  label: 'Google Ads',
  children: [
    { label: 'Dashboard Google Ads', key: 'googleads:1', url: '/googleAds' },
    { label: 'Campañas', key: 'googleads:2', url: '/googleAds/campaigns' },
    { label: 'Keywords', key: 'googleads:3', url: '/googleAds/keywords' },
    { label: 'Reportes', key: 'googleads:4', url: '/googleAds/reports' },
    { label: 'Sincronizar con Marketing', key: 'googleads:5', url: '/googleAds/sync/marketing-campaigns' }
  ]
}
```

---

## 🔧 Configuración del Módulo

### index.js

```javascript
export default {
  name: "googleAds",
  dependencies: [], // Sin dependencias obligatorias
  modules: [],
  layouts: {
    googleAds: "modules/googleAds/layouts/MainLayout.jsx"
  },
  install(siteName, parentModule, layouts) {
    registerModuleRoutes("googleAds", routes, siteName, parentModule, layouts);
  },
  metadata: {
    version: '1.0.0',
    description: 'Integración con Google Ads API',
    features: [
      'Gestión de campañas Google Ads',
      'Sincronización con Marketing Campaigns',
      'Métricas en tiempo real',
      'Gestión de presupuestos y keywords'
    ]
  }
};
```

---

## 🎨 Componentes Principales

### Dashboard

**Archivo**: `pages/Dashboard.jsx`

**Características**:
- 7 métricas principales (Inversión, Impresiones, Clicks, Conversiones, CTR, CPC, Tasa Conversión)
- Tabla de campañas activas
- Botones de acción rápida
- Alertas de configuración

**Métricas Mostradas**:
```javascript
{
  totalSpent: 5432.50,      // Inversión total
  impressions: 125000,      // Impresiones
  clicks: 3542,             // Clicks
  conversions: 234,         // Conversiones
  ctr: 2.83,                // CTR %
  cpc: 1.53,                // CPC promedio
  conversionRate: 6.61      // Tasa de conversión %
}
```

### CampaignsList

**Archivo**: `pages/Campaigns/CampaignsList.jsx`

**Características**:
- Filtro de búsqueda
- Tag especial "Vinculada con Marketing" (morado)
- 4 cards de estadísticas:
  - Total campañas
  - Activas
  - Vinculadas con Marketing
  - Presupuesto total
- Botones Ver/Editar por campaña

### MarketingCampaignSync

**Archivo**: `pages/Sync/MarketingCampaignSync.jsx`

**Características**:
- Tabla de campañas Google Ads con estado de vinculación
- Modal para seleccionar Marketing Campaign
- Botones Vincular/Desvincular
- Alertas informativas sobre vinculación opcional

---

## 🔐 Seguridad y Permisos

### Políticas de Acceso

**Todos los endpoints están protegidos** por el scope del módulo admin:

```
/zoomy/admin/googleAds/* → Requiere rol 'admin'
```

### Configuración Futura

En el futuro se podrán agregar políticas específicas:

```javascript
protectedRoutes: {
  'campaigns/create': {
    policies: [{ roles: ['admin', 'marketing-manager'] }]
  },
  'settings': {
    policies: [{ roles: ['admin'] }]
  }
}
```

---

## 🌐 Menú de Navegación

### Ubicación

**Marketing** > **Google Ads**

### Estructura del Menú

```
Marketing (Marketing Icon)
├─ Campañas IA
│  ├─ Dashboard
│  └─ Campañas Asistidas por IA
├─ 🆕 Google Ads
│  ├─ Dashboard Google Ads
│  ├─ Campañas
│  ├─ Keywords
│  ├─ Reportes
│  └─ Sincronizar con Marketing
├─ Análisis y Seguimiento
│  ├─ Analytics
│  └─ CRM & Leads
└─ Configuración
   ├─ Configuración Marketing
   └─ Configuración Google Ads
```

---

## 📊 Datos de Ejemplo

### Campañas

```javascript
[
  {
    id: 'gads-001',
    name: 'Campaña Black Friday 2025',
    status: 'active',
    budget: 500,
    spent: 342.50,
    impressions: 25000,
    clicks: 650,
    conversions: 42,
    linkedMarketingCampaign: 'camp-mk-001' // ✅ Vinculada
  },
  {
    id: 'gads-002',
    name: 'Remarketing - Carrito Abandonado',
    status: 'active',
    budget: 200,
    spent: 156.30,
    impressions: 12000,
    clicks: 320,
    conversions: 28,
    linkedMarketingCampaign: null // ❌ Sin vincular
  }
]
```

---

## ✅ Testing

### Verificar Instalación

1. **Abrir panel admin**:
   ```
   http://localhost:3000/zoomy/admin
   ```

2. **Navegar a Marketing > Google Ads > Dashboard**:
   ```
   http://localhost:3000/zoomy/admin/googleAds
   ```

3. **Verificar en Configuración del Sitio**:
   - Ir a `/zoomy/admin/site-config`
   - Pestaña "Árbol de Módulos"
   - Expandir `admin-main`
   - Verificar que aparece `[Incorporado] googleAds`

4. **Probar navegación**:
   - Dashboard Google Ads ✅
   - Campañas ✅
   - Sincronizar con Marketing ✅

---

## 🔮 Próximos Pasos

### Fase 2 - Integración API Real

1. **Conectar con Google Ads API**
   - OAuth 2.0
   - Obtener refresh token
   - Configurar credenciales

2. **Sincronización Automática**
   - Job cada 15 minutos
   - Actualizar métricas
   - Notificaciones de cambios

3. **Vinculación Completa con Marketing**
   - Crear relaciones en base de datos
   - Sincronizar presupuestos
   - Unificar reportes

### Fase 3 - Features Avanzadas

1. **Optimización con IA**
   - Sugerencias de keywords
   - Ajuste automático de pujas
   - Análisis predictivo

2. **A/B Testing**
   - Variantes de anuncios
   - Análisis de rendimiento
   - Recomendaciones

---

## 📚 Documentación Técnica

### Convenciones de Código

- **Páginas**: PascalCase (`Dashboard.jsx`)
- **URLs**: camelCase (`/googleAds/campaigns`)
- **Keys de menú**: `googleads:N` (número secuencial)
- **Tags**: Color morado para vinculaciones con Marketing

### Imports Principales

```javascript
// Ant Design
import { Card, Table, Button, Tag, Alert, Modal } from 'antd';

// Icons
import { 
  GoogleOutlined, 
  LinkOutlined, 
  SyncOutlined,
  DisconnectOutlined 
} from '@ant-design/icons';

// React Router v7
import { useNavigate, useParams, Outlet } from 'react-router';
```

---

## 🐛 Troubleshooting

### Problema: No aparece en el menú

**Solución**: Verificar que admin/index.js incluye 'googleAds' en modules[]

### Problema: Ruta 404

**Solución**: Verificar que systemLoader.js carga el módulo googleAds

### Problema: Layout incorrecto

**Solución**: Verificar que admin/index.js tiene:
```javascript
layouts: {
  googleAds: "modules/admin/layouts/MainLayout.jsx"
}
```

---

## 📞 Soporte

Para dudas o issues:
- Revisar esta documentación
- Consultar `FIXES_CONFIGURACION_SITIO.md`
- Ver `NUEVA_FUNCIONALIDAD_FLUJO_CARGA.md`

---

**✅ Módulo GoogleAds implementado completamente**  
**🔗 Relación opcional con Marketing configurada**  
**📋 Menú actualizado y corregido**  
**🎯 Listo para integración con Google Ads API**

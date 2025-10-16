# 🚀 Próximos Pasos - Módulo GoogleAds

**Fecha**: 16 de octubre de 2025  
**Estado Actual**: ✅ Configurado y funcionando (sin API real)

---

## ✅ Estado Actual

### Completado

- ✅ Estructura del módulo creada
- ✅ Rutas configuradas y funcionando
- ✅ Dashboard con métricas de prueba
- ✅ Listado de campañas funcional
- ✅ Sincronización con Marketing (UI)
- ✅ Menú integrado en Admin
- ✅ Layouts heredados correctamente
- ✅ Configuración modular respetada

### Pendiente (Datos de Prueba)

- ⚠️ API de Google Ads NO conectada
- ⚠️ Datos hardcodeados en componentes
- ⚠️ Sin persistencia en base de datos
- ⚠️ Sincronización con Marketing NO funcional

---

## 🎯 Fase 1: Infraestructura Backend (API)

### 1.1 Configurar Google Ads API

**Prioridad**: 🔴 Alta  
**Tiempo estimado**: 2-3 días

**Tareas**:

1. **Obtener credenciales de Google Cloud**:
   - Crear proyecto en Google Cloud Console
   - Habilitar Google Ads API
   - Crear OAuth 2.0 credentials
   - Obtener Developer Token de Google Ads
   - Generar Refresh Token

2. **Configurar variables de entorno**:
   ```bash
   # En zoomplanet-ia-panel/.env
   VITE_GOOGLE_ADS_CLIENT_ID=your_client_id
   VITE_GOOGLE_ADS_CLIENT_SECRET=your_client_secret
   VITE_GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token
   VITE_GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token
   VITE_GOOGLE_ADS_LOGIN_CUSTOMER_ID=your_customer_id
   
   # En zoomplanet-ia-api-actualizado/.env
   GOOGLE_ADS_CLIENT_ID=your_client_id
   GOOGLE_ADS_CLIENT_SECRET=your_client_secret
   GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token
   GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token
   GOOGLE_ADS_LOGIN_CUSTOMER_ID=your_customer_id
   ```

3. **Activar API en configuración**:
   ```javascript
   // src/sites/zoomy/config/googleAds.config.js
   api: {
     enabled: true, // ✅ Cambiar a true
     version: 'v15',
     // ... resto de config
   }
   ```

### 1.2 Crear Servicio de API en Backend

**Prioridad**: 🔴 Alta  
**Tiempo estimado**: 3-4 días

**Archivos a crear en `zoomplanet-ia-api-actualizado`**:

```
src/
└── modules/
    └── googleAds/
        ├── googleAds.module.js
        ├── googleAds.typeDefs.js
        ├── googleAds.resolvers.js
        ├── googleAds.model.js
        └── services/
            ├── googleAdsClient.js       ← Cliente de Google Ads API
            ├── campaignService.js       ← CRUD de campañas
            ├── metricsService.js        ← Obtención de métricas
            ├── keywordService.js        ← Gestión de keywords
            └── syncService.js           ← Sincronización con Marketing
```

**Schema GraphQL**:

```graphql
# googleAds.typeDefs.js
type GoogleAdsCampaign {
  id: ID!
  googleAdsId: String!
  name: String!
  status: CampaignStatus!
  budget: Float!
  spent: Float!
  impressions: Int!
  clicks: Int!
  conversions: Int!
  ctr: Float!
  cpc: Float!
  conversionRate: Float!
  linkedMarketingCampaign: MarketingCampaign
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum CampaignStatus {
  ACTIVE
  PAUSED
  REMOVED
  PENDING
}

type GoogleAdsMetrics {
  campaignId: ID!
  date: DateTime!
  impressions: Int!
  clicks: Int!
  cost: Float!
  conversions: Int!
  conversionValue: Float!
}

type Query {
  googleAdsCampaigns(filters: CampaignFilters): [GoogleAdsCampaign!]!
  googleAdsCampaign(id: ID!): GoogleAdsCampaign
  googleAdsMetrics(campaignId: ID!, dateFrom: DateTime!, dateTo: DateTime!): [GoogleAdsMetrics!]!
}

type Mutation {
  createGoogleAdsCampaign(input: CreateCampaignInput!): GoogleAdsCampaign!
  updateGoogleAdsCampaign(id: ID!, input: UpdateCampaignInput!): GoogleAdsCampaign!
  deleteGoogleAdsCampaign(id: ID!): Boolean!
  syncGoogleAdsCampaign(campaignId: ID!): GoogleAdsMetrics!
  linkToMarketingCampaign(googleAdsCampaignId: ID!, marketingCampaignId: ID!): GoogleAdsCampaign!
}
```

**Modelo de Base de Datos**:

```javascript
// googleAds.model.js
const mongoose = require('mongoose');

const GoogleAdsCampaignSchema = new mongoose.Schema({
  googleAdsId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['ACTIVE', 'PAUSED', 'REMOVED', 'PENDING'],
    default: 'PAUSED'
  },
  budget: { type: Number, required: true },
  spent: { type: Number, default: 0 },
  
  // Métricas (cacheadas)
  metrics: {
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    ctr: { type: Number, default: 0 },
    cpc: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    lastUpdated: { type: Date }
  },
  
  // Vinculación con Marketing
  linkedMarketingCampaign: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'MarketingCampaign',
    default: null
  },
  
  // Metadata
  siteId: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
}, { timestamps: true });

module.exports = mongoose.model('GoogleAdsCampaign', GoogleAdsCampaignSchema);
```

### 1.3 Implementar Cliente de Google Ads

**Prioridad**: 🔴 Alta  
**Tiempo estimado**: 2-3 días

```javascript
// services/googleAdsClient.js
const { GoogleAdsApi } = require('google-ads-api');

class GoogleAdsClient {
  constructor() {
    this.client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    });
    
    this.customer = this.client.Customer({
      customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID,
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    });
  }
  
  async getCampaigns() {
    const campaigns = await this.customer.query(`
      SELECT 
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign_budget.amount_micros,
        metrics.impressions,
        metrics.clicks,
        metrics.conversions,
        metrics.cost_micros
      FROM campaign
      WHERE campaign.status != 'REMOVED'
      ORDER BY campaign.name
    `);
    
    return campaigns;
  }
  
  async createCampaign(data) {
    // Implementar creación de campaña
  }
  
  async updateCampaign(campaignId, data) {
    // Implementar actualización de campaña
  }
  
  async getCampaignMetrics(campaignId, dateFrom, dateTo) {
    // Implementar obtención de métricas
  }
}

module.exports = new GoogleAdsClient();
```

---

## 🎯 Fase 2: Integración Frontend-Backend

### 2.1 Crear Servicios GraphQL en Frontend

**Prioridad**: 🟡 Media  
**Tiempo estimado**: 2 días

**Archivos a crear en `zoomplanet-ia-panel`**:

```
src/modules/googleAds/
└── services/
    ├── graphql/
    │   ├── queries.js
    │   ├── mutations.js
    │   └── fragments.js
    └── api/
        ├── campaignApi.js
        ├── metricsApi.js
        └── syncApi.js
```

**Ejemplo de queries**:

```javascript
// services/graphql/queries.js
import { gql } from '@apollo/client';

export const GET_CAMPAIGNS = gql`
  query GetGoogleAdsCampaigns($filters: CampaignFilters) {
    googleAdsCampaigns(filters: $filters) {
      id
      googleAdsId
      name
      status
      budget
      spent
      metrics {
        impressions
        clicks
        conversions
        ctr
        cpc
        conversionRate
      }
      linkedMarketingCampaign {
        id
        name
      }
    }
  }
`;

export const GET_CAMPAIGN = gql`
  query GetGoogleAdsCampaign($id: ID!) {
    googleAdsCampaign(id: $id) {
      id
      googleAdsId
      name
      status
      budget
      spent
      metrics {
        impressions
        clicks
        conversions
        ctr
        cpc
        conversionRate
        lastUpdated
      }
      linkedMarketingCampaign {
        id
        name
      }
      createdAt
      updatedAt
    }
  }
`;
```

### 2.2 Actualizar Componentes con Datos Reales

**Prioridad**: 🟡 Media  
**Tiempo estimado**: 3 días

**Componentes a actualizar**:

1. **Dashboard.jsx**:
   ```javascript
   import { useQuery } from '@apollo/client';
   import { GET_CAMPAIGNS, GET_METRICS } from '../services/graphql/queries';
   
   const GoogleAdsDashboard = () => {
     const { data, loading, error } = useQuery(GET_CAMPAIGNS);
     const { data: metricsData } = useQuery(GET_METRICS);
     
     // Reemplazar datos hardcodeados por data real
   };
   ```

2. **CampaignsList.jsx**: Usar datos de GraphQL
3. **CampaignDetail.jsx**: Implementar vista completa
4. **CreateCampaign.jsx**: Implementar formulario funcional
5. **EditCampaign.jsx**: Implementar edición funcional

---

## 🎯 Fase 3: Sincronización con Marketing

### 3.1 Modelo de Vinculación

**Prioridad**: 🟢 Baja  
**Tiempo estimado**: 2 días

```javascript
// En MarketingCampaign model
const MarketingCampaignSchema = new mongoose.Schema({
  // ... campos existentes
  
  // Vinculación con Google Ads
  googleAdsCampaigns: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GoogleAdsCampaign'
  }],
  
  // Métricas consolidadas
  consolidatedMetrics: {
    totalSpent: Number,
    totalImpressions: Number,
    totalClicks: Number,
    totalConversions: Number,
    // ... más métricas
  }
});
```

### 3.2 Job de Sincronización

**Prioridad**: 🟢 Baja  
**Tiempo estimado**: 1 día

```javascript
// jobs/syncGoogleAdsMetrics.js
const cron = require('node-cron');
const GoogleAdsCampaign = require('../models/GoogleAdsCampaign');
const googleAdsClient = require('../services/googleAdsClient');

// Ejecutar cada 15 minutos
cron.schedule('*/15 * * * *', async () => {
  console.log('🔄 Sincronizando métricas de Google Ads...');
  
  try {
    const campaigns = await GoogleAdsCampaign.find({ status: 'ACTIVE' });
    
    for (const campaign of campaigns) {
      const metrics = await googleAdsClient.getCampaignMetrics(
        campaign.googleAdsId,
        new Date(Date.now() - 86400000), // Últimas 24h
        new Date()
      );
      
      campaign.metrics = {
        ...metrics,
        lastUpdated: new Date()
      };
      
      await campaign.save();
    }
    
    console.log('✅ Sincronización completada');
  } catch (error) {
    console.error('❌ Error en sincronización:', error);
  }
});
```

---

## 🎯 Fase 4: Features Avanzadas

### 4.1 Integración con IA

**Prioridad**: 🟢 Baja  
**Tiempo estimado**: 5 días

- Sugerencias de keywords con IA
- Generación de copys para anuncios
- Optimización automática de pujas
- Predicción de rendimiento

### 4.2 Reportes Avanzados

**Prioridad**: 🟢 Baja  
**Tiempo estimado**: 3 días

- Reportes personalizados
- Exportación a Excel/PDF
- Comparativas entre campañas
- Análisis de tendencias

### 4.3 Automatización

**Prioridad**: 🟢 Baja  
**Tiempo estimado**: 4 días

- Reglas de pausa/activación automática
- Ajuste de presupuestos según ROI
- Alertas por email/SMS
- A/B Testing automático

---

## 📋 Checklist de Implementación

### Backend (zoomplanet-ia-api-actualizado)

- [ ] Obtener credenciales de Google Ads API
- [ ] Configurar variables de entorno
- [ ] Crear módulo googleAds en backend
- [ ] Implementar schema GraphQL
- [ ] Crear modelo de base de datos
- [ ] Implementar cliente de Google Ads API
- [ ] Implementar resolvers GraphQL
- [ ] Crear servicio de campañas
- [ ] Crear servicio de métricas
- [ ] Crear servicio de keywords
- [ ] Crear servicio de sincronización
- [ ] Implementar job de sincronización
- [ ] Agregar tests unitarios
- [ ] Agregar tests de integración

### Frontend (zoomplanet-ia-panel)

- [ ] Actualizar configuración (api.enabled = true)
- [ ] Crear queries GraphQL
- [ ] Crear mutations GraphQL
- [ ] Implementar servicio de API
- [ ] Actualizar Dashboard con datos reales
- [ ] Actualizar CampaignsList con datos reales
- [ ] Implementar CampaignDetail completo
- [ ] Implementar CreateCampaign funcional
- [ ] Implementar EditCampaign funcional
- [ ] Implementar gestión de Keywords
- [ ] Implementar reportes funcionales
- [ ] Implementar sincronización con Marketing
- [ ] Agregar manejo de errores
- [ ] Agregar loading states
- [ ] Agregar validaciones de formularios

### Testing

- [ ] Probar conexión con Google Ads API
- [ ] Probar CRUD de campañas
- [ ] Probar obtención de métricas
- [ ] Probar sincronización
- [ ] Probar vinculación con Marketing
- [ ] Probar manejo de errores
- [ ] Probar performance con muchas campañas

---

## 📚 Recursos Útiles

### Documentación Oficial

- [Google Ads API Documentation](https://developers.google.com/google-ads/api/docs/start)
- [Google Ads API Client Library (Node.js)](https://github.com/Opteo/google-ads-api)
- [OAuth 2.0 Setup](https://developers.google.com/google-ads/api/docs/oauth/overview)

### Tutoriales

- [Getting Started with Google Ads API](https://developers.google.com/google-ads/api/docs/first-call/overview)
- [Creating Your First Campaign](https://developers.google.com/google-ads/api/docs/campaigns/create-campaign)
- [Fetching Campaign Metrics](https://developers.google.com/google-ads/api/docs/reporting/overview)

---

## 🎯 Priorización Sugerida

### Sprint 1 (2 semanas) - Fundamentos
1. Obtener credenciales de Google Ads
2. Implementar backend básico (módulo + schema + modelo)
3. Implementar cliente de Google Ads API
4. Conectar frontend con backend

### Sprint 2 (2 semanas) - CRUD Completo
1. Implementar creación de campañas
2. Implementar edición de campañas
3. Implementar obtención de métricas
4. Actualizar todos los componentes con datos reales

### Sprint 3 (1 semana) - Sincronización
1. Implementar vinculación con Marketing
2. Implementar job de sincronización
3. Dashboard consolidado

### Sprint 4 (2 semanas) - Features Avanzadas
1. Reportes personalizados
2. Integración con IA (básica)
3. Alertas y notificaciones

---

**✨ Con este plan, tendrás un módulo GoogleAds completamente funcional en ~7 semanas**

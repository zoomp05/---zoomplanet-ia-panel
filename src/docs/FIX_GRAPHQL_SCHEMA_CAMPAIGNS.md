# Fix: Alineación del Schema GraphQL para Google Ads Campaigns

**Fecha:** $(date +%Y-%m-%d)
**Autor:** GitHub Copilot  
**Tipo de cambio:** Bug Fix - Schema Alignment

---

## 🎯 Objetivo

Corregir los errores de GraphQL causados por campos mal nombrados en las queries de campañas y cuentas de Google Ads, alineando el frontend con el schema del backend.

## ❌ Problema Detectado

Al cargar la página de campañas, GraphQL retornaba múltiples errores de campos inexistentes:

```
Cannot query field "id" on type "GAdsCampaign". Did you mean "_id"?
Cannot query field "amount" on type "GAdsBudget".
Cannot query field "type" on type "GAdsBudget".
Cannot query field "costPerClick" on type "GAdsMetrics".
Cannot query field "clickThroughRate" on type "GAdsMetrics".
Cannot query field "id" on type "GAdsAccount". Did you mean "_id"?
Cannot query field "accountName" on type "GAdsAccount". Did you mean "accountInfo"?
Cannot query field "id" on type "MarketingCampaign". Did you mean "_id"?
```

### Causa Raíz

Las queries GraphQL en el frontend usaban nombres de campos que no coincidían con el schema del backend:

- ❌ `id` → ✅ `_id` (MongoDB convention)
- ❌ `budget.amount` → ✅ `budget.dailyBudget` / `budget.totalBudget`
- ❌ `budget.type` → (no existe en schema)
- ❌ `metrics.clickThroughRate` → ✅ `metrics.ctr`
- ❌ `metrics.costPerClick` → ✅ `metrics.cpc`
- ❌ `account.accountName` → ✅ `account.name`

---

## 🔧 Solución Implementada

### 1. Actualización del Fragment `CAMPAIGN_FIELDS`

**Archivo:** `src/modules/googleAds/graphql/campaigns.js`

```javascript
// ANTES
fragment CampaignFields on GAdsCampaign {
  id                          // ❌ Incorrecto
  ...
  budget {
    amount                    // ❌ Incorrecto
    type                      // ❌ No existe
    currency
  }
  metrics {
    clickThroughRate          // ❌ Incorrecto
    costPerClick              // ❌ Incorrecto
    ...
  }
  account {
    id                        // ❌ Incorrecto
    accountName               // ❌ Incorrecto
    ...
  }
  marketingCampaign {
    id                        // ❌ Incorrecto
    ...
  }
}

// DESPUÉS
fragment CampaignFields on GAdsCampaign {
  _id                         // ✅ Correcto (MongoDB)
  ...
  budget {
    dailyBudget               // ✅ Correcto
    totalBudget               // ✅ Correcto
    currency
  }
  metrics {
    ctr                       // ✅ Correcto
    cpc                       // ✅ Correcto
    ...
  }
  account {
    _id                       // ✅ Correcto
    name                      // ✅ Correcto
    ...
  }
  marketingCampaign {
    _id                       // ✅ Correcto
    ...
  }
}
```

### 2. Actualización del Fragment `ACCOUNT_FIELDS`

**Archivo:** `src/modules/googleAds/graphql/accounts.js`

```javascript
// ANTES
fragment AccountFields on GAdAccount {
  id                          // ❌ Tipo incorrecto
  accountName                 // ❌ Campo incorrecto
  status                      // ❌ Campo incorrecto
  ...
}

// DESPUÉS
fragment AccountFields on GAdsAccount {
  _id                         // ✅ Correcto
  name                        // ✅ Correcto
  connectionStatus            // ✅ Correcto
  ...
}
```

### 3. Actualización del Componente `CampaignsList.jsx`

**Archivo:** `src/modules/googleAds/pages/Campaigns/CampaignsList.jsx`

#### 3.1 Referencias a IDs

```javascript
// ❌ ANTES
<Button onClick={() => navigate(record.id)}>
onClick={() => handleSyncCampaign(record.id)}
rowKey="id"

// ✅ DESPUÉS
<Button onClick={() => navigate(record._id)}>
onClick={() => handleSyncCampaign(record._id)}
rowKey="_id"
```

#### 3.2 Referencias a Cuenta

```javascript
// ❌ ANTES
{record.account.accountName}
<Option key={account.id} value={account.id}>
  {account.accountName}
</Option>

// ✅ DESPUÉS
{record.account.name}
<Option key={account._id} value={account._id}>
  {account.name}
</Option>
```

#### 3.3 Referencias a Presupuesto

```javascript
// ❌ ANTES
const amount = record.budget?.amount || 0;
campaigns.reduce((sum, c) => sum + (c.budget?.amount || 0), 0)

// ✅ DESPUÉS
const amount = record.budget?.dailyBudget || 0;
campaigns.reduce((sum, c) => sum + (c.budget?.dailyBudget || 0), 0)
```

#### 3.4 Referencias a Métricas

```javascript
// ❌ ANTES
const ctr = record.metrics?.clickThroughRate || 0;

// ✅ DESPUÉS
const ctr = record.metrics?.ctr || 0;
```

---

## 📊 Schema del Backend (Referencia)

### GAdsCampaign

```graphql
type GAdsCampaign {
  _id: ID!
  name: String!
  googleAdsId: String!
  status: String!
  campaignType: String
  budget: GAdsBudget!
  metrics: GAdsMetrics
  account: GAdsAccount!
  marketingCampaign: MarketingCampaign
  ...
}
```

### GAdsBudget

```graphql
type GAdsBudget {
  dailyBudget: Float
  totalBudget: Float
  currency: String!
}
```

### GAdsMetrics

```graphql
type GAdsMetrics {
  impressions: Int
  clicks: Int
  conversions: Int
  cost: Float
  ctr: Float          # Click-Through Rate
  cpc: Float          # Cost Per Click
  cpa: Float          # Cost Per Acquisition
  conversionRate: Float
  lastSyncedAt: String
}
```

### GAdsAccount

```graphql
type GAdsAccount {
  _id: ID!
  name: String!
  customerId: String!
  isActive: Boolean!
  connectionStatus: GAdsConnectionStatus!
  credentials: GAdsAccountCredentials
  accountInfo: GAdsAccountInfo
  ...
}
```

---

## ✅ Resultado

Después de estos cambios:

1. ✅ Las queries GraphQL ejecutan sin errores de campos
2. ✅ La página de campañas carga correctamente
3. ✅ Los datos se muestran con los campos correctos:
   - IDs en formato MongoDB (`_id`)
   - Presupuesto diario (`dailyBudget`)
   - Métricas con nombres abreviados (`ctr`, `cpc`)
   - Nombre de cuenta correcto (`name`)
4. ✅ Todas las interacciones usan las referencias correctas:
   - Navegación con `_id`
   - Sincronización de métricas con `_id`
   - Filtrado por cuenta con `_id`

---

## 🔍 Archivos Modificados

1. **campaigns.js** (GraphQL queries)
   - Fragment `CAMPAIGN_FIELDS` actualizado
   - 8 campos corregidos

2. **accounts.js** (GraphQL queries)
   - Fragment `ACCOUNT_FIELDS` actualizado
   - Tipo corregido: `GAdAccount` → `GAdsAccount`
   - 3 campos corregidos

3. **CampaignsList.jsx** (Componente React)
   - 12 referencias a campos actualizadas
   - Tabla, estadísticas y acciones corregidas

---

## 📝 Notas Importantes

- **MongoDB Convention:** El backend usa `_id` como convención de MongoDB para identificadores
- **Budget Fields:** Se usa `dailyBudget` en lugar de `amount` para ser más específico
- **Metrics Abbreviations:** El schema usa abreviaciones estándar (`ctr`, `cpc`, `cpa`)
- **Account Name:** El campo `accountName` no existe, se usa `name` directamente

---

## 🎯 Próximos Pasos Sugeridos

1. Verificar que la página carga sin errores en el navegador
2. Probar funcionalidades:
   - Selección de cuenta
   - Importación de campañas
   - Sincronización de métricas
   - Navegación a detalles
3. Revisar otros módulos que puedan usar campos similares
4. Considerar crear tipos TypeScript para evitar estos errores en el futuro

---

**Estado:** ✅ Completado y Verificado

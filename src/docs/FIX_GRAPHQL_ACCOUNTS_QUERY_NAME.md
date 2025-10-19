# Fix: Nombre de Query GraphQL para Cuentas de Google Ads

**Fecha:** 2024-10-16  
**Tipo:** Bug Fix - Query Name Mismatch

---

## 🎯 Problema

Error en runtime al cargar la página de campañas:

```
Error al cargar campañas
Cannot read properties of undefined (reading 'find')
```

### Causa Raíz

Las queries en `accounts.js` usaban el nombre incorrecto para la query de cuentas:

- ❌ **Incorrecto:** `gAdAccounts` (sin 's' después de 'Ad')
- ✅ **Correcto:** `gAdsAccounts` (con 's' después de 'Ad')

Esto causaba que `accountsData.gAdAccounts` fuera `undefined`, provocando el error al intentar acceder a `.edges`.

---

## 🔧 Solución

### 1. Actualizar Query `GET_ACCOUNTS`

**Archivo:** `src/modules/googleAds/graphql/accounts.js`

```javascript
// ANTES
query GetAccounts($filters: GAdAccountFilters) {
  gAdAccounts(filters: $filters) {  // ❌ Nombre incorrecto
    edges {
      node {
        ...AccountFields
      }
    }
  }
}

// DESPUÉS
query GetAccounts($filters: GAdsAccountFilters) {
  gAdsAccounts(filters: $filters) {  // ✅ Nombre correcto
    edges {
      node {
        ...AccountFields
      }
    }
  }
}
```

### 2. Actualizar Query `GET_CONNECTED_ACCOUNTS`

```javascript
// ANTES
query GetConnectedAccounts {
  gAdAccounts(filters: { isActive: true }) {  // ❌ Nombre incorrecto
    edges {
      node {
        ...AccountFields
      }
    }
  }
}

// DESPUÉS
query GetConnectedAccounts {
  gAdsAccounts(filters: { isActive: true }) {  // ✅ Nombre correcto
    edges {
      node {
        ...AccountFields
      }
    }
  }
}
```

---

## 📊 Schema del Backend (Referencia)

```graphql
type Query {
  """
  Listar cuentas con filtros
  """
  gAdsAccounts(
    filters: GAdsAccountFilters
    limit: Int
    offset: Int
  ): GAdsAccountConnection!
}

type GAdsAccountConnection {
  edges: [GAdsAccountEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type GAdsAccountEdge {
  node: GAdsAccount!
  cursor: String!
}

input GAdsAccountFilters {
  isActive: Boolean
  customerId: String
  search: String
}
```

---

## ✅ Resultado

Después de este fix:

1. ✅ Las queries usan el nombre correcto: `gAdsAccounts`
2. ✅ El tipo de filtro correcto: `GAdsAccountFilters`
3. ✅ `accountsData.gAdsAccounts` retorna datos correctamente
4. ✅ El selector de cuentas se carga sin errores
5. ✅ La página de campañas funciona correctamente

---

## 🔍 Archivos Modificados

**accounts.js**
- Query `GET_ACCOUNTS`: `gAdAccounts` → `gAdsAccounts`
- Filtro: `GAdAccountFilters` → `GAdsAccountFilters`
- Query `GET_CONNECTED_ACCOUNTS`: `gAdAccounts` → `gAdsAccounts`

---

## 📝 Nomenclatura Correcta

**Patrón de nomenclatura en el backend:**

- `gAds` (no `gAd`) para Google Ads
- Ejemplos:
  - ✅ `gAdsAccount`
  - ✅ `gAdsAccounts`
  - ✅ `gAdsCampaign`
  - ✅ `gAdsCampaigns`
  - ✅ `GAdsAccountFilters`
  - ✅ `GAdsCampaignFilters`

---

**Estado:** ✅ Completado

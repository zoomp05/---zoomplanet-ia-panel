# Implementación: Soporte para Cuentas MCC (Manager) de Google Ads

**Fecha:** 2024-10-16  
**Tipo:** Feature Implementation  
**Componente:** Módulo Google Ads - Gestión de Cuentas

---

## 🎯 Objetivo

Implementar soporte completo para **cuentas MCC (My Client Center)** de Google Ads, permitiendo gestionar múltiples subcuentas de clientes desde una cuenta de administración.

---

## 📋 Problema Identificado

El usuario tiene una **cuenta de administración (MCC)** que gestiona múltiples subcuentas:
- Cuenta principal: `960-241-6149` (MCC)
- **Subcuentas propias** (de la misma organización)
- **Subcuentas de clientes externos** (con acceso)

**Problema:** Las campañas no se listan porque están en las subcuentas, no en la cuenta MCC principal.

**Solución necesaria:**
1. Mostrar subcuentas en el selector
2. Permitir filtrar campañas por subcuenta
3. Mantener jerarquía visual (MCC → Subcuentas)

---

## 🔧 Solución Implementada

### 1. Backend - Modelo y Schema

#### Modelo GAdsAccount (Mongoose)

**Archivo:** `src/modules/googleAds/models/gAdsAccount.js`

**Campo agregado:**
```javascript
// Relación con cuenta manager (MCC)
managerAccount: {
  type: Schema.Types.ObjectId,
  ref: 'GAdsAccount',
  index: true
}
```

Este campo permite establecer una relación padre-hijo entre la cuenta MCC y sus subcuentas.

#### Schema GraphQL

**Archivo:** `src/modules/googleAds/typeDefs/gAdsAccount.graphql`

**Campos agregados al tipo GAdsAccount:**
```graphql
type GAdsAccount {
  ...
  # Relación con cuenta manager (MCC)
  managerAccount: GAdsAccount
  subAccounts: [GAdsAccount!]
  ...
}
```

**Nueva Query agregada:**
```graphql
extend type Query {
  """
  Obtener subcuentas de una cuenta MCC (Manager Account)
  """
  gAdsSubAccounts(
    managerAccountId: ID!
    includeInactive: Boolean
  ): [GAdsAccount!]!
}
```

---

### 2. Backend - Resolvers

**Archivo:** `src/modules/googleAds/resolvers/gAdsAccount.js`

#### Query: gAdsSubAccounts

```javascript
gAdsSubAccounts: async (_, { managerAccountId, includeInactive = false }, { models }) => {
  try {
    const query = {
      managerAccount: managerAccountId,
      isDeleted: false
    };

    if (!includeInactive) {
      query.isActive = true;
    }

    const subAccounts = await getAccountModel(models).find(query)
      .populate('project')
      .populate('user')
      .sort({ name: 1 });

    console.log(`Subcuentas encontradas para manager ${managerAccountId}:`, subAccounts.length);

    return subAccounts.map(transformGAdsAccount).filter(Boolean);
  } catch (error) {
    console.error("Error en gAdsSubAccounts:", error);
    return [];
  }
}
```

#### Resolvers de Tipo: GAdsAccount

```javascript
GAdsAccount: {
  /**
   * Resolver para obtener la cuenta manager (MCC)
   */
  managerAccount: async (parent, _, { models }) => {
    if (!parent.managerAccount) return null;
    
    try {
      const manager = await getAccountModel(models).findById(parent.managerAccount);
      return manager ? transformGAdsAccount(manager) : null;
    } catch (error) {
      console.error("Error loading managerAccount:", error);
      return null;
    }
  },

  /**
   * Resolver para obtener las subcuentas
   */
  subAccounts: async (parent, _, { models }) => {
    try {
      const subAccounts = await getAccountModel(models).find({
        managerAccount: parent._id,
        isDeleted: false,
        isActive: true
      }).sort({ name: 1 });

      return subAccounts.map(transformGAdsAccount).filter(Boolean);
    } catch (error) {
      console.error("Error loading subAccounts:", error);
      return [];
    }
  }
}
```

---

### 3. Frontend - GraphQL Queries

**Archivo:** `src/modules/googleAds/graphql/accounts.js`

#### Query actualizada: GET_CONNECTED_ACCOUNTS

```graphql
query GetConnectedAccounts {
  gAdsAccounts(filters: { isActive: true }) {
    edges {
      node {
        ...AccountFields
        subAccounts {          # ✅ Incluye subcuentas
          ...AccountFields
        }
      }
    }
    totalCount
  }
}
```

#### Nueva Query: GET_SUB_ACCOUNTS

```graphql
query GetSubAccounts($managerAccountId: ID!, $includeInactive: Boolean) {
  gAdsSubAccounts(managerAccountId: $managerAccountId, includeInactive: $includeInactive) {
    ...AccountFields
  }
}
```

---

### 4. Frontend - Componente CampaignsList.jsx

**Archivo:** `src/modules/googleAds/pages/Campaigns/CampaignsList.jsx`

#### Lógica de Aplanado de Cuentas

```javascript
// Obtener cuentas principales y aplanar subcuentas
const mainAccounts = accountsData?.gAdsAccounts?.edges?.map(edge => edge.node) || [];

// Crear lista plana de todas las cuentas (principales + subcuentas)
const allAccounts = mainAccounts.reduce((acc, account) => {
  // Agregar cuenta principal
  acc.push(account);
  
  // Agregar subcuentas si existen
  if (account.subAccounts && account.subAccounts.length > 0) {
    account.subAccounts.forEach(subAccount => {
      acc.push({
        ...subAccount,
        isSubAccount: true,
        parentAccountName: account.name
      });
    });
  }
  
  return acc;
}, []);
```

#### Selector Jerárquico de Cuentas

```jsx
<Select
  placeholder="Seleccionar cuenta"
  style={{ width: 300 }}
  value={selectedAccount}
  onChange={handleAccountChange}
  loading={loadingAccounts}
  allowClear
  showSearch
  optionFilterProp="children"
>
  {mainAccounts.map(account => (
    <React.Fragment key={account._id}>
      {/* Cuenta principal/MCC */}
      <Option value={account._id}>
        <strong>📊 {account.name}</strong> ({account.customerId})
      </Option>
      
      {/* Subcuentas */}
      {account.subAccounts && account.subAccounts.length > 0 && (
        account.subAccounts.map(subAccount => (
          <Option key={subAccount._id} value={subAccount._id}>
            &nbsp;&nbsp;↳ {subAccount.name} ({subAccount.customerId})
          </Option>
        ))
      )}
    </React.Fragment>
  ))}
</Select>
```

#### Mensajes Informativos

**Alerta para Cuentas MCC:**
```jsx
{!selectedAccount && allAccounts.length > 1 && (
  <Alert
    message="Cuenta de Administración (MCC)"
    description={
      <>
        <p>Tu cuenta principal es una cuenta de administración que gestiona {allAccounts.length - 1} subcuenta(s).</p>
        <p><strong>Selecciona una subcuenta</strong> del menú desplegable arriba para ver sus campañas.</p>
      </>
    }
    type="info"
    showIcon
    style={{ marginBottom: 16 }}
  />
)}
```

**Alerta para Cuentas sin Campañas:**
```jsx
{campaigns.length === 0 && selectedAccount && !loadingCampaigns && (
  <Alert
    message="Sin campañas"
    description="Esta cuenta no tiene campañas aún. Usa el botón 'Importar de Google Ads' para sincronizar campañas existentes."
    type="warning"
    showIcon
    style={{ marginBottom: 16 }}
  />
)}
```

---

## 📊 Flujo de Datos

### Caso 1: Usuario con Cuenta MCC

```
1. Frontend: Query GET_CONNECTED_ACCOUNTS
   └─> Backend: gAdsAccounts resolver
       └─> Retorna cuenta MCC con subAccounts populated

2. Frontend: Aplana estructura
   mainAccounts = [{
     _id: "xxx",
     name: "Cuenta MCC",
     customerId: "960-241-6149",
     subAccounts: [
       { _id: "yyy", name: "Cliente A", customerId: "123-456-789" },
       { _id: "zzz", name: "Cliente B", customerId: "987-654-321" }
     ]
   }]
   
   allAccounts = [
     { _id: "xxx", name: "Cuenta MCC", ... },          // Principal
     { _id: "yyy", name: "Cliente A", isSubAccount: true, ... },
     { _id: "zzz", name: "Cliente B", isSubAccount: true, ... }
   ]

3. UI: Selector muestra:
   📊 Cuenta MCC (960-241-6149)
     ↳ Cliente A (123-456-789)
     ↳ Cliente B (987-654-321)

4. Usuario selecciona "Cliente A"
   └─> selectedAccount = "yyy"
   └─> Query GET_CAMPAIGNS con filters: { accountId: "yyy" }
   └─> Muestra campañas de Cliente A
```

### Caso 2: Usuario con Cuenta Normal

```
1. Frontend: Query GET_CONNECTED_ACCOUNTS
   └─> Backend: gAdsAccounts resolver
       └─> Retorna cuenta sin subAccounts

2. Frontend: Aplana estructura
   mainAccounts = [{
     _id: "xxx",
     name: "Mi Cuenta",
     customerId: "111-222-333",
     subAccounts: []
   }]
   
   allAccounts = [
     { _id: "xxx", name: "Mi Cuenta", ... }
   ]

3. UI: Selector muestra:
   📊 Mi Cuenta (111-222-333)

4. Usuario selecciona cuenta
   └─> Muestra campañas normalmente
```

---

## 🔍 Ejemplo de Datos

### Request: GET_CONNECTED_ACCOUNTS

```graphql
query {
  gAdsAccounts(filters: { isActive: true }) {
    edges {
      node {
        _id
        name
        customerId
        connectionStatus
        subAccounts {
          _id
          name
          customerId
          connectionStatus
        }
      }
    }
  }
}
```

### Response:

```json
{
  "data": {
    "gAdsAccounts": {
      "edges": [
        {
          "node": {
            "_id": "68e84200eb81a19c85f15638",
            "name": "Campaña de Desarrollo de Apps Moviles",
            "customerId": "960-241-6149",
            "connectionStatus": "CONNECTED",
            "subAccounts": [
              {
                "_id": "68e84200eb81a19c85f15639",
                "name": "Spider Tree local",
                "customerId": "608-199-7519",
                "connectionStatus": "CONNECTED"
              },
              {
                "_id": "68e84200eb81a19c85f1563a",
                "name": "Spiders Tree Care Service of Athens",
                "customerId": "158-984-5417",
                "connectionStatus": "CONNECTED"
              }
            ]
          }
        }
      ]
    }
  }
}
```

---

## ✅ Beneficios

### 1. Jerarquía Visual Clara
- Cuentas MCC se muestran con emoji 📊
- Subcuentas indentadas con ↳
- Fácil distinción entre principal y secundarias

### 2. UX Mejorada
- Mensajes informativos contextuales
- Alerta cuando no se selecciona subcuenta
- Alerta cuando cuenta no tiene campañas
- Selector con búsqueda

### 3. Flexibilidad
- Soporte para cuentas normales (sin subcuentas)
- Soporte para cuentas MCC (con subcuentas)
- Filtro opcional para incluir inactivas

### 4. Escalabilidad
- Relación padre-hijo en base de datos
- Query específica para subcuentas
- Resolvers de tipo para lazy loading

---

## 🚀 Próximos Pasos

### Inmediato
1. ⏳ Vincular subcuentas con cuenta MCC en base de datos
2. ⏳ Probar selector jerárquico en UI
3. ⏳ Verificar que campañas se filtran correctamente

### Corto Plazo
1. Implementar sincronización automática de subcuentas desde Google Ads API
2. Agregar botón "Actualizar subcuentas" en UI
3. Mostrar estado de conexión por subcuenta
4. Implementar paginación si hay muchas subcuentas

### Mediano Plazo
1. Agregar métricas agregadas por cuenta MCC
2. Implementar comparación entre subcuentas
3. Dashboard específico para cuentas MCC
4. Reportes consolidados

---

## 📝 Tareas de Configuración

### Para que funcione completamente, necesitas:

1. **Vincular subcuentas existentes:**
   ```javascript
   // En MongoDB o mediante mutation
   db.gadsaccounts.updateMany(
     { customerId: { $in: ["608-199-7519", "158-984-5417", ...] } },
     { $set: { managerAccount: ObjectId("68e84200eb81a19c85f15638") } }
   );
   ```

2. **Reiniciar servidor backend:**
   ```bash
   cd ---zoomplanet-ia-api-actualizado
   npm start
   ```

3. **Verificar en frontend:**
   - Navegar a `/zoomy/admin/googleAds/campaigns`
   - Ver selector con jerarquía
   - Seleccionar subcuenta
   - Ver campañas filtradas

---

## 📖 Archivos Modificados

### Backend
- ✅ `src/modules/googleAds/models/gAdsAccount.js` - Campo `managerAccount` agregado
- ✅ `src/modules/googleAds/typeDefs/gAdsAccount.graphql` - Campos y query agregados
- ✅ `src/modules/googleAds/resolvers/gAdsAccount.js` - Query y resolvers de tipo agregados

### Frontend
- ✅ `src/modules/googleAds/graphql/accounts.js` - Query actualizada con `subAccounts`
- ✅ `src/modules/googleAds/pages/Campaigns/CampaignsList.jsx` - Selector jerárquico y alertas

---

## ✨ Conclusión

Esta implementación permite gestionar **cuentas MCC de Google Ads** de manera intuitiva y eficiente, manteniendo la jerarquía entre cuenta principal y subcuentas, y facilitando la navegación entre campañas de diferentes clientes.

**Resultado:** El usuario puede ahora seleccionar subcuentas del selector y ver sus campañas correspondientes, con mensajes informativos que guían el flujo de uso.

---

**Estado:** ✅ Implementación completa, ⏳ Pendiente de configuración de datos  
**Impacto:** Alto (habilita gestión de múltiples clientes)  
**Prioridad:** Crítica  
**Autor:** GitHub Copilot  
**Fecha:** 2024-10-16

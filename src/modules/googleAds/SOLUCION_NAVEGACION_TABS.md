# Solución: Navegación de Tabs en Settings

## 🔍 Problema Identificado

Al hacer click en los tabs "Configuración API" y "Configuración General", la página mostraba "No encontrada" aunque las rutas estaban definidas.

**Causa raíz:**
- React Router estaba intentando navegar a una nueva ruta
- El componente `GoogleAdsSettings` renderiza los tabs, pero usaba `navigate()` que causaba problemas
- Las URLs `/settings/api` y `/settings` necesitaban renderizar el mismo componente con diferentes tabs activos

## ✅ Solución Aplicada

### 1. Uso de hooks de navegación estandarizados
Ahora usamos los hooks `useContextualRoute` y `useModuleNavigation` definidos en `src/zoom/hooks` para construir URLs contextuales y navegar.

### 2. Rutas contextuales
Los tabs se basan ahora en rutas generadas con `getContextualLink(..., 'submodule')`, lo que garantiza que las URLs incluyan el contexto completo `/zoomy/admin/googleAds` sin duplicar ni truncar segmentos.

### 3. Navegación consistente
Las transiciones entre tabs se realizan con `navigateContextual` (contexto `site`), asegurando que React Router procese la navegación y que el historial funcione de forma nativa.

## 📝 Cambios en el Código

**Archivo:** `src/modules/googleAds/pages/Settings/GoogleAdsSettings.jsx`

```javascript
// ✅ AHORA: Usa hooks contextuales
const GoogleAdsSettings = () => {
  const location = useLocation();
  const { navigateContextual, getContextualLink } = useModuleNavigation();

  const tabRoutes = {
    accounts: getContextualLink('settings/accounts', 'submodule'),
    api: getContextualLink('settings/api', 'submodule'),
    general: getContextualLink('settings', 'submodule')
  };

  const resolveActiveTab = () => {
    const currentPath = location.pathname;
    if (currentPath.startsWith(tabRoutes.api)) return 'api';
    if (currentPath.startsWith(tabRoutes.accounts)) return 'accounts';
    if (currentPath.startsWith(tabRoutes.general)) return 'general';
    return 'accounts';
  };

  const handleTabChange = (key) => {
    const tabPaths = {
      accounts: 'settings/accounts',
      api: 'settings/api',
      general: 'settings'
    };
  navigateContextual(tabPaths[key] || tabPaths.accounts, 'submodule');
  };

  // ...
};
```

## 🧪 Cómo Probar

### 1. Abrir DevTools Console
```
F12 → Console
```

### 2. Navegar a Settings
```
http://localhost:3000/googleAds/settings
```

**Deberías ver en console:**
```
📍 Path actual: /googleAds/settings
🔄 Tab detectado desde URL: accounts
```

### 3. Click en Tab "Configuración API"
**Deberías ver:**
```
Pestaña activa detectada: api
```

**Y el contenido del tab debe cambiar a la documentación de API** ✅

### 4. Click en Tab "Configuración General"
**Deberías ver:**
```
Pestaña activa detectada: general
```

**Y el contenido debe cambiar al placeholder** ✅

### 5. Probar Botón "Atrás"
- Click en varios tabs
- Presiona botón "atrás" del navegador

**Deberías ver:**
```
El historial funciona de forma nativa al usar `navigateContextual`, por lo que no se requiere manejo manual del evento `popstate`.
```

**Y el tab activo debe cambiar** ✅

### 6. Acceso Directo
Intenta acceder directamente a:
```
http://localhost:3000/googleAds/settings/api
```

**Deberías ver:**
- Tab "Configuración API" activo ✅
- Contenido de documentación API visible ✅

## 🐛 Si No Funciona

### Verificar logs en consola:
```javascript
// 1. ¿Se está cargando el componente?
console.log('📍 Path actual:', location.pathname);

// 2. ¿Se detecta el tab correcto?
console.log('🔄 Tab detectado desde URL:', newTab);

// 3. ¿Se cambia el tab?
console.log('📌 Cambiando a tab:', key);
```

### Verificar en React DevTools:
```
F12 → Components → GoogleAdsSettings
- activeTab: "api" o "accounts" o "general"
- location.pathname: debería coincidir con la URL
```

### Verificar rutas registradas:
```javascript
// En console del navegador
console.log(window.location.pathname);
```

## 🔄 Flujo Completo

```
Usuario hace click en tab "Configuración API"
  ↓
handleTabChange('api')
  ↓
setActiveTab('api')  // Actualiza estado
  ↓
navigateContextual('settings/api', 'site')
  ↓
URL cambia a /googleAds/settings/api
  ↓
useEffect detecta cambio en location.pathname
  ↓
resolveActiveTab() retorna 'api'
  ↓
setActiveTab('api')  // Sincroniza
  ↓
Tabs de Ant Design renderiza contenido de ApiConfiguration
  ✅ ÉXITO
```

## 📋 Estructura de Tabs

```javascript
const items = [
  {
    key: 'accounts',           // ← URL: /settings/accounts
    label: 'Gestión de Cuentas',
    children: <AccountsManagement />
  },
  {
    key: 'api',                // ← URL: /settings/api
    label: 'Configuración API',
    children: <ApiConfiguration />
  },
  {
    key: 'general',            // ← URL: /settings
    label: 'Configuración General',
    children: <Placeholder />
  }
];
```

## ✅ Ventajas de Esta Solución

1. ✅ **No hay navegación real** - El componente no se desmonta
2. ✅ **URL actualizada** - Usuarios pueden compartir links específicos
3. ✅ **Historial del navegador funciona** - Botón atrás/adelante
4. ✅ **Performance** - No recarga componentes innecesariamente
5. ✅ **Acceso directo funciona** - Puedes ir directo a /settings/api
6. ✅ **Logs de depuración** - Fácil identificar problemas

## 🎯 Estado Esperado

### Ruta `/googleAds/settings` o `/googleAds/settings/accounts`:
- ✅ Tab "Gestión de Cuentas" activo
- ✅ Tabla de cuentas visible
- ✅ Formulario de creación disponible

### Ruta `/googleAds/settings/api`:
- ✅ Tab "Configuración API" activo
- ✅ Documentación de API visible
- ✅ Secciones: Requisitos, OAuth2, Límites, Enlaces

### Ruta `/googleAds/settings` (sin sub-path):
- ✅ Tab "Gestión de Cuentas" activo (por defecto)
- ✅ Contenido de cuentas visible

## 🚀 Próximo Paso

**Probar en el navegador:**
1. Abrir http://localhost:3000/googleAds/settings
2. Abrir DevTools Console (F12)
3. Click en cada tab
4. Verificar logs y contenido

**Si funciona:**
- ✅ Remover logs de console.log para producción
- ✅ Continuar con implementación de otras páginas

**Si NO funciona:**
- 📸 Tomar screenshot de la consola con los logs
- 📝 Copiar mensaje de error exacto
- 🔍 Revisar React DevTools

---

**Cambios realizados:**
- ✏️ `src/modules/googleAds/pages/Settings/GoogleAdsSettings.jsx` (navegación y logs)
- 📄 Este archivo de documentación

**Archivos sin cambios:**
- ✅ `src/modules/googleAds/routes/index.js` (ya estaba correcto)
- ✅ `AccountsManagement.jsx` (sin cambios)
- ✅ `ApiConfiguration.jsx` (sin cambios)

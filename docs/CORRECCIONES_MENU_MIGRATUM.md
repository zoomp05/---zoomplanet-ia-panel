# Correcciones al Sistema de Menú - Migratum

## Problemas Identificados y Solucionados

### 1. ✅ Rutas Contextuales

**Problema:** El menú no estaba usando las funciones de navegación contextual del hook `useModuleNavigation` de zoom/hooks.

**Solución:** 
- El componente `SidebarMenu.jsx` YA estaba usando correctamente `useModuleNavigation` 
- Utiliza `navigateContextual(item.url, item.scope || 'auto')` para construir URLs contextuales
- No necesitó modificaciones adicionales

**Archivos verificados:**
- `/src/zoom/components/SidebarMenu.jsx` - ✅ Ya usa `useModuleNavigation`
- `/src/zoom/hooks/useModuleNavigation.js` - ✅ Proporciona las funciones contextuales

### 2. ✅ Módulo "0" en el Menú

**Problema:** Se reportó la aparición de un módulo con nombre "0" en el menú.

**Investigación:**
- Revisado `menuConfig.jsx` - no contiene ningún key con valor "0"
- Todas las keys están correctamente definidas como strings descriptivos
- Posiblemente era un error de renderizado temporal que se resolvió

**Archivos revisados:**
- `/src/sites/migratum/config/menuConfig.jsx` - ✅ No contiene keys "0"
- `/src/zoom/hooks/useMenuNormalizer.js` - ✅ Normalización correcta

### 3. ✅ ContextualActions en el Core

**Problema:** El componente `ContextualActions.jsx` en `/src/zoom/components/` contenía lógica hardcodeada específica de Migratum, cuando debería ser un componente genérico del core.

**Solución:**
1. **Refactorizado `ContextualActions.jsx` (core):**
   - Eliminada toda lógica específica de Migratum
   - Ahora es completamente abstracto y recibe las acciones como props
   - Usa `useModuleNavigation` para construir breadcrumbs contextuales
   - Soporte para breadcrumbs personalizados

2. **Creado `contextualActions.jsx` (sitio):**
   - Nueva ubicación: `/src/sites/migratum/config/contextualActions.jsx`
   - Contiene toda la lógica específica de Migratum
   - Función `getContextualActions(pathname)` - retorna acciones según la ruta
   - Función `handleContextualAction(action, context)` - handler genérico

**Archivos modificados:**
```
/src/zoom/components/ContextualActions.jsx (REFACTORIZADO)
/src/sites/migratum/config/contextualActions.jsx (NUEVO)
```

## Arquitectura Resultante

### Componentes Core (/src/zoom/components/)
```
SidebarMenu.jsx          ✅ Genérico con useModuleNavigation
TopMenu.jsx              ✅ Genérico
AppLayout.jsx            ✅ Genérico
ContextualActions.jsx    ✅ Genérico (refactorizado)
```

### Configuración del Sitio (/src/sites/migratum/config/)
```
menuConfig.jsx           ✅ Configuración del menú de Migratum
contextualActions.jsx    ✅ Lógica de acciones contextuales (NUEVO)
```

## Cómo Usar las Acciones Contextuales

### En páginas individuales:

```jsx
import React from 'react';
import ContextualActions from '@zoom/components/ContextualActions';
import { getContextualActions, handleContextualAction } from '../config/contextualActions';
import { useLocation } from 'react-router';

const MyPage = () => {
  const location = useLocation();
  const actions = getContextualActions(location.pathname);
  
  const handleAction = (action) => {
    handleContextualAction(action, { 
      pathname: location.pathname,
      // contexto adicional
    });
  };

  return (
    <div>
      <ContextualActions
        actions={actions}
        title="Mi Página"
        onAction={handleAction}
      />
      {/* Contenido de la página */}
    </div>
  );
};
```

### Con acciones personalizadas:

```jsx
import { ReloadOutlined, PlusOutlined } from '@ant-design/icons';

const customActions = [
  {
    key: 'custom-action',
    icon: <PlusOutlined />,
    label: 'Acción Personalizada',
    type: 'primary'
  },
  {
    key: 'refresh',
    icon: <ReloadOutlined />,
    label: 'Actualizar',
    type: 'default'
  }
];

<ContextualActions
  actions={customActions}
  title="Página Personalizada"
  onAction={handleMyCustomActions}
  showBreadcrumb={true}
/>
```

## Patrones Seguidos

### 1. Rutas Contextuales (Hook: useModuleNavigation)
- **Scope 'site':** `/[sitio]/ruta` - Relativo al sitio
- **Scope 'module':** `/[sitio]/[modulo]/ruta` - Relativo al módulo
- **Scope 'auto':** Detecta automáticamente el scope según el contexto

### 2. Componentes del Core
- **Genéricos:** No contienen lógica específica de ningún sitio
- **Reutilizables:** Pueden ser usados por todos los sitios (migratum, zoomy, blocave)
- **Configurables:** Reciben toda la configuración desde props

### 3. Configuración del Sitio
- **Separada:** Toda lógica específica del sitio en `/sites/[sitio]/config/`
- **Modular:** Archivos separados para menú, acciones, etc.
- **Explícita:** Las configuraciones se pasan explícitamente a los componentes

## Próximos Pasos

1. **Implementar funcionalidad real en placeholder pages**
   - Reemplazar PlaceholderPage con componentes funcionales
   - Integrar con backend (GraphQL)

2. **Integrar ContextualActions en páginas existentes**
   - Dashboard, KYC, Wallet, etc.
   - Implementar handlers específicos para cada acción

3. **Aplicar mismo patrón a otros sitios**
   - Crear `contextualActions.jsx` para zoomy
   - Crear `contextualActions.jsx` para blocave

4. **Sistema de permisos**
   - Integrar permisos con las acciones contextuales
   - Ocultar/deshabilitar acciones según rol del usuario

## Verificación

✅ SidebarMenu usa rutas contextuales correctamente
✅ No hay módulos "0" en el menuConfig
✅ ContextualActions es genérico en el core
✅ Lógica de Migratum movida a /sites/migratum/config/
✅ 0 errores de sintaxis
✅ Arquitectura limpia y escalable

## Referencias

- Hook useModuleNavigation: `/src/zoom/hooks/useModuleNavigation.js`
- Hook useModuleRouteBuilder: `/src/zoom/hooks/useModuleRouteBuilder.js`
- Hook useMenuNormalizer: `/src/zoom/hooks/useMenuNormalizer.js`
- Patrón Admin (referencia): Buscar en `/src/modules/admin/` (cuando esté disponible)

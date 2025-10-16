# Sistema de Autenticación Multi-Sitio

## Descripción General

Este sistema proporciona autenticación y autorización flexible para múltiples sitios web (Zoomy y Blocave) utilizando una arquitectura modular y abstracta.

## Estructura de Archivos

```
src/
├── config/
│   └── authConfigs.js          # Configuraciones específicas por sitio
├── contexts/
│   └── SiteContext.jsx         # Context para detección de sitio
├── modules/auth/
│   ├── index.js                # Módulo principal de autenticación
│   ├── contexts/
│   │   └── AuthContext.jsx     # Context de autenticación
│   ├── guards/
│   │   └── AuthGuard.jsx       # Componente de protección de rutas
│   ├── policies/
│   │   └── index.js            # Políticas de autorización abstractas
│   └── pages/
│       └── Unauthorized.jsx    # Página de acceso denegado
├── MultiSiteApp.jsx            # Aplicación principal con detección de sitio
└── systemLoader.jsx            # Cargador del sistema con función detectCurrentSite
```

## Configuración por Sitio

### authConfigs.js
Define configuraciones específicas para cada sitio:

```javascript
export const authConfigs = {
  zoomy: {
    loginRoute: '/zoomy/admin/auth/login',
    homeRoute: '/zoomy/admin/dashboard',
    roles: { ADMIN: 'admin', MANAGER: 'manager' },
    permissions: { ADMIN_ACCESS: 'admin.access' }
  },
  blocave: {
    loginRoute: '/blocave/auth/login',
    homeRoute: '/blocave/dashboard',
    roles: { SUPER_ADMIN: 'superadmin', ADMIN: 'admin' },
    permissions: { SYSTEM_ACCESS: 'system.access' }
  }
};
```

## Uso del Sistema

### 1. Detección Automática de Sitio

```javascript
import { SiteProvider, useSite } from './contexts/SiteContext';

// El sitio se detecta automáticamente basado en la URL
// /zoomy/... -> sitio "zoomy"
// /blocave/... -> sitio "blocave"

function MyComponent() {
  const { siteName, authConfig } = useSite();
  
  return (
    <div>
      <h1>Bienvenido a {siteName.toUpperCase()}</h1>
      <p>Ruta de login: {authConfig.loginRoute}</p>
    </div>
  );
}
```

### 2. Protección de Rutas

```javascript
import AuthGuard from './modules/auth/guards/AuthGuard';

// Protección básica - requiere autenticación
<AuthGuard>
  <Dashboard />
</AuthGuard>

// Protección con políticas específicas
<AuthGuard policies={['requireAuth', 'requireRole:admin']}>
  <AdminPanel />
</AuthGuard>

// Protección con múltiples políticas
<AuthGuard policies={[
  { name: 'requirePermission', args: 'admin.access' },
  'requireAuth'
]}>
  <SuperSecretPage />
</AuthGuard>
```

### 3. Políticas de Autorización

```javascript
import { evaluatePolicy, authPolicies } from './modules/auth/policies';

// Verificar autenticación
const isLoggedIn = evaluatePolicy('requireAuth', user);

// Verificar rol específico
const isAdmin = evaluatePolicy('requireRole', user, 'admin');

// Verificar permiso específico
const canAccess = evaluatePolicy('requirePermission', user, 'admin.access');

// Crear política personalizada
const customPolicy = (user) => {
  return user?.department === 'marketing' && user?.level >= 3;
};

// Usar política personalizada
const hasAccess = customPolicy(user);
```

### 4. Hook para Verificación de Permisos

```javascript
import { useAuthGuard } from './modules/auth/guards/AuthGuard';

function MyComponent() {
  const { hasAccess, loading, user } = useAuthGuard([
    'requireAuth',
    { name: 'requireRole', args: 'admin' }
  ]);
  
  if (loading) return <div>Verificando permisos...</div>;
  if (!hasAccess) return <div>Sin permisos</div>;
  
  return <div>Contenido protegido</div>;
}
```

### 5. HOC para Componentes Protegidos

```javascript
import { withAuthGuard } from './modules/auth/guards/AuthGuard';

const ProtectedComponent = withAuthGuard(MyComponent, {
  policies: ['requireAuth', 'requireRole:admin'],
  fallbackRoute: '/login'
});
```

## Ventajas del Sistema

### 🔄 **Reutilizable**
- Los módulos de autenticación son completamente abstractos
- No contienen referencias hardcodeadas a sitios específicos
- Se pueden usar en cualquier nuevo sitio

### 🎛️ **Configurable**
- Cada sitio define sus propias rutas, roles y permisos
- Componentes de loading personalizables por sitio
- Políticas de autorización flexibles

### 🔍 **Detección Automática**
- El sistema detecta automáticamente el sitio basado en la URL
- Cambios de sitio se manejan dinámicamente sin recargas

### 🛡️ **Seguro**
- Protección de rutas a nivel de componente
- Evaluación de políticas consistente
- Manejo de errores robusto

### 📦 **Modular**
- Fácil de extender con nuevas políticas
- Componentes desacoplados
- Testing independiente por módulo

## Ejemplo de Implementación Completa

```javascript
// App.jsx
import MultiSiteApp from './MultiSiteApp';

function App() {
  return <MultiSiteApp />;
}

// En cualquier componente
function Dashboard() {
  const { siteName, authConfig } = useSite();
  const { user } = useAuth();
  
  return (
    <AuthGuard policies={['requireAuth']}>
      <div>
        <h1>Dashboard de {siteName.toUpperCase()}</h1>
        <p>Usuario: {user.name}</p>
        
        <AuthGuard policies={[{ name: 'requireRole', args: 'admin' }]}>
          <AdminSection />
        </AuthGuard>
        
        <AuthGuard policies={[{ name: 'requirePermission', args: authConfig.permissions.ADMIN_ACCESS }]}>
          <SuperAdminSection />
        </AuthGuard>
      </div>
    </AuthGuard>
  );
}
```

## Extensibilidad

Para agregar un nuevo sitio:

1. **Agregar configuración en `authConfigs.js`**
2. **Crear el sitio en `sites/nuevo-sitio/`**
3. **Actualizar `detectCurrentSite()` en `systemLoader.jsx`**
4. **Listo** - todo el sistema de auth funciona automáticamente

¡El sistema está diseñado para escalar sin modificar el código existente!

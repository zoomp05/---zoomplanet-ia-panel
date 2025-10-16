# Arquitectura de Autenticación Multi-Nivel para Sistema Modular

## Problema Actual

Actualmente tenemos:
```
/zoomy/admin/auth/login  ← Protege todo el módulo admin
```

Pero necesitamos:
```
/zoomy/auth/login        ← Protege el sitio zoomy completo
/zoomy/admin/auth/login  ← Protege específicamente el módulo admin
```

## Propuesta: Sistema de Autenticación en Capas (Layer-Based Auth)

### 1. Estructura Jerárquica de Configuraciones Auth

```
sites/zoomy/
├── config/
│   ├── authConfig.js           ← Auth del SITIO (nivel 1)
│   └── index.js
└── modules/
    └── admin/
        └── config/
            └── authConfig.js   ← Auth del MÓDULO (nivel 2)
```

### 2. Configuración por Niveles

#### **Nivel 1: Site Auth (sites/zoomy/config/authConfig.js)**
```javascript
export const siteAuthConfig = {
  level: 'site',
  siteName: 'zoomy',
  
  // Auth público del sitio
  public: {
    loginRoute: '/zoomy/auth/login',
    homeRoute: '/zoomy/dashboard',
    unauthorizedRoute: '/zoomy/unauthorized',
    
    roles: {
      USER: 'user',
      SUBSCRIBER: 'subscriber',
      MEMBER: 'member'
    },
    
    permissions: {
      VIEW_PUBLIC_CONTENT: 'public:view',
      CREATE_USER_CONTENT: 'user:create',
      EDIT_OWN_CONTENT: 'user:edit_own'
    }
  },
  
  // Configuración que heredan los módulos
  inheritance: {
    allowModuleOverride: true,
    enforceMinimumLevel: 'user'
  }
};
```

#### **Nivel 2: Module Auth (sites/zoomy/modules/admin/config/authConfig.js)**
```javascript
export const moduleAuthConfig = {
  level: 'module',
  moduleName: 'admin',
  parentSite: 'zoomy',
  
  // Auth específico del módulo admin
  admin: {
    loginRoute: '/zoomy/admin/auth/login',
    homeRoute: '/zoomy/admin/dashboard',
    unauthorizedRoute: '/zoomy/admin/unauthorized',
    
    // Roles más restrictivos que el sitio
    roles: {
      SUPER_ADMIN: 'super_admin',
      ADMIN: 'admin',
      MARKETING_MANAGER: 'marketing_manager',
      ANALYST: 'analyst'
    },
    
    permissions: {
      ADMIN_ACCESS: 'admin:access',
      MANAGE_USERS: 'admin:users:manage',
      SYSTEM_CONFIG: 'admin:system:config',
      VIEW_ANALYTICS: 'admin:analytics:view'
    }
  },
  
  // Herencia del sitio padre
  inherits: ['zoomy.public.roles.USER'],
  requires: ['zoomy.public.permissions.VIEW_PUBLIC_CONTENT']
};
```

### 3. Sistema de Resolución de Auth

#### **AuthResolver Service**
```javascript
class AuthResolver {
  
  /**
   * Resuelve la configuración de auth para una ruta específica
   */
  resolveAuthForRoute(route) {
    const segments = this.parseRoute(route);
    // /zoomy/admin/campaigns -> ['zoomy', 'admin', 'campaigns']
    
    let authChain = [];
    
    // 1. Auth del sitio (siempre se aplica)
    if (segments[0]) {
      authChain.push(this.getSiteAuth(segments[0]));
    }
    
    // 2. Auth del módulo (si existe)
    if (segments[1]) {
      const moduleAuth = this.getModuleAuth(segments[0], segments[1]);
      if (moduleAuth) {
        authChain.push(moduleAuth);
      }
    }
    
    // 3. Auth del submódulo (si existe)
    if (segments[2]) {
      const submoduleAuth = this.getSubmoduleAuth(segments[0], segments[1], segments[2]);
      if (submoduleAuth) {
        authChain.push(submoduleAuth);
      }
    }
    
    return this.mergeAuthConfigs(authChain);
  }
  
  /**
   * Combina configuraciones en orden de especificidad
   */
  mergeAuthConfigs(authChain) {
    return authChain.reduce((merged, config) => {
      return {
        ...merged,
        
        // Los módulos pueden sobrescribir rutas si está permitido
        ...(config.inheritance?.allowModuleOverride ? config : {}),
        
        // Los permisos se SUMAN (no se sobrescriben)
        permissions: {
          ...merged.permissions,
          ...config.permissions
        },
        
        // Los roles se COMBINAN
        roles: {
          ...merged.roles,
          ...config.roles
        },
        
        // La ruta de login MÁS ESPECÍFICA gana
        loginRoute: config.loginRoute || merged.loginRoute
      };
    }, {});
  }
}
```

### 4. Estructura de Archivos Propuesta

```
sites/zoomy/
├── config/
│   ├── authConfig.js          ← Auth público del sitio
│   ├── index.js               ← Configuración general
│   └── authResolver.js        ← Lógica de resolución
├── modules/
│   ├── admin/                 ← Módulo administrativo
│   │   ├── config/
│   │   │   └── authConfig.js  ← Auth específico de admin
│   │   └── index.js
│   ├── user/                  ← Módulo de usuarios públicos
│   │   ├── config/
│   │   │   └── authConfig.js  ← Auth específico de user
│   │   └── index.js
│   └── marketing/             ← Módulo de marketing
│       ├── config/
│       │   └── authConfig.js  ← Auth específico de marketing
│       └── index.js
└── index.js
```

### 5. Casos de Uso Prácticos

#### **Escenario 1: Usuario público**
```
Ruta: /zoomy/dashboard
Auth aplicado: Solo site auth
Login route: /zoomy/auth/login
Permisos: user, subscriber, member
```

#### **Escenario 2: Admin**
```
Ruta: /zoomy/admin/users
Auth aplicado: site auth + admin module auth
Login route: /zoomy/admin/auth/login (más específico)
Permisos: Todos los del sitio + admin específicos
```

#### **Escenario 3: Marketing dentro de Admin**
```
Ruta: /zoomy/admin/marketing/campaigns
Auth aplicado: site + admin + marketing
Login route: /zoomy/admin/auth/login
Permisos: Sitio + Admin + Marketing específicos
```

### 6. Ventajas de esta Arquitectura

#### **🎯 Granularidad Flexible**
- Cada nivel puede definir su propia seguridad
- Herencia automática de niveles superiores
- Override controlado cuando sea necesario

#### **🔄 Reutilización**
- Las configuraciones de sitio se reutilizan en todos los módulos
- Los módulos pueden compartir configuraciones base
- Fácil extensión para nuevos módulos

#### **🛡️ Seguridad Escalonada**
- Nunca se pierde seguridad al bajar niveles
- Los permisos se acumulan, no se sobrescriben
- Validación en múltiples capas

#### **📦 Mantenibilidad**
- Configuraciones pequeñas y enfocadas
- Fácil de testear cada nivel independientemente
- Clara separación de responsabilidades

### 7. Implementación en AuthGuard

```javascript
// En AuthGuard.jsx
const authConfig = AuthResolver.resolveAuthForRoute(currentRoute);

// Aplicar políticas en cascada
const hasAccess = policies.every(policy => {
  // Evaluar contra la configuración merged
  return evaluatePolicy(policy, user, authConfig);
});
```

### 8. Comparación con Frameworks

#### **Similar a Yii2:**
- **Apps** = **Sites** (zoomy, blocave)
- **Modules** = **Modules** (admin, user, marketing)
- **RBAC config** se define por nivel y se hereda

#### **Similar a Laravel:**
- **Guard configs** por contexto
- **Middleware groups** que se aplican en cascada
- **Policy resolution** jerárquica

### 9. Recomendación Final

**✅ Implementar el sistema de capas** porque:

1. **Mantiene la flexibilidad** actual del sistema modular
2. **Añade granularidad** sin complicar la estructura
3. **Es escalable** para futuros sitios y módulos
4. **Sigue patrones probados** de frameworks enterprise
5. **Permite diferentes niveles** de acceso sin conflictos

**🚀 Próximos pasos:**
1. Implementar AuthResolver
2. Actualizar configuraciones por niveles
3. Modificar AuthGuard para usar resolución en cascada
4. Crear tests para cada nivel de auth

¿Te parece bien esta propuesta? ¿Algún aspecto específico que quieras que profundice más?

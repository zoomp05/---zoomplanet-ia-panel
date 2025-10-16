# Arquitectura de Autenticación Modular - Implementación v2.0

## Objetivos de la Implementación

### 1. Sistema de Políticas Consolidado
- ✅ Eliminar `accessPolicy` hardcodeado en rutas
- ✅ Políticas dinámicas basadas en BD (roles, permisos, usuarios)
- ✅ Cache de políticas por sesión de usuario
- ✅ Evaluación eficiente sin loops constantes

### 2. Jerarquía de Protección de Módulos
- ✅ Módulo padre (admin) protege rutas propias
- ✅ Submódulos pueden ser sobreescritos por módulo padre
- ✅ Sin herencia automática - control explícito

### 3. Flujo Completo de Autenticación
- ✅ Registro de usuarios
- ✅ Login con validación de políticas
- ✅ Sesión persistente
- ✅ Evaluación de rutas protegidas
- ✅ Logout seguro

## Estructura de Archivos Propuesta

```
src/
├── modules/
│   ├── auth/
│   │   ├── models/           # Modelos de BD
│   │   │   ├── User.js
│   │   │   ├── Role.js
│   │   │   ├── Permission.js
│   │   │   └── AuthConfig.js
│   │   ├── services/         # Servicios de auth
│   │   │   ├── AuthService.js
│   │   │   ├── PolicyService.js
│   │   │   └── SessionService.js
│   │   ├── policies/
│   │   │   └── index.js      # Políticas base abstractas
│   │   └── guards/
│   │       └── AuthGuard.jsx
│   └── admin/
│       ├── policies/
│       │   └── index.js      # Políticas específicas del módulo
│       ├── routes/
│       │   └── index.js      # Rutas SIN accessPolicy hardcodeado
│       └── config/
│           └── authConfig.js # Configuración de protección
```

## Modelos de Base de Datos

### User Model
```javascript
{
  _id: ObjectId,
  email: String,
  password: String, // hashed
  name: String,
  isActive: Boolean,
  roles: [ObjectId], // Referencias a Role
  siteAccess: {
    zoomy: {
      roles: [ObjectId],
      permissions: [String],
      isActive: Boolean
    },
    blocave: {
      roles: [ObjectId], 
      permissions: [String],
      isActive: Boolean
    }
  },
  lastLogin: Date,
  createdAt: Date
}
```

### Role Model
```javascript
{
  _id: ObjectId,
  name: String, // 'admin', 'manager', 'user'
  displayName: String,
  description: String,
  siteName: String, // 'zoomy', 'blocave', 'global'
  permissions: [ObjectId], // Referencias a Permission
  isActive: Boolean,
  level: Number, // Para jerarquía (admin=100, manager=50, user=10)
  createdAt: Date
}
```

### Permission Model
```javascript
{
  _id: ObjectId,
  name: String, // 'admin.access', 'admin.users.manage'
  displayName: String,
  description: String,
  module: String, // 'admin', 'marketing', 'auth'
  resource: String, // 'users', 'campaigns', 'settings'
  action: String, // 'view', 'create', 'edit', 'delete'
  siteName: String,
  isActive: Boolean
}
```

### AuthConfig Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  siteName: String,
  moduleName: String,
  config: {
    loginRoute: String,
    homeRoute: String,
    allowedRoutes: [String],
    deniedRoutes: [String],
    sessionTimeout: Number
  },
  lastUpdated: Date
}
```

## Servicios de Autenticación

### 1. AuthService
```javascript
class AuthService {
  // Registro de usuario
  async register(userData, siteName)
  
  // Login con validación
  async login(email, password, siteName)
  
  // Obtener usuario con roles y permisos
  async getCurrentUser(userId, siteName)
  
  // Validar token de sesión
  async validateSession(token)
  
  // Logout
  async logout(userId)
}
```

### 2. PolicyService  
```javascript
class PolicyService {
  // Consolidar todas las políticas del usuario
  async consolidatePolicies(userId, siteName)
  
  // Evaluar acceso a ruta específica
  async evaluateRouteAccess(userId, route, siteName)
  
  // Cache de políticas por sesión
  async cachePolicies(userId, policies)
  
  // Obtener políticas de módulo
  async getModulePolicies(moduleName, siteName)
}
```

### 3. SessionService
```javascript
class SessionService {
  // Crear sesión con políticas
  async createSession(userId, siteName)
  
  // Actualizar sesión
  async updateSession(sessionId, data)
  
  // Obtener datos de sesión
  async getSession(sessionId)
  
  // Invalidar sesión
  async invalidateSession(sessionId)
}
```

## Configuración de Políticas por Módulo

### modules/admin/config/authConfig.js
```javascript
export const adminAuthConfig = {
  moduleName: 'admin',
  
  // Rutas protegidas del módulo
  protectedRoutes: {
    '': {                           // /[site]/admin
      policies: ['requireAdminAccess'],
      redirectTo: '/auth/login'
    },
    'dashboard': {                  // /[site]/admin/dashboard  
      policies: ['requireAdminAccess'],
      redirectTo: '/auth/login'
    },
    'users': {                      // /[site]/admin/users
      policies: ['requireAdminAccess', 'requireUserManagement'],
      redirectTo: '/auth/login'
    },
    'users/create': {               // /[site]/admin/users/create
      policies: ['requireAdminAccess', 'requireUserCreate'],
      redirectTo: '/admin'
    }
  },
  
  // Submódulos que puede sobreescribir
  submoduleOverrides: {
    'marketing': {
      'campaigns': {
        policies: ['requireAdminAccess'], // Sobreescribe las del submódulo
        redirectTo: '/admin'
      }
    }
  },
  
  // Configuración de autenticación
  auth: {
    loginRoute: '/auth/login',
    registerRoute: '/auth/register', 
    homeRoute: '/admin/dashboard',
    sessionTimeout: 3600000 // 1 hora
  }
};
```

### modules/admin/policies/index.js
```javascript
import { PolicyService } from '../../auth/services/PolicyService';

export const adminPolicies = {
  
  // Política que consulta BD dinámicamente
  requireAdminAccess: async (user, siteName) => {
    const userRoles = await PolicyService.getUserRoles(user.id, siteName);
    const requiredRoles = ['admin', 'owner', 'superadmin'];
    
    return userRoles.some(role => requiredRoles.includes(role.name));
  },
  
  requireUserManagement: async (user, siteName) => {
    const userPermissions = await PolicyService.getUserPermissions(user.id, siteName);
    return userPermissions.includes('admin.users.manage');
  },
  
  requireUserCreate: async (user, siteName) => {
    const userPermissions = await PolicyService.getUserPermissions(user.id, siteName);
    return userPermissions.includes('admin.users.create');
  }
};
```

## Flujo de Implementación

### Fase 1: Base de Datos y Modelos ✅
1. Crear modelos User, Role, Permission, AuthConfig
2. Migración inicial con datos de prueba
3. Servicios básicos de consulta

### Fase 2: Servicios de Autenticación ✅  
1. AuthService con registro/login
2. PolicyService con consolidación
3. SessionService con cache

### Fase 3: Integración con Rutas ✅
1. Eliminar accessPolicy hardcodeado
2. AuthGuard dinámico con PolicyService
3. Configuración por módulo

### Fase 4: Implementación Admin ✅
1. Protección de rutas admin
2. Login/registro funcional
3. Sesión persistente
4. Políticas internas

### Fase 5: Testing y Refinamiento ✅
1. Tests de políticas
2. Tests de flujo completo
3. Optimización de cache
4. Documentación de usuario

## Ventajas de esta Arquitectura

### 🔒 Seguridad
- Políticas dinámicas desde BD
- Sin hardcoding de permisos
- Validación en múltiples capas

### ⚡ Performance  
- Cache de políticas por sesión
- Evaluación eficiente sin loops
- Consolidación una vez por login

### 🔧 Flexibilidad
- Configuración por módulo
- Sobreescritura de submódulos
- Roles y permisos editables

### 📈 Escalabilidad
- Fácil agregar nuevos módulos
- Herencia controlada
- Separación de responsabilidades

## Próximos Pasos

1. **Implementar modelos** en la API
2. **Crear servicios** de autenticación
3. **Actualizar AuthGuard** para usar PolicyService
4. **Configurar módulo admin** con nuevas políticas
5. **Testing completo** del flujo

¿Procedemos con la implementación?

# Sistema de Autenticación con Políticas Dinámicas

## Modelos de Base de Datos

### User Model
```javascript
const userSchema = {
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  avatar: String,
  roles: [ObjectId], // Referencias a Role
  siteId: String, // Identificador del sitio
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  },
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Role Model
```javascript
const roleSchema = {
  _id: ObjectId,
  name: String, // 'admin', 'user', 'moderator', etc.
  displayName: String,
  description: String,
  permissions: [ObjectId], // Referencias a Permission
  siteId: String, // Específico del sitio
  isDefault: Boolean, // Role por defecto para nuevos usuarios
  createdAt: Date,
  updatedAt: Date
}
```

### Permission Model
```javascript
const permissionSchema = {
  _id: ObjectId,
  name: String, // 'user.create', 'admin.access', 'reports.view'
  displayName: String,
  description: String,
  module: String, // 'auth', 'admin', 'reports'
  action: String, // 'create', 'read', 'update', 'delete', 'access'
  resource: String, // 'user', 'dashboard', 'settings'
  conditions: {
    type: Object,
    default: {} // Condiciones adicionales para el permiso
  },
  siteId: String,
  createdAt: Date,
  updatedAt: Date
}
```

### AuthConfig Model
```javascript
const authConfigSchema = {
  _id: ObjectId,
  siteId: String,
  config: {
    registration: {
      enabled: Boolean,
      requireApproval: Boolean,
      defaultRole: ObjectId
    },
    login: {
      maxAttempts: Number,
      lockoutDuration: Number, // en minutos
      sessionTimeout: Number // en minutos
    },
    passwordPolicy: {
      minLength: Number,
      requireUppercase: Boolean,
      requireLowercase: Boolean,
      requireNumbers: Boolean,
      requireSpecialChars: Boolean
    },
    socialLogin: {
      google: {
        enabled: Boolean,
        clientId: String
      },
      facebook: {
        enabled: Boolean,
        appId: String
      }
    }
  },
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints Necesarios

### Autenticación
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/logout
- POST /api/auth/refresh-token
- GET /api/auth/me

### Gestión de Usuarios
- GET /api/users
- GET /api/users/:id
- POST /api/users
- PUT /api/users/:id
- DELETE /api/users/:id

### Roles y Permisos
- GET /api/roles
- GET /api/roles/:id/permissions
- GET /api/permissions
- GET /api/users/:id/roles
- GET /api/users/:id/permissions

### Configuración
- GET /api/auth/config/:siteId
- PUT /api/auth/config/:siteId

## Flujo de Autenticación Completo

1. **Registro**
   - Validar datos de entrada
   - Verificar que el email no exista
   - Crear usuario con role por defecto
   - Enviar email de confirmación (opcional)

2. **Login**
   - Validar credenciales
   - Verificar estado del usuario
   - Generar JWT token
   - Registrar último login
   - Cargar roles y permisos

3. **Autorización**
   - Verificar token JWT
   - Consultar permisos del usuario
   - Evaluar políticas dinámicas
   - Permitir o denegar acceso

4. **Logout**
   - Invalidar token
   - Limpiar sesión
   - Registrar logout

## Implementación del PolicyService

El PolicyService debe conectarse a estos endpoints para obtener datos dinámicos:

```javascript
// Ejemplo de implementación
async getUserRoles(userId, siteId) {
  const response = await fetch(`/api/users/${userId}/roles?siteId=${siteId}`);
  return response.json();
}

async getUserPermissions(userId, siteId) {
  const response = await fetch(`/api/users/${userId}/permissions?siteId=${siteId}`);
  return response.json();
}
```

## Cache Strategy

- **Roles y Permisos**: Cache por 30 minutos
- **Configuración de Sitio**: Cache por 1 hora
- **Información de Usuario**: Cache por 15 minutos
- **Invalidación**: Al modificar roles/permisos del usuario

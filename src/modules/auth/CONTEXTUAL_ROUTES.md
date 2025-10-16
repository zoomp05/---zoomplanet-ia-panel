# Rutas Contextuales en Módulo Auth

## 🎯 Problema Resuelto

### ❌ Antes (Rutas Estáticas)
```jsx
// Links hardcodeados que no respetan jerarquía
<Link to="/auth/register">Regístrate aquí</Link>
<Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
<Link to="/auth/login">Volver al Login</Link>
```

**Problemas:**
- No respetan la jerarquía del sitio actual
- Llevan a `/auth/...` en lugar de `/[siteName]/auth/...`
- Rompen la navegación modular

### ✅ Después (Rutas Contextuales)
```jsx
// Rutas que respetan jerarquía automáticamente
import { useContextualRoute } from "@hooks/useContextualRoute";

const getModuleRoute = useContextualRoute("module");

<Link to={getModuleRoute("register")}>Regístrate aquí</Link>
<Link to={getModuleRoute("forgot-password")}>¿Olvidaste tu contraseña?</Link>
<Link to={getModuleRoute("login")}>Volver al Login</Link>
```

**Beneficios:**
- Respetan jerarquía: `/zoomy/auth/register`
- Funcionan en cualquier sitio: `/corporate/auth/register`
- Navegación modular consistente

## 📄 Archivos Actualizados

### 1. Login.jsx
```jsx
// Importación agregada
import { useContextualRoute } from "@hooks/useContextualRoute";

// Hook agregado
const getModuleRoute = useContextualRoute("module");

// Links actualizados
<Link to={getModuleRoute("forgot-password")}>¿Olvidaste tu contraseña?</Link>
<Link to={getModuleRoute("register")}>Regístrate aquí</Link>
```

### 2. Register.jsx
```jsx
// Importación agregada
import { useContextualRoute } from "@hooks/useContextualRoute";

// Hook agregado
const getModuleRoute = useContextualRoute("module");

// Links actualizados
<Link to={getModuleRoute("login")}>Ir a Iniciar Sesión</Link>
<Link to={getModuleRoute("login")}>Inicia sesión aquí</Link>
```

### 3. ConfirmEmail.jsx
```jsx
// Importación agregada
import { useContextualRoute } from "@hooks/useContextualRoute";

// Hook agregado
const getModuleRoute = useContextualRoute("module");

// Links actualizados
<Link to={getModuleRoute("login")}>Iniciar Sesión</Link>
<Link to={getModuleRoute("login")}>Volver al Login</Link>
```

## 🔄 Comportamiento Esperado

### En Sitio "Zoomy"
- Login: `http://localhost:3003/zoomy/auth/login`
- Register: `http://localhost:3003/zoomy/auth/register`
- Forgot: `http://localhost:3003/zoomy/auth/forgot-password`
- Confirm: `http://localhost:3003/zoomy/auth/verify-email`

### En Sitio "Corporate" (futuro)
- Login: `http://localhost:3003/corporate/auth/login`
- Register: `http://localhost:3003/corporate/auth/register`
- Forgot: `http://localhost:3003/corporate/auth/forgot-password`
- Confirm: `http://localhost:3003/corporate/auth/verify-email`

### Bajo Admin (si aplicable)
- Login: `http://localhost:3003/zoomy/admin/auth/login`
- Register: `http://localhost:3003/zoomy/admin/auth/register`
- Etc.

## 🎨 Hook useContextualRoute

### Uso Básico
```jsx
const getModuleRoute = useContextualRoute("module");

// Rutas relativas del módulo actual
getModuleRoute("register")     // → /[site]/[module]/register
getModuleRoute("login")        // → /[site]/[module]/login
getModuleRoute("dashboard")    // → /[site]/[module]/dashboard
```

### Ventajas
1. **Automático**: Detecta sitio y módulo actual
2. **Flexible**: Funciona en cualquier contexto
3. **Consistente**: Misma API en todos los módulos
4. **Mantenible**: Un solo lugar para cambiar lógica de rutas

## ✅ Testing

### Flujo de Navegación
1. Usuario va a `/zoomy/auth/login`
2. Hace clic en "Regístrate aquí"
3. Va a `/zoomy/auth/register` (mantiene jerarquía)
4. Hace clic en "Inicia sesión aquí"
5. Vuelve a `/zoomy/auth/login` (mantiene jerarquía)

### Verificaciones
- [ ] Links respetan sitio actual
- [ ] Links respetan módulo padre (si existe)
- [ ] Navegación fluida entre páginas auth
- [ ] URLs generadas correctamente
- [ ] Funciona en diferentes contextos

## 🚀 Próximas Mejoras

1. **Aplicar a otros módulos**: Marketing, Project, etc.
2. **Rutas intercmodulares**: Links entre módulos diferentes
3. **Rutas absolutas**: Cuando se necesite salir del contexto
4. **Breadcrumbs**: Navegación jerárquica visual

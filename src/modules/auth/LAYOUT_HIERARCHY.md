# Layout Hierarchy Strategy - Auth Module

## 📋 Overview

El módulo Auth implementa una estrategia jerárquica de layouts que permite flexibilidad y reutilización:

```
Site Config > Parent Module > Module Default > Route Specific
```

## 🏗️ Architecture

### 1. Module Default Layout
- **File**: `modules/auth/layouts/AuthLayout.jsx`
- **Purpose**: Layout por defecto para todas las rutas del módulo Auth
- **Features**: Header con navegación, botones Home/Admin, área de contenido centrada

### 2. Route-Specific Layout
- **File**: `modules/auth/layouts/MinimalLayout.jsx`
- **Purpose**: Layout minimal para rutas específicas (reset-password, verify-email)
- **Features**: Fondo gradiente, card centrada, diseño limpio

### 3. Layout Priority System

```javascript
// Prioridad de layouts en routeProcessor.jsx:
// 1. Layout definido por el sitio para este módulo específico
if (route.moduleName && siteLayouts[route.moduleName]) {
  layoutPath = siteLayouts[route.moduleName]; 
}
// 2. Layout del módulo actual (definido en la ruta)
else if (route.layout) {
  layoutPath = route.layout;
}
// 3. Layout heredado del módulo padre para este módulo  
else if (route.moduleName && inheritedLayouts[route.moduleName]) {
  layoutPath = inheritedLayouts[route.moduleName];
}
```

## 🎯 Route Configuration

### Group 1: Main Auth Routes (AuthLayout)
```javascript
{
  path: "",
  layout: "modules/auth/layouts/AuthLayout.jsx", // Module default
  children: [
    { path: "", componentPath: "modules/auth/pages/Login.jsx" },
    { path: "login", componentPath: "modules/auth/pages/Login.jsx" },
    { path: "register", componentPath: "modules/auth/pages/Register.jsx" },
    { path: "forgot-password", componentPath: "modules/auth/pages/ForgotPassword.jsx" },
    { path: "unauthorized", componentPath: "modules/auth/pages/Unauthorized.jsx" },
    { path: "config", componentPath: "modules/auth/pages/AuthConfig.jsx" }
  ]
}
```

### Group 2: Minimal Routes (MinimalLayout)
```javascript
// Route-specific layout override
{
  path: "reset-password",
  componentPath: "modules/auth/pages/ResetPassword.jsx",
  layout: "modules/auth/layouts/MinimalLayout.jsx"
},
{
  path: "verify-email",
  componentPath: "modules/auth/pages/Unauthorized.jsx",
  layout: "modules/auth/layouts/MinimalLayout.jsx"
}
```

## 🔧 Parent Module Override

### Admin Module Can Override Auth Layouts
```javascript
// In modules/admin/index.js
layouts: {
  auth: "modules/admin/layouts/AdminAuthLayout.jsx" // Optional override
}
```

### Site Config Can Override Any Module
```javascript
// In site configuration
siteLayouts: {
  auth: "sites/zoomy/layouts/CustomAuthLayout.jsx"
}
```

## 📄 Default Layout Config Export

```javascript
export const defaultLayoutConfig = {
  defaultLayout: "modules/auth/layouts/AuthLayout.jsx",
  alternativeLayouts: {
    minimal: "modules/auth/layouts/MinimalLayout.jsx"
  }
};
```

## 🔍 Debugging

La aplicación registra información útil en console:

```
🔐 Registrando módulo Auth:
   Sitio: zoomy
   Módulo padre: admin
   Layouts heredados: {auth: "modules/admin/layouts/AdminAuthLayout.jsx"}
   🎨 Layout sobreescrito por padre: modules/admin/layouts/AdminAuthLayout.jsx
```

## ✅ Testing Checklist

- [ ] Auth module loads with default AuthLayout
- [ ] Reset password uses MinimalLayout
- [ ] Admin can override auth layout when configured
- [ ] Site config can override any module layout
- [ ] Console logging shows correct hierarchy resolution
- [ ] All auth routes are accessible and render correctly

## 🚀 Benefits

1. **Flexibility**: Each level can override layouts as needed
2. **Consistency**: Default layouts provide consistent experience
3. **Modularity**: Layouts are self-contained within modules
4. **Debugging**: Clear logging shows which layout is being used
5. **Scalability**: Pattern can be applied to all modules

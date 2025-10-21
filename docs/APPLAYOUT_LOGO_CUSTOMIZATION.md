# 🎨 AppLayout - Personalización del Logo

## 📋 Nuevas Props Agregadas

Se han agregado varias props al componente `AppLayout` para permitir la personalización del logo tanto en el **sidebar** como en el **header**.

---

## 🔧 Props Disponibles

### **Logo Props**

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `sidebarLogoSize` | `string` | `'medium'` | Tamaño del logo en sidebar: `'small'`, `'medium'`, `'large'` |
| `headerLogoSize` | `string` | `'small'` | Tamaño del logo en header: `'small'`, `'medium'`, `'large'` |
| `logoProps` | `Object` | `{}` | Props adicionales para pasar al componente de logo del **sidebar** |
| `headerLogoProps` | `Object` | `{}` | Props adicionales para pasar al componente de logo del **header** |
| `logoStyle` | `Object` | `{}` | Estilos CSS adicionales para el **contenedor** del logo en sidebar |

---

## 📚 Ejemplos de Uso

### Ejemplo 1: Cambiar Tamaños del Logo

```jsx
<AppLayout
  logo={MigratumLogo}
  sidebarLogoSize="large"    // Logo más grande en sidebar
  headerLogoSize="medium"    // Logo mediano en header
  // ... otras props
/>
```

**Resultado:**
- Sidebar: Logo de 60px altura (large)
- Header: Logo de 40px altura (medium)

---

### Ejemplo 2: Personalizar Estilos del Logo

```jsx
<AppLayout
  logo={MigratumLogo}
  logoStyle={{
    margin: '20px 16px',        // Más espacio alrededor del logo
    padding: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '8px'
  }}
  // ... otras props
/>
```

**Resultado:**
- El contenedor del logo en el sidebar tiene fondo semi-transparente y bordes redondeados

---

### Ejemplo 3: Props Adicionales al Componente de Logo

```jsx
<AppLayout
  logo={MigratumLogo}
  logoProps={{
    style: {
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
    }
  }}
  headerLogoProps={{
    style: {
      opacity: 0.9
    }
  }}
  // ... otras props
/>
```

**Resultado:**
- Logo del sidebar: Sombra aplicada
- Logo del header: Ligeramente transparente (90% opacidad)

---

### Ejemplo 4: Configuración Completa

```jsx
const AdminLayout = () => {
  return (
    <AppLayout
      sidebarMenuConfig={menuConfig}
      topMenuConfig={topMenu}
      siteName="MIGRATUM"
      logo={MigratumLogo}
      
      // Personalización del logo
      sidebarLogoSize="large"
      headerLogoSize="small"
      
      logoStyle={{
        margin: '24px 16px',
        padding: '12px',
        backgroundColor: 'rgba(24, 144, 255, 0.1)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}
      
      logoProps={{
        style: {
          filter: 'brightness(1.1)',
          transition: 'all 0.3s ease'
        }
      }}
      
      headerLogoProps={{
        style: {
          filter: 'brightness(0.95)'
        }
      }}
      
      // Otras props...
      user={user}
      onLogout={handleLogout}
      footerText="Migratum ©2025"
    />
  );
};
```

---

## 🎨 Tamaños de Logo Predefinidos

Si tu componente de logo (como `MigratumLogo`) soporta la prop `size`, estos son los tamaños:

| Size | Altura | Uso Recomendado |
|------|--------|-----------------|
| `small` | 28px | Header, toolbars |
| `medium` | 40px | Sidebar expandido |
| `large` | 60px | Hero sections, splash screens |

---

## 📊 Comparación Visual

### Sidebar Expandido
```
┌─────────────────────────────┐
│                             │
│     [LOGO PERSONALIZADO]    │  ← sidebarLogoSize + logoStyle + logoProps
│                             │
├─────────────────────────────┤
│ 📊 Dashboard                │
│ 💳 Servicios                │
└─────────────────────────────┘
```

### Sidebar Colapsado
```
┌──────┐
│  M   │  ← Solo muestra letra inicial
├──────┤
│  📊  │
│  💳  │
└──────┘
```

### Header
```
┌────────────────────────────────────────────────┐
│ ☰  [logo] MIGRATUM              [👤 Admin ▼] │
│     ↑                                          │
│     headerLogoSize + headerLogoProps           │
└────────────────────────────────────────────────┘
```

---

## 💡 Tips y Mejores Prácticas

### 1. **Mantén Proporciones Consistentes**
```jsx
// ✅ Bueno: Sidebar más grande que header
sidebarLogoSize="medium"
headerLogoSize="small"

// ❌ Evitar: Header más grande que sidebar
sidebarLogoSize="small"
headerLogoSize="large"
```

### 2. **Usa logoStyle para el Contenedor**
```jsx
// ✅ Bueno: Estilos del contenedor
logoStyle={{
  margin: '20px',
  backgroundColor: '#1890ff'
}}

// ✅ Bueno: Estilos de la imagen
logoProps={{
  style: { filter: 'brightness(1.2)' }
}}
```

### 3. **Considera el Tema del Sidebar**
```jsx
// Para sidebar oscuro
logoStyle={{
  backgroundColor: 'rgba(255, 255, 255, 0.05)', // Fondo claro sutil
  border: '1px solid rgba(255, 255, 255, 0.1)'
}}

// Para sidebar claro
logoStyle={{
  backgroundColor: 'rgba(0, 0, 0, 0.02)',
  border: '1px solid rgba(0, 0, 0, 0.08)'
}}
```

### 4. **Transiciones Suaves**
```jsx
logoProps={{
  style: {
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },
  onClick: () => navigate('/dashboard')
}}
```

---

## 🔄 Compatibilidad con Componentes de Logo

Para que tu componente de logo funcione correctamente con `AppLayout`, debe:

1. ✅ Aceptar la prop `size` (opcional pero recomendado)
2. ✅ Aceptar props adicionales via spread (`{...props}`)
3. ✅ Soportar estilos inline

**Ejemplo de componente compatible:**

```jsx
const MigratumLogo = ({ size = 'medium', style = {}, ...props }) => {
  const sizeMap = {
    small: { height: '28px' },
    medium: { height: '40px' },
    large: { height: '60px' }
  };

  return (
    <img
      src={logoImage}
      alt="Migratum Logo"
      style={{
        ...sizeMap[size],
        width: 'auto',
        objectFit: 'contain',
        ...style
      }}
      {...props}
    />
  );
};
```

---

## 📦 Archivos Modificados

1. ✅ `src/zoom/components/AppLayout.jsx`
   - Agregadas 5 nuevas props
   - Documentación actualizada

2. ✅ `src/zoom/components/TopMenu.jsx`
   - Agregadas 2 nuevas props
   - Soporte para tamaños y props personalizados

3. ✅ `src/sites/migratum/layouts/AdminLayout.jsx`
   - Comentarios de ejemplo agregados

---

## 🎯 Casos de Uso

### Caso 1: Logo muy ancho que necesita más espacio
```jsx
logoStyle={{
  margin: '16px 8px',  // Menos margen horizontal
  width: '100%'
}}
```

### Caso 2: Logo con animación al hacer hover
```jsx
logoProps={{
  style: {
    transition: 'transform 0.3s ease'
  },
  onMouseEnter: (e) => e.currentTarget.style.transform = 'scale(1.05)',
  onMouseLeave: (e) => e.currentTarget.style.transform = 'scale(1)'
}}
```

### Caso 3: Logo diferente para sidebar y header
```jsx
// Puedes pasar diferentes componentes si es necesario
// Aunque no está directamente soportado, puedes usar props condicionales
logoProps={{ variant: 'sidebar' }}
headerLogoProps={{ variant: 'header' }}
```

---

## ✅ Resumen

Ahora `AppLayout` es **totalmente personalizable** en cuanto al logo:

- ✅ Controla tamaños independientemente (sidebar vs header)
- ✅ Aplica estilos al contenedor del logo
- ✅ Pasa props personalizados al componente de logo
- ✅ Mantiene retrocompatibilidad (todas las props son opcionales)
- ✅ Documentación completa con ejemplos

**Uso básico sin personalización:**
```jsx
<AppLayout logo={MigratumLogo} />
```

**Uso avanzado con personalización:**
```jsx
<AppLayout 
  logo={MigratumLogo}
  sidebarLogoSize="large"
  logoStyle={{ margin: '20px' }}
  logoProps={{ className: 'animated-logo' }}
/>
```

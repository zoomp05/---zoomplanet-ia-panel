# 🎨 Guía Rápida: logoStyle vs logoProps

## 🔑 Diferencia Clave

### `logoStyle` → Estilos del CONTENEDOR
El div que envuelve el logo (sidebar)

### `logoProps` → Props del LOGO
Se pasan directamente al componente `MigratumLogo`

---

## ❌ Incorrecto: Cambiar altura con logoStyle

```jsx
<AppLayout
  logo={MigratumLogo}
  logoStyle={{ height: '100px' }}  // ❌ Esto afecta al contenedor, NO al logo
/>
```

**Resultado:** El contenedor tiene 100px de altura, pero el logo mantiene su tamaño original.

```
┌─────────────────┐
│                 │  ← Contenedor 100px
│   [Logo 40px]   │  ← Logo mantiene 40px
│                 │
└─────────────────┘
```

---

## ✅ Correcto: Cambiar altura con logoProps

### Opción 1: Usar prop `height` directa
```jsx
<AppLayout
  logo={MigratumLogo}
  logoProps={{ height: '60px' }}  // ✅ Esto afecta al logo directamente
/>
```

### Opción 2: Usar prop `style`
```jsx
<AppLayout
  logo={MigratumLogo}
  logoProps={{ 
    style: { 
      height: '60px',
      filter: 'brightness(1.2)'
    } 
  }}
/>
```

### Opción 3: Usar tamaños predefinidos
```jsx
<AppLayout
  logo={MigratumLogo}
  sidebarLogoSize="large"  // ✅ 60px (predefinido)
/>
```

---

## 📊 Ejemplos Completos

### Ejemplo 1: Logo más grande
```jsx
<AppLayout
  logo={MigratumLogo}
  logoProps={{ height: '80px' }}  // Logo de 80px
  logoStyle={{ 
    padding: '10px',              // Padding del contenedor
    backgroundColor: 'rgba(255, 255, 255, 0.05)'
  }}
/>
```

**Resultado:**
```
┌─────────────────────┐
│   [Logo 80px tall]  │  ← Logo 80px + padding 10px
└─────────────────────┘
```

### Ejemplo 2: Logo con ancho personalizado
```jsx
<AppLayout
  logo={MigratumLogo}
  logoProps={{ 
    width: '120px',
    height: 'auto'     // Mantiene proporción
  }}
/>
```

### Ejemplo 3: Logo con efectos
```jsx
<AppLayout
  logo={MigratumLogo}
  logoProps={{ 
    height: '50px',
    style: {
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
      transition: 'all 0.3s ease'
    }
  }}
  logoStyle={{
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: 'rgba(24, 144, 255, 0.1)'
  }}
/>
```

**Resultado:** Logo de 50px con sombra, dentro de un contenedor con fondo azul claro.

---

## 🎯 Tabla Resumen

| Necesidad | Usa | Ejemplo |
|-----------|-----|---------|
| Cambiar tamaño del logo | `logoProps` | `logoProps={{ height: '60px' }}` |
| Usar tamaño predefinido | `sidebarLogoSize` | `sidebarLogoSize="large"` |
| Agregar efectos al logo | `logoProps.style` | `logoProps={{ style: { filter: '...' } }}` |
| Padding alrededor del logo | `logoStyle` | `logoStyle={{ padding: '10px' }}` |
| Fondo del contenedor | `logoStyle` | `logoStyle={{ backgroundColor: '...' }}` |
| Bordes redondeados del contenedor | `logoStyle` | `logoStyle={{ borderRadius: '8px' }}` |

---

## 💡 Configuración Recomendada para Migratum

```jsx
const AdminLayout = () => {
  return (
    <AppLayout
      logo={MigratumLogo}
      
      // Usar tamaño predefinido (más fácil)
      sidebarLogoSize="large"      // 60px
      headerLogoSize="small"       // 28px
      
      // O usar altura personalizada
      // logoProps={{ height: '70px' }}
      
      // Estilo del contenedor (opcional)
      logoStyle={{
        padding: '12px',
        margin: '16px',
        borderRadius: '8px',
        backgroundColor: 'rgba(24, 144, 255, 0.08)'
      }}
      
      // Efectos en el logo (opcional)
      logoProps={{
        style: {
          filter: 'brightness(1.1)',
          transition: 'transform 0.3s ease'
        }
      }}
    />
  );
};
```

---

## 🔍 Debug: Ver qué se está aplicando

### Props del logo (MigratumLogo)
Estos props van directamente al componente:
```jsx
logoProps={{ 
  height: '60px',      // ← Pasa a MigratumLogo
  width: 'auto',       // ← Pasa a MigratumLogo
  style: { ... }       // ← Se mezcla con el style del componente
}}
```

En `MigratumLogo.jsx`:
```jsx
const MigratumLogo = ({ size, height, width, style }) => {
  // height y width vienen de logoProps
  const dimensions = height || width 
    ? { height, width: width || 'auto' }
    : sizeMap[size];
    
  return (
    <img 
      style={{ 
        ...dimensions,    // ← Aquí se aplica
        ...style          // ← Y aquí style adicional
      }} 
    />
  );
};
```

### Estilos del contenedor
Estos estilos se aplican al div que envuelve el logo:
```jsx
logoStyle={{ 
  height: '100px',     // ← Altura del contenedor (div)
  padding: '10px'      // ← Padding del contenedor (div)
}}
```

En `AppLayout.jsx`:
```jsx
<div style={{ 
  height: 64,      // ← Altura por defecto
  margin: 16,
  ...logoStyle     // ← logoStyle se mezcla aquí
}}>
  <LogoComponent {...logoProps} />  {/* ← logoProps van aquí */}
</div>
```

---

## ✅ Resumen

- **Para cambiar el tamaño del logo:** Usa `logoProps={{ height: '...' }}` o `sidebarLogoSize`
- **Para decorar el contenedor:** Usa `logoStyle={{ padding: '...', backgroundColor: '...' }}`
- **Para efectos en el logo:** Usa `logoProps={{ style: { filter: '...' } }}`

**Regla simple:** 
- ¿Afecta al logo? → `logoProps`
- ¿Afecta al espacio alrededor? → `logoStyle`

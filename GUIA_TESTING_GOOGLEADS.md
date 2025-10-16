# 🧪 Guía de Testing - Módulo GoogleAds

**Objetivo**: Verificar que las correcciones aplicadas funcionan correctamente

---

## 📋 Pre-requisitos

- ✅ Servidor de desarrollo detenido
- ✅ Navegador web (Chrome/Firefox recomendado)
- ✅ Consola de desarrollo del navegador abierta

---

## 🚀 Paso 1: Reiniciar el Servidor

```bash
# Navegar al proyecto
cd /Users/wikiwoo/Documents/DEV/ZoomyApi/---zoomplanet-ia-panel

# Limpiar caché de Vite (opcional pero recomendado)
rm -rf node_modules/.vite

# Iniciar servidor de desarrollo
npm run dev
```

**Resultado esperado**:
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.x.x:3000/
  ➜  press h + enter to show help
```

---

## 🌐 Paso 2: Verificar Consola del Navegador

### 2.1 Abrir la aplicación

```
http://localhost:3000/zoomy/admin
```

### 2.2 Abrir DevTools

- **Chrome/Edge**: `F12` o `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
- **Firefox**: `F12` o `Cmd+Option+K` (Mac) / `Ctrl+Shift+K` (Windows)

### 2.3 Buscar logs de inicialización

En la pestaña **Console**, deberías ver:

```javascript
🚀 ========================================
🚀 Inicializando Site: Zoomy
🚀 ========================================

📍 Paso 0: Registrando jerarquía de módulos...
  📦 Registrando módulo: auth-panel (tipo: auth)
  📦 Registrando módulo: admin-main (tipo: admin)
  📦 Registrando módulo: auth-admin (tipo: auth) bajo admin
  📦 Registrando módulo: googleads-admin (tipo: googleAds) bajo admin  ← ✅ DEBE APARECER
  📦 Registrando módulo: marketing-admin (tipo: marketing) bajo admin  ← ✅ DEBE APARECER
✅ Jerarquía de módulos registrada

📍 Paso 1: Registrando rutas base del site...
✅ Rutas base del site registradas

📍 Paso 2: Creando ModuleInitializer...
✅ ModuleInitializer creado

📍 Paso 3: Inicializando módulos...

⏳ Inicializando módulo: googleads-admin...
📢 Registrando rutas de 'googleAds' en sitio=zoomy, padre=admin  ← ✅ DEBE APARECER
📦 Layouts heredados para googleAds: { googleAds: 'modules/admin/layouts/MainLayout.jsx' }
✅ Módulo GoogleAds registrado correctamente  ← ✅ DEBE APARECER

⏳ Inicializando módulo: marketing-admin...
📢 Registrando rutas de 'marketing' en sitio=zoomy, padre=admin  ← ✅ DEBE APARECER
✅ Módulo Marketing registrado correctamente  ← ✅ DEBE APARECER

🎉 ========================================
🎉 Site Zoomy inicializado correctamente
🎉 ========================================
```

### ✅ Test 1: Logs de Inicialización

- [ ] Aparece "Registrando módulo: googleads-admin"
- [ ] Aparece "Registrando rutas de 'googleAds'"
- [ ] Aparece "Módulo GoogleAds registrado correctamente"
- [ ] NO hay errores en rojo

---

## 📱 Paso 3: Verificar Menú de Navegación

### 3.1 Expandir el menú lateral

- Click en el ícono de menú (☰) si está colapsado
- Buscar la sección **"Marketing"** (ícono de trofeo 🏆)

### 3.2 Verificar grupo "Google Ads"

Deberías ver:

```
Marketing 🏆
├─ Campañas IA
│  ├─ Dashboard
│  └─ Campañas Asistidas por IA
│
├─ Google Ads  ← ✅ DEBE APARECER
│  ├─ Dashboard Google Ads
│  ├─ Campañas
│  ├─ Keywords
│  ├─ Reportes
│  └─ Sincronizar con Marketing
│
└─ ...
```

### ✅ Test 2: Menú

- [ ] Aparece el grupo "Google Ads"
- [ ] Tiene 5 elementos
- [ ] Los enlaces son clicables

---

## 🎯 Paso 4: Probar Navegación a GoogleAds

### Opción A: Desde el Menú

1. Click en **Marketing** → **Google Ads** → **Dashboard Google Ads**
2. La URL debe cambiar a: `http://localhost:3000/zoomy/admin/googleAds`

### Opción B: URL Directa

```
http://localhost:3000/zoomy/admin/googleAds
```

### 4.1 Verificar que carga el Dashboard

Deberías ver:

```
┌─────────────────────────────────────────────┐
│  📊 Dashboard Google Ads                    │
│  Gestiona tus campañas de Google Ads...    │
│                                             │
│  [🔄 Sincronizar]  [➕ Nueva Campaña]      │
└─────────────────────────────────────────────┘

ℹ️ Módulo Google Ads
   Este módulo está en fase inicial...
   [Configurar API]

┌─────────────┬─────────────┬─────────────┐
│ Inversión   │ Impresiones │ Clicks      │
│ Total       │             │             │
│ $5,432.50   │ 125,000     │ 3,542       │
└─────────────┴─────────────┴─────────────┘

... más métricas ...

Campañas Activas
┌───────────────────────────────────────────┐
│ Campaña              │ Estado  │ Gastado │
├──────────────────────┼─────────┼─────────┤
│ Campaña Black Friday │ Activa  │ $342.50 │
│ Remarketing - Carri..│ Activa  │ $156.30 │
└───────────────────────────────────────────┘
```

### ✅ Test 3: Dashboard

- [ ] El componente carga sin errores
- [ ] Se muestran 7 cards de métricas
- [ ] Se muestra la tabla de campañas
- [ ] Los botones son clicables
- [ ] NO aparece el error de `ClickThroughRateOutlined`

---

## 🔍 Paso 5: Verificar Otras Páginas

### 5.1 Listado de Campañas

```
http://localhost:3000/zoomy/admin/googleAds/campaigns
```

**Debe mostrar**:
- 4 cards con estadísticas
- Tabla con 2 campañas de ejemplo
- Filtros de búsqueda
- Tags "Vinculada con Marketing" en morado

### 5.2 Sincronización con Marketing

```
http://localhost:3000/zoomy/admin/googleAds/sync/marketing-campaigns
```

**Debe mostrar**:
- Alerta informativa
- Tabla de campañas con estado de vinculación
- Botones "Vincular" y "Desvincular"

### 5.3 Keywords

```
http://localhost:3000/zoomy/admin/googleAds/keywords
```

**Debe mostrar**:
- Página stub con mensaje de "En desarrollo"

### ✅ Test 4: Navegación

- [ ] Todas las rutas cargan sin errores
- [ ] La navegación entre páginas funciona
- [ ] El layout de Admin se mantiene
- [ ] El breadcrumb se actualiza correctamente

---

## 🛠️ Paso 6: Verificar Configuración del Sitio

### 6.1 Ir al panel de configuración

```
http://localhost:3000/zoomy/admin/site-config
```

### 6.2 Abrir pestaña "Árbol de Módulos"

### 6.3 Expandir "admin-main"

Deberías ver:

```
admin-main
├─ [Incorporado] auth
├─ [Incorporado] googleAds  ← ✅ DEBE APARECER
├─ [Incorporado] marketing  ← ✅ DEBE APARECER
├─ [Incorporado] account
├─ [Incorporado] project
└─ [Incorporado] crm
```

### ✅ Test 5: Configuración

- [ ] googleAds aparece en el árbol
- [ ] marketing aparece en el árbol
- [ ] Estado: "Incorporado"

---

## 🐛 Troubleshooting

### Problema 1: No aparecen los logs de googleAds

**Posibles causas**:
- site.config.js no se guardó correctamente
- Servidor no se reinició

**Solución**:
```bash
# Detener servidor (Ctrl+C)
# Verificar que el archivo existe
cat src/sites/zoomy/site.config.js | grep -A 10 "googleads-admin"

# Reiniciar servidor
npm run dev
```

### Problema 2: Error 404 en /zoomy/admin/googleAds

**Posibles causas**:
- Módulo no se registró en site.config.js
- Rutas no se cargaron

**Solución**:
1. Verificar consola del navegador
2. Buscar el log "Registrando rutas de 'googleAds'"
3. Si NO aparece, revisar site.config.js

### Problema 3: Error de "ClickThroughRateOutlined"

**Posibles causas**:
- Caché de Vite no se limpió
- Cambio en Dashboard.jsx no se aplicó

**Solución**:
```bash
# Limpiar caché y reiniciar
rm -rf node_modules/.vite
npm run dev
```

### Problema 4: Componente se ve mal o sin estilos

**Posibles causas**:
- Layout no se está heredando correctamente

**Solución**:
1. Verificar en consola: "Layouts heredados para googleAds"
2. Debería mostrar: `{ googleAds: 'modules/admin/layouts/MainLayout.jsx' }`

---

## 📊 Checklist Final de Testing

### Inicialización ✅

- [ ] Servidor arranca sin errores
- [ ] Logs de inicialización correctos
- [ ] Módulo googleAds se registra
- [ ] Módulo marketing se registra

### UI/UX ✅

- [ ] Menú muestra "Google Ads"
- [ ] Dashboard carga correctamente
- [ ] Métricas se muestran
- [ ] Tabla de campañas visible
- [ ] Navegación entre páginas funciona
- [ ] Breadcrumb actualiza correctamente

### Configuración ✅

- [ ] googleAds aparece en árbol de módulos
- [ ] marketing aparece en árbol de módulos
- [ ] Archivos de configuración cargados

### Sin Errores ✅

- [ ] No hay errores en consola del navegador
- [ ] No hay errores de importación
- [ ] No hay errores de iconos
- [ ] No hay errores 404

---

## 📸 Screenshots de Referencia

### Dashboard Esperado

```
╔═══════════════════════════════════════════════╗
║  📊 Dashboard Google Ads                      ║
║                                               ║
║  ┌─────────┐  ┌─────────┐  ┌─────────┐      ║
║  │ $5432   │  │ 125,000 │  │ 3,542   │      ║
║  │ Total   │  │ Impress │  │ Clicks  │      ║
║  └─────────┘  └─────────┘  └─────────┘      ║
║                                               ║
║  Campañas Activas                            ║
║  ┌─────────────────────────────────────────┐ ║
║  │ Black Friday 2025        │ $342.50      │ ║
║  │ Remarketing Carrito      │ $156.30      │ ║
║  └─────────────────────────────────────────┘ ║
╚═══════════════════════════════════════════════╝
```

---

## ✅ Resultado Esperado

Si todos los tests pasan:

```
🎉 ¡TODO FUNCIONA CORRECTAMENTE!

✅ Módulo googleAds cargado
✅ Rutas registradas
✅ Dashboard funcional
✅ Navegación operativa
✅ Sin errores de iconos
✅ Configuración correcta

El módulo está listo para desarrollo posterior.
```

---

## 📞 Siguiente Paso

Una vez validado el funcionamiento:

1. Revisar `PROXIMOS_PASOS_GOOGLEADS.md` para el plan de desarrollo
2. Obtener credenciales de Google Ads API
3. Implementar backend (ver `PROXIMOS_PASOS_GOOGLEADS.md`)

---

**🎯 ¡Listo para probar!**

# ⚠️ IMPORTANTE: Cambios Pendientes en Worktrees

## Worktrees Afectados

Los siguientes worktrees tienen referencias al módulo `core` eliminado:

1. `zoomplanet-ia-panel_Modulos2.0`
2. `zoomplanet-ia-panel_ModulosYiiInspired`

---

## 🔄 Cambios Necesarios en Cada Worktree

### 1. Actualizar `src/App.jsx`

**Cambiar**:
```javascript
import RouterErrorBoundary from './modules/core/components/RouterErrorBoundary';
```

**Por**:
```javascript
import RouterErrorBoundary from './zoom/components/RouterErrorBoundary';
```

---

### 2. Actualizar `src/zoom/appConfig.js`

**Cambiar**:
```javascript
core: {
  moduleName: 'core',
  entry: 'modules/core'
}
```

**Por**:
```javascript
base: {
  moduleName: 'base',
  entry: 'modules/base'
}
```

---

### 3. Copiar Nueva Estructura de `modules/base/`

**Copiar desde rama actual**:
```
src/modules/base/
├── index.js
├── pages/
│   └── SiteConfiguration.jsx
└── routes/
    └── index.js
```

---

### 4. Copiar `src/zoom/components/RouterErrorBoundary.jsx`

**Copiar desde rama actual**:
```
src/zoom/components/
└── RouterErrorBoundary.jsx
```

---

### 5. Eliminar Módulo Core (Si existe)

```bash
# En PowerShell:
Remove-Item -Recurse -Force "src/modules/core"
```

---

### 6. Actualizar `site.config.js`

Agregar módulo base al inicio de la sección `modules`:

```javascript
modules: [
  // NIVEL 0: Módulo Base
  {
    id: 'base',
    module: 'base',
    scope: 'global',
    lazy: false,
    priority: 0,
    dependencies: [],
    routes: null,
    routing: {
      parentModule: null,
      routePrefix: null
    }
  },
  // ... resto de módulos
]
```

---

## 🎯 Comando Rápido para Worktree

```bash
# 1. Cambiar a worktree
cd zoomplanet-ia-panel_Modulos2.0

# 2. Hacer merge desde main o cherry-pick commits relevantes
git merge main
# O específicamente:
git cherry-pick <commit-hash-refactorizacion>

# 3. Resolver conflictos si existen
# 4. Probar que compile correctamente
npm run dev
```

---

## ✅ Verificación

Después de aplicar cambios, verificar:

- [ ] No hay imports de `modules/core`
- [ ] RouterErrorBoundary se importa desde `zoom/components`
- [ ] Módulo base existe y funciona
- [ ] SiteConfiguration accesible desde base
- [ ] La aplicación compila sin errores

---

## 📝 Notas

- Estos cambios son **solo estructurales**, no afectan funcionalidad
- Es seguro aplicarlos mediante merge o cherry-pick
- Si hay conflictos, siempre elegir la versión nueva (sin `core`)

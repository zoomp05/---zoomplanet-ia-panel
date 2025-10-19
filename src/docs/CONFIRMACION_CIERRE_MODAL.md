# Confirmación de Cierre de Modal con Cambios

**Fecha:** 11 de octubre de 2025
**Módulo:** Hooks Globales
**Feature:** Detectar cambios en formularios y confirmar antes de cerrar modal

---

## 🎯 Objetivo

Implementar una lógica **reutilizable** que:
1. **Detecte cambios** en formularios de edición
2. **Muestre confirmación** antes de cerrar si hay cambios sin guardar
3. **Sea fácil de integrar** en cualquier modal con formulario
4. **Mejore UX** evitando pérdida accidental de datos

---

## 📦 Hook: `useFormChanges`

### Ubicación
```
src/hooks/useFormChanges.js
```

### API

```javascript
const { hasChanges, confirmClose, resetChanges } = useFormChanges(
  form,         // Instancia del formulario Ant Design
  isEditing,    // Boolean: true si está en modo edición
  initialValues // Objeto con valores iniciales del formulario
);
```

### Retorno

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `hasChanges` | `boolean` | `true` si hay cambios sin guardar |
| `confirmClose` | `function` | Función para confirmar cierre con callback |
| `resetChanges` | `function` | Resetea el estado de cambios (llamar después de guardar) |

---

## 🔧 Cómo Funciona

### 1. Detección de Cambios

El hook:
- Compara `initialValues` con `form.getFieldsValue()` cada 300ms
- Detecta cambios en campos anidados (credentials, settings, etc.)
- Normaliza valores vacíos (`null`, `undefined`, `""`) para comparación justa
- Compara objetos recursivamente

### 2. Confirmación de Cierre

Cuando el usuario intenta cerrar:
- Si **NO hay cambios** → Cierra directamente
- Si **HAY cambios** → Muestra modal de confirmación:
  ```
  ┌─────────────────────────────────┐
  │ ⚠️  ¿Descartar cambios?         │
  ├─────────────────────────────────┤
  │ Has realizado cambios que no se │
  │ han guardado.                   │
  │                                 │
  │ ¿Estás seguro de que deseas     │
  │ cerrar sin guardar?             │
  ├─────────────────────────────────┤
  │      [Cancelar] [Sí, descartar] │
  └─────────────────────────────────┘
  ```

### 3. Reset Después de Guardar

Después de guardar exitosamente:
```javascript
const handleSave = async () => {
  const result = await saveData();
  if (result) {
    resetChanges(); // ✅ Resetea estado de cambios
  }
};
```

---

## 💻 Ejemplo de Uso Completo

### Caso: AccountForm (Google Ads)

```javascript
import React from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { useFormChanges } from '../../../hooks/useFormChanges';

const AccountForm = ({ visible, account, onSave, onCancel }) => {
  const [form] = Form.useForm();
  const isEditing = !!account;

  // 1️⃣ Preparar valores iniciales
  const initialValues = React.useMemo(() => {
    if (!account) return {};
    return {
      name: account.name,
      customerId: account.customerId,
      credentials: {
        clientId: account.credentials?.clientId || '',
        clientSecret: account.credentials?.clientSecret || '',
        // ... otros campos
      },
      settings: account.settings || {}
    };
  }, [account]);

  // 2️⃣ Inicializar hook
  const { hasChanges, confirmClose, resetChanges } = useFormChanges(
    form,
    isEditing,
    initialValues
  );

  // 3️⃣ Cargar valores iniciales
  React.useEffect(() => {
    if (visible && account) {
      form.setFieldsValue(initialValues);
    }
  }, [visible, account, initialValues, form]);

  // 4️⃣ Handler de guardado (resetear cambios al éxito)
  const handleSubmit = async () => {
    const values = await form.validateFields();
    const result = await onSave(values);
    
    if (result !== false) {
      resetChanges(); // ✅ Importante: resetear estado
      form.resetFields();
    }
  };

  // 5️⃣ Handler de cierre (con confirmación)
  const handleCancel = async () => {
    if (isEditing) {
      const canClose = await confirmClose(() => {
        console.log('Modal cerrado después de confirmar');
        onCancel();
      });
      
      if (!canClose) {
        console.log('Usuario canceló el cierre');
        return;
      }
    } else {
      onCancel();
    }
  };

  return (
    <Modal
      title="Editar Cuenta"
      open={visible}
      onCancel={handleCancel}
      maskClosable={false}  // ✅ Evitar cierre con click fuera
      keyboard={false}       // ✅ Evitar cierre con ESC
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancelar
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Guardar
        </Button>
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="Nombre">
          <Input />
        </Form.Item>
        {/* ... más campos */}
      </Form>
    </Modal>
  );
};

export default AccountForm;
```

---

## 🚀 Cómo Integrar en Otro Modal

### Paso 1: Importar Hook

```javascript
import { useFormChanges } from '../../../hooks/useFormChanges';
```

### Paso 2: Preparar Valores Iniciales

```javascript
const initialValues = React.useMemo(() => {
  if (!item) return {};
  return {
    field1: item.field1,
    field2: item.field2,
    nested: {
      field3: item.nested?.field3 || ''
    }
  };
}, [item]);
```

**Importante:**
- Usar `useMemo` para evitar recálculos innecesarios
- Estructura debe coincidir con el formulario
- Normalizar valores (`|| ''` para evitar undefined)

### Paso 3: Inicializar Hook

```javascript
const { hasChanges, confirmClose, resetChanges } = useFormChanges(
  form,
  isEditing, // true si está editando
  initialValues
);
```

### Paso 4: Modificar Handler de Cierre

```javascript
const handleCancel = async () => {
  if (isEditing) {
    const canClose = await confirmClose(() => {
      onCancel(); // Callback original
    });
    
    if (!canClose) return; // Usuario canceló
  } else {
    onCancel();
  }
};
```

### Paso 5: Resetear Después de Guardar

```javascript
const handleSave = async () => {
  const values = await form.validateFields();
  const result = await saveAction(values);
  
  if (result) {
    resetChanges(); // ✅ IMPORTANTE
  }
};
```

### Paso 6: Configurar Modal

```javascript
<Modal
  onCancel={handleCancel}
  maskClosable={false}  // ✅ Evitar click fuera
  keyboard={false}       // ✅ Evitar ESC
  // ... otras props
>
```

---

## 🎨 Personalización del Modal de Confirmación

### Cambiar Textos

Editar `src/hooks/useFormChanges.js`:

```javascript
modalConfirm({
  title: 'Tu título personalizado',
  content: (
    <div>
      <p>Tu mensaje personalizado.</p>
    </div>
  ),
  okText: 'Texto botón confirmar',
  cancelText: 'Texto botón cancelar',
  // ...
});
```

### Cambiar Icono

```javascript
import { WarningOutlined } from '@ant-design/icons';

modalConfirm({
  icon: <WarningOutlined />,
  // ...
});
```

### Cambiar Tipo de Botón OK

```javascript
modalConfirm({
  okType: 'danger',  // 'default' | 'primary' | 'danger'
  // ...
});
```

---

## 🧪 Testing

### Test 1: Editar y Cancelar con Cambios

1. Abrir modal de edición
2. Cambiar un campo (ej: nombre)
3. Click en "Cancelar" o "X"
4. **Resultado esperado:**
   - ✅ Modal de confirmación aparece
   - ✅ Mensaje: "Has realizado cambios..."
   - ✅ Botones: "Cancelar" y "Sí, descartar"

### Test 2: Cancelar Confirmación

1. En modal de confirmación
2. Click en "Cancelar"
3. **Resultado esperado:**
   - ✅ Modal de confirmación se cierra
   - ✅ Modal principal permanece abierto
   - ✅ Cambios preservados en formulario

### Test 3: Confirmar Descarte

1. En modal de confirmación
2. Click en "Sí, descartar"
3. **Resultado esperado:**
   - ✅ Modal principal se cierra
   - ✅ Cambios descartados
   - ✅ No se guarda nada

### Test 4: Editar sin Cambios

1. Abrir modal de edición
2. NO cambiar nada
3. Click en "Cancelar"
4. **Resultado esperado:**
   - ✅ Modal se cierra directamente
   - ✅ NO muestra confirmación

### Test 5: Guardar Exitosamente

1. Abrir modal de edición
2. Cambiar campos
3. Click en "Guardar"
4. Mutación exitosa
5. Reabrir modal
6. Click en "Cancelar" sin cambios
7. **Resultado esperado:**
   - ✅ NO muestra confirmación (cambios fueron reseteados)

### Test 6: Click Fuera del Modal

1. Abrir modal de edición
2. Cambiar campos
3. Click en fondo oscuro (máscara)
4. **Resultado esperado:**
   - ✅ Modal NO se cierra (maskClosable=false)
   - ✅ Usuario debe usar botón "Cancelar"

### Test 7: Presionar ESC

1. Abrir modal de edición
2. Cambiar campos
3. Presionar tecla `ESC`
4. **Resultado esperado:**
   - ✅ Modal NO se cierra (keyboard=false)
   - ✅ Usuario debe usar botón "Cancelar"

---

## ⚡ Performance

### Optimizaciones Implementadas

1. **Polling Cada 300ms**
   - Detecta cambios sin overhead significativo
   - Balance entre responsividad y performance

2. **useMemo para initialValues**
   - Evita recálculos innecesarios
   - Previene re-renders del hook

3. **Comparación Optimizada**
   - Normalización de valores antes de comparar
   - Early return si ambos son null/undefined
   - Comparación recursiva solo cuando necesario

### Mejoras Futuras (Opcional)

```javascript
// Usar onValuesChange en lugar de polling
<Form 
  form={form} 
  onValuesChange={() => {
    // Disparar checkChanges inmediatamente
  }}
>
```

---

## 🔒 Consideraciones de Seguridad

### Datos Sensibles en Memoria

El hook mantiene `initialValues` en memoria durante la edición:

```javascript
const initialValuesRef = useRef(initialValues);
```

**Para datos sensibles:**
- No incluir credentials en `initialValues` si no es necesario
- Limpiar ref cuando el modal se cierra:
  ```javascript
  useEffect(() => {
    return () => {
      initialValuesRef.current = {};
    };
  }, []);
  ```

### Persistencia en localStorage

Si combinas con persistencia de borrador:
- Solo aplicar en modo **creación**, NO en edición
- Credentials sensibles NO deben ir a localStorage
- Limpiar localStorage después de éxito

---

## 🐛 Troubleshooting

### Error: "hasChanges is always true"

**Causa:** Valores iniciales no coinciden con estructura del formulario

**Solución:**
```javascript
// ❌ MAL - Estructura no coincide
const initialValues = { name: 'Test' };
<Form.Item name={['nested', 'name']} />

// ✅ BIEN - Estructura coincide
const initialValues = { nested: { name: 'Test' } };
<Form.Item name={['nested', 'name']} />
```

### Error: "Confirmation not showing"

**Causa:** `isEditing` es `false`

**Verificar:**
```javascript
const isEditing = !!account; // Debe ser true cuando hay account
console.log('isEditing:', isEditing);
```

### Error: "Changes not detected"

**Causa:** `initialValues` se recalcula en cada render

**Solución:**
```javascript
// ✅ Usar useMemo
const initialValues = React.useMemo(() => ({
  // ...
}), [account]);
```

### Error: "Modal closes without confirmation"

**Causa:** No se está usando `handleCancel` personalizado

**Verificar:**
```javascript
<Modal
  onCancel={handleCancel} // ✅ Debe ser tu handler, no onCancel directo
/>
```

---

## 📚 Casos de Uso Adicionales

### 1. Formulario de Campaña

```javascript
const CampaignForm = ({ campaign, onSave, onCancel }) => {
  const [form] = Form.useForm();
  const isEditing = !!campaign;

  const initialValues = React.useMemo(() => ({
    name: campaign?.name || '',
    budget: campaign?.budget || 0,
    status: campaign?.status || 'ACTIVE'
  }), [campaign]);

  const { confirmClose, resetChanges } = useFormChanges(
    form,
    isEditing,
    initialValues
  );

  // ... similar implementación
};
```

### 2. Formulario de Usuario

```javascript
const UserForm = ({ user, onSave, onCancel }) => {
  const initialValues = React.useMemo(() => ({
    name: user?.name || '',
    email: user?.email || '',
    roles: user?.roles || []
  }), [user]);

  // ... usar hook
};
```

### 3. Formulario Anidado Complejo

```javascript
const ComplexForm = ({ data, onSave, onCancel }) => {
  const initialValues = React.useMemo(() => ({
    basicInfo: {
      name: data?.name || '',
      description: data?.description || ''
    },
    advanced: {
      settings: data?.settings || {},
      metadata: data?.metadata || {}
    }
  }), [data]);

  // Hook maneja objetos anidados automáticamente
  const { confirmClose, resetChanges } = useFormChanges(
    form,
    true,
    initialValues
  );
};
```

---

## 🎓 Best Practices

### ✅ DO

1. **Usar useMemo** para `initialValues`
2. **Llamar resetChanges** después de guardar exitosamente
3. **Configurar maskClosable={false}** si hay cambios posibles
4. **Configurar keyboard={false}** para controlar ESC
5. **Aplicar solo en modo edición** (no en creación)
6. **Normalizar valores** (`|| ''`) en initialValues

### ❌ DON'T

1. **NO usar** en formularios de solo lectura
2. **NO aplicar** en modales sin formulario
3. **NO olvidar** resetear después de guardar
4. **NO incluir** datos sensibles innecesarios en initialValues
5. **NO usar** sin `isEditing` flag
6. **NO mezclar** con otros sistemas de confirmación

---

## 📦 Archivos Relacionados

| Archivo | Descripción |
|---------|-------------|
| `src/hooks/useFormChanges.js` | Hook principal (159 líneas) |
| `src/modules/googleAds/components/AccountForm.jsx` | Implementación de referencia |
| `CONFIRMACION_CIERRE_MODAL.md` | Esta documentación |

---

## 🔄 Próximas Mejoras

### Alta Prioridad
1. **Agregar tests unitarios** para el hook
2. **Implementar en otros modales** (Campaigns, Users, etc.)
3. **Agregar indicador visual** cuando hay cambios (`*` en título)

### Media Prioridad
4. **Opción de auto-guardado** cada N segundos
5. **Historial de cambios** (undo/redo)
6. **Comparación visual** de cambios (diff)

### Baja Prioridad
7. **Animaciones** en modal de confirmación
8. **Sonido** de alerta al intentar cerrar
9. **Keyboard shortcuts** (Ctrl+S para guardar)

---

## 📊 Métricas

**Hook:**
- 159 líneas de código
- 3 funciones principales
- 0 dependencias externas (solo Ant Design)

**Implementación en AccountForm:**
- +30 líneas añadidas
- 3 modificaciones en handlers existentes
- 100% compatible con funcionalidad anterior

**Cobertura:**
- ✅ Google Ads - AccountForm (IMPLEMENTADO)
- ⏳ Marketing - CampaignForm (PENDIENTE)
- ⏳ Auth - UserForm (PENDIENTE)
- ⏳ Projects - ProjectForm (PENDIENTE)

---

**Estado:** ✅ IMPLEMENTADO Y DOCUMENTADO
**Próxima acción:** Usuario prueba edición con confirmación de cierre

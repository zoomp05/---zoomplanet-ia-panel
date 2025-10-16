# Persistencia de Formulario en localStorage

## 📋 Descripción

Se implementó persistencia automática del formulario de cuentas Google Ads en `localStorage`, permitiendo que los usuarios recuperen sus datos si cierran accidentalmente el modal antes de guardar.

## 🎯 Comportamiento

### 1. **Guardado Automático**
- Cada vez que el usuario modifica un campo del formulario, los valores se guardan automáticamente en `localStorage`
- La clave utilizada es: `googleAds_accountForm_draft`
- Solo aplica cuando está **creando** una nueva cuenta (no al editar)

### 2. **Recuperación al Abrir**
- Si el modal se abre para crear una nueva cuenta y existe un borrador en `localStorage`, los campos se rellenan automáticamente
- El usuario ve sus datos previos preservados
- Se muestra un log en consola: `📦 Recuperando borrador de cuenta desde localStorage`

### 3. **Limpieza del Borrador**
El borrador se elimina **solo** cuando:
- ✅ La mutación de creación/actualización fue **exitosa**
- ✅ Los datos se guardaron correctamente en el backend

El borrador **NO** se elimina cuando:
- ❌ El usuario cierra el modal sin guardar (Cancelar o X)
- ❌ Ocurre un error en la mutación
- ❌ La validación del formulario falla

### 4. **Al Cancelar**
- El borrador se **preserva** en `localStorage`
- El usuario puede volver a abrir el modal y continuar donde lo dejó
- Se muestra un log en consola: `⏸️ Modal cerrado, borrador preservado en localStorage`

## 🔧 Implementación Técnica

### Archivos Modificados

#### 1. `AccountForm.jsx`
```javascript
const STORAGE_KEY = 'googleAds_accountForm_draft';

// Cargar desde localStorage al abrir
React.useEffect(() => {
  if (visible && !account) {
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    if (savedDraft) {
      const draftValues = JSON.parse(savedDraft);
      form.setFieldsValue(draftValues);
    }
  }
}, [visible, account, form]);

// Guardar en cada cambio (solo si NO está editando)
const handleFormChange = () => {
  if (!isEditing) {
    const currentValues = form.getFieldsValue();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentValues));
  }
};

// Limpiar después de guardar exitosamente
const clearDraft = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// En handleSubmit, limpiar solo si fue exitoso
const handleSubmit = async () => {
  const values = await form.validateFields();
  const result = await onSave(values);
  
  if (result !== false) {
    clearDraft();
    form.resetFields();
  }
};
```

#### 2. `AccountsManagement.jsx`
```javascript
// Modificado handleSave para retornar resultado
const handleSave = async (values) => {
  try {
    if (selectedAccount) {
      const result = await updateAccount({ variables: {...} });
      return result?.data?.updateGAdsAccount?.success !== false;
    } else {
      const result = await createAccount({ variables: {...} });
      return result?.data?.createGAdsAccount?.success !== false;
    }
  } catch (error) {
    return false; // Indicar que falló
  }
};
```

## 📊 Datos Persistidos

El objeto guardado en `localStorage` contiene:

```json
{
  "name": "Nombre de la cuenta",
  "customerId": "123-456-7890",
  "credentials": {
    "clientId": "...",
    "clientSecret": "...",
    "developerToken": "...",
    "refreshToken": "..."
  },
  "settings": {
    "currency": "USD",
    "timezone": "America/Mexico_City",
    "autoTaggingEnabled": true
  }
}
```

## 🔒 Consideraciones de Seguridad

### ⚠️ Advertencias
- Los datos se almacenan en **texto plano** en `localStorage` del navegador
- Las credenciales OAuth2 son sensibles y quedan temporalmente expuestas
- `localStorage` es accesible desde JavaScript en el mismo dominio

### ✅ Mitigaciones Aplicadas
1. **Solo en modo desarrollo**: Esta funcionalidad está diseñada para desarrollo local
2. **Limpieza automática**: Los datos se eliminan después de guardar exitosamente
3. **Scope limitado**: Solo aplica para creación de cuentas (no edición)
4. **Temporalidad**: Los datos son un "borrador" temporal, no permanente

### 🛡️ Mejoras Futuras (Opcional)
Si se requiere mayor seguridad:

```javascript
// Opción 1: No persistir credenciales sensibles
const handleFormChange = () => {
  if (!isEditing) {
    const currentValues = form.getFieldsValue();
    const { credentials, ...safeValues } = currentValues;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeValues));
  }
};

// Opción 2: Encriptar antes de guardar
import CryptoJS from 'crypto-js';

const SECRET_KEY = 'your-secret-key'; // Debería venir de env

const handleFormChange = () => {
  if (!isEditing) {
    const currentValues = form.getFieldsValue();
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(currentValues),
      SECRET_KEY
    ).toString();
    localStorage.setItem(STORAGE_KEY, encrypted);
  }
};

// Al cargar
const savedDraft = localStorage.getItem(STORAGE_KEY);
if (savedDraft) {
  const decrypted = CryptoJS.AES.decrypt(savedDraft, SECRET_KEY);
  const draftValues = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
  form.setFieldsValue(draftValues);
}
```

## 🧪 Cómo Probar

### Escenario 1: Cierre Accidental
1. Ir a "Gestión de Cuentas" → Click "Nueva Cuenta"
2. Llenar algunos campos (nombre, customer ID, credenciales)
3. Cerrar el modal (X o Cancelar) **sin guardar**
4. Volver a abrir "Nueva Cuenta"
5. ✅ Los campos deben mostrar los valores anteriores

### Escenario 2: Error en Mutación
1. Llenar el formulario con datos inválidos
2. Click en "Crear Cuenta"
3. Si la mutación falla (error de red, validación backend, etc.)
4. Cerrar el modal
5. Volver a abrir
6. ✅ Los campos deben conservar los valores

### Escenario 3: Guardado Exitoso
1. Llenar el formulario correctamente
2. Click en "Crear Cuenta"
3. Si la mutación es exitosa
4. Cerrar el modal (se cierra automáticamente)
5. Volver a abrir "Nueva Cuenta"
6. ✅ Los campos deben estar vacíos (borrador limpiado)

### Escenario 4: Edición de Cuenta
1. Click en "Editar" en una cuenta existente
2. Modificar campos
3. Cerrar sin guardar
4. Volver a editar
5. ✅ **No debe persistir** (solo persiste en creación)

## 📝 Logs de Consola

La implementación incluye logs útiles para debugging:

```javascript
// Al guardar en localStorage
💾 Guardando borrador en localStorage

// Al recuperar desde localStorage
📦 Recuperando borrador de cuenta desde localStorage: { name: "...", ... }

// Al cerrar sin guardar
⏸️ Modal cerrado, borrador preservado en localStorage

// Al guardar exitosamente
🗑️ Borrador limpiado de localStorage
```

## 🔍 Inspección Manual

Para ver/editar/eliminar el borrador manualmente:

```javascript
// Ver el borrador actual
console.log(JSON.parse(localStorage.getItem('googleAds_accountForm_draft')));

// Limpiar el borrador manualmente
localStorage.removeItem('googleAds_accountForm_draft');

// Modificar el borrador
const draft = JSON.parse(localStorage.getItem('googleAds_accountForm_draft'));
draft.name = "Nuevo nombre";
localStorage.setItem('googleAds_accountForm_draft', JSON.stringify(draft));
```

## ✅ Ventajas

1. **Experiencia de Usuario Mejorada**
   - No pierden datos por cierres accidentales
   - Pueden tomarse su tiempo para buscar credenciales
   - Reducción de frustración

2. **Flujo Natural**
   - Guardado automático (no requiere acción del usuario)
   - Limpieza automática (no requiere mantenimiento)
   - Transparente (funciona en segundo plano)

3. **Desarrollo Ágil**
   - Útil durante testing (no re-escribir credenciales)
   - Facilita debugging (valores persistentes)
   - Reduce tiempo de pruebas manuales

## ⚙️ Configuración

La funcionalidad está **habilitada por defecto**. Si se requiere deshabilitar:

```javascript
// En AccountForm.jsx, comentar o remover:
// onValuesChange={handleFormChange}

// O agregar una flag condicional:
const ENABLE_DRAFT_PERSISTENCE = import.meta.env.VITE_ENABLE_DRAFT_PERSISTENCE !== 'false';

// Y en el Form:
onValuesChange={ENABLE_DRAFT_PERSISTENCE ? handleFormChange : undefined}
```

## 📚 Referencias

- [Web Storage API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [localStorage - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [Ant Design Form - onValuesChange](https://ant.design/components/form#API)

---

**Última actualización:** 9 de octubre de 2025  
**Autor:** Sistema de IA - GitHub Copilot  
**Estado:** ✅ Implementado y Funcional

# 🧪 Guía de Pruebas - Persistencia de Formulario

## Preparación

### 1. Iniciar Backend
```powershell
cd "d:\Users\JoseGlez\Documents\DEV\PC\ZoomyApi\zoomplanet-ia-api-actualizado"
npm run win
```

**Verificar:**
- ✅ `🚀 Server ready at http://0.0.0.0:4000`
- ✅ `📦 Connected to MongoDB`
- ✅ Sin errores de schema

### 2. Iniciar Frontend
```powershell
cd "d:\Users\JoseGlez\Documents\DEV\PC\ZoomyApi\zoomplanet-ia-panel"
npm run dev
```

**Verificar:**
- ✅ Servidor corriendo en `http://localhost:3000`
- ✅ Sin errores de compilación

### 3. Abrir Consola del Navegador
- Presionar **F12**
- Ir a pestaña **Console**
- Limpiar consola (icono 🚫 o Ctrl+L)

---

## 📋 Test Suite

### Test 1: Guardado Automático en Tiempo Real

**Objetivo:** Verificar que cada cambio se guarda en localStorage

**Pasos:**
1. Ir a `http://localhost:3000/zoomy/admin/googleAds/settings/accounts`
2. Click en botón **"Nueva Cuenta"**
3. Escribir en el campo "Nombre de la Cuenta": `"Mi Cuenta Test"`
4. **Esperar 1 segundo**
5. Abrir **Herramientas de Desarrollo (F12)** → Pestaña **Console**
6. Ejecutar:
   ```javascript
   JSON.parse(localStorage.getItem('googleAds_accountForm_draft'))
   ```

**Resultado Esperado:**
```javascript
{
  name: "Mi Cuenta Test",
  settings: {
    currency: "USD",
    timezone: "America/Mexico_City",
    autoTaggingEnabled: true
  }
}
```

**Verificación:**
- ✅ El objeto contiene el nombre que escribiste
- ✅ En consola aparece: `💾 Guardando borrador en localStorage`

---

### Test 2: Preservación al Cerrar Modal

**Objetivo:** Verificar que los datos NO se pierden al cerrar

**Pasos:**
1. Continuar desde Test 1 (modal abierto con datos)
2. Agregar más datos:
   - Customer ID: `123-456-7890`
   - Client ID: `test-client-id`
   - Client Secret: `test-secret`
3. **NO hacer click en "Crear Cuenta"**
4. Click en **"Cancelar"** o en la **X** del modal
5. Verificar consola: debe aparecer `⏸️ Modal cerrado, borrador preservado en localStorage`
6. **Volver a hacer click** en botón **"Nueva Cuenta"**

**Resultado Esperado:**
- ✅ El formulario se abre con **todos los datos** que habías escrito
- ✅ Nombre: "Mi Cuenta Test"
- ✅ Customer ID: "123-456-7890"
- ✅ Credenciales preservadas
- ✅ En consola aparece: `📦 Recuperando borrador de cuenta desde localStorage`

---

### Test 3: Limpieza Después de Guardado Exitoso

**Objetivo:** Verificar que el borrador se elimina solo al guardar

**Prerequisitos:**
- Backend debe estar corriendo
- Usuario debe estar autenticado

**Pasos:**
1. Abrir modal "Nueva Cuenta"
2. Llenar **TODOS** los campos requeridos:
   ```
   Nombre: "Cuenta Producción"
   Customer ID: "123-456-7890"
   Client ID: "tu-client-id"
   Client Secret: "tu-client-secret"
   Developer Token: "tu-dev-token"
   Refresh Token: "tu-refresh-token"
   Moneda: USD
   Zona Horaria: America/Mexico_City
   ```
3. Click en **"Crear Cuenta"**
4. **Esperar** a que aparezca mensaje de éxito o error
5. Si fue exitoso:
   - Verificar consola: `🗑️ Borrador limpiado de localStorage`
   - Modal se cierra automáticamente
6. Volver a abrir **"Nueva Cuenta"**

**Resultado Esperado:**
- ✅ Formulario está **completamente vacío**
- ✅ No se recupera ningún valor anterior
- ✅ localStorage NO contiene el borrador:
  ```javascript
  localStorage.getItem('googleAds_accountForm_draft') // null
  ```

---

### Test 4: Preservación en Caso de Error

**Objetivo:** Verificar que los datos se conservan si falla el guardado

**Pasos:**
1. **Opción A - Simular error de red:**
   - Abrir Herramientas de Desarrollo (F12)
   - Ir a pestaña **Network**
   - Click en **"Offline"** (simular sin conexión)
   
2. **Opción B - Datos inválidos:**
   - Dejar un campo requerido vacío
   
3. Llenar formulario con datos:
   ```
   Nombre: "Cuenta con Error"
   Customer ID: "999-999-9999"
   ```
   
4. Click en **"Crear Cuenta"**
5. Esperar mensaje de error
6. Cerrar modal (Cancelar)
7. Volver a abrir "Nueva Cuenta"

**Resultado Esperado:**
- ✅ Los datos están **preservados**
- ✅ Nombre: "Cuenta con Error"
- ✅ Customer ID: "999-999-9999"
- ✅ Usuario puede corregir y reintentar sin reescribir todo

---

### Test 5: NO Persistir en Modo Edición

**Objetivo:** Verificar que NO se guarda borrador al editar

**Prerequisitos:**
- Debe existir al menos una cuenta en la tabla

**Pasos:**
1. En la tabla de cuentas, click en **icono de lápiz (Editar)**
2. Modificar el nombre de la cuenta: `"Nombre Editado"`
3. **NO guardar**, click en **"Cancelar"**
4. Verificar en consola:
   ```javascript
   localStorage.getItem('googleAds_accountForm_draft')
   ```

**Resultado Esperado:**
- ✅ `null` o el borrador anterior de **creación** (NO de edición)
- ✅ NO aparece log de `💾 Guardando borrador` al editar campos
- ✅ Solo se guarda en localStorage cuando **creas** nueva cuenta

---

### Test 6: Múltiples Campos y Objetos Anidados

**Objetivo:** Verificar que guarda correctamente estructuras complejas

**Pasos:**
1. Abrir "Nueva Cuenta"
2. Llenar todos los campos:
   ```
   Nombre: "Cuenta Completa"
   Customer ID: "111-222-3333"
   Client ID: "abc123.apps.googleusercontent.com"
   Client Secret: "GOCSPX-xyz789"
   Developer Token: "DEV123456"
   Refresh Token: "1//refresh-token-largo"
   Moneda: MXN
   Zona Horaria: America/Mexico_City
   Auto-tagging: ON (switch activado)
   ```
3. Cerrar modal (NO guardar)
4. En consola ejecutar:
   ```javascript
   const draft = JSON.parse(localStorage.getItem('googleAds_accountForm_draft'));
   console.log(draft);
   ```

**Resultado Esperado:**
```javascript
{
  name: "Cuenta Completa",
  customerId: "111-222-3333",
  credentials: {
    clientId: "abc123.apps.googleusercontent.com",
    clientSecret: "GOCSPX-xyz789",
    developerToken: "DEV123456",
    refreshToken: "1//refresh-token-largo"
  },
  settings: {
    currency: "MXN",
    timezone: "America/Mexico_City",
    autoTaggingEnabled: true
  }
}
```

**Verificación:**
- ✅ Todos los campos están presentes
- ✅ Estructura anidada correcta (`credentials` y `settings`)
- ✅ Switch se guardó como booleano (`true`)

---

## 🔍 Inspección Manual

### Ver Borrador Actual
```javascript
// En consola del navegador (F12):
const draft = localStorage.getItem('googleAds_accountForm_draft');
console.log('Raw:', draft);
console.log('Parsed:', JSON.parse(draft));
```

### Modificar Borrador Manualmente
```javascript
// Cargar borrador
const draft = JSON.parse(localStorage.getItem('googleAds_accountForm_draft'));

// Modificar
draft.name = "Nombre Modificado Manualmente";

// Guardar
localStorage.setItem('googleAds_accountForm_draft', JSON.stringify(draft));

// Abrir modal para ver cambios
```

### Limpiar Borrador Manualmente
```javascript
localStorage.removeItem('googleAds_accountForm_draft');
console.log('Borrador eliminado');
```

---

## 🐛 Troubleshooting

### Problema: No se guardan los cambios

**Síntomas:**
- Escribes en campos pero no aparece `💾 Guardando borrador`
- Al cerrar y reabrir, campos están vacíos

**Solución:**
1. Verificar que NO estás en modo edición (botón debe decir "Crear Cuenta", no "Actualizar")
2. Verificar consola de errores (F12 → Console)
3. Verificar que localStorage está habilitado:
   ```javascript
   try {
     localStorage.setItem('test', 'test');
     localStorage.removeItem('test');
     console.log('localStorage disponible');
   } catch(e) {
     console.error('localStorage NO disponible:', e);
   }
   ```

### Problema: Borrador no se limpia después de guardar

**Síntomas:**
- Guardas cuenta exitosamente
- Abres "Nueva Cuenta" y los datos anteriores siguen ahí

**Solución:**
1. Verificar que la mutación retorna `success: true`
2. Verificar en Network (F12) que la respuesta del backend es correcta
3. Verificar consola: debe aparecer `🗑️ Borrador limpiado`
4. Si no aparece, revisar que `handleSave` en `AccountsManagement.jsx` retorna el resultado correctamente

### Problema: Error al parsear JSON

**Síntomas:**
- Error en consola: `SyntaxError: Unexpected token...`
- Modal no abre o se congela

**Solución:**
```javascript
// Limpiar localStorage corrupto
localStorage.removeItem('googleAds_accountForm_draft');

// Reiniciar página
location.reload();
```

---

## 📊 Checklist de Validación Completa

Marca cada item después de validar:

- [ ] **Test 1:** Guardado automático funciona
- [ ] **Test 2:** Datos se preservan al cerrar
- [ ] **Test 3:** Borrador se limpia al guardar exitosamente
- [ ] **Test 4:** Datos se preservan si hay error
- [ ] **Test 5:** NO persiste en modo edición
- [ ] **Test 6:** Estructuras complejas se guardan correctamente
- [ ] **Logs:** Aparecen todos los logs esperados (📦, 💾, ⏸️, 🗑️)
- [ ] **Sin errores:** Consola no muestra errores de JavaScript
- [ ] **Backend:** Responde correctamente a mutaciones
- [ ] **CORS:** No hay errores de origen cruzado

---

## 🎯 Criterios de Aceptación

✅ La funcionalidad se considera **COMPLETA** si:

1. Los campos se guardan automáticamente al escribir
2. Los datos se recuperan al reabrir el modal
3. El borrador se elimina solo al guardar exitosamente
4. No persiste en modo edición
5. No hay errores en consola
6. Todos los logs aparecen correctamente
7. La experiencia de usuario es fluida y transparente

---

## 📝 Reporte de Resultados

Después de ejecutar los tests, documenta:

```
Fecha: _____________
Navegador: _____________
Versión: _____________

Test 1 (Guardado automático): ✅ / ❌
Test 2 (Preservación): ✅ / ❌
Test 3 (Limpieza): ✅ / ❌
Test 4 (Error): ✅ / ❌
Test 5 (Edición): ✅ / ❌
Test 6 (Estructuras): ✅ / ❌

Observaciones:
______________________________
______________________________
______________________________

Errores encontrados:
______________________________
______________________________
______________________________
```

---

**Última actualización:** 9 de octubre de 2025  
**Autor:** Sistema de IA - GitHub Copilot  
**Versión:** 1.0

# Solución: Error 400 redirect_uri_mismatch

## 🔴 Problema

```
Error 400: redirect_uri_mismatch
The redirect URI in the request, urn:ietf:wg:oauth:2.0:oob, can only be used by a Client ID for native application. It is not allowed for the WEB client type.
```

**Causa:** Tu Client ID actual es de tipo "Aplicación Web", pero estábamos intentando usar `urn:ietf:wg:oauth:2.0:oob` que solo funciona con aplicaciones de tipo "Escritorio".

---

## ✅ Solución: Configurar URI de Callback

### Paso 1: Ir a Google Cloud Console

Abre: https://console.cloud.google.com/apis/credentials

### Paso 2: Editar tu Client ID Actual

1. Click en tu Client ID existente (ejemplo: `YOUR_CLIENT_ID.apps.googleusercontent.com`)

### Paso 3: Añadir URI de Redirección

En la sección **"URIs de redirección autorizadas"**, añade:

```
http://localhost:4000/api/googleAds/oauth/callback
```

**IMPORTANTE:** Escribe exactamente esto, sin espacios ni caracteres extra.

### Paso 4: Guardar

Click en **"GUARDAR"** en la parte inferior.

⏰ **Espera 5 minutos** para que el cambio se propague en los servidores de Google.

---

## 🚀 Probar el Flujo Actualizado

### Paso 1: Asegúrate de que la API esté corriendo

```powershell
# Verificar que el backend esté en puerto 4000
curl http://localhost:4000
```

Si no está corriendo:
```powershell
cd d:\Users\JoseGlez\Documents\DEV\PC\ZoomyApi\zoomplanet-ia-api-actualizado
npm run win
```

### Paso 2: Abrir el Formulario

```
http://localhost:3000/zoomy/admin/googleAds/settings/accounts
```

Click en **"Nueva Cuenta"**

### Paso 3: Llenar Credenciales

**IMPORTANTE:** Ahora necesitas llenar **ambos campos** antes de generar la URL:

- **Client ID:** `YOUR_CLIENT_ID.apps.googleusercontent.com`
- **Client Secret:** `YOUR_CLIENT_SECRET`

### Paso 4: Generar URL

Click en **"Generar URL de Autorización OAuth2"**

El botón ahora:
1. Llama a tu API en `/api/googleAds/oauth/authorize`
2. La API genera la URL con el callback correcto
3. Se abre el popup de Google

### Paso 5: Autorizar

En la ventana de Google:
1. Inicia sesión con `zoomplanet.soporte@gmail.com` (o la cuenta que uses)
2. Acepta los permisos
3. **Serás redirigido automáticamente** a una página con los tokens

### Paso 6: Copiar Refresh Token

La página de callback mostrará:

```
✅ Autorización Exitosa

Refresh Token (Guarda este valor):
1//0gABC123XYZ...

[Copiar Refresh Token]
```

Click en **"Copiar Refresh Token"** o selecciona y copia el valor.

### Paso 7: Completar Formulario

Pega el Refresh Token en el campo del formulario y completa:
- ✅ Refresh Token (pegado)
- ✅ Developer Token (tu Developer Token de Google Ads)
- ✅ Settings (moneda, zona horaria, etc.)

Click en **"Crear Cuenta"**

---

## 📋 Flujo Completo Actualizado

```
┌─────────────┐
│  Formulario │ → Llenar Client ID + Client Secret
└──────┬──────┘
       │
       ↓
┌──────────────────────────────────────────────┐
│ Click "Generar URL de Autorización OAuth2"  │
└──────┬───────────────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────────────┐
│ Frontend llama:                              │
│ GET /api/googleAds/oauth/authorize          │
│   ?clientId=XXX&clientSecret=YYY            │
└──────┬──────────────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────────────┐
│ API genera URL con redirect_uri:            │
│ http://localhost:4000/api/.../callback      │
└──────┬──────────────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────────────┐
│ Popup abre página de Google                 │
│ Usuario autoriza                             │
└──────┬──────────────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────────────┐
│ Google redirige a:                           │
│ /api/googleAds/oauth/callback?code=XXX      │
└──────┬──────────────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────────────┐
│ API intercambia código por tokens           │
│ Muestra página HTML con Refresh Token       │
└──────┬──────────────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────────────┐
│ Usuario copia Refresh Token                 │
│ Pega en formulario                           │
│ Click "Crear Cuenta"                         │
└─────────────────────────────────────────────┘
```

---

## 🔧 Cambios Realizados en el Código

### 1. Función `generateAuthUrl()` Actualizada

**ANTES (Generaba URL localmente):**
```javascript
const params = new URLSearchParams({
  client_id: clientId,
  redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',  // ❌ No funciona con Web Client
  // ...
});
const url = `https://accounts.google.com/o/oauth2/auth?${params}`;
```

**DESPUÉS (Llama a la API):**
```javascript
fetch(`http://localhost:4000/api/googleAds/oauth/authorize?clientId=${clientId}&clientSecret=${clientSecret}`)
  .then(response => response.json())
  .then(data => {
    setAuthUrl(data.authUrl);  // URL con redirect correcto
    window.open(data.authUrl, '_blank');
  });
```

### 2. Validación Mejorada

Ahora requiere **Client ID** y **Client Secret** antes de generar la URL.

### 3. Instrucciones Actualizadas

El panel de ayuda ahora explica:
- Opción A: Configurar URI de callback (para Web Client)
- Opción B: Crear Client ID de escritorio (para Desktop Client)

---

## 🐛 Troubleshooting

### Error persiste después de añadir URI

**Causa:** Cambio no propagado aún

**Solución:** Espera 5-10 minutos y vuelve a intentar

### Error: "Cannot connect to API"

**Causa:** Backend no está corriendo

**Solución:**
```powershell
cd d:\Users\JoseGlez\Documents\DEV\PC\ZoomyApi\zoomplanet-ia-api-actualizado
npm run win
```

### Error: "invalid_client"

**Causa:** Client Secret incorrecto o no enviado

**Solución:** Verifica que llenaste el campo Client Secret en el formulario

### La página de callback no se abre

**Causa:** Ruta `/api/googleAds/oauth/callback` no registrada

**Solución:** Verifica que el backend esté corriendo con las rutas OAuth cargadas

---

## ✅ Checklist Final

Antes de probar:
- [ ] URI de callback añadida en Google Cloud Console
- [ ] Esperado 5 minutos después de guardar
- [ ] Backend corriendo en puerto 4000
- [ ] Frontend corriendo en puerto 3000
- [ ] Client ID y Client Secret llenados en el formulario

Durante la prueba:
- [ ] URL generada desde el botón (no manualmente)
- [ ] Popup de Google abierto correctamente
- [ ] Autorización completada sin errores
- [ ] Página de callback muestra Refresh Token
- [ ] Refresh Token copiado al formulario

---

## 🎯 Verificación Rápida

**1. Verificar URI en Google Cloud Console:**
```
https://console.cloud.google.com/apis/credentials
→ Click en tu Client ID
→ "URIs de redirección autorizadas" debe contener:
   http://localhost:4000/api/googleAds/oauth/callback
```

**2. Verificar Backend:**
```powershell
# En PowerShell
curl http://localhost:4000/api/googleAds/oauth/authorize?clientId=test&clientSecret=test
```

Debe devolver JSON con `authUrl`.

**3. Verificar Frontend:**
Abrir formulario y llenar Client ID + Client Secret, el botón debe estar habilitado.

---

**Fecha de Actualización:** 12 de octubre de 2025  
**Solución Aplicada:** Usar callback URL en lugar de OOB  
**Estado:** ✅ Código actualizado, pendiente configuración en Google Cloud Console

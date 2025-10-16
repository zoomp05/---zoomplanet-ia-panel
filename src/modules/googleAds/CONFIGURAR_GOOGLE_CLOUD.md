# 🎯 Guía Rápida: Configurar OAuth en Google Cloud Console

## ⚡ Pasos Inmediatos (5 minutos)

### 1️⃣ Abrir Google Cloud Console
```
https://console.cloud.google.com/apis/credentials
```

### 2️⃣ Editar tu Client ID

1. Busca en la lista: `689750185751-s1j9ih9tk5dqgfv70l55e0dkhmqp54ca.apps.googleusercontent.com`
2. **Click en el nombre** (no en el ID)

### 3️⃣ Añadir URI de Redirección

Desplázate hasta la sección: **"URIs de redirección autorizadas"**

Click en **"+ AÑADIR URI"**

Escribe EXACTAMENTE esto (copia y pega):
```
http://localhost:4000/api/googleAds/oauth/callback
```

**IMPORTANTE:** 
- ✅ Sin espacios
- ✅ Sin barra final (/)
- ✅ `http` no `https` (para desarrollo local)
- ✅ Puerto `4000` (puerto de tu API)

### 4️⃣ Guardar

1. Scroll hasta abajo
2. Click en **"GUARDAR"**
3. ⏰ **Espera 5 minutos** (cambios tardan en propagarse)

---

## ✅ Verificación Visual

Tu configuración debe verse así:

```
┌─────────────────────────────────────────────────────────────┐
│ Editar ID de cliente de OAuth 2.0                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Nombre                                                       │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ ZoomyApp                                              │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ URIs de redirección autorizadas                             │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ http://localhost:4000/api/googleAds/oauth/callback   │ × │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│                   [+ AÑADIR URI]                             │
│                                                              │
│                                     [ CANCELAR ] [ GUARDAR ] │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Probar el Flujo (Después de 5 minutos)

### Paso 1: Verificar Backend
```powershell
# Debe estar corriendo en puerto 4000
# Si no, ejecuta:
cd d:\Users\JoseGlez\Documents\DEV\PC\ZoomyApi\zoomplanet-ia-api-actualizado
npm run win
```

### Paso 2: Abrir Formulario
```
http://localhost:3000/zoomy/admin/googleAds/settings/accounts
```
Click en **"Nueva Cuenta"**

### Paso 3: Llenar Campos
- **Nombre:** "Mi Cuenta Test"
- **Customer ID:** "123-456-7890"
- **Client ID:** `689750185751-s1j9ih9tk5dqgfv70l55e0dkhmqp54ca.apps.googleusercontent.com`
- **Client Secret:** `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`

### Paso 4: Click en Botón
**"Generar URL de Autorización OAuth2"**

### Paso 5: Autorizar en Google
1. Se abre popup de Google
2. Inicia sesión (si es necesario)
3. Acepta permisos
4. **RESULTADO:** Página con Refresh Token

### Paso 6: Copiar y Guardar
1. Copia el Refresh Token de la página
2. Pégalo en el formulario
3. Llena Developer Token
4. Click "Crear Cuenta"

---

## 🎬 Resultado Esperado

### ✅ Flujo Exitoso:

```
1. Click en botón
   ↓
2. Popup de Google se abre
   ↓
3. Autorizar aplicación
   ↓
4. Redirección automática
   ↓
5. Página blanca con tokens
   ┌────────────────────────────────────┐
   │ ✅ Autorización Exitosa            │
   │                                    │
   │ Refresh Token:                     │
   │ 1//0gABC123XYZ...                 │
   │ [Copiar Refresh Token]             │
   │                                    │
   │ Access Token (temporal):           │
   │ ya29.a0AfB_...                    │
   │ [Copiar Access Token]              │
   └────────────────────────────────────┘
   ↓
6. Copiar Refresh Token
   ↓
7. Pegar en formulario
   ↓
8. Crear cuenta ✅
```

### ❌ Si Sigue Fallando:

**Error: redirect_uri_mismatch**
- Verifica que la URI esté EXACTAMENTE como se indica
- Espera 10 minutos (a veces tarda)
- Limpia cache del navegador (Ctrl+Shift+Del)

**Error: Cannot connect**
- Verifica que el backend esté corriendo
- Verifica puerto 4000 (no 3000)

**Popup no se abre**
- Verifica que no haya bloqueador de popups
- Intenta con modo incógnito

---

## 📸 Capturas de Pantalla de Referencia

### Google Cloud Console - Client ID
```
URL: https://console.cloud.google.com/apis/credentials

Vista debe mostrar:
┌─────────────────────────────────────────────┐
│ Credenciales                                 │
├─────────────────────────────────────────────┤
│ IDs de cliente de OAuth 2.0                 │
│                                              │
│ ┌─────────────────────────────────────┐    │
│ │ 📄 689750185751-s1j9ih...           │ ✏️ │
│ │    Aplicación web                    │    │
│ │    ZoomyApp                          │    │
│ └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
       ↑
     Click aquí para editar
```

### Formulario - Campos Requeridos
```
┌─────────────────────────────────────────────┐
│ Nueva Cuenta de Google Ads              × │
├─────────────────────────────────────────────┤
│                                              │
│ Client ID *                                  │
│ ┌──────────────────────────────────────┐   │
│ │ 689750185751-s1j9ih9tk...             │   │
│ └──────────────────────────────────────┘   │
│                                              │
│ Client Secret *                              │
│ ┌──────────────────────────────────────┐   │
│ │ ••••••••••••••••••••••••••            │   │
│ └──────────────────────────────────────┘   │
│                                              │
│ [🔗 Generar URL de Autorización OAuth2]     │
│                                              │
└─────────────────────────────────────────────┘
```

---

## 🔍 Debug: Verificar URI Configurada

```powershell
# PowerShell - Verificar que API responde
Invoke-WebRequest -Uri "http://localhost:4000/api/googleAds/oauth/authorize?clientId=test&clientSecret=test" | ConvertFrom-Json | Select-Object -ExpandProperty authUrl

# Debe contener: redirect_uri=http%3A%2F%2Flocalhost%3A4000%2Fapi%2FgoogleAds%2Foauth%2Fcallback
```

---

## ✅ Checklist Final

**Antes de intentar:**
- [ ] URI añadida en Google Cloud Console
- [ ] Guardado en Google Cloud Console
- [ ] Esperado 5-10 minutos
- [ ] Backend corriendo (puerto 4000)
- [ ] Frontend corriendo (puerto 3000)

**Al probar:**
- [ ] Campos Client ID y Client Secret llenados
- [ ] Click en botón genera URL
- [ ] Popup de Google se abre
- [ ] Sin error "redirect_uri_mismatch"
- [ ] Página de callback muestra tokens
- [ ] Refresh Token copiado correctamente

---

**Tiempo Total:** 5 minutos configuración + 5 minutos espera + 2 minutos prueba = **12 minutos**

**Estado Actual:** 
- ✅ Código actualizado
- ⏳ Pendiente: Configurar URI en Google Cloud Console
- ⏳ Pendiente: Probar flujo completo

---

**Próximo Paso:** Ir a https://console.cloud.google.com/apis/credentials y añadir la URI

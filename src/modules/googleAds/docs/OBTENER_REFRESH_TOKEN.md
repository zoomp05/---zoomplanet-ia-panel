# Guía Rápida: Obtener Refresh Token de Google Ads

## 🎯 Flujo Completo (Paso a Paso)

### Paso 1: Llenar Credenciales en el Formulario

1. Abre el formulario de "Nueva Cuenta de Google Ads"
2. Llena los campos:
   - **Nombre:** Ej. "Mi Cuenta Google Ads"
   - **Customer ID:** Ej. "123-456-7890"
   - **Client ID:** Tu Client ID de Google Cloud Console
   - **Client Secret:** Tu Client Secret
   - **Developer Token:** Tu Developer Token de Google Ads

### Paso 2: Generar URL de Autorización

1. Click en el botón **"Generar URL de Autorización OAuth2"**
2. Se abrirá una nueva ventana con la página de autorización de Google
3. La URL también se copiará al portapapeles y se mostrará en el formulario

### Paso 3: Autorizar la Aplicación

1. En la ventana de Google que se abrió:
   - Inicia sesión con tu cuenta de Google (zoomplanet.soporte@gmail.com)
   - Acepta los permisos solicitados
   - Google te mostrará un **código de autorización** (ej: `4/0AeaYSHABC123...`)
2. **Copia ese código**

### Paso 4: Intercambiar Código por Refresh Token

Tienes 3 opciones:

#### Opción A: Usando la API (Recomendado)

```bash
curl -X POST "http://localhost:4000/api/googleAds/oauth/exchange" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "4/0AeaYSHABC123...",
    "clientId": "689750185751-s1j9ih9tk5dqgfv70l55e0dkhmqp54ca.apps.googleusercontent.com",
    "clientSecret": "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"
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "tokens": {
    "access_token": "ya29.a0AfB_byABC123...",
    "refresh_token": "1//0gABC123...",
    "expiry_date": 1699564800000,
    "token_type": "Bearer",
    "scope": "https://www.googleapis.com/auth/adwords"
  }
}
```

#### Opción B: Usando Google OAuth2

```bash
curl -X POST "https://oauth2.googleapis.com/token" \
  -d "client_id=689750185751-s1j9ih9tk5dqgfv70l55e0dkhmqp54ca.apps.googleusercontent.com" \
  -d "client_secret=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" \
  -d "code=4/0AeaYSHABC123..." \
  -d "grant_type=authorization_code" \
  -d "redirect_uri=urn:ietf:wg:oauth:2.0:oob"
```

#### Opción C: Usando PowerShell (Windows)

```powershell
$body = @{
    client_id = "689750185751-s1j9ih9tk5dqgfv70l55e0dkhmqp54ca.apps.googleusercontent.com"
    client_secret = "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"
    code = "4/0AeaYSHABC123..."
    grant_type = "authorization_code"
    redirect_uri = "urn:ietf:wg:oauth:2.0:oob"
}

$response = Invoke-RestMethod -Uri "https://oauth2.googleapis.com/token" -Method Post -Body $body
$response.refresh_token
```

### Paso 5: Guardar Refresh Token

1. Copia el **refresh_token** de la respuesta (empieza con `1//0g...`)
2. Pégalo en el campo **"Refresh Token"** del formulario
3. Click en **"Crear Cuenta"**

¡Listo! Tu cuenta de Google Ads está configurada.

---

## 🔧 Troubleshooting

### Error: "invalid_grant"
**Causa:** El código de autorización expiró (solo son válidos por 10 minutos)
**Solución:** Genera una nueva URL y repite el proceso

### Error: "redirect_uri_mismatch"
**Causa:** La URI de redirección no está configurada en Google Cloud Console
**Solución:** Añade `urn:ietf:wg:oauth:2.0:oob` en las URIs autorizadas

### Error: "access_denied"
**Causa:** La app está en modo "Testing" y tu email no está autorizado
**Solución:** Cambia la app a modo "Producción" en Google Cloud Console

### No se obtiene refresh_token
**Causa:** Google solo devuelve refresh token en la primera autorización
**Solución:** 
1. Ve a: https://myaccount.google.com/permissions
2. Busca "ZoomyApp" y revoca el acceso
3. Vuelve a autorizar (la URL ya incluye `prompt=consent` para forzar)

---

## 📚 Recursos Útiles

- **Google Cloud Console:** https://console.cloud.google.com/apis/credentials
- **OAuth Consent Screen:** https://console.cloud.google.com/apis/credentials/consent
- **Revocar Accesos:** https://myaccount.google.com/permissions
- **Documentación Google Ads API:** https://developers.google.com/google-ads/api/docs/start

---

## ✅ Checklist Rápido

- [ ] App en modo "Producción" en Google Cloud Console
- [ ] Client ID y Secret obtenidos
- [ ] Developer Token obtenido
- [ ] URL de autorización generada desde el botón
- [ ] Código de autorización copiado de Google
- [ ] Refresh Token obtenido mediante curl/API
- [ ] Refresh Token pegado en el formulario
- [ ] Cuenta creada exitosamente

---

**Última Actualización:** 12 de octubre de 2025

# Intercambiar Código por Refresh Token - Guía Práctica

## 🎯 Contexto

Después de generar la URL de autorización OAuth2 y autorizar la aplicación en Google, obtienes un **código de autorización**. Este código debe ser intercambiado por un **Refresh Token** que es el que necesitas guardar en tu cuenta de Google Ads.

---

## 📋 Método Recomendado: Usar PowerShell (Windows)

### Paso 1: Tener a Mano
- **Código de autorización** que te dio Google (ej: `4/0AeaYSHABC123...`)
- **Client ID:** `YOUR_CLIENT_ID.apps.googleusercontent.com`
- **Client Secret:** `YOUR_CLIENT_SECRET`

### Paso 2: Abrir PowerShell

1. Presiona `Win + X`
2. Selecciona "Windows PowerShell" o "Terminal"

### Paso 3: Ejecutar Comando

Copia y pega este comando (reemplaza `TU_CODIGO_AQUI` con el código que te dio Google):

```powershell
$body = @{
    client_id = "YOUR_CLIENT_ID.apps.googleusercontent.com"
    client_secret = "YOUR_CLIENT_SECRET"
    code = "TU_CODIGO_AQUI"
    grant_type = "authorization_code"
    redirect_uri = "urn:ietf:wg:oauth:2.0:oob"
}

$response = Invoke-RestMethod -Uri "https://oauth2.googleapis.com/token" -Method Post -Body $body

Write-Host "`n✅ Refresh Token Obtenido:" -ForegroundColor Green
Write-Host $response.refresh_token -ForegroundColor Yellow
Write-Host "`nCopia el token de arriba y pégalo en el campo 'Refresh Token' del formulario." -ForegroundColor Cyan
```

### Paso 4: Resultado Esperado

PowerShell mostrará algo como:

```
✅ Refresh Token Obtenido:
1//0gABC123XYZ456DEF789GHI012JKL345MNO678PQR901STU234VWX567YZ890

Copia el token de arriba y pégalo en el campo 'Refresh Token' del formulario.
```

### Paso 5: Copiar y Pegar

1. Selecciona el token (línea que empieza con `1//0g...`)
2. Copia (Ctrl+C)
3. Pega en el campo **"Refresh Token"** del formulario

---

## 🌐 Método Alternativo: Usar la API de ZoomyApp

Si prefieres usar la API de tu propia aplicación:

### Paso 1: Asegúrate de que la API esté corriendo

```powershell
# En una terminal, verifica que la API esté en puerto 4000
curl http://localhost:4000
```

### Paso 2: Ejecutar Request

```powershell
$body = @{
    code = "TU_CODIGO_AQUI"
    clientId = "YOUR_CLIENT_ID.apps.googleusercontent.com"
    clientSecret = "YOUR_CLIENT_SECRET"
} | ConvertTo-Json

$response = Invoke-RestMethod `
    -Uri "http://localhost:4000/api/googleAds/oauth/exchange" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"

Write-Host "`n✅ Refresh Token Obtenido:" -ForegroundColor Green
Write-Host $response.tokens.refresh_token -ForegroundColor Yellow
```

---

## 🖥️ Método Alternativo: Usar curl (Si tienes instalado)

### Windows con curl:

```bash
curl -X POST "https://oauth2.googleapis.com/token" ^
  -d "client_id=YOUR_CLIENT_ID.apps.googleusercontent.com" ^
  -d "client_secret=YOUR_CLIENT_SECRET" ^
  -d "code=TU_CODIGO_AQUI" ^
  -d "grant_type=authorization_code" ^
  -d "redirect_uri=urn:ietf:wg:oauth:2.0:oob"
```

---

## 🔍 Parsear Respuesta JSON (Opcional)

Si el comando anterior te devuelve JSON completo y quieres extraer solo el refresh token:

```powershell
# Con formato bonito
$body = @{
    client_id = "YOUR_CLIENT_ID.apps.googleusercontent.com"
    client_secret = "YOUR_CLIENT_SECRET"
    code = "TU_CODIGO_AQUI"
    grant_type = "authorization_code"
    redirect_uri = "urn:ietf:wg:oauth:2.0:oob"
}

$response = Invoke-RestMethod -Uri "https://oauth2.googleapis.com/token" -Method Post -Body $body

Write-Host "`n📦 Respuesta Completa:" -ForegroundColor Cyan
$response | ConvertTo-Json -Depth 3

Write-Host "`n✅ Refresh Token:" -ForegroundColor Green
Write-Host $response.refresh_token -ForegroundColor Yellow

Write-Host "`n🔑 Access Token (temporal):" -ForegroundColor Green
Write-Host $response.access_token -ForegroundColor Yellow

Write-Host "`n⏰ Expira en:" -ForegroundColor Green
$expiryDate = (Get-Date).AddSeconds($response.expires_in)
Write-Host $expiryDate.ToString("yyyy-MM-dd HH:mm:ss") -ForegroundColor Yellow
```

---

## ⚠️ Errores Comunes

### Error: `invalid_grant`

**Mensaje:**
```json
{
  "error": "invalid_grant",
  "error_description": "Malformed auth code."
}
```

**Causas:**
1. El código de autorización expiró (válido por 10 minutos)
2. El código ya fue usado anteriormente
3. El código está mal copiado (espacios extras, caracteres faltantes)

**Solución:**
1. Genera una nueva URL desde el botón del formulario
2. Autoriza nuevamente en Google
3. Usa el nuevo código inmediatamente

---

### Error: `redirect_uri_mismatch`

**Mensaje:**
```json
{
  "error": "redirect_uri_mismatch"
}
```

**Causa:** La URI en el comando no coincide con la usada al generar el código

**Solución:** Asegúrate de usar exactamente: `urn:ietf:wg:oauth:2.0:oob`

---

### Error: `invalid_client`

**Mensaje:**
```json
{
  "error": "invalid_client"
}
```

**Causa:** Client ID o Client Secret incorrectos

**Solución:** Verifica que estés usando las credenciales correctas de tu proyecto en Google Cloud Console.

---

### No aparece `refresh_token` en la respuesta

**Causa:** Google solo devuelve refresh token la primera vez que autorizas

**Solución:**
1. Ve a: https://myaccount.google.com/permissions
2. Busca "ZoomyApp"
3. Click "Quitar acceso"
4. Vuelve a autorizar desde el principio

El botón del formulario ya incluye `prompt=consent` que debería forzar el refresh token, pero si aún así no aparece, revoca y vuelve a autorizar.

---

## 📊 Respuesta Exitosa Completa

Cuando todo funciona correctamente, la respuesta se ve así:

```json
{
  "access_token": "ya29.a0AfB_byABC123...",
  "expires_in": 3599,
  "refresh_token": "1//0gABC123XYZ456...",
  "scope": "https://www.googleapis.com/auth/adwords",
  "token_type": "Bearer"
}
```

**Lo que necesitas:** Solo el valor de `refresh_token` (empieza con `1//0g...`)

---

## ✅ Checklist Final

Antes de ejecutar el comando:
- [ ] Tengo el código de autorización copiado
- [ ] El código es reciente (menos de 10 minutos)
- [ ] Tengo Client ID y Client Secret correctos
- [ ] PowerShell está abierto
- [ ] Voy a usar el comando inmediatamente

Después de obtener el refresh token:
- [ ] Copié el refresh token completo
- [ ] Lo pegué en el formulario
- [ ] Completé los demás campos (Client Secret, Developer Token)
- [ ] Click en "Crear Cuenta"

---

## 🎓 Para Desarrolladores

Si quieres automatizar esto desde el frontend, podrías crear un componente que:

```jsx
const [authCode, setAuthCode] = useState('');
const [loading, setLoading] = useState(false);

const handleExchangeCode = async () => {
  setLoading(true);
  try {
    const response = await fetch('http://localhost:4000/api/googleAds/oauth/exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: authCode,
        clientId: form.getFieldValue(['credentials', 'clientId']),
        clientSecret: form.getFieldValue(['credentials', 'clientSecret'])
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Auto-completar el campo de Refresh Token
      form.setFieldValue(['credentials', 'refreshToken'], data.tokens.refresh_token);
      message.success('✅ Refresh Token obtenido y guardado automáticamente');
    }
  } catch (error) {
    message.error('Error al obtener el refresh token');
  } finally {
    setLoading(false);
  }
};

return (
  <Form.Item label="Código de Autorización">
    <Input.Search
      placeholder="Pega aquí el código de Google"
      value={authCode}
      onChange={(e) => setAuthCode(e.target.value)}
      enterButton="Obtener Refresh Token"
      loading={loading}
      onSearch={handleExchangeCode}
    />
  </Form.Item>
);
```

---

**Última Actualización:** 12 de octubre de 2025  
**Método Recomendado:** PowerShell (más visual y amigable)  
**Tiempo Estimado:** 2-3 minutos

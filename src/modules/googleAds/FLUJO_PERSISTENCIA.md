# Flujo de Persistencia - Google Ads Account Form

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FLUJO DE PERSISTENCIA                             │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ 1. USUARIO ABRE MODAL "NUEVA CUENTA"                                 │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────┐
                    │ ¿Hay borrador   │
                    │ en localStorage?│
                    └─────────────────┘
                       /             \
                      /               \
                    SI                 NO
                    /                   \
                   ↓                     ↓
    ┌──────────────────────┐    ┌────────────────┐
    │ Cargar valores       │    │ Campos vacíos  │
    │ desde localStorage   │    │ (valores por   │
    │                      │    │ defecto)       │
    │ 📦 Log: "Recuperando"│    └────────────────┘
    └──────────────────────┘             

┌─────────────────────────────────────────────────────────────────────┐
│ 2. USUARIO EDITA CAMPOS                                              │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
                 ┌────────────────────────┐
                 │ onValuesChange trigger │
                 └────────────────────────┘
                              ↓
                    ┌─────────────────┐
                    │ handleFormChange│
                    └─────────────────┘
                              ↓
              ┌──────────────────────────────┐
              │ Guardar en localStorage      │
              │ Key: googleAds_accountForm... │
              │                              │
              │ 💾 Log: "Guardando borrador" │
              └──────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ 3A. USUARIO CIERRA SIN GUARDAR (X o Cancelar)                       │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
                   ┌─────────────────┐
                   │ handleCancel    │
                   └─────────────────┘
                              ↓
               ┌────────────────────────────┐
               │ NO SE LIMPIA localStorage  │
               │                            │
               │ ⏸️ Log: "Modal cerrado,    │
               │ borrador preservado"       │
               └────────────────────────────┘
                              ↓
            ┌──────────────────────────────────┐
            │ Al volver a abrir el modal,      │
            │ los valores se recuperan         │
            └──────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ 3B. USUARIO GUARDA (Crear Cuenta)                                   │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
                   ┌─────────────────┐
                   │ handleSubmit    │
                   └─────────────────┘
                              ↓
                  ┌──────────────────┐
                  │ form.validate    │
                  └──────────────────┘
                       /          \
                      /            \
                   ERROR          SUCCESS
                    /              \
                   ↓                ↓
        ┌─────────────────┐  ┌──────────────┐
        │ Mostrar errores │  │ onSave()     │
        │ NO limpiar      │  └──────────────┘
        │ localStorage    │         ↓
        └─────────────────┘  ┌──────────────────┐
                             │ GraphQL Mutation │
                             │ CREATE_GADS_...  │
                             └──────────────────┘
                                  /        \
                                 /          \
                              ERROR        SUCCESS
                               /            \
                              ↓              ↓
                  ┌───────────────┐  ┌──────────────────┐
                  │ return false  │  │ return true      │
                  └───────────────┘  └──────────────────┘
                         |                    |
                         ↓                    ↓
              ┌──────────────────┐  ┌──────────────────────┐
              │ NO limpiar       │  │ clearDraft()         │
              │ localStorage     │  │                      │
              │                  │  │ 🗑️ Limpiar localStorage│
              │ Usuario puede    │  │                      │
              │ intentar de nuevo│  │ form.resetFields()   │
              └──────────────────┘  └──────────────────────┘
                                              ↓
                                    ┌──────────────────┐
                                    │ Modal se cierra  │
                                    │ Tabla se recarga │
                                    └──────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ ESTRUCTURA DE DATOS EN localStorage                                  │
└─────────────────────────────────────────────────────────────────────┘

Key: "googleAds_accountForm_draft"

Value (JSON):
{
  "name": "Mi Cuenta de Google Ads",
  "customerId": "123-456-7890",
  "credentials": {
    "clientId": "xxx.apps.googleusercontent.com",
    "clientSecret": "GOCSPX-xxxxx",
    "developerToken": "xxxxx",
    "refreshToken": "1//xxxxx"
  },
  "settings": {
    "currency": "USD",
    "timezone": "America/Mexico_City",
    "autoTaggingEnabled": true
  }
}

┌─────────────────────────────────────────────────────────────────────┐
│ CASOS DE USO                                                         │
└─────────────────────────────────────────────────────────────────────┘

✅ CASO 1: Usuario cierra por error
   → Borrador se preserva
   → Al reabrir, todos los datos están ahí

✅ CASO 2: Usuario necesita buscar credenciales
   → Cierra modal para buscar en otro lugar
   → Al regresar, continúa donde lo dejó

✅ CASO 3: Error de red durante guardado
   → Mutación falla, pero datos quedan en localStorage
   → Usuario puede reintentar sin reescribir todo

✅ CASO 4: Guardado exitoso
   → Borrador se limpia automáticamente
   → Próxima vez, formulario empieza limpio

❌ CASO 5: Editar cuenta existente
   → NO se guarda borrador (solo aplica a creación)
   → Previene sobrescribir datos de cuentas diferentes

┌─────────────────────────────────────────────────────────────────────┐
│ FUNCIONES PRINCIPALES                                                │
└─────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ handleFormChange()                                             │
├────────────────────────────────────────────────────────────────┤
│ Trigger: onValuesChange del Form                              │
│ Acción:                                                        │
│   1. Verificar que NO está editando (isEditing = false)       │
│   2. Obtener valores actuales: form.getFieldsValue()          │
│   3. Guardar en localStorage como JSON string                 │
│   4. Log de confirmación                                      │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ clearDraft()                                                   │
├────────────────────────────────────────────────────────────────┤
│ Trigger: Después de guardado exitoso                          │
│ Acción:                                                        │
│   1. localStorage.removeItem(STORAGE_KEY)                     │
│   2. Log de confirmación                                      │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ handleSubmit()                                                 │
├────────────────────────────────────────────────────────────────┤
│ Trigger: Click en botón "Crear Cuenta"                        │
│ Acción:                                                        │
│   1. Validar formulario                                       │
│   2. Llamar a onSave(values) y ESPERAR resultado              │
│   3. Si result !== false:                                     │
│      - clearDraft()                                           │
│      - form.resetFields()                                     │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ handleCancel()                                                 │
├────────────────────────────────────────────────────────────────┤
│ Trigger: Click en "Cancelar" o X del modal                    │
│ Acción:                                                        │
│   1. Log de preservación                                      │
│   2. Llamar a onCancel()                                      │
│   3. NO limpiar localStorage                                  │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ useEffect (recuperación)                                       │
├────────────────────────────────────────────────────────────────┤
│ Trigger: Modal se abre (visible = true)                       │
│ Acción:                                                        │
│   SI visible && account (editando):                           │
│     → Cargar datos de la cuenta                               │
│   SI visible && !account (creando):                           │
│     → Buscar borrador en localStorage                         │
│     → Si existe, cargar en formulario                         │
│     → Si no existe, resetear campos                           │
└────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ DEBUGGING                                                            │
└─────────────────────────────────────────────────────────────────────┘

# Ver borrador actual en consola del navegador (F12):
localStorage.getItem('googleAds_accountForm_draft')

# Ver borrador parseado:
JSON.parse(localStorage.getItem('googleAds_accountForm_draft'))

# Limpiar borrador manualmente:
localStorage.removeItem('googleAds_accountForm_draft')

# Ver todos los logs:
# Abrir consola y filtrar por: 📦 💾 ⏸️ 🗑️
```

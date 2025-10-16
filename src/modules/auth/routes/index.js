/**
 * Rutas del módulo Auth con layouts jerárquicos
 * Ejemplo de implementación con:
 * - Layout por defecto del módulo (sobreescribible por parent)
 * - Layouts específicos por ruta
 * - Agrupación de rutas por layout
 */

export const routes = [
  {
    path: "",
    moduleName: "auth", // Definición global del módulo
    layout: "modules/auth/layouts/AuthLayout.jsx", // Layout por defecto del módulo (sobreescribible)
    children: [
      // Grupo 1: Rutas con layout principal de Auth
      {
        path: "",
        componentPath: "modules/auth/pages/Login.jsx",
        // Hereda moduleName y layout del padre
      },
      {
        path: "login", 
        componentPath: "modules/auth/pages/Login.jsx",
        // Hereda moduleName y layout del padre
      },
      {
        path: "register",
        componentPath: "modules/auth/pages/Register.jsx", 
        // Hereda moduleName y layout del padre
      },
      {
        path: "forgot-password",
        componentPath: "modules/auth/pages/ForgotPassword.jsx",
        // Hereda moduleName y layout del padre
      },
      {
        path: "resend-confirmation",
        componentPath: "modules/auth/pages/ResendConfirmation.jsx",
        // Hereda moduleName y layout del padre
      },
      {
        path: "email-confirmation-required",
        componentPath: "modules/auth/pages/EmailConfirmationRequired.jsx",
        // Hereda moduleName y layout del padre
      },

      // Grupo 2: Rutas con layout específico (minimal)
      {
        path: "reset-password",
        componentPath: "modules/auth/pages/ResetPassword.jsx",
        layout: "modules/auth/layouts/MinimalLayout.jsx" // Sobreescribe layout del padre
      },
      {
        path: "verify-email",
        componentPath: "modules/auth/pages/ConfirmEmail.jsx", // Página de confirmación
        layout: "modules/auth/layouts/MinimalLayout.jsx" // Sobreescribe layout del padre
      },

      // Grupo 3: Rutas de error/status (sin layout específico, hereda del padre)
      {
        path: "unauthorized",
        componentPath: "modules/auth/pages/Unauthorized.jsx",
        // Hereda moduleName y layout del padre
      },
      {
        path: "config",
        componentPath: "modules/auth/pages/AuthConfig.jsx",
        // Esta ruta requiere autenticación - políticas definidas en config/authConfig.js
      }
    ]
  }
];

/**
 * Configuración de layouts por defecto del módulo Auth
 * Puede ser sobreescrito por configuración del parent module
 */
export const defaultLayoutConfig = {
  defaultLayout: "modules/auth/layouts/AuthLayout.jsx",
  alternativeLayouts: {
    minimal: "modules/auth/layouts/MinimalLayout.jsx",
    // Futuros layouts pueden ir aquí
  }
};

console.log('🔐 Rutas del módulo Auth definidas con layouts jerárquicos:', routes);


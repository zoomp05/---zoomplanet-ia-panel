/**
 * RouterErrorBoundary
 * 
 * Componente de error boundary para el router.
 * Muestra un mensaje amigable cuando ocurre un error en la navegación.
 * 
 * NOTA: Movido de modules/core a src/zoom (core del sistema)
 */

import React from 'react';

function RouterErrorBoundary() {
  return (
    <div className="router-error">
      <h2>Oops! Algo salió mal</h2>
      <p>Hubo un error en la navegación. Por favor, intenta recargar la página.</p>
      <button onClick={() => window.location.reload()}>
        Recargar página
      </button>
    </div>
  );
}

export default RouterErrorBoundary;

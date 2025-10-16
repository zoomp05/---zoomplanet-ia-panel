import React from 'react';
import { Link, useLocation } from 'react-router';

/**
 * Componente que crea enlaces relativos al contexto actual
 * con manejo especial para rutas con parámetros ID
 */
export const ContextualLink = ({ to, children, ...props }) => {
  const location = useLocation();
  
  // Función para determinar la ruta base según el contexto
  const getContextBase = () => {
    // Si la ruta solicitada empieza con /, es absoluta y no modificamos
    if (to.startsWith('/')) {
      return to;
    }
    
    const path = location.pathname;
    const pathParts = path.split('/').filter(Boolean);
    
    // Caso especial: si estamos en una ruta que termina con un ID
    // y tratamos de navegar a otro ID, debemos reemplazar el ID actual
    // en lugar de añadir a la ruta
    
    // Verificar si el destino "to" parece ser un ID (sin slashes)
    const looksLikeId = !to.includes('/') && to.length > 20;
    
    if (looksLikeId) {
      // Asumir que el último segmento de la ruta actual es un ID
      // y por lo tanto debe ser reemplazado, no añadido
      
      // Obtener la ruta base sin el último segmento (supuesto ID)
      const basePathParts = pathParts.slice(0, -1);
      return `/${basePathParts.join('/')}/${to}`;
    }
    
    // Para otros casos, usamos el comportamiento normal
    
    // Si estamos en una página de ID, nos aseguramos de no añadir al ID,
    // sino a la base del módulo
    if (pathParts.length >= 3) {
      // Verificar si el último segmento parece un ID (más de 20 caracteres)
      const lastSegment = pathParts[pathParts.length - 1];
      if (lastSegment.length > 20) {
        // Eliminar el ID y mantener los segmentos anteriores
        const basePathParts = pathParts.slice(0, -1);
        return `/${basePathParts.join('/')}/${to}`;
      }
    }
    
    // Si no es un caso especial, comportamiento predeterminado
    return `${path.endsWith('/') ? path : `${path}/`}${to}`;
  };
  
  const finalPath = getContextBase();
  
  return (
    <Link to={finalPath} {...props}>
      {children}
    </Link>
  );
};
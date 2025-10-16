import React from 'react';
import { Link, useLocation } from 'react-router';

/**
 * Componente que crea enlaces relativos al contexto actual
 * con detección automática de IDs a cualquier profundidad
 */
export const ContextualLink = ({ to, children, context = 'auto', ...props }) => {
  const location = useLocation();
  
  // Función para determinar si un segmento de URL parece un ID
  const looksLikeId = (segment) => {
    // Patrones comunes de IDs:
    // - MongoDB ObjectId: 24 caracteres hexadecimales
    // - UUID: 36 caracteres con guiones
    // - Números largos o combinaciones alfanuméricas largas
    return (
      (segment.length >= 24 && /^[0-9a-f]+$/i.test(segment)) || // MongoDB ObjectId
      (segment.length === 36 && /^[0-9a-f-]+$/i.test(segment)) || // UUID
      (segment.length > 8 && /^[0-9a-z_-]+$/i.test(segment)) // Otros IDs alfanuméricos
    );
  };

  // Función para determinar la ruta base según el contexto
  const getContextBase = () => {
    // Si es una ruta absoluta, no modificamos
    if (to.startsWith('/')) {
      return to;
    }

    const path = location.pathname;
    const pathParts = path.split('/').filter(Boolean);
    
    // Si el destino parece un ID, vamos a reemplazar el segmento ID en la ruta actual
    if (looksLikeId(to) && !to.includes('/')) {
      // Buscar desde el final hacia el principio, el primer segmento que parece un ID
      for (let i = pathParts.length - 1; i >= 0; i--) {
        if (looksLikeId(pathParts[i])) {
          // Reemplazar el ID encontrado con el nuevo ID
          const newPathParts = [...pathParts];
          newPathParts[i] = to;
          return '/' + newPathParts.join('/');
        }
      }
    }
    
    // Si hay algún query parameter en la URL actual, no los copiamos
    const basePath = path.split('?')[0];
    
    // Si estamos en una ruta que termina con un ID
    const lastSegment = pathParts[pathParts.length - 1];
    if (looksLikeId(lastSegment)) {
      // Quitar el ID final para obtener la ruta base
      const basePathParts = pathParts.slice(0, -1);
      return `/${basePathParts.join('/')}/${to}`;
    }
    
    // Manejar diferentes tipos de contexto explícito
    if (context !== 'auto') {
      switch (context) {
        case 'site': // Primer nivel
          if (pathParts.length >= 1) {
            return `/${pathParts[0]}/${to}`;
          }
          break;
          
        case 'module': // Dos primeros niveles (site/module)
          if (pathParts.length >= 2) {
            return `/${pathParts.slice(0, 2).join('/')}/${to}`;
          }
          break;
          
        case 'parent': // Un nivel hacia arriba
          if (pathParts.length >= 2) {
            return `/${pathParts.slice(0, -1).join('/')}/${to}`;
          }
          break;
      }
    }
    
    // Comportamiento predeterminado - añadir a la ruta actual
    return `${basePath.endsWith('/') ? basePath : `${basePath}/`}${to}`;
  };
  
  const finalPath = getContextBase();
  
  // Opcionalmente, añadir logging para debug
  // console.log(`ContextualLink: ${location.pathname} -> ${to} = ${finalPath}`);
  
  return (
    <Link to={finalPath} {...props}>
      {children}
    </Link>
  );
};
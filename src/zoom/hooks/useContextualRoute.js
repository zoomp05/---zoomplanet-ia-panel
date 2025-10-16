import { useLocation } from 'react-router';

// Centralizado: hook de ruta contextual
export const useContextualRoute = (context = 'current') => {
  const location = useLocation();
  const getContextualRoute = (to) => {
    const relativePath = to.startsWith('/') ? to.substring(1) : to;
    const currentPath = location.pathname;
    const pathSegments = currentPath.split('/').filter(Boolean);
    switch (context) {
      case 'current':
        return `${currentPath.endsWith('/') ? currentPath : currentPath + '/' }${relativePath}`;
      case 'parent':
        if (pathSegments.length >= 2) {
          const parentPath = `/${pathSegments.slice(0,-1).join('/')}`; return `${parentPath}/${relativePath}`; }
        break;
      case 'site':
        if (pathSegments.length >=1) return `/${pathSegments[0]}/${relativePath}`; break;
      case 'module':
        if (pathSegments.length >=2) return `/${pathSegments.slice(0,2).join('/')}/${relativePath}`; break;
      default: break;
    }
    return `/${relativePath}`;
  };
  return getContextualRoute;
};

export default useContextualRoute;

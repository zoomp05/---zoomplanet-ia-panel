import { useLocation, useNavigate } from 'react-router';
import { useMemo } from 'react';

export const useModuleNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const routeContext = useMemo(() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    return {
      site: pathParts[0] || '',
      module: pathParts[1] || '',
      submodule: pathParts[2] || '',
      basePath: pathParts[0] ? `/${pathParts[0]}` : '',
      modulePath: pathParts.length > 1 ? `/${pathParts[0]}/${pathParts[1]}` : '',
      fullContext: pathParts.length > 2 ? `/${pathParts.slice(0,3).join('/')}` : '',
      isInModule: pathParts.length >=2,
      isInSubmodule: pathParts.length >=3,
    };
  }, [location.pathname]);

  const buildContextualUrl = (path, scope='auto') => {
    if (path.startsWith('http') || path.startsWith('//')) return path;
    let prefix='';
    switch(scope){
      case 'site': prefix=routeContext.basePath; break;
      case 'module': prefix=routeContext.modulePath; break;
      case 'submodule': prefix=routeContext.fullContext; break;
      case 'absolute': prefix=''; break;
      case 'auto':
      default:
        if (routeContext.isInSubmodule) prefix=routeContext.fullContext; else if (routeContext.isInModule) prefix=routeContext.modulePath; else prefix=routeContext.basePath;
    }
    const normalized = path.startsWith('/') ? `${prefix}${path}` : `${prefix}/${path}`;
    return normalized.replace(/\/+/g,'/');
  };
  const navigateContextual = (path, scope='auto', options={}) => navigate(buildContextualUrl(path, scope), options);
  const getContextualLink = (path, scope='auto') => buildContextualUrl(path, scope);
  const isActive = (path, exact=false) => { const url=buildContextualUrl(path); return exact ? location.pathname===url : location.pathname.startsWith(url); };
  return { routeContext, buildContextualUrl, navigateContextual, getContextualLink, isActive, navigate:navigateContextual, buildUrl:buildContextualUrl };
};

export default useModuleNavigation;

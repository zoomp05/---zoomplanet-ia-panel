import { useLocation } from 'react-router';
import { useMemo } from 'react';

export const useMenuNormalizer = () => {
  const location = useLocation();
  const routeContext = useMemo(()=>{
    const parts = location.pathname.split('/').filter(Boolean);
    return {
      site: parts[0]||'',
      module: parts[1]||'',
      submodule: parts[2]||'',
      basePath: parts[0]?`/${parts[0]}`:'',
      modulePath: parts.length>1?`/${parts[0]}/${parts[1]}`:'',
      fullContext: parts.length>2?`/${parts.slice(0,3).join('/')}`:'',
    };
  },[location.pathname]);

  const normalizeUrl = (url, scope='auto') => {
    if (url.startsWith('http')|| url.startsWith('//')) return url;
    let prefix='';
    switch(scope){
      case 'site': prefix=routeContext.basePath; break;
      case 'module': prefix=routeContext.modulePath; break;
      case 'submodule': prefix=routeContext.fullContext; break;
      case 'absolute': prefix=''; break;
      case 'auto': default:
        prefix = routeContext.module ? routeContext.modulePath : routeContext.basePath;
    }
    const result = url.startsWith('/')? `${prefix}${url}` : `${prefix}/${url}`;
    return result.replace(/\/+/g,'/');
  };

  const validateMenuItem = (item) => {
    if (!item || typeof item !== 'object') return null;
    const out={};
    ['key','label','url','type','scope'].forEach(k=>{ if(item[k]!==undefined) out[k]=String(item[k]); });
    if (item.icon) out.icon=item.icon;
    if (Array.isArray(item.children)) {
      const children = item.children.map(validateMenuItem).filter(Boolean);
      if (children.length) out.children=children;
    }
    return out;
  };

  const normalizeMenuItems = (items, defaultScope='auto') => {
    if(!Array.isArray(items)) return [];
    return items.map(validateMenuItem).filter(Boolean).map(it=>{
      const cloned={...it};
      if (it.url) cloned.url = normalizeUrl(it.url, it.scope||defaultScope);
      if (it.children) cloned.children = normalizeMenuItems(it.children, defaultScope);
      return cloned;
    });
  };

  return { routeContext, normalizeUrl, normalizeMenuItems };
};

export default useMenuNormalizer;

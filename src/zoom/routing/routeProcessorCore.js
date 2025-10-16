// src/zoom/routing/routeProcessorCore.js
import React, { lazy, Suspense } from 'react';
import RouteGuard from '../../modules/auth/guards/RouteGuard.jsx';

// (Contenido trasladado desde utils/routeProcessor.jsx)

const importComponent = (componentPath) => {
  const LazyComponent = lazy(() => {
    let normalizedPath = componentPath.startsWith('./') ? componentPath.substring(2) : componentPath;
    if (normalizedPath.startsWith('src/src/')) normalizedPath = normalizedPath.substring(4);
    if (!normalizedPath.startsWith('src/')) normalizedPath = `src/${normalizedPath}`;
    return import(/* @vite-ignore */ `/${normalizedPath}`)
      .catch(error => {
        const relativePath = componentPath.startsWith('./') ? componentPath.substring(2) : componentPath;
        return import(/* @vite-ignore */ `../../${relativePath}`)
          .catch(error2 => {
            return { default: () => React.createElement(
              'div',
              { className: 'error-loading', style: { padding:20, background:'#fff3f3', border:'1px solid #d32f2f', borderRadius:4 } },
              React.createElement('h2', { style:{ color:'#d32f2f'} }, 'Error al cargar componente'),
              React.createElement('p', null, 'No se pudo cargar: ', React.createElement('code', null, componentPath)),
              React.createElement('p', null, 'Ruta normalizada: ', React.createElement('code', null, normalizedPath)),
              React.createElement('p', null, 'Error absoluto: ', React.createElement('code', null, error.message)),
              React.createElement('p', null, 'Error relativo: ', React.createElement('code', null, error2.message))
            ) };
          });
      });
  });
  return (props) => React.createElement(
    Suspense,
    { fallback: React.createElement('div', { className: 'loading-component' }, 'Cargando...') },
    React.createElement(LazyComponent, { ...props })
  );
};

export function processRoutes(routes, siteLayouts = {}, inheritedLayouts = {}) {
  return routes.map(route => {
    const processedRoute = { ...route };
    let layoutPath = null;
    if (route.moduleName && siteLayouts[route.moduleName]) {
      layoutPath = siteLayouts[route.moduleName];
    } else if (route.layout) {
      layoutPath = route.layout;
    } else if (route.moduleName && inheritedLayouts[route.moduleName]) {
      layoutPath = inheritedLayouts[route.moduleName];
    }

    if (processedRoute.children && processedRoute.children.length > 0) {
      if (layoutPath) {
        const LayoutComponent = importComponent(layoutPath);
        const layoutElement = React.createElement(LayoutComponent, null);
        processedRoute.element = processedRoute.protected
          ? React.createElement(RouteGuard, { moduleName: route.moduleName }, layoutElement)
          : layoutElement;
      }
      processedRoute.children = processRoutes(processedRoute.children, siteLayouts, inheritedLayouts);
      delete processedRoute.componentPath;
      delete processedRoute.layout;
    } else if (processedRoute.componentPath) {
      const PageComponent = importComponent(processedRoute.componentPath);
      const pageElement = React.createElement(PageComponent, null);
      processedRoute.element = processedRoute.protected
        ? React.createElement(RouteGuard, { moduleName: route.moduleName }, pageElement)
        : pageElement;
      delete processedRoute.componentPath;
      delete processedRoute.layout;
    }
    delete processedRoute.protected;
    return processedRoute;
  });
}

export default processRoutes;

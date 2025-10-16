import React from 'react';
import { createBrowserRouter } from 'react-router';
import configRoutes from './configRoutes.jsx';
import { processRoutes } from './routeProcessor.js';
import { getAllLayouts } from './routesRegistry';

// Genera el router a partir de la configuración centralizada
const generateRoutes = async () => {
  try {
    const siteLayouts = getAllLayouts();
    const routes = processRoutes(configRoutes, siteLayouts);
    console.log('[dynamicRoutes] Rutas procesadas:', JSON.stringify(routes, (k,v)=> k==='element'?'[Element]':v,2));
    routes.push({
      path: '*',
      element: React.createElement(() => (
        <div className="not-found"><h1>Página no encontrada</h1><p>La página solicitada no existe.</p></div>
      ))
    });
    return createBrowserRouter(routes);
  } catch (error) {
    console.error('[dynamicRoutes] Error generando rutas', error);
    return createBrowserRouter([
      { path: '*', element: React.createElement(() => (<div className="router-error"><h1>Error en el enrutador</h1><p>{error.message}</p></div>)) }
    ]);
  }
};

export default generateRoutes;
